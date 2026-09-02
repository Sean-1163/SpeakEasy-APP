/**
 * Vosk 离线语音识别服务 (纯本地 ASR)
 *
 * 完全离线：模型文件在 App 内 (~39MB)，不依赖任何服务器或 Google 服务
 * 模型：vosk-model-small-en-us-0.15 (英文)
 *
 * 架构：
 * - vosk-browser WASM runtime (嵌入在 vosk.js 中)
 * - 模型文件: public/v/model.tar.gz (Android assets)
 * - Web Worker 方式加载模型
 */

// 声明全局 Vosk 类型
declare global {
  interface Window {
    Vosk: VoskType;
  }
}

interface VoskType {
  createModel(url: string): Promise<VoskModel>;
  createModel(buffer: ArrayBuffer): Promise<VoskModel>;
}

interface VoskModel extends EventTarget {
  ready: boolean;
  KaldiRecognizer: {
    new (): KaldiRecognizer;
  };
  terminate(): void;
  on(event: string, listener: (detail: unknown) => void): void;
  setLogLevel(level: number): void;
}

interface KaldiRecognizer extends EventTarget {
  id: string;
  acceptWaveform(buffer: AudioBuffer): void;
  setWords(show: boolean): void;
  remove(): void;
  on(event: string, listener: (detail: unknown) => void): void;
}

// 识别结果回调类型
export type VoskResultCallback = (text: string, isFinal: boolean) => void;
export type VoskErrorCallback = (error: string) => void;

// 状态枚举
export type VoskAsrState = 'idle' | 'loading' | 'ready' | 'listening' | 'error';

const MODEL_URL = 'v/model.tar.gz';

let voskModel: VoskModel | null = null;
let recognizer: KaldiRecognizer | null = null;
let audioContext: AudioContext | null = null;
let recognizerNode: ScriptProcessorNode | null = null;
let mediaStream: MediaStream | null = null;

let _onResult: VoskResultCallback | null = null;
let _onError: VoskErrorCallback | null = null;
let _state: VoskAsrState = 'idle';
let _reportErrorFn: (msg: string) => void = console.error;

export function getVoskState(): VoskAsrState {
  return _state;
}

/**
 * 加载 vosk.js (已打包在 public/vosk.js)
 * 只加载一次，后续直接使用全局 Vosk 对象
 */
function loadVoskScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Vosk) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'vosk.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load vosk.js'));
    document.head.appendChild(script);
  });
}

/**
 * 初始化 Vosk 模型 (加载 ~39MB 模型文件)
 */
export async function initVoskModel(): Promise<void> {
  if (voskModel && voskModel.ready) return;
  if (_state === 'loading') return;

  _state = 'loading';
  _reportErrorFn = console.error;

  try {
    console.log('[Vosk] Loading vosk.js...');
    await loadVoskScript();
    console.log('[Vosk] vosk.js loaded. Creating model from:', MODEL_URL);
    console.log('[Vosk] Model file size (est): ~39MB, may take a while...');

    // vosk-browser 的 createModel 支持 string URL
    // 在 Capacitor Android 中，public/ 文件被映射到 /android_asset/public/
    // 所以 'v/model.tar.gz' 会被正确解析
    const model = await window.Vosk.createModel(MODEL_URL);
    voskModel = model;

    console.log('[Vosk] Model ready:', voskModel.ready);
    _state = voskModel.ready ? 'ready' : 'error';
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[Vosk] Model load error:', msg);
    _state = 'error';
    throw new Error('Vosk model load failed: ' + msg);
  }
}

export function setVoskCallbacks(
  onResult: VoskResultCallback,
  onError: VoskErrorCallback
): void {
  _onResult = onResult;
  _onError = onError;
  _reportErrorFn = (msg: string) => {
    console.error('[Vosk]', msg);
    _onError?.(msg);
  };
}

/**
 * 开始监听麦克风
 */
export async function startListening(): Promise<void> {
  if (_state === 'listening') return;
  const model = voskModel;
  if (!model || !model.ready) {
    throw new Error('Vosk model not ready. Call initVoskModel first.');
  }

  try {
    console.log('[Vosk] Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1,
        sampleRate: 16000,
      },
    });
    mediaStream = stream;
    console.log('[Vosk] Microphone access granted');

    // 创建 AudioContext (需要 16kHz)
    audioContext = new AudioContext({ sampleRate: 16000 });

    // 创建 ScriptProcessorNode 来获取原始音频
    const procNode = audioContext.createScriptProcessor(4096, 1, 1);
    recognizerNode = procNode;
    procNode.onaudioprocess = (event) => {
      if (!recognizer) return;
      try {
        recognizer.acceptWaveform(event.inputBuffer);
      } catch (err) {
        _reportErrorFn('acceptWaveform failed: ' + String(err));
      }
    };

    // 创建 Vosk 识别器
    const rec = new model.KaldiRecognizer();
    recognizer = rec;
    rec.setWords(true);

    rec.on('result', (message: unknown) => {
      const msg = message as { result?: { text: string }[] };
      if (msg.result && msg.result.length > 0) {
        const text = msg.result.map((r) => r.text).join(' ').trim();
        if (text) {
          console.log('[Vosk] Final:', text);
          _onResult?.(text, true);
        }
      }
    });

    rec.on('partialresult', (message: unknown) => {
      const msg = message as { partial?: string };
      if (msg.partial) {
        console.log('[Vosk] Partial:', msg.partial);
        _onResult?.(msg.partial, false);
      }
    });

    rec.on('error', (e: unknown) => {
      _reportErrorFn('Recognizer error: ' + JSON.stringify(e));
    });

    // 连接节点
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(procNode);
    // 注意：不连接到 destination，避免回声

    _state = 'listening';
    console.log('[Vosk] Listening...');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    _reportErrorFn('Start listening failed: ' + msg);
    await stopListening();
    throw e;
  }
}

/**
 * 停止监听
 */
export async function stopListening(): Promise<void> {
  try {
    if (recognizerNode) {
      recognizerNode.disconnect();
      recognizerNode = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }
    if (recognizer) {
      try { recognizer.remove(); } catch { /* ignore */ }
      recognizer = null;
    }
  } catch (e) {
    console.error('[Vosk] Stop error:', e);
  }

  if (_state === 'listening') _state = 'ready';
  console.log('[Vosk] Stopped');
}

/**
 * 清理所有资源
 */
export async function disposeVosk(): Promise<void> {
  await stopListening();
  if (voskModel) {
    try { voskModel.terminate(); } catch { /* ignore */ }
    voskModel = null;
  }
  _state = 'idle';
  console.log('[Vosk] Disposed');
}
