/**
 * iOS ASR Plugin — Capacitor 6 web shim
 *
 * 在 iOS 上：registerPlugin 找到 IosAsrPlugin.swift，走 SFSpeechRecognizer（系统自带，支持中英文离线识别）
 * 在 Android 上：回退到已有的 VoiceInput 插件
 * 在浏览器上：fallback 用 webkitSpeechRecognition
 */
import { registerPlugin } from '@capacitor/core';

export interface IosAsrResult {
  text: string;       // 最佳匹配
  isFinal: boolean;   // 是否最终结果
  alternatives: string[]; // 候选列表
}

export interface IosAsrOptions {
  language?: string;      // BCP-47: 'en-US', 'zh-CN', 'en-GB'
  partialResults?: boolean; // 是否返回部分结果
}

export interface IosAsrPlugin {
  /** 请求语音识别权限 */
  requestPermissions(): Promise<{ granted: boolean }>;
  /** 检查语音识别是否可用 */
  isAvailable(): Promise<{ available: boolean }>;
  /** 开始语音识别 */
  startListening(opts?: IosAsrOptions): Promise<{ started: boolean }>;
  /** 停止语音识别 */
  stopListening(): Promise<{ stopped: boolean }>;
  /** 监听识别结果 */
  addListener(event: 'asrResult', cb: (e: IosAsrResult) => void): Promise<{ remove: () => void }>;
  /** 监听错误 */
  addListener(event: 'asrError', cb: (e: { message: string }) => void): Promise<{ remove: () => void }>;
  /** 监听识别结束 */
  addListener(event: 'asrEnd', cb: () => void): Promise<{ remove: () => void }>;
}

const _impl = registerPlugin<IosAsrPlugin>('IosAsr');
export const IosAsr = _impl;
