interface Tweet {
  id: string;
  text: string;
  author: string;
  url: string;
  likes: number;
  retweets: number;
  createdAt: string;
}

interface ThreadPost {
  id: string;
  text: string;
  author: string;
  url: string;
  likes: number;
  createdAt: string;
}

export class SocialMediaService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15분

  async searchTwitter(query: string): Promise<Tweet[]> {
    const cacheKey = `twitter_${query}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // 시뮬레이션: 실제로는 X API v2 호출
    await this.simulateDelay(500);
    
    const mockTweets: Tweet[] = [
      {
        id: `tweet_${Date.now()}`,
        text: `Check out this amazing #aiagent tool: LangChain Agents - Build powerful AI agents with ease! ${query}`,
        author: '@ai_dev',
        url: 'https://github.com/langchain-ai/langchain',
        likes: 1234,
        retweets: 567,
        createdAt: new Date().toISOString(),
      },
    ];

    this.cache.set(cacheKey, { data: mockTweets, timestamp: Date.now() });
    return mockTweets;
  }

  async searchThreads(query: string): Promise<ThreadPost[]> {
    const cacheKey = `threads_${query}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    await this.simulateDelay(500);

    const mockPosts: ThreadPost[] = [
      {
        id: `thread_${Date.now()}`,
        text: `New #vibecoding library just dropped! Perfect for building AI agents. ${query}`,
        author: '@tech_creator',
        url: 'https://github.com/example/ai-tool',
        likes: 890,
        createdAt: new Date().toISOString(),
      },
    ];

    this.cache.set(cacheKey, { data: mockPosts, timestamp: Date.now() });
    return mockPosts;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
