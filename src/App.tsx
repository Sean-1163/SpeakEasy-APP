import { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Languages, 
  MessageCircle, BookOpen, Newspaper,
  Send, ChevronDown, ChevronUp, 
  Globe, Headphones, Trash2, Play, Pause, Settings, X, CheckCircle2, XCircle
} from 'lucide-react';
import { speechService, SpeechService } from './services/speechService';
import { aiService } from './services/aiService';
import { storyService } from './services/storyService';
import { newsService } from './services/newsService';
import { translationService } from './services/translationService';
import type { Accent, Message, Story, NewsItem } from './types';
import './App.css';

// 口音选项
const ACCENTS: Accent[] = ['en-GB', 'en-US', 'en-AU'];

function App() {
  // 状态
  const [activeTab, setActiveTab] = useState<'chat' | 'stories' | 'news' | 'translate'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAccent, setCurrentAccent] = useState<Accent>('en-GB');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [translateFrom, setTranslateFrom] = useState<'en' | 'zh'>('en');
  const [translateText, setTranslateText] = useState('');
  const [translateResult, setTranslateResult] = useState('');
  const [stories, setStories] = useState<Story[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [storyFilter, setStoryFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [topicSuggestions] = useState<string[]>(aiService.getTopicSuggestions());
  const [showSettings, setShowSettings] = useState(false);
  const [serverAddr, setServerAddr] = useState(speechService.getServerAddress());
  const [serverTest, setServerTest] = useState<{ ok: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [hint, setHint] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<any>(null);

  // 初始化
  useEffect(() => {
    // 加载故事
    setStories(storyService.getAllStories());
    
    // 加载新闻
    newsService.getNews().then(setNews).catch(console.error);
    
    // 添加欢迎消息
    setMessages([{
      id: 'welcome',
      role: 'ai',
      content: aiService.getGreeting() + " You can practice English with me, or try saying 'tell me a story' or 'news'!",
      timestamp: new Date()
    }]);

    return () => {
      speechService.stopListening();
    };
  }, []);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 显示临时提示
  const showHint = (msg: string) => {
    setHint(msg);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setHint(''), 5000);
  };

  // 开始语音识别 (原生 → 浏览器 自动回退)
  const startListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }
    const engine = speechService.getRecognitionEngine();
    if (engine === 'none') {
      showHint('此设备不支持语音识别');
      return;
    }
    try {
      setIsListening(true);
      const ok = await speechService.startListening((text) => {
        setInputText(text);
      });
      if (!ok) {
        setIsListening(false);
        showHint('语音识别不可用：请检查麦克风权限或系统语音服务');
      } else {
        // 监听结束
        setTimeout(() => {
          if (!speechService.isListening()) setIsListening(false);
        }, 1500);
      }
    } catch (e: any) {
      setIsListening(false);
      showHint('语音识别出错: ' + (e?.message || '未知错误'));
    }
  };

  // 停止语音识别
  const stopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  // 切换口音
  const changeAccent = (accent: Accent) => {
    setCurrentAccent(accent);
    speechService.setAccent(accent);
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 生成回复
    const response = await aiService.generateResponse(userMessage.content);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);

    // 语音播放AI回复
    speakText(response);
  };

  // 语音合成
  const speakText = async (text: string) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speechService.speak(text, currentAccent);
    } catch (error: any) {
      console.error('Speech error:', error);
      showHint(error?.message || '朗读失败：没有可用的语音引擎');
    } finally {
      setIsSpeaking(false);
    }
  };

  // 翻译
  const handleTranslate = async () => {
    if (!translateText.trim()) return;

    setIsTranslating(true);
    try {
      const result = translateFrom === 'en'
        ? await translationService.enToZh(translateText)
        : await translationService.zhToEn(translateText);
      setTranslateResult(result.translatedText);
    } catch (error) {
      setTranslateResult('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // 朗读翻译文本
  const speakTranslation = () => {
    if (translateResult) {
      speakText(translateResult);
    }
  };

  // 过滤故事
  const filteredStories = storyFilter === 'all' 
    ? stories 
    : storyService.getStoriesByDifficulty(storyFilter);

  // 朗读故事
  const speakStory = async (story: Story) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }
    speakText(story.content);
  };

  // 朗读新闻
  const speakNews = async (item: NewsItem) => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }
    speakText(`${item.title}. ${item.summary}`);
  };

  // 清空聊天
  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'ai',
      content: aiService.getGreeting(),
      timestamp: new Date()
    }]);
    aiService.resetHistory();
  };

  // 插入话题到输入框
  const insertTopic = (topic: string) => {
    setInputText(topic);
  };

  // 测试 TTS 服务器
  const testServer = async () => {
    setIsTesting(true);
    setServerTest(null);
    const result = await speechService.testServer(serverAddr);
    setServerTest(result);
    setIsTesting(false);
  };

  // 保存服务器设置
  const saveServer = () => {
    speechService.setServerAddress(serverAddr);
    setShowSettings(false);
    showHint('设置已保存');
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <h1>🗣️ SpeakEasy</h1>
        <button className="settings-btn" onClick={() => setShowSettings(true)} title="语音设置">
          <Settings size={18} />
        </button>
        <div className="accent-selector">
          <Globe size={16} />
          <select 
            value={currentAccent} 
            onChange={(e) => changeAccent(e.target.value as Accent)}
            className="accent-select"
          >
            {ACCENTS.map(accent => (
              <option key={accent} value={accent}>
                {SpeechService.getAccentInfo(accent).flag} {SpeechService.getAccentInfo(accent).name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* 主导航 */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <MessageCircle size={20} />
          <span>Chat</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'stories' ? 'active' : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          <BookOpen size={20} />
          <span>Stories</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          <Newspaper size={20} />
          <span>News</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'translate' ? 'active' : ''}`}
          onClick={() => setActiveTab('translate')}
        >
          <Languages size={20} />
          <span>Translate</span>
        </button>
      </nav>

      {/* 内容区域 */}
      <main className="content">
        {/* 聊天页面 */}
        {activeTab === 'chat' && (
          <div className="chat-container">
            <div className="messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-bubble">
                    <p>{msg.content}</p>
                    <div className="message-actions">
                      <button 
                        className="action-btn speak-btn"
                        onClick={() => speakText(msg.content)}
                        title="Read aloud"
                      >
                        {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 话题建议 */}
            <div className="topic-suggestions">
              <span className="topic-label">Try saying:</span>
              {topicSuggestions.slice(0, 4).map((topic, idx) => (
                <button 
                  key={idx} 
                  className="topic-chip"
                  onClick={() => insertTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>

            {/* 输入区域 */}
            <div className="input-area">
              <button 
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : startListening}
                title={isListening ? 'Stop' : 'Voice input'}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message or speak..."
                className="message-input"
              />
              <button className="send-btn" onClick={sendMessage}>
                <Send size={20} />
              </button>
              <button className="clear-btn" onClick={clearChat} title="Clear chat">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 故事页面 */}
        {activeTab === 'stories' && (
          <div className="stories-container">
            <div className="filter-bar">
              <span>Level:</span>
              {(['all', 'easy', 'medium', 'hard'] as const).map(level => (
                <button
                  key={level}
                  className={`filter-btn ${storyFilter === level ? 'active' : ''}`}
                  onClick={() => setStoryFilter(level)}
                >
                  {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>

            <div className="stories-list">
              {filteredStories.map(story => (
                <div key={story.id} className="story-card">
                  <div 
                    className="story-header"
                    onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                  >
                    <div className="story-info">
                      <h3>{story.title}</h3>
                      <div className="story-meta">
                        <span className={`difficulty ${story.difficulty}`}>
                          {story.difficulty}
                        </span>
                        <span className="category">{story.category}</span>
                      </div>
                    </div>
                    <button 
                      className="expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakStory(story);
                      }}
                    >
                      {isSpeaking ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    {expandedStory === story.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                  
                  {expandedStory === story.id && (
                    <div className="story-content">
                      <pre>{story.content}</pre>
                      <div className="story-actions">
                        <button 
                          className="story-action-btn"
                          onClick={() => speakStory(story)}
                        >
                          <Headphones size={16} /> Listen
                        </button>
                        <button 
                          className="story-action-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(story.content);
                          }}
                        >
                          Copy Text
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 新闻页面 */}
        {activeTab === 'news' && (
          <div className="news-container">
            <h2>📰 English News</h2>
            <p className="news-intro">Read and listen to improve your reading and listening skills!</p>
            
            <div className="news-list">
              {news.map(item => (
                <div key={item.id} className="news-card">
                  <div className="news-header">
                    <span className="news-source">{item.source}</span>
                    <span className="news-date">
                      {item.date.toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="news-summary">{item.summary}</p>
                  <div className="news-actions">
                    <button 
                      className="news-action-btn"
                      onClick={() => speakNews(item)}
                    >
                      <Headphones size={16} /> Listen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {news.length === 0 && (
              <div className="loading">Loading news...</div>
            )}
          </div>
        )}

        {/* 翻译页面 */}
        {activeTab === 'translate' && (
          <div className="translate-container">
            <h2>🌐 Translation</h2>
            
            <div className="translate-direction">
              <button 
                className={`direction-btn ${translateFrom === 'en' ? 'active' : ''}`}
                onClick={() => setTranslateFrom('en')}
              >
                🇬🇧 English → 🇨🇳 Chinese
              </button>
              <button 
                className={`direction-btn ${translateFrom === 'zh' ? 'active' : ''}`}
                onClick={() => setTranslateFrom('zh')}
              >
                🇨🇳 Chinese → 🇬🇧 English
              </button>
            </div>

            <div className="translate-input-area">
              <textarea
                value={translateText}
                onChange={(e) => setTranslateText(e.target.value)}
                placeholder={translateFrom === 'en' 
                  ? 'Enter English text to translate...' 
                  : '输入中文进行翻译...'}
                className="translate-input"
              />
              <div className="translate-buttons">
                <button 
                  className="translate-btn"
                  onClick={handleTranslate}
                  disabled={isTranslating || !translateText.trim()}
                >
                  {isTranslating ? 'Translating...' : 'Translate'}
                </button>
                {translateText && (
                  <button 
                    className="clear-translate-btn"
                    onClick={() => {
                      setTranslateText('');
                      setTranslateResult('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {translateResult && (
              <div className="translate-result">
                <div className="result-header">
                  <span>Translation:</span>
                  <button 
                    className="speak-translation-btn"
                    onClick={speakTranslation}
                    disabled={isSpeaking}
                  >
                    <Volume2 size={16} /> Listen
                  </button>
                </div>
                <div className="result-text">
                  {translateResult}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 语音状态指示器 */}
      {isSpeaking && (
        <div className="speaking-indicator">
          <Volume2 className="pulse" size={20} />
          <span>Speaking...</span>
        </div>
      )}

      {/* 提示信息 */}
      {hint && (
        <div className="hint-toast">
          {hint}
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h3>⚙️ 语音设置</h3>
              <button className="settings-close" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="settings-section">
              <h4>🎤 语音识别</h4>
              <p className="settings-status">
                {speechService.getRecognitionEngine() === 'ios-native'
                  ? '✅ iOS 语音识别（SFSpeechRecognizer，系统自带，中英文离线）'
                  : speechService.getRecognitionEngine() === 'native'
                    ? '✅ 系统语音识别（使用手机自带语音服务，无需 Google）'
                    : speechService.getRecognitionEngine() === 'webkit'
                      ? 'ℹ️ 浏览器语音识别'
                      : '❌ 此设备不支持语音识别'}
              </p>
              <button
                className="server-test-btn"
                style={{ marginTop: '8px' }}
                onClick={() => { window.location.href = '/voice-test.html'; }}
              >
                🔍 语音诊断（排查识别问题）
              </button>
            </div>

            <div className="settings-section">
              <h4>🔊 朗读引擎</h4>
              <p className="settings-status">
                {speechService.getTtsEngine() === 'ios-native'
                  ? '✅ iOS 朗读引擎（AVSpeechSynthesizer，系统自带，中英文离线）'
                  : speechService.getTtsEngine() === 'system'
                    ? '✅ 系统朗读引擎'
                    : speechService.getTtsEngine() === 'edge-server'
                      ? 'ℹ️ 局域网 TTS 服务器'
                      : '❌ 未检测到朗读引擎，请配置下方服务器'}
              </p>
            </div>

            <div className="settings-section">
              <h4>🖥️ 电脑 TTS 服务器（无需Google，免费）</h4>
              <p className="settings-help">
                1. 在电脑上双击 <b>启动TTS服务器.bat</b>（首次会自动安装依赖）<br/>
                2. 把电脑显示的地址（如 http://192.168.1.100:8765）填到下面<br/>
                3. 手机和电脑需连接同一 WiFi
              </p>
              <div className="server-input-row">
                <input
                  type="text"
                  value={serverAddr}
                  onChange={(e) => setServerAddr(e.target.value)}
                  placeholder="http://192.168.1.100:8765"
                  className="server-input"
                />
                <button className="server-test-btn" onClick={testServer} disabled={isTesting}>
                  {isTesting ? '测试中...' : '测试连接'}
                </button>
              </div>
              {serverTest && (
                <p className={`server-test-result ${serverTest.ok ? 'ok' : 'fail'}`}>
                  {serverTest.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {serverTest.message}
                </p>
              )}
            </div>

            <div className="settings-footer">
              <button className="settings-save-btn" onClick={saveServer}>
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
