interface SocialItem {
  title: string;
  url: string;
  command?: string;
}

const MOCK_SOCIAL: SocialItem[] = [
  {
    title: 'AI SEO Toolkit',
    url: 'https://github.com/example/ai-seo-toolkit',
    command: 'npm install ai-seo-toolkit',
  },
  {
    title: 'GEO Optimizer',
    url: 'https://github.com/example/geo-optimizer',
    command: 'pip install geo-optimizer',
  },
  {
    title: 'AIO Optimizer',
    url: 'https://github.com/example/aio-optimizer',
    command: 'npm install aio-optimizer',
  },
];

export class SocialTrendingService {
  private apiBase = import.meta.env.VITE_SOCIAL_FEED_API as string | undefined;

  async fetchTrending(keyword: string): Promise<SocialItem[]> {
    if (!this.apiBase) {
      return MOCK_SOCIAL;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const resp = await fetch(`${this.apiBase}?q=${encodeURIComponent(keyword)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!resp.ok) {
        return MOCK_SOCIAL;
      }
      const data = await resp.json();
      if (!Array.isArray(data)) {
        return MOCK_SOCIAL;
      }
      return data as SocialItem[];
    } catch {
      clearTimeout(timeout);
      return MOCK_SOCIAL;
    }
  }
}
