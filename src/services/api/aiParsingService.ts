/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource, ResourceType, SourceType } from '../../utils/types';
import { isGitHubURL, isPyPIURL, isDocumentationURL } from '../../utils/validators';

interface SocialPost {
  text: string;
  url: string;
  author?: string;
  likes?: number;
  shares?: number;
  platform?: 'X' | 'THREADS' | 'REDDIT';
}

export class AIParsingService {
  async parseSocialPost(post: SocialPost): Promise<Partial<Resource>> {
    // 시뮬레이션: 실제로는 LLM API 호출
    await this.simulateDelay(1000);

    // 텍스트에서 도구 이름 추출
    const title = this.extractTitle(post.text);
    const description = this.extractDescription(post.text);
    const command = this.extractCommand(post.text);
    const tags = this.extractTags(post.text);
    const type = this.inferType(post.text, post.url);

    // 링크 검증
    const isValid = await this.verifyLink(post.url);
    if (!isValid) {
      throw new Error('Invalid link');
    }

    // 스팸 필터링
    const sentimentScore = await this.checkSentiment(post.text);
    if (sentimentScore < 0.3) {
      throw new Error('Low quality post detected');
    }

    return {
      title,
      description,
      command,
      tags,
      type,
      url: post.url,
      isVerified: true,
      source: post.platform === 'X' ? 'X (Twitter)' : post.platform === 'THREADS' ? 'Threads' : 'Social Media',
      sourceType: post.platform === 'X' ? 'SOCIAL_X' : 'SOCIAL_THREADS' as SourceType,
      socialMetrics: {
        likes: post.likes || 0,
        shares: post.shares || 0,
        trendingDate: new Date().toISOString(),
        author: post.author,
        platform: post.platform,
      },
    };
  }

  async analyzeURL(url: string): Promise<Partial<Resource>> {
    await this.simulateDelay(1500);

    let title = '';
    let description = '';
    let command = '';
    let type: ResourceType = 'LIBRARY';
    let stars = 0;
    let tags: string[] = [];

    if (isGitHubURL(url)) {
      // GitHub 리포지토리 분석 시뮬레이션
      const repoName = url.split('/').slice(-1)[0];
      const owner = url.split('/').slice(-2)[0];
      
      // dev-agent-kit 특별 처리
      if (url.includes('dev-agent-kit') || (owner === 'saewookkangboy' && repoName === 'dev-agent-kit')) {
        title = 'dev-agent-kit';
        description = 'Development total package - 통합 개발 에이전트 키트. To-do 관리, Agent Role 설정, Spec-kit 관리, AI 강화학습, Skills 관리, SEO/AI SEO/GEO/AIO 최적화, FastAPI 서버, API 키 관리 등 개발 워크플로우를 자동화하는 CLI 도구.';
        command = 'npm install -g dev-agent-kit';
        type = 'CLI_EXTENSION';
        tags = ['cli', 'agent', 'workflow', 'automation', 'todo', 'spec-kit', 'seo', 'ai-seo', 'geo', 'aio', 'fastapi'];
        return {
          title,
          description,
          command,
          type,
          tags,
          url,
          isVerified: true,
          source: 'GitHub',
          sourceType: 'GITHUB' as SourceType,
        };
      } else {
        title = repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        description = `A powerful ${title} library for building AI applications.`;
        command = `pip install ${repoName.toLowerCase()}`;
        type = 'LIBRARY';
        stars = Math.floor(Math.random() * 10000) + 100;
        tags = [repoName.toLowerCase()];
      }
    } else if (isPyPIURL(url)) {
      // PyPI 패키지 분석 시뮬레이션
      const packageName = url.split('/').slice(-2)[0];
      title = packageName;
      description = `Python package: ${packageName}`;
      command = `pip install ${packageName}`;
      type = 'LIBRARY';
      tags = [packageName];
    } else if (isDocumentationURL(url)) {
      // 문서 페이지 분석 시뮬레이션
      title = 'API Documentation';
      description = 'Official API documentation and guides.';
      type = 'API';
      tags = ['api', 'documentation'];
    } else {
      title = 'Resource';
      description = 'A useful development resource.';
      tags = ['general'];
    }

    return {
      title,
      description,
      command,
      type,
      stars,
      tags,
      url,
      isVerified: true,
      source: isGitHubURL(url) ? 'GitHub' : 'Official',
      sourceType: isGitHubURL(url) ? 'GITHUB' : 'OFFICIAL' as SourceType,
    };
  }

  private extractTitle(text: string): string {
    // 간단한 추출 로직 (실제로는 LLM 사용)
    const patterns = [
      /(?:Check out|Introducing|New)\s+([A-Z][a-zA-Z\s]+?)(?:\s|:|!|\.|$)/,
      /#(\w+)/,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    return text.split(' ').slice(0, 5).join(' ');
  }

  private extractDescription(text: string): string {
    // 설명 추출 (실제로는 LLM 사용)
    return text.length > 150 ? text.slice(0, 150) + '...' : text;
  }

  private extractCommand(text: string): string {
    // 설치 명령어 추출
    const pipMatch = text.match(/pip install\s+[\w-]+/i);
    if (pipMatch) return pipMatch[0];

    const npmMatch = text.match(/npm install\s+[\w-]+/i);
    if (npmMatch) return npmMatch[0];

    return '';
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const hashtags = text.match(/#\w+/g);
    if (hashtags) {
      tags.push(...hashtags.map(t => t.slice(1).toLowerCase()));
    }
    return tags;
  }

  private inferType(text: string, url: string): ResourceType {
    const lowerText = text.toLowerCase();
    const lowerUrl = url.toLowerCase();

    if (lowerText.includes('cli') || lowerText.includes('command')) return 'CLI_EXTENSION';
    if (lowerText.includes('skill') || lowerText.includes('agent')) return 'AGENT_SKILL';
    if (lowerText.includes('extension') || lowerUrl.includes('marketplace')) return 'VSCODE_EXT';
    if (lowerText.includes('api') || lowerText.includes('service')) return 'API';
    if (lowerText.includes('starter') || lowerText.includes('template')) return 'STARTER_KIT';
    
    return 'LIBRARY';
  }

  private async verifyLink(url: string): Promise<boolean> {
    // 링크 유효성 검증 시뮬레이션
    await this.simulateDelay(300);
    return url.startsWith('http');
  }

  private async checkSentiment(text: string): Promise<number> {
    // 스팸 필터링 시뮬레이션 (0-1 점수)
    await this.simulateDelay(200);
    
    const spamKeywords = ['buy now', 'limited offer', 'click here', 'free money'];
    const hasSpam = spamKeywords.some(keyword => text.toLowerCase().includes(keyword));
    
    return hasSpam ? 0.2 : 0.8;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

