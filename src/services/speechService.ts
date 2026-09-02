// 语音识别和合成服务（多引擎分层，不依赖 Google 语音服务）
//
// 语音识别 (ASR) 层级:
//   iOS: SFSpeechRecognizer (系统自带，中英文离线识别)
//   Android: Vosk 离线识别 → VoiceInput Intent → webkitSpeechRecognition
//
// 语音合成 (TTS) 层级:
//   iOS: AVSpeechSynthesizer (系统自带，中英文离线)
//   Android: 离线音频 → 原生 Android TTS → speechSynthesis → Edge TTS
//
import { Capacitor } from '@capacitor/core';
import type { Accent } from '../types';
import { NativeTts } from '../plugins/native-tts/src';
import { VoiceInput } from '../plugins/voice-input/src';
import { IosTts } from '../plugins/ios-tts/src';
import { IosAsr } from '../plugins/ios-asr/src';
import { offlineTts } from './offlineTts';
import {
  initVoskModel,
  startListening as voskStartListening,
  stopListening as voskStopListening,
  setVoskCallbacks,
  getVoskState,
} from './voskAsr';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Edge TTS 语音角色映射
const EDGE_VOICES: Record<string, string> = {
  'en-GB': 'en-GB-SoniaNeural',
  'en-US': 'en-US-AriaNeural',
  'en-AU': 'en-AU-NatashaNeural',
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
};

const SERVER_KEY = 'speakeasy_tts_server';

// 识别结果回调: (文本, 是否最终结果)
export type RecognitionCallback = (text: string, isFinal: boolean) => void;

class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private currentAccent: Accent = 'en-GB';
  private recognition: any = null; // webkit 识别器
  private nativeListening = false;
  private webkitListening = false;
  private nativeListeners: { remove: () => void }[] = [];

  private iosAsrListeners: { remove: () => void }[] = [];
  private iosListening = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      try {
        this.synthesis.getVoices();
        const synth = this.synthesis as any;
        if (typeof synth.onvoiceschanged !== 'undefined') {
          synth.onvoiceschanged = () => { /* 声音列表已就绪 */ };
        }
      } catch (e) { /* 忽略 */ }
      // 某些 WebView 需要延迟加载声音列表
      setTimeout(() => {
        try { this.synthesis?.getVoices(); } catch (e) { /* 忽略 */ }
      }, 800);
    }
    this.initRecognition();

    // 平台判断
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      // iOS: 初始化原生 ASR 权限和监听
      this.initIosAsr();
    } else {
      // Android: 后台初始化 Vosk 模型
      this.initVosk();
    }
  }

  private async initIosAsr() {
    try {
      console.log('[SpeechService] iOS: requesting ASR permissions...');
      const perm = await IosAsr.requestPermissions();
      console.log('[SpeechService] iOS ASR permission:', perm.granted ? 'granted' : 'denied');

      // 监听识别结果
      const resultListener = await IosAsr.addListener('asrResult', (result: any) => {
        if (this.iosAsrResultCallback) {
          this.iosAsrResultCallback(result.text, result.isFinal);
        }
      });
      this.iosAsrListeners.push({ remove: () => resultListener.remove() });

      const errorListener = await IosAsr.addListener('asrError', (err: any) => {
        console.warn('[SpeechService] iOS ASR error:', err.message);
        this.iosListening = false;
      });
      this.iosAsrListeners.push({ remove: () => errorListener.remove() });

      const endListener = await IosAsr.addListener('asrEnd', () => {
        console.log('[SpeechService] iOS ASR ended');
        this.iosListening = false;
      });
      this.iosAsrListeners.push({ remove: () => endListener.remove() });

    } catch (e) {
      console.warn('[SpeechService] iOS ASR init failed:', e);
    }
  }

  private iosAsrResultCallback: ((text: string, isFinal: boolean) => void) | null = null;

  private async initVosk() {
    // 仅 Android 需要 Vosk（iOS 用 SFSpeechRecognizer）
    if (Capacitor.getPlatform() === 'ios') return;
    try {
      console.log('[SpeechService] Starting Vosk model init in background...');
      await initVoskModel();
      console.log('[SpeechService] Vosk model ready');
    } catch (e) {
      console.warn('[SpeechService] Vosk init failed, using fallback ASR:', e);
    }
  }

  private initRecognition() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  // ---------- 设置 ----------

  setAccent(accent: Accent) { this.currentAccent = accent; }
  getAccent(): Accent { return this.currentAccent; }

  // Edge TTS 服务器地址
  getServerAddress(): string {
    try { return localStorage.getItem(SERVER_KEY) || ''; } catch { return ''; }
  }

  setServerAddress(addr: string) {
    try { localStorage.setItem(SERVER_KEY, addr.trim().replace(/\/+$/, '')); } catch { /* 忽略 */ }
  }

  // 测试 TTS 服务器连接
  async testServer(addr: string): Promise<{ ok: boolean; message: string }> {
    const base = addr.trim().replace(/\/+$/, '');
    if (!base) return { ok: false, message: '请输入服务器地址' };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(`${base}/voices`, { signal: controller.signal });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const voices = await res.json();
      const list = Array.isArray(voices) ? voices : [];
      return { ok: true, message: `连接成功！可用语音 ${list.length} 个` };
    } catch (e: any) {
      return { ok: false, message: e?.name === 'AbortError' ? '连接超时' : '无法连接服务器' };
    } finally {
      clearTimeout(timer);
    }
  }

  // ---------- 引擎状态 ----------

  // 识别引擎: 'ios-native' | 'native' | 'webkit' | 'none'
  getRecognitionEngine(): 'ios-native' | 'native' | 'webkit' | 'none' {
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'ios') return 'ios-native';
      return 'native';
    }
    if (this.recognition) return 'webkit';
    return 'none';
  }

  // 朗读引擎: 'ios-native' | 'native' | 'system' | 'edge-server' | 'none'
  getTtsEngine(): 'ios-native' | 'native' | 'system' | 'edge-server' | 'none' {
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'ios') return 'ios-native';
      return 'native'; // 走原生 Android TTS
    }
    if (this.hasSystemVoices()) return 'system';
    if (this.getServerAddress()) return 'edge-server';
    return 'none';
  }

  private hasSystemVoices(): boolean {
    if (!this.synthesis) return false;
    try { return this.synthesis.getVoices().length > 0; } catch { return false; }
  }

  // ---------- 语音识别 (ASR) ----------

  // 开始识别。onResult: 部分/最终结果回调；返回是否成功启动
  async startListening(onResult: RecognitionCallback): Promise<boolean> {
    // iOS: 直接用 SFSpeechRecognizer（系统自带，中英文离线）
    if (Capacitor.getPlatform() === 'ios') {
      return this.startIosListening(onResult);
    }

    // Android: 层1 Vosk → 层2 VoiceInput → 层3 webkit
    const voskState = getVoskState();
    if (voskState === 'ready' || voskState === 'listening') {
      try {
        console.log('[SpeechService] Starting Vosk ASR...');
        setVoskCallbacks(
          (text, isFinal) => onResult(text, isFinal),
          (err) => console.warn('[SpeechService] Vosk error:', err)
        );
        await voskStartListening();
        return true;
      } catch (e: any) {
        console.warn('[SpeechService] Vosk failed, falling back:', e?.message || e);
        // Vosk 失败，继续尝试其他引擎
      }
    }

    // 层2: 原生 VoiceInput（系统语音界面，支持中文）
    if (Capacitor.isNativePlatform()) {
      const ok = await this.startNativeListening(onResult);
      if (ok) return true;
    }

    // 层3: 浏览器 webkitSpeechRecognition
    return this.startWebkitListening(onResult);
  }

  // 停止识别
  stopListening() {
    if (Capacitor.getPlatform() === 'ios') {
      this.stopIosListening();
      return;
    }
    voskStopListening();
    this.stopNativeListening();
    this.stopWebkitListening();
  }

  // 是否正在监听
  isListening(): boolean {
    if (Capacitor.getPlatform() === 'ios') return this.iosListening;
    const voskState = getVoskState();
    return voskState === 'listening' || this.nativeListening || this.webkitListening;
  }

  // iOS 语音识别
  private async startIosListening(onResult: RecognitionCallback): Promise<boolean> {
    try {
      const isZh = /[\u4e00-\u9fff]/.test(this.currentAccent);
      // 英文用 en-US/en-GB，中文用 zh-CN
      const lang = isZh ? 'zh-CN' : this.currentAccent;

      this.iosAsrResultCallback = onResult;
      this.iosListening = true;

      await IosAsr.startListening({
        language: lang,
        partialResults: true,
      });
      return true;
    } catch (e: any) {
      console.warn('[SpeechService] iOS ASR failed:', e?.message || e);
      this.iosListening = false;
      return false;
    }
  }

  private async stopIosListening() {
    if (!this.iosListening) return;
    this.iosListening = false;
    this.iosAsrResultCallback = null;
    try {
      await IosAsr.stopListening();
    } catch (e) { /* 忽略 */ }
  }

  private async startNativeListening(onResult: RecognitionCallback): Promise<boolean> {
    try {
      const { text } = await VoiceInput.startVoiceInput({
        language: 'zh-CN',
      });
      if (text) {
        onResult(text, true);
        return true;
      }
      return false;
    } catch (e: any) {
      console.warn('VoiceInput failed:', e?.message || e);
      if (e?.message?.includes('取消') || e?.message?.includes('cancel')) {
        // 用户取消，不算错误
        return false;
      }
      onResult('语音识别失败，请重试', true);
      return false;
    }
  }

  private stopNativeListening() {
    if (!this.nativeListening) return;
    this.nativeListening = false;
    try {
      import('@capacitor-community/speech-recognition').then((mod: any) => {
        mod.SpeechRecognition?.stop().catch(() => {});
      }).catch(() => {});
    } catch (e) { /* 忽略 */ }
    this.nativeListeners.forEach(l => { try { l.remove(); } catch (e) { /* 忽略 */ } });
    this.nativeListeners = [];
  }

  private startWebkitListening(onResult: RecognitionCallback): boolean {
    if (!this.recognition) return false;
    try {
      this.recognition.lang = 'en-US';
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        try {
          transcript = Array.from(event.results)
            .flatMap((result: any) => Array.from(result))
            .map((alt: any) => alt.transcript)
            .join('');
        } catch (e) { /* 忽略 */ }
        onResult(transcript, event?.results?.[0]?.isFinal ?? false);
      };
      this.recognition.onerror = (event: any) => {
        this.webkitListening = false;
        console.warn('webkit recognition error:', event?.error);
      };
      this.recognition.onend = () => {
        this.webkitListening = false;
      };
      this.recognition.start();
      this.webkitListening = true;
      return true;
    } catch (e) {
      this.webkitListening = false;
      return false;
    }
  }

  private stopWebkitListening() {
    if (!this.webkitListening || !this.recognition) return;
    try { this.recognition.stop(); } catch (e) { /* 忽略 */ }
    this.webkitListening = false;
  }

  // ---------- 语音合成 (TTS) ----------

  // 朗读文本。三层自动回退：原生TTS → 系统TTS → Edge服务器
  async speak(text: string, accent?: Accent): Promise<void> {
    if (!text?.trim()) return;

    const isZh = /[\u4e00-\u9fff]/.test(text);
    const lang = isZh ? 'zh-CN' : (accent || this.currentAccent);

    // 层0: 离线音频（预录句子，完全本地，零延迟）
    // iOS 不需要预录音频（AVSpeechSynthesizer 开箱即用），跳过
    if (Capacitor.getPlatform() !== 'ios') {
      const offlineOk = await this.speakWithOffline(text);
      if (offlineOk) return;
    }

    // 层1: iOS 原生 TTS (AVSpeechSynthesizer，完全离线)
    if (Capacitor.getPlatform() === 'ios') {
      const ok = await this.speakWithIosNative(text, lang);
      if (ok) return;
    }

    // 层1b: 原生 Android TTS（系统引擎，完全离线，厂商自带中文支持）
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      const ok = await this.speakWithNative(text, lang);
      if (ok) return;
    }

    // 层2: 系统 speechSynthesis
    if (this.hasSystemVoices()) {
      const ok = await this.speakWithSystem(text, lang);
      if (ok) return;
    }

    // 层3: Edge TTS 服务器
    const ok2 = await this.speakWithEdgeServer(text, lang);
    if (ok2) return;

    const server = this.getServerAddress();
    throw new Error(
      server
        ? '无法连接朗读服务器，请确认电脑上的 TTS 服务器已启动'
        : '本机没有朗读引擎。请在 ⚙️设置 中填写电脑 TTS 服务器地址（电脑上双击"启动TTS服务器.bat"）'
    );
  }

  // 层0: 离线预录音频
  private speakWithOffline(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      offlineTts.speak(
        text,
        () => resolve(true),   // 播放成功
        () => resolve(false)   // 找不到音频，走下一层
      );
    });
  }

  // 层1: iOS 原生 TTS (AVSpeechSynthesizer)
  private async speakWithIosNative(text: string, lang: string): Promise<boolean> {
    try {
      await Promise.race([
        IosTts.speak({ text, language: lang, rate: 0.9, pitch: 1.0, volume: 1.0 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ]);
      return true;
    } catch (e: any) {
      console.warn('iOS Native TTS failed:', e?.message || e);
      return false;
    }
  }

  // 层1: 原生 Android TTS
  private async speakWithNative(text: string, lang: string): Promise<boolean> {
    try {
      // 4秒看门狗
      await Promise.race([
        NativeTts.speak({ text, language: lang, rate: 1.0, pitch: 1.0, volume: 1.0 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      return true;
    } catch (e: any) {
      console.warn('Native TTS failed:', e?.message || e);
      return false;
    }
  }

  private speakWithSystem(text: string, lang: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synthesis) { resolve(false); return; }

      const prefix = lang.split('-')[0].toLowerCase();
      const voices = this.synthesis.getVoices();
      const match = voices.find(v => v.lang.toLowerCase().startsWith(prefix) && (v as any).localService)
        || voices.find(v => v.lang.toLowerCase().startsWith(prefix));
      if (!match) { resolve(false); return; }

      try { this.synthesis.cancel(); } catch (e) { /* 忽略 */ }

      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = 0.9;
      u.pitch = 1;
      u.voice = match;

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      u.onend = () => finish(true);
      u.onerror = () => finish(false);

      try {
        this.synthesis.speak(u);
      } catch (e) {
        finish(false);
        return;
      }

      // 看门狗: 若引擎故障(未开始朗读)，4秒后判定失败
      setTimeout(() => {
        if (!settled) {
          if (!this.synthesis!.speaking && !this.synthesis!.pending) {
            finish(false);
          }
          // 正在朗读则等待 onend
        }
      }, 4000);
    });
  }

  private async speakWithEdgeServer(text: string, lang: string): Promise<boolean> {
    const server = this.getServerAddress();
    if (!server) return false;
    try {
      const voice = EDGE_VOICES[lang] || EDGE_VOICES['en-US'];
      const url = `${server}/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`;
      const audio = new Audio(url);
      audio.volume = 1;

      const result = await new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          resolve(ok);
        };
        audio.onended = () => finish(true);
        audio.onerror = () => finish(false);
        audio.play().catch(() => finish(false));
        // 30秒硬超时
        setTimeout(() => finish(false), 30000);
      });
      return result;
    } catch (e) {
      console.warn('Edge TTS server failed:', e);
      return false;
    }
  }

  // 停止朗读
  stop() {
    try { this.synthesis?.cancel(); } catch (e) { /* 忽略 */ }
  }

  isSpeaking(): boolean {
    try { return !!this.synthesis?.speaking; } catch { return false; }
  }

  // 获取可用语音列表
  getAvailableVoices(): { name: string; lang: string }[] {
    try {
      return (this.synthesis?.getVoices() || []).map(v => ({ name: v.name, lang: v.lang }));
    } catch { return []; }
  }

  // 获取口音描述
  static getAccentInfo(accent: Accent): { name: string; flag: string; description: string } {
    const accents: Record<Accent, { name: string; flag: string; description: string }> = {
      'en-GB': { name: 'British (UK)', flag: '🇬🇧', description: '伦敦/英式英语' },
      'en-US': { name: 'American (US)', flag: '🇺🇸', description: '美式英语' },
      'en-AU': { name: 'Australian', flag: '🇦🇺', description: '澳式英语' }
    };
    return accents[accent];
  }
}

export const speechService = new SpeechService();
export { SpeechService };
