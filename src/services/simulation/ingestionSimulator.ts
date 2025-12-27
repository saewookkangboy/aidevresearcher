import { Resource } from '../../utils/types';
import { AIParsingService } from '../api/aiParsingService';

export class IngestionSimulator {
  private aiService: AIParsingService;

  constructor() {
    this.aiService = new AIParsingService();
  }

  async ingestURL(url: string): Promise<Resource> {
    // 1. URL 유효성 검증
    if (!url.startsWith('http')) {
      throw new Error('Invalid URL format');
    }

    // 2. AI 분석
    const analysis = await this.aiService.analyzeURL(url);

    // 3. Resource 객체 생성
    const resource: Resource = {
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: analysis.title || 'Untitled Resource',
      type: analysis.type || 'LIBRARY',
      description: analysis.description || 'No description available',
      platforms: this.inferPlatforms(analysis.command || ''),
      tags: this.generateTags(analysis),
      command: analysis.command || '',
      url: url,
      stars: analysis.stars,
      isVerified: analysis.isVerified || false,
      source: analysis.source || 'User',
      sourceType: analysis.sourceType || 'USER',
      linkStatus: 'checking',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return resource;
  }

  private inferPlatforms(command: string): string[] {
    const platforms: string[] = [];
    
    if (command.includes('pip')) {
      platforms.push('Python');
    }
    if (command.includes('npm') || command.includes('yarn') || command.includes('node')) {
      platforms.push('Node.js');
      if (command.includes('react') || command.includes('vue') || command.includes('angular')) {
        platforms.push('JavaScript');
      }
    }
    if (command.includes('cargo')) {
      platforms.push('Rust');
    }
    if (command.includes('go get')) {
      platforms.push('Go');
    }

    return platforms.length > 0 ? platforms : ['General'];
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

  async updateMetadataForURL(url: string, existingResource: Partial<Resource>): Promise<Partial<Resource>> {
    // URL 변경 시 메타 정보 다시 분석
    try {
      if (!url.startsWith('http')) {
        return {};
      }

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
      console.error('Failed to update metadata:', error);
      return {};
    }
  }
}

