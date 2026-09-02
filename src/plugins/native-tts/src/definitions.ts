/**
 * Native TTS Plugin — type definitions
 * 原生 Android TTS (Android 系统引擎，厂商自带，无需 Google 服务)
 */
import type { PluginListenerHandle } from '@capacitor/core';

export interface NativeTtsOptions {
  text: string;
  language?: string;   // BCP-47: 'zh-CN', 'en-US', 'en-GB', 'en-AU', ...
  rate?: number;       // 语速 0.5~2.0，默认 1.0
  pitch?: number;       // 音高 0.5~2.0，默认 1.0
  volume?: number;      // 音量 0.0~1.0，默认 1.0
}

export interface NativeTtsPlugin {
  /** 初始化 TTS 引擎（通常自动完成） */
  init(): Promise<{ ready: boolean }>;
  /** 检查 TTS 是否可用 */
  checkAvailable(): Promise<{ available: boolean; engine: string }>;
  /** 获取支持的语言列表 */
  getLanguages(): Promise<{ languages: string[] }>;
  /** 设置默认语言 */
  setLanguage(opts: { language: string }): Promise<{ set: boolean }>;
  /** 朗读文本 */
  speak(opts: NativeTtsOptions): Promise<{ started: boolean }>;
  /** 停止朗读 */
  stop(): Promise<void>;
  /** 是否正在朗读 */
  isSpeaking(): Promise<{ speaking: boolean }>;
  /** 监听朗读结束 */
  addListener(event: 'ttsEnd', cb: (e: { text: string }) => void): Promise<PluginListenerHandle>;
  /** 监听朗读错误 */
  addListener(event: 'ttsError', cb: (e: { message: string }) => void): Promise<PluginListenerHandle>;
}
