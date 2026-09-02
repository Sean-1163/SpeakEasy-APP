// AI对话服务 - 基于规则和模板的对话系统

// 对话模板
const GREETINGS = [
  "Hello! How can I help you practice English today?",
  "Hi there! Ready for some English conversation?",
  "Welcome! What would you like to talk about?"
];

const TOPIC_SUGGESTIONS = [
  "Tell me about your day.",
  "What did you do this weekend?",
  "Do you have any hobbies?",
  "What is your favorite food?",
  "Tell me about your family.",
  "What do you like to do for fun?",
  "Have you traveled anywhere interesting?",
  "What is your dream job?"
];

const PRACTICE_PHRASES = {
  greeting: [
    "Hello! Nice to meet you!",
    "Good morning! How are you today?",
    "Hi! How's your day going?"
  ],
  introduction: [
    "My name is [name]. I am from [city], [country].",
    "Let me introduce myself. I am [name] and I work as a [job].",
    "I would like to tell you about myself. My name is [name]."
  ],
  asking_help: [
    "Could you help me with my pronunciation?",
    "I don't understand. Could you say that again, please?",
    "Could you speak more slowly?"
  ],
  leaving: [
    "It was nice talking to you. Goodbye!",
    "Thank you for the conversation. See you next time!",
    "I have to go now. It was great chatting with you!"
  ]
};

class AIService {
  private conversationHistory: { role: string; content: string }[] = [];


  // 重置对话历史
  resetHistory() {
    this.conversationHistory = [];
  }

  // 生成随机欢迎语
  getGreeting(): string {
    return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  }

  // 获取话题建议
  getTopicSuggestions(): string[] {
    return TOPIC_SUGGESTIONS;
  }

  // 获取练习短语
  getPracticePhrases(category: keyof typeof PRACTICE_PHRASES): string[] {
    return PRACTICE_PHRASES[category] || [];
  }

  // 处理用户输入并生成回复
  async generateResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase().trim();

    // 添加用户消息到历史
    this.conversationHistory.push({ role: 'user', content: userMessage });

    let response: string;

    // 简单的模式匹配回复
    if (this.matchPatterns(lowerMessage, ['hello', 'hi', 'hey', 'greetings'])) {
      response = this.randomPick([
        "Hello! How are you today?",
        "Hi there! It's great to see you!",
        "Hello! What would you like to practice?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['how are you', 'how do you do', "how's it going"])) {
      response = this.randomPick([
        "I'm doing well, thank you for asking! How about you?",
        "I'm great! Ready to help you practice English.",
        "I'm fine, thanks! What shall we talk about today?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['bye', 'goodbye', 'see you', 'talk later'])) {
      response = this.randomPick([
        "Goodbye! Keep practicing! It was great talking with you!",
        "See you next time! Don't forget to practice every day!",
        "Bye for now! You're doing great with your English!"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['thank you', 'thanks', 'appreciate'])) {
      response = this.randomPick([
        "You're welcome! Happy to help!",
        "No problem! Keep up the good work!",
        "Anytime! Practice makes perfect!"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['my name is', "i'm ", 'i am ', 'call me'])) {
      response = this.randomPick([
        "Nice to meet you! That's a lovely name.",
        "Great to know you! Where are you from?",
        "Nice to meet you! What do you like to do in your free time?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['from ', 'i live in', 'i\'m from'])) {
      response = this.randomPick([
        "That sounds interesting! What's it like living there?",
        "I see! Have you always lived there?",
        "That's nice! What do you like most about your hometown?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['weather', 'rain', 'sunny', 'hot', 'cold'])) {
      response = this.randomPick([
        "The weather can really affect our mood, can't it? What's the weather like where you are?",
        "I agree! By the way, do you have any plans for today?",
        "That's true! Is it a good day for outdoor activities?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['food', 'eat', 'dinner', 'lunch', 'breakfast'])) {
      response = this.randomPick([
        "Food is always a great topic! What's your favorite dish?",
        "Yummy! I love food too. Do you like cooking?",
        "That's interesting! Do you prefer local food or international cuisine?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['help', 'pronunciation', 'vocabulary', 'grammar'])) {
      response = this.randomPick([
        "Of course! I can help you with that. What specific area would you like to work on?",
        "Sure! Let's practice together. Try saying: '",
        "I'm here to help! Would you like me to speak slowly or explain any words?"
      ]);
    } else if (this.matchPatterns(lowerMessage, ['repeat', 'again', 'slower', 'more slowly'])) {
      response = this.randomPick([
        "Sure, let me say that again more slowly: ",
        "I can speak more slowly for you: ",
        "Here it is again, take your time: "
      ]);
    } else if (this.matchPatterns(lowerMessage, ['what can i say', 'what should i', 'help me respond'])) {
      response = `Here are some useful phrases you could say:\n${PRACTICE_PHRASES.greeting.map(p => `- ${p}`).join('\n')}`;
    } else if (this.matchPatterns(lowerMessage, ['tell me a story', 'story', 'once upon'])) {
      response = "I have some great stories for you! Go to the Stories section to read and listen to them. Would you like some conversation practice instead, or shall I suggest a topic?";
    } else if (this.matchPatterns(lowerMessage, ['news', 'news article'])) {
      response = "Check out the News section! There are English news articles there. Would you like me to suggest some topics for conversation instead?";
    } else if (this.matchPatterns(lowerMessage, ['translate', 'translation', 'mean', 'meaning'])) {
      response = "Use the translate feature to convert between English and Chinese. Type your text and I'll help you understand it!";
    } else {
      // 默认回复
      response = this.randomPick([
        "That's interesting! Can you tell me more about that?",
        "I see! What else would you like to share?",
        "Tell me more! I'm enjoying our conversation.",
        "That's a great point! How do you feel about it?",
        "Interesting! Let's talk more about that.",
        "I understand. Would you like to practice any specific vocabulary related to this topic?"
      ]);
    }

    // 添加AI回复到历史
    this.conversationHistory.push({ role: 'assistant', content: response });

    return response;
  }

  // 匹配模式
  private matchPatterns(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  // 随机选择
  private randomPick(items: string[]): string {
    return items[Math.floor(Math.random() * items.length)];
  }

  // 获取对话历史
  getHistory() {
    return this.conversationHistory;
  }
}

export const aiService = new AIService();
