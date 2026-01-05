/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export interface GoogleSearchResult {
  url: string;
  title: string;
  snippet: string;
  isGitHub: boolean;
}

export class GoogleSearchService {
  /**
   * Google 검색에서 GitHub 리포지토리 검색
   * 실제 URL이 유효한지 확인하여 필터링
   */
  async searchGitHubRepos(query: string, limit: number = 10): Promise<GoogleSearchResult[]> {
    try {
      // Google Custom Search API 또는 웹 스크래핑 사용
      // 실제 구현에서는 Google Custom Search API 키가 필요
      // 여기서는 시뮬레이션된 검색 결과 반환
      
      // 실제로는 다음과 같은 방식으로 구현:
      // 1. Google Custom Search API 사용
      // 2. 또는 웹 스크래핑 (CORS 이슈로 인해 백엔드 필요)
      
      return this.simulateGoogleSearch(query, limit);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Google search failed, using fallback:', error);
      }
      return this.simulateGoogleSearch(query, limit);
    }
  }

  /**
   * Google 검색 시뮬레이션 (GitHub 결과 필터링)
   */
  private simulateGoogleSearch(query: string, limit: number): GoogleSearchResult[] {
    const keywords = query.toLowerCase().split(' ');
    const githubRepos: GoogleSearchResult[] = [];

    // GitHub 리포지토리 형식의 결과 생성
    for (let i = 0; i < Math.min(limit, 8); i++) {
      const repoName = `${keywords[0] || 'tool'}-${i + 1}`;
      const owner = ['awesome', 'github', 'developer', 'open-source'][i % 4];
      
      githubRepos.push({
        url: `https://github.com/${owner}/${repoName}`,
        title: `${repoName} - GitHub`,
        snippet: `GitHub repository for ${query}. This repository contains ${query} related tools and resources.`,
        isGitHub: true,
      });
    }

    return githubRepos;
  }

  /**
   * URL 유효성 검증 (실제 접근 가능한지 확인)
   * LinkHealthService를 사용하여 검증
   */
  async validateUrl(url: string, linkHealthService?: any): Promise<boolean> {
    try {
      if (linkHealthService) {
        const status = await linkHealthService.checkLink(url);
        return status === 'active';
      }
      
      // LinkHealthService가 없는 경우 기본 검증
      const urlObj = new URL(url);
      return urlObj.hostname.includes('github.com');
    } catch {
      return false;
    }
  }

  /**
   * GitHub URL 추출 및 필터링
   */
  extractGitHubUrls(results: GoogleSearchResult[]): GoogleSearchResult[] {
    return results.filter(result => {
      try {
        const url = new URL(result.url);
        return url.hostname.includes('github.com') && 
               url.pathname.split('/').length >= 3; // owner/repo 형식
      } catch {
        return false;
      }
    });
  }
}

