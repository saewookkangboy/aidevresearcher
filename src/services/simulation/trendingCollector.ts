import { Resource } from '../../utils/types';
import { IngestionSimulator } from './ingestionSimulator';
import { SocialTrendingService } from '../api/socialTrendingService';

const FALLBACK_SOURCES = [
  { title: 'LangGraph Agents', url: 'https://github.com/langchain-ai/langgraph', command: 'pip install langgraph' },
  { title: 'CrewAI', url: 'https://github.com/joaomdmoura/crewai', command: 'pip install crewai' },
  { title: 'dev-agent-kit', url: 'https://github.com/saewookkangboy/dev-agent-kit', command: 'npm install -g dev-agent-kit' },
  { title: 'AutoGen', url: 'https://github.com/microsoft/autogen', command: 'pip install pyautogen' },
  { title: 'LlamaIndex', url: 'https://github.com/run-llama/llama_index', command: 'pip install llama-index' },
];

interface SourceItem {
  title: string;
  url: string;
  command?: string;
}

export class TrendingCollector {
  private ingestion = new IngestionSimulator();
  private social = new SocialTrendingService();

  async collect(keyword: string): Promise<Resource[]> {
    const candidates = await this.fetchStableSources(keyword);
    const picks = candidates.slice(0, 3);
    const resources: Resource[] = [];

    for (const item of picks) {
      const base = await this.ingestion.ingestURL(item.url);
      const tagged: Resource = {
        ...base,
        title: `${item.title} (${keyword})`,
        command: item.command || base.command,
        tags: Array.from(new Set([...base.tags, keyword.toLowerCase(), 'trending'])),
        socialMetrics: {
          likes: Math.floor(Math.random() * 5000) + 100,
          shares: Math.floor(Math.random() * 2000) + 50,
          trendingDate: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      resources.push(tagged);
    }

    return resources;
  }

  private async fetchStableSources(keyword: string): Promise<SourceItem[]> {
    const [github, social] = await Promise.all([
      this.fetchGitHubTrending(keyword).catch(() => []),
      this.social.fetchTrending(keyword).catch(() => []),
    ]);
    const merged = [...github, ...social];
    if (merged.length > 0) return merged;
    return FALLBACK_SOURCES;
  }

  private async fetchGitHubTrending(keyword: string): Promise<SourceItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const query = `${keyword} stars:>50`;
      const resp = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
        { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal }
      );
      clearTimeout(timeout);

      if (resp.status === 403) {
        // Rate limit 시 fallback
        return [];
      }
      if (!resp.ok) throw new Error('github fetch failed');

      const data = await resp.json();
      return (data.items || []).map((item: any) => ({
        title: item.full_name || item.name,
        url: item.html_url,
        command: item.language && typeof item.language === 'string' && item.language.toLowerCase().includes('python')
          ? `pip install ${item.name.toLowerCase()}`
          : `npm install ${item.name.toLowerCase()}`,
      }));
    } catch (err) {
      clearTimeout(timeout);
      return [];
    }
  }
}
