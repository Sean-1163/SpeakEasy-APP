/**
 * 离线 TTS 服务 — 纯本地音频播放，不联网、不依赖 Google、不依赖系统引擎
 *
 * 策略：精确匹配预录句子 → Android 原生 TTS → 系统 speechSynthesis
 * 预录句子覆盖 App 所有常见提示语（中英双语，共 24 条）
 */
import { Capacitor } from '@capacitor/core';
import { NativeTts } from '../plugins/native-tts/src';

// 英文预录句子（与 gen_tts.cs 顺序一致）
const EN_PHRASES: Record<string, string> = {
  "Hello! I'm SpeakEasy, your English conversation partner.": "tts/en_00.wav",
  "Let's practice English together!": "tts/en_01.wav",
  "Try speaking in English. I'll correct your mistakes.": "tts/en_02.wav",
  "That's great! Your pronunciation is improving.": "tts/en_03.wav",
  "Let's try a new topic. Tell me about your hobbies.": "tts/en_04.wav",
  "How was your day?": "tts/en_05.wav",
  "I don't understand. Could you say that again?": "tts/en_06.wav",
  "Your English is getting better every day!": "tts/en_07.wav",
  "Now let's read a story together.": "tts/en_08.wav",
  "Translate this sentence into English.": "tts/en_09.wav",
  "What would you like to talk about today?": "tts/en_10.wav",
  "Excellent work! Keep it up!": "tts/en_11.wav",
};

// 中文预录句子
const ZH_PHRASES: Record<string, string> = {
  "你好！我是 SpeakEasy，你的英语对话伙伴。": "tts/zh_00.wav",
  "让我们一起练习英语吧！": "tts/zh_01.wav",
  "试着用英语说话，我会纠正你的错误。": "tts/zh_02.wav",
  "太棒了！你的发音越来越好了。": "tts/zh_03.wav",
  "换个话题吧。告诉我你的爱好是什么。": "tts/zh_04.wav",
  "你今天过得怎么样？": "tts/zh_05.wav",
  "我没听懂，能再说一遍吗？": "tts/zh_06.wav",
  "你的英语每天都在进步！": "tts/zh_07.wav",
  "现在让我们一起读个故事吧。": "tts/zh_08.wav",
  "把这个句子翻译成英语。": "tts/zh_09.wav",
  "今天想聊些什么呢？": "tts/zh_10.wav",
  "太棒了！继续保持！": "tts/zh_11.wav",
};

type DoneCallback = () => void;
type ErrorCallback = (e: Error) => void;

class OfflineTtsService {
  private audioEl: HTMLAudioElement | null = null;

  /** 用离线音频朗读指定文字（精确匹配） */
  speak(text: string, onDone?: DoneCallback, onError?: ErrorCallback): void {
    // 1. 精确匹配预录句子
    const enKey = Object.keys(EN_PHRASES).find(k => text.includes(k) || k.includes(text.trim()));
    const zhKey = Object.keys(ZH_PHRASES).find(k => text.includes(k) || k.includes(text.trim()));
    const matchedKey = enKey || zhKey;
    const audioPath = matchedKey ? (EN_PHRASES[matchedKey] || ZH_PHRASES[matchedKey]) : null;

    if (audioPath) {
      this.playAudio(audioPath, onDone, onError);
      return;
    }

    // 2. Android 原生 TTS
    if (Capacitor.isNativePlatform()) {
      this.speakWithNative(text, onDone, onError);
      return;
    }

    // 3. 系统 speechSynthesis
    this.speakWithSynthesis(text, onDone, onError);
  }

  /** 异步朗读，返回 Promise */
  async speakAsync(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.speak(text, resolve, reject);
    });
  }

  private playAudio(
    path: string,
    onDone?: DoneCallback,
    onError?: ErrorCallback
  ): void {
    // 停止当前播放
    this.stop();

    this.audioEl = new Audio(path);
    this.audioEl.onended = () => {
      onDone?.();
    };
    this.audioEl.onerror = (_e) => {
      // 音频文件不存在 → 尝试兜底引擎
      console.warn('OfflineTts: audio not found, falling back:', path);
      onError?.(new Error('audio_not_found'));
    };

    // 如果音频加载出错，手动触发错误处理
    const el = this.audioEl;
    el.play().catch(() => {
      onError?.(new Error('audio_play_failed'));
    });
  }

  private async speakWithNative(
    text: string,
    onDone?: DoneCallback,
    onError?: ErrorCallback
  ): Promise<void> {
    try {
      // 检查 TTS 是否可用
      const avail = await (NativeTts as any).checkAvailable?.();
      if (avail?.available === false) {
        // 原生不可用 → 系统 speechSynthesis
        this.speakWithSynthesis(text, onDone, onError);
        return;
      }
      await (NativeTts as any).speak({ text, rate: 0.85 });
      onDone?.();
    } catch (_e: any) {
      // 原生 TTS 失败 → 系统 speechSynthesis
      this.speakWithSynthesis(text, onDone, onError);
    }
  }

  private speakWithSynthesis(
    text: string,
    onDone?: DoneCallback,
    onError?: ErrorCallback
  ): void {
    if (!window.speechSynthesis) {
      onError?.(new Error('no_tts_engine'));
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onend = () => onDone?.();
    u.onerror = (e) => {
      if (e.error !== 'canceled') onError?.(new Error(e.error));
    };
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.currentTime = 0;
      this.audioEl = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  isPlaying(): boolean {
    if (this.audioEl && !this.audioEl.paused) return true;
    if (window.speechSynthesis?.speaking) return true;
    return false;
  }
}

export const offlineTts = new OfflineTtsService();
