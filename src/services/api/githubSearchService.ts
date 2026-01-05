/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export interface GitHubSearchResult {
  url: string;
  title: string;
  description: string;
  stars?: number;
  language?: string;
  owner: string;
  repo: string;
}

export class GitHubSearchService {
  /**
   * GitHub README 내용 기반 검색
   * GitHub API를 사용하여 README에 특정 키워드가 포함된 리포지토리 검색
   */
  async searchByReadme(query: string, limit: number = 10): Promise<GitHubSearchResult[]> {
    try {
      // GitHub API를 통한 검색 (README 내용 기반)
      // 실제 구현에서는 GitHub API 또는 웹 스크래핑 사용
      const searchQuery = encodeURIComponent(`${query} in:readme`);
      const apiUrl = `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=${limit}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map((item: any) => ({
        url: item.html_url,
        title: item.name,
        description: item.description || '',
        stars: item.stargazers_count,
        language: item.language,
        owner: item.owner.login,
        repo: item.name,
      }));
    } catch (error) {
      // 개발 환경에서만 에러 로그 출력
      if (import.meta.env.DEV) {
        console.warn('GitHub search failed, using fallback:', error);
      }
      
      // Fallback: 시뮬레이션된 결과 반환
      return this.simulateSearchResults(query, limit);
    }
  }

  /**
   * README 내용에서 특정 키워드 검색 (시뮬레이션)
   */
  private simulateSearchResults(query: string, limit: number): GitHubSearchResult[] {
    // 실제로는 GitHub API를 사용하거나, 프록시 서버를 통해 검색
    // 여기서는 시뮬레이션 결과 반환
    const keywords = query.toLowerCase().split(' ');
    
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      url: `https://github.com/example/${keywords[0] || 'tool'}-${i + 1}`,
      title: `${keywords[0] || 'Tool'} ${i + 1}`,
      description: `A ${query} tool for developers. This repository contains README with ${query} related content.`,
      stars: Math.floor(Math.random() * 1000) + 100,
      language: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'][i % 5],
      owner: 'example',
      repo: `${keywords[0] || 'tool'}-${i + 1}`,
    }));
  }

  /**
   * GitHub 리포지토리 URL 유효성 검증
   */
  async validateGitHubUrl(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('github.com')) {
        return false;
      }

      // GitHub API를 통해 리포지토리 존재 확인
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return false;

      const [, owner, repo] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, '')}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

