/**
 * VoiceInput Plugin — 调起系统语音识别（MIUI 小爱同学 / Android 系统语音）
 *
 * 使用 Intent 方式，绕过 @capacitor-community/speech-recognition 插件在 MIUI 上失效的问题。
 * ACTION_RECOGNIZE_SPEECH 会弹出系统语音输入界面，用户可选小爱同学或其他引擎。
 */
import { registerPlugin } from '@capacitor/core';

export interface VoiceInputResult {
    text: string;      // 最佳匹配
    matches: string[]; // 所有候选
}

export interface VoiceInputPlugin {
    /** 调起语音识别，返回识别文本 */
    startVoiceInput(opts?: { language?: string }): Promise<VoiceInputResult>;
}

const _impl = registerPlugin<VoiceInputPlugin>('VoiceInput');
export const VoiceInput = _impl;
