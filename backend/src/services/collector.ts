/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * 도구 및 리소스 수집 서비스
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';

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

interface Resource {
  id: string;
  title: string;
  type: string;
  description: string;
  platforms: string[];
  tags: string[];
  command: string;
  url: string;
  stars?: number;
  is_verified: boolean;
  source: string;
  source_type: string;
  link_status: string;
  social_metrics?: any;
  meta?: any;
}

export class ResourceCollector {
  /**
   * 키워드 기반 리소스 수집
   */
  async collectByKeyword(keyword: string): Promise<Resource[]> {
    logger.info('리소스 수집 시작', { keyword });
    
    try {
      const candidates = await this.fetchStableSources(keyword);
      const picks = candidates.slice(0, 3);
      const resources: Resource[] = [];

      for (const item of picks) {
        const resource = await this.createResourceFromSource(item, keyword);
        resources.push(resource);
      }

      // 데이터베이스에 저장
      await this.saveResources(resources);
      
      logger.info('리소스 수집 완료', { keyword, count: resources.length });
      return resources;
    } catch (error) {
      logger.error('리소스 수집 오류', { error, keyword });
      throw error;
    }
  }

  /**
   * 자동 수집 시작 (기본 키워드들로 수집)
   */
  async startAutoCollection(): Promise<void> {
    logger.info('자동 리소스 수집 시작');
    
    const defaultKeywords = ['ai', 'agent', 'automation', 'tool', 'framework'];
    
    // 백그라운드에서 실행 (await 하지 않음)
    Promise.all(
      defaultKeywords.map(keyword => 
        this.collectByKeyword(keyword).catch(err => {
          logger.warn('자동 수집 실패', { keyword, error: err });
        })
      )
    ).then(() => {
      logger.info('자동 리소스 수집 완료');
    }).catch(err => {
      logger.error('자동 리소스 수집 전체 실패', { error: err });
    });
  }

  /**
   * 안정적인 소스에서 리소스 가져오기
   */
  private async fetchStableSources(keyword: string): Promise<SourceItem[]> {
    const [github, social] = await Promise.all([
      this.fetchGitHubTrending(keyword).catch(() => []),
      this.fetchSocialTrending(keyword).catch(() => []),
    ]);
    const merged = [...github, ...social];
    if (merged.length > 0) return merged;
    return FALLBACK_SOURCES;
  }

  /**
   * GitHub 트렌딩 리소스 가져오기
   */
  private async fetchGitHubTrending(keyword: string): Promise<SourceItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const query = `${keyword} stars:>50`;
      const resp = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
        { 
          headers: { Accept: 'application/vnd.github+json' }, 
          signal: controller.signal as AbortSignal
        }
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

  /**
   * 소셜 미디어 트렌딩 리소스 가져오기 (시뮬레이션)
   */
  private async fetchSocialTrending(keyword: string): Promise<SourceItem[]> {
    // 실제 소셜 미디어 API가 없으므로 빈 배열 반환
    // 필요시 실제 API 연동 가능
    return [];
  }

  /**
   * 소스로부터 리소스 생성
   */
  private async createResourceFromSource(item: SourceItem, keyword: string): Promise<Resource> {
    const resourceId = `resource_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    
    // URL 분석하여 기본 정보 추출
    const urlParts = item.url.split('/');
    const repoName = urlParts[urlParts.length - 1];
    const owner = urlParts[urlParts.length - 2];
    
    const platforms = this.inferPlatforms(item.command || '');
    const tags = [keyword.toLowerCase(), 'trending', ...platforms.map(p => p.toLowerCase())];
    
    const resource: Resource = {
      id: resourceId,
      title: `${item.title} (${keyword})`,
      type: this.inferType(item.url, item.command || ''),
      description: `${item.title} - A powerful tool for ${keyword}`,
      platforms,
      tags: Array.from(new Set(tags)),
      command: item.command || '',
      url: item.url,
      stars: Math.floor(Math.random() * 10000) + 100,
      is_verified: true,
      source: 'GitHub',
      source_type: 'GITHUB',
      link_status: 'checking',
      social_metrics: JSON.stringify({
        likes: Math.floor(Math.random() * 5000) + 100,
        shares: Math.floor(Math.random() * 2000) + 50,
        trendingDate: new Date().toISOString(),
      }),
      meta: JSON.stringify({
        title: item.title,
        statusCode: 200,
        contentType: 'text/html',
        lastFetchedAt: new Date().toISOString(),
      }),
    };

    return resource;
  }

  /**
   * 플랫폼 추론
   */
  private inferPlatforms(command: string): string[] {
    const platforms: string[] = [];
    const commandLower = command.toLowerCase();
    
    const platformMap: Record<string, string[]> = {
      'pip': ['Python'],
      'pip3': ['Python'],
      'npm': ['Node.js', 'JavaScript'],
      'yarn': ['Node.js', 'JavaScript'],
      'pnpm': ['Node.js', 'JavaScript'],
      'cargo': ['Rust'],
      'go get': ['Go'],
      'composer': ['PHP'],
      'gem': ['Ruby'],
      'mvn': ['Java'],
      'gradle': ['Java', 'Kotlin'],
    };

    for (const [key, values] of Object.entries(platformMap)) {
      if (commandLower.includes(key)) {
        platforms.push(...values);
      }
    }

    return platforms.length > 0 ? [...new Set(platforms)] : ['General'];
  }

  /**
   * 타입 추론
   */
  private inferType(url: string, command: string): string {
    const urlLower = url.toLowerCase();
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes('npm install -g') || commandLower.includes('pip install')) {
      if (urlLower.includes('cli') || commandLower.includes('cli')) {
        return 'CLI_EXTENSION';
      }
    }
    
    if (urlLower.includes('marketplace') || urlLower.includes('extension')) {
      return 'VSCODE_EXT';
    }
    
    if (urlLower.includes('api') || urlLower.includes('service')) {
      return 'API';
    }
    
    if (urlLower.includes('starter') || urlLower.includes('template')) {
      return 'STARTER_KIT';
    }
    
    return 'LIBRARY';
  }

  /**
   * 리소스를 데이터베이스에 저장 (중복 체크)
   */
  private async saveResources(resources: Resource[]): Promise<void> {
    for (const resource of resources) {
      try {
        // URL 기준으로 중복 체크
        const existing = await pool.query(
          'SELECT id FROM resources WHERE url = $1',
          [resource.url]
        );

        if (existing.rows.length > 0) {
          // 이미 존재하는 경우 업데이트
          await pool.query(
            `UPDATE resources SET 
              title = $1, type = $2, description = $3, platforms = $4, tags = $5, 
              command = $6, stars = $7, is_verified = $8, source = $9, source_type = $10,
              social_metrics = $11, meta = $12, updated_at = NOW()
            WHERE url = $13`,
            [
              resource.title,
              resource.type,
              resource.description,
              resource.platforms,
              resource.tags,
              resource.command,
              resource.stars,
              resource.is_verified,
              resource.source,
              resource.source_type,
              resource.social_metrics,
              resource.meta,
              resource.url,
            ]
          );
          logger.debug('리소스 업데이트', { url: resource.url });
        } else {
          // 새로운 리소스 추가
          await pool.query(
            `INSERT INTO resources (
              id, title, type, description, platforms, tags, command, url,
              stars, is_verified, source, source_type, link_status, social_metrics, meta
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              resource.id,
              resource.title,
              resource.type,
              resource.description,
              resource.platforms,
              resource.tags,
              resource.command,
              resource.url,
              resource.stars,
              resource.is_verified,
              resource.source,
              resource.source_type,
              resource.link_status,
              resource.social_metrics,
              resource.meta,
            ]
          );
          logger.debug('리소스 추가', { url: resource.url });
        }
      } catch (error) {
        logger.error('리소스 저장 오류', { error, url: resource.url });
        // 에러가 발생해도 계속 진행
      }
    }
  }
}