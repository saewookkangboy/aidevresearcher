/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource } from '../../utils/types';
import { AIParsingService } from '../api/aiParsingService';

export class IngestionSimulator {
  private aiService: AIParsingService;

  constructor() {
    this.aiService = new AIParsingService();
  }

  async ingestURL(url: string): Promise<Resource> {
    // 1. URL 유효성 검증
    this.validateURL(url);

    // 2. AI 분석
    const analysis = await this.aiService.analyzeURL(url);
    const meta = this.generateMetaSnapshot(url);
    const extraTags = this.extractTagsFromURL(url);

    // 3. Resource 객체 생성
    const resource: Resource = {
      id: `resource_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      title: analysis.title || 'Untitled Resource',
      type: analysis.type || 'LIBRARY',
      description: analysis.description || meta.title || 'No description available',
      platforms: this.inferPlatforms(analysis.command || ''),
      tags: Array.from(new Set([...this.generateTags(analysis), ...extraTags])),
      command: analysis.command || '',
      url: url,
      stars: analysis.stars,
      isVerified: analysis.isVerified || false,
      source: analysis.source || 'User',
      sourceType: analysis.sourceType || 'USER',
      linkStatus: 'checking',
      meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return resource;
  }

  private validateURL(url: string): void {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL은 http 또는 https 프로토콜이어야 합니다');
      }
    } catch (error) {
      throw new Error(`유효하지 않은 URL 형식: ${url}`);
    }
  }

  private inferPlatforms(command: string): string[] {
    const platforms: string[] = [];
    const commandLower = command.toLowerCase();
    
    // Package manager 기반 플랫폼 추론
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
      'nuget': ['C#', '.NET'],
      'pub': ['Dart', 'Flutter'],
    };

    // 명령어에서 플랫폼 매칭
    for (const [key, values] of Object.entries(platformMap)) {
      if (commandLower.includes(key)) {
        platforms.push(...values);
      }
    }

    // 프레임워크 기반 추가 추론
    if (commandLower.includes('react') || commandLower.includes('vue') || commandLower.includes('angular')) {
      if (!platforms.includes('JavaScript')) {
        platforms.push('JavaScript');
      }
    }

    return platforms.length > 0 ? [...new Set(platforms)] : ['General'];
  }

  private generateTags(analysis: Partial<Resource>): string[] {
    const tags: string[] = [];
    
    if (analysis.title) {
      const keywords = analysis.title.toLowerCase().split(/\s+/);
      tags.push(...keywords.slice(0, 3));
    }

    if (analysis.type) {
      tags.push(analysis.type.toLowerCase().replace('_', '-'));
    }

    return tags;
  }

  private extractTagsFromURL(url: string): string[] {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      const host = parsed.hostname.replace('www.', '');
      const tags = [];
      if (host) tags.push(host.split('.')[0]);
      if (pathParts[0]) tags.push(pathParts[0]);
      if (pathParts[1]) tags.push(pathParts[1]);
      return tags.map(t => t.toLowerCase());
    } catch {
      return [];
    }
  }

  private generateMetaSnapshot(url: string) {
    return {
      title: url.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || '리소스',
      statusCode: 200,
      contentType: 'text/html',
      lastFetchedAt: new Date().toISOString(),
    };
  }

  async updateMetadataForURL(url: string, existingResource: Partial<Resource>): Promise<Partial<Resource>> {
    // URL 변경 시 메타 정보 다시 분석
    try {
      this.validateURL(url);

      const analysis = await this.aiService.analyzeURL(url);
      
      return {
        title: analysis.title || existingResource.title,
        type: analysis.type || existingResource.type,
        description: analysis.description || existingResource.description,
        platforms: analysis.command ? this.inferPlatforms(analysis.command) : existingResource.platforms,
        tags: this.generateTags(analysis),
        command: analysis.command || existingResource.command,
        stars: analysis.stars ?? existingResource.stars,
        isVerified: analysis.isVerified ?? existingResource.isVerified,
        source: analysis.source || existingResource.source,
        sourceType: analysis.sourceType || existingResource.sourceType,
      };
    } catch (error) {
      // 개발 환경에서만 에러 로그 출력
      if (import.meta.env.DEV) {
        console.error('Failed to update metadata:', error);
      }
      return {};
    }
  }
}
