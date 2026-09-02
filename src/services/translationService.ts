// 翻译服务 - 使用 MyMemory API (免费版每日1000字符)
import type { TranslationResult } from '../types';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

class TranslationService {
  private lastRequestTime = 0;
  private minInterval = 1000; // API限制，最小请求间隔

  // 翻译文本
  async translate(text: string, fromLang: string = 'en', toLang: string = 'zh'): Promise<TranslationResult> {
    // 简单的节流控制
    const now = Date.now();
    if (now - this.lastRequestTime < this.minInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minInterval - (now - this.lastRequestTime)));
    }
    this.lastRequestTime = Date.now();

    try {
      const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'Translation failed');
      }

      return {
        translatedText: data.responseData.translatedText,
        sourceLang: fromLang,
        targetLang: toLang
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  // 中译英
  async zhToEn(text: string): Promise<TranslationResult> {
    return this.translate(text, 'zh-CN', 'en-US');
  }

  // 英译中
  async enToZh(text: string): Promise<TranslationResult> {
    return this.translate(text, 'en-US', 'zh-CN');
  }

  // 检测语言
  detectLanguage(text: string): 'en' | 'zh' {
    // 简单的语言检测
    const zhRegex = /[\u4e00-\u9fff]/;
    return zhRegex.test(text) ? 'zh' : 'en';
  }
}

export const translationService = new TranslationService();
