/**
 * Native TTS Plugin — web shim
 *
 * 用途：让 web/React 代码可以通过 @capacitor/core 访问原生 Android TTS。
 * Android 端: NativeTtsPlugin.java (已内置到 SpeakEasy Android 项目)
 * 注册方式: capacitor.config.ts → plugins.NativeTts: {}
 */
import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface NativeTtsOptions {
  text: string;
  language?: string;   // BCP-47: 'zh-CN', 'en-US', 'en-GB', ...
  rate?: number;        // 语速 0.5~2.0，默认 1.0
  pitch?: number;       // 音高 0.5~2.0，默认 1.0
  volume?: number;      // 音量 0.0~1.0，默认 1.0
}

export interface NativeTtsPlugin {
  init(): Promise<{ ready: boolean }>;
  checkAvailable(): Promise<{ available: boolean; engine: string }>;
  getLanguages(): Promise<{ languages: string[] }>;
  setLanguage(opts: { language: string }): Promise<{ set: boolean }>;
  speak(opts: NativeTtsOptions): Promise<{ started: boolean }>;
  stop(): Promise<void>;
  isSpeaking(): Promise<{ speaking: boolean }>;
  addListener(event: 'ttsEnd', cb: (e: { text: string }) => void): Promise<PluginListenerHandle>;
  addListener(event: 'ttsError', cb: (e: { message: string }) => void): Promise<PluginListenerHandle>;
}

// Capacitor 6：通过 Capacitor.Plugins.NativeTts 访问
const _impl = registerPlugin<NativeTtsPlugin>('NativeTts');
export const NativeTts = _impl;
