// 新闻服务 - 获取BBC Learning English新闻
import type { NewsItem } from '../types';

// 使用公共RSS解析服务
const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

// 新闻RSS源
const NEWS_SOURCES = {
  bbcLearning: 'https://feeds.bbci.co.uk/learningenglish/english/features/news-views/rss.xml',
  voaLearning: 'https://learningenglish.voanews.com/api/zqhbqegs'
};

class NewsService {
  // 获取新闻列表
  async getNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${RSS2JSON_API}${encodeURIComponent(NEWS_SOURCES.bbcLearning)}`);
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error('Failed to fetch news');
      }

      return data.items.map((item: { title: string; description: string; link: string; pubDate: string }, index: number) => ({
        id: `news-${Date.now()}-${index}`,
        title: item.title,
        summary: this.stripHtml(item.description || '').slice(0, 200),
        content: item.description || '',
        date: new Date(item.pubDate),
        source: 'BBC Learning English'
      })).slice(0, 10); // 只取前10条
    } catch (error) {
      console.error('Error fetching news:', error);
      // 如果API失败，返回示例新闻
      return this.getSampleNews();
    }
  }

  // 获取特定新闻的详细内容
  async getNewsDetail(link: string): Promise<string> {
    try {
      const response = await fetch(link);
      const html = await response.text();
      // 简单提取正文（实际生产环境需要更好的解析）
      return this.extractContent(html);
    } catch {
      return 'Unable to fetch full content.';
    }
  }

  // 去除HTML标签
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // 简单提取正文内容
  private extractContent(html: string): string {
    // 移除script和style标签
    let content = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    // 提取body中的文本
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
    return this.stripHtml(content).slice(0, 1000);
  }

  // 示例新闻（备用）
  private getSampleNews(): NewsItem[] {
    return [
      {
        id: 'sample-1',
        title: 'Climate Change: What Can We Do?',
        summary: 'Learn about the effects of climate change and what we can do to help protect our planet.',
        content: 'Climate change is one of the biggest challenges facing our world today. Rising temperatures, extreme weather, and melting ice caps are all signs that our planet is changing...',
        date: new Date(),
        source: 'BBC Learning English'
      },
      {
        id: 'sample-2',
        title: 'Technology in Education',
        summary: 'How technology is changing the way we learn and teach.',
        content: 'The internet has transformed education in many ways. Online courses, educational apps, and virtual classrooms make learning more accessible than ever before...',
        date: new Date(Date.now() - 86400000),
        source: 'BBC Learning English'
      },
      {
        id: 'sample-3',
        title: 'Healthy Habits for a Better Life',
        summary: 'Simple tips for staying healthy in your daily life.',
        content: 'Good health is our most valuable asset. Regular exercise, healthy eating, and enough sleep are the foundations of a healthy lifestyle...',
        date: new Date(Date.now() - 172800000),
        source: 'BBC Learning English'
      }
    ];
  }
}

export const newsService = new NewsService();
