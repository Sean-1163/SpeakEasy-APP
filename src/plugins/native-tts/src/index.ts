/**
 * Native TTS Plugin — Capacitor 6 web shim
 *
 * 在 Android 上：registerPlugin 找到 NativeTtsPlugin.java，走原生系统 TTS（厂商自带，无需 Google）
 * 在浏览器上：fallback 用 speechSynthesis
 */
import { registerPlugin } from '@capacitor/core';
import type { NativeTtsOptions } from './definitions';
import type { NativeTtsPlugin } from './definitions';


// 原生插件（Android 端）
const _raw = registerPlugin<NativeTtsPlugin>('NativeTts');

// 浏览器 fallback（开发预览 / PWA 环境）
const _fallback: NativeTtsPlugin = {
  async init() { return { ready: false }; },
  async checkAvailable() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return { available: true, engine: 'system (browser)' };
    }
    return { available: false, engine: 'none' };
  },
  async getLanguages() {
    const voices: any[] = (window as any).speechSynthesis?.getVoices?.() || [];
    const langs = [...new Set(voices.map((v: any) => String(v.lang)))] as string[];
    return { languages: langs };
  },
  async setLanguage() { return { set: true }; },
  async speak(opts: NativeTtsOptions): Promise<{ started: boolean }> {
    const { text, language = 'en-US', rate = 1, pitch = 1, volume = 1 } = opts;
    return new Promise((resolve, reject) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onend = () => resolve({ started: true });
      u.onerror = () => reject(new Error('TTS 错误'));
      (window as any).speechSynthesis?.speak(u);
    });
  },
  async stop() { (window as any).speechSynthesis?.cancel(); },
  async isSpeaking() { return { speaking: !!(window as any).speechSynthesis?.speaking }; },
  async addListener(_eventName: string, _cb: (...args: any[]) => any) {
    return { remove: async () => {} };
  },
};

// 优先原生插件，speak 方法自动回退到浏览器 TTS
const _plugin: NativeTtsPlugin = new Proxy(_raw as NativeTtsPlugin, {
  get(target, prop, receiver) {
    if (prop === 'speak') {
      return async (opts: NativeTtsOptions) => {
        try {
          return await target.speak(opts);
        } catch {
          return _fallback.speak(opts);
        }
      };
    }
    if (prop === 'checkAvailable') {
      return async () => {
        try {
          return await (target.checkAvailable as () => Promise<any>)();
        } catch {
          return _fallback.checkAvailable();
        }
      };
    }
    return Reflect.get(target, prop, receiver);
  },
});

export const NativeTts: NativeTtsPlugin = _plugin;
export type { NativeTtsPlugin, NativeTtsOptions };
