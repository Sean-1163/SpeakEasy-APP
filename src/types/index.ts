// 语音识别类型
export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

// 翻译类型
export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  type?: 'text' | 'story' | 'news';
}

// 新闻类型
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  audioUrl?: string;
  date: Date;
  source: string;
}

// 故事类型
export interface Story {
  id: string;
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// 口音类型
export type Accent = 'en-GB' | 'en-US' | 'en-AU';

// 应用状态
export interface AppState {
  isListening: boolean;
  isSpeaking: boolean;
  currentAccent: Accent;
  messages: Message[];
  news: NewsItem[];
  stories: Story[];
}
