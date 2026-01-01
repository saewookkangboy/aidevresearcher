/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { AgentRole, Resource, RoleRecommendation } from '../../utils/types';
import { ROLE_PREFERENCES } from '../../utils/roleConfigs';
import { performanceMonitor } from './performanceMonitor';

/**
 * Role별 성능 최적화 서비스
 * - 캐싱, 인덱싱, 메모이제이션을 통한 성능 향상
 * - 자동화된 최적화 전략 적용
 */

interface RecommendationCache {
  role: AgentRole;
  resourcesHash: string;
  recommendations: RoleRecommendation[];
  timestamp: number;
}

interface ResourceIndex {
  platformIndex: Map<string, Set<number | string>>;
  typeIndex: Map<string, Set<number | string>>;
  tagIndex: Map<string, Set<number | string>>;
  keywordIndex: Map<string, Set<number | string>>;
}

class RolePerformanceOptimizer {
  private recommendationCache: Map<string, RecommendationCache> = new Map();
  private resourceIndex: ResourceIndex | null = null;
  private lastResourcesHash: string = '';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5분
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * 리소스 배열의 해시 생성 (변경 감지용)
   */
  private generateResourcesHash(resources: Resource[]): string {
    if (resources.length === 0) return 'empty';
    
    // ID와 업데이트 시간을 기반으로 해시 생성
    const hashData = resources
      .map(r => `${r.id}:${r.updatedAt}`)
      .sort()
      .join('|');
    
    // 간단한 해시 함수
    let hash = 0;
    for (let i = 0; i < hashData.length; i++) {
      const char = hashData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit 정수로 변환
    }
    return hash.toString(36);
  }

  /**
   * 리소스 인덱스 생성 (빠른 검색을 위한 인덱싱)
   */
  private buildResourceIndex(resources: Resource[]): ResourceIndex {
    const platformIndex = new Map<string, Set<number | string>>();
    const typeIndex = new Map<string, Set<number | string>>();
    const tagIndex = new Map<string, Set<number | string>>();
    const keywordIndex = new Map<string, Set<number | string>>();

    resources.forEach((resource) => {
      const resourceId = resource.id;

      // 플랫폼 인덱스
      resource.platforms.forEach(platform => {
        const key = platform.toLowerCase();
        if (!platformIndex.has(key)) {
          platformIndex.set(key, new Set());
        }
        platformIndex.get(key)!.add(resourceId);
      });

      // 타입 인덱스
      const typeKey = resource.type.toLowerCase();
      if (!typeIndex.has(typeKey)) {
        typeIndex.set(typeKey, new Set());
      }
      typeIndex.get(typeKey)!.add(resourceId);

      // 태그 인덱스
      resource.tags.forEach(tag => {
        const key = tag.toLowerCase();
        if (!tagIndex.has(key)) {
          tagIndex.set(key, new Set());
        }
        tagIndex.get(key)!.add(resourceId);
      });

      // 키워드 인덱스 (제목, 설명에서 추출)
      const searchText = `${resource.title} ${resource.description}`.toLowerCase();
      const words = searchText.split(/\s+/).filter(w => w.length > 2);
      words.forEach(word => {
        if (!keywordIndex.has(word)) {
          keywordIndex.set(word, new Set());
        }
        keywordIndex.get(word)!.add(resourceId);
      });
    });

    return { platformIndex, typeIndex, tagIndex, keywordIndex };
  }

  /**
   * 인덱스 업데이트 (리소스 변경 시)
   */
  updateIndex(resources: Resource[]): void {
    const currentHash = this.generateResourcesHash(resources);
    
    if (currentHash !== this.lastResourcesHash) {
      this.resourceIndex = this.buildResourceIndex(resources);
      this.lastResourcesHash = currentHash;
      // 인덱스가 변경되면 캐시 무효화
      this.recommendationCache.clear();
    }
  }

  /**
   * 캐시 키 생성
   */
  private getCacheKey(role: AgentRole, resourcesHash: string): string {
    return `${role || 'none'}:${resourcesHash}`;
  }

  /**
   * 캐시에서 추천 결과 조회
   */
  private getCachedRecommendations(
    role: AgentRole,
    resourcesHash: string
  ): RoleRecommendation[] | null {
    if (!role) return null;

    const cacheKey = this.getCacheKey(role, resourcesHash);
    const cached = this.recommendationCache.get(cacheKey);

    if (!cached) return null;

    // TTL 확인
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.recommendationCache.delete(cacheKey);
      return null;
    }

    // 해시가 일치하는지 확인
    if (cached.resourcesHash !== resourcesHash) {
      this.recommendationCache.delete(cacheKey);
      return null;
    }

    return cached.recommendations;
  }

  /**
   * 추천 결과를 캐시에 저장
   */
  private setCachedRecommendations(
    role: AgentRole,
    resourcesHash: string,
    recommendations: RoleRecommendation[]
  ): void {
    if (!role) return;

    // 캐시 크기 제한
    if (this.recommendationCache.size >= this.MAX_CACHE_SIZE) {
      // 가장 오래된 항목 제거
      const oldestKey = Array.from(this.recommendationCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]?.[0];
      if (oldestKey) {
        this.recommendationCache.delete(oldestKey);
      }
    }

    const cacheKey = this.getCacheKey(role, resourcesHash);
    this.recommendationCache.set(cacheKey, {
      role,
      resourcesHash,
      recommendations,
      timestamp: Date.now(),
    });
  }

  /**
   * 인덱스를 사용한 빠른 플랫폼 매칭
   */
  private getMatchingResourcesByPlatform(
    platforms: string[],
    allResources: Resource[]
  ): Set<number | string> {
    if (!this.resourceIndex) {
      return new Set();
    }

    const matchingIds = new Set<number | string>();
    
    platforms.forEach(platform => {
      const key = platform.toLowerCase();
      const ids = this.resourceIndex!.platformIndex.get(key);
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    });

    return matchingIds;
  }

  /**
   * 인덱스를 사용한 빠른 타입 매칭
   */
  private getMatchingResourcesByType(
    types: string[],
    allResources: Resource[]
  ): Set<number | string> {
    if (!this.resourceIndex) {
      return new Set();
    }

    const matchingIds = new Set<number | string>();
    
    types.forEach(type => {
      const key = type.toLowerCase();
      const ids = this.resourceIndex!.typeIndex.get(key);
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    });

    return matchingIds;
  }

  /**
   * 인덱스를 사용한 빠른 태그 매칭
   */
  private getMatchingResourcesByTags(
    tags: string[],
    allResources: Resource[]
  ): Set<number | string> {
    if (!this.resourceIndex) {
      return new Set();
    }

    const matchingIds = new Set<number | string>();
    
    tags.forEach(tag => {
      const key = tag.toLowerCase();
      const ids = this.resourceIndex!.tagIndex.get(key);
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    });

    return matchingIds;
  }

  /**
   * 인덱스를 사용한 빠른 키워드 매칭
   */
  private getMatchingResourcesByKeywords(
    keywords: string[],
    allResources: Resource[]
  ): Set<number | string> {
    if (!this.resourceIndex) {
      return new Set();
    }

    const matchingIds = new Set<number | string>();
    
    keywords.forEach(keyword => {
      const key = keyword.toLowerCase();
      const ids = this.resourceIndex!.keywordIndex.get(key);
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    });

    return matchingIds;
  }

  /**
   * 최적화된 추천 계산 (인덱스 및 캐싱 활용)
   */
  getOptimizedRecommendations(
    role: AgentRole,
    resources: Resource[]
  ): RoleRecommendation[] {
    if (!role || resources.length === 0) {
      return [];
    }

    // 성능 측정
    return performanceMonitor.measure(
      'getRecommendations',
      () => {
        // 인덱스 업데이트
        this.updateIndex(resources);

        const resourcesHash = this.generateResourcesHash(resources);

        // 캐시 확인
        const cached = this.getCachedRecommendations(role, resourcesHash);
        if (cached) {
          return cached;
        }

    const preferences = ROLE_PREFERENCES[role];
    const recommendations: RoleRecommendation[] = [];

    // 인덱스를 사용한 빠른 필터링
    const platformMatches = this.getMatchingResourcesByPlatform(
      preferences.preferredPlatforms,
      resources
    );
    const typeMatches = this.getMatchingResourcesByType(
      preferences.preferredTypes,
      resources
    );
    const tagMatches = this.getMatchingResourcesByTags(
      preferences.preferredTags,
      resources
    );
    const keywordMatches = this.getMatchingResourcesByKeywords(
      preferences.keywords,
      resources
    );

    // 모든 매칭된 리소스 ID 수집
    const candidateIds = new Set<number | string>();
    [platformMatches, typeMatches, tagMatches, keywordMatches].forEach(set => {
      set.forEach(id => candidateIds.add(id));
    });

    // 후보 리소스만 점수 계산 (전체 순회 대신)
    const candidateResources = resources.filter(r => candidateIds.has(r.id));

    candidateResources.forEach((resource) => {
      let score = 0;
      const reasons: string[] = [];

      // 플랫폼 매칭 점수
      const platformMatch = resource.platforms.some(p =>
        preferences.preferredPlatforms.some(pref => 
          p.toLowerCase().includes(pref.toLowerCase()) || 
          pref.toLowerCase().includes(p.toLowerCase())
        )
      );
      if (platformMatch) {
        score += 30;
        reasons.push('플랫폼 일치');
      }

      // 타입 매칭 점수
      if (preferences.preferredTypes.includes(resource.type)) {
        score += 25;
        reasons.push('타입 일치');
      }

      // 태그 매칭 점수
      const tagMatches = resource.tags.filter(tag =>
        preferences.preferredTags.some(prefTag =>
          tag.toLowerCase().includes(prefTag.toLowerCase()) ||
          prefTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (tagMatches.length > 0) {
        score += tagMatches.length * 10;
        reasons.push(`${tagMatches.length}개 태그 일치`);
      }

      // 키워드 매칭 (제목, 설명)
      const searchText = `${resource.title} ${resource.description}`.toLowerCase();
      const keywordMatches = preferences.keywords.filter(keyword =>
        searchText.includes(keyword.toLowerCase())
      );
      if (keywordMatches.length > 0) {
        score += keywordMatches.length * 5;
        reasons.push(`${keywordMatches.length}개 키워드 일치`);
      }

      // 검증된 리소스 보너스
      if (resource.isVerified) {
        score += 10;
        reasons.push('검증된 리소스');
      }

      // 인기 리소스 보너스
      if (resource.stars && resource.stars > 1000) {
        score += 5;
        reasons.push('인기 리소스');
      }

      if (score > 0) {
        recommendations.push({
          resource,
          score,
          reason: reasons.join(', '),
        });
      }
    });

    // 점수순으로 정렬
    const sortedRecommendations = recommendations.sort((a, b) => b.score - a.score);

        // 캐시에 저장
        this.setCachedRecommendations(role, resourcesHash, sortedRecommendations);

        return sortedRecommendations;
      },
      role,
      { resourceCount: resources.length }
    );
  }

  /**
   * 필터링 최적화 (인덱스 활용)
   */
  getOptimizedFilteredResources(
    role: AgentRole,
    resources: Resource[]
  ): Resource[] {
    if (!role || resources.length === 0) {
      return resources;
    }

    // 성능 측정
    return performanceMonitor.measure(
      'filterResources',
      () => {
        // 인덱스 업데이트
        this.updateIndex(resources);

    const preferences = ROLE_PREFERENCES[role];
    const scored: Array<{ resource: Resource; score: number }> = [];

    // 인덱스를 사용한 빠른 필터링
    const platformMatches = this.getMatchingResourcesByPlatform(
      preferences.preferredPlatforms,
      resources
    );
    const typeMatches = this.getMatchingResourcesByType(
      preferences.preferredTypes,
      resources
    );
    const tagMatches = this.getMatchingResourcesByTags(
      preferences.preferredTags,
      resources
    );

    // 매칭된 리소스만 점수 계산
    const candidateIds = new Set<number | string>();
    [platformMatches, typeMatches, tagMatches].forEach(set => {
      set.forEach(id => candidateIds.add(id));
    });

    resources.forEach((resource) => {
      let score = 0;

      // 플랫폼 매칭
      if (candidateIds.has(resource.id) && platformMatches.has(resource.id)) {
        score += 1;
      }

      // 타입 매칭
      if (candidateIds.has(resource.id) && typeMatches.has(resource.id)) {
        score += 1;
      }

      // 태그 매칭
      if (candidateIds.has(resource.id) && tagMatches.has(resource.id)) {
        score += 0.5;
      }

      scored.push({ resource, score });
    });

        // 점수가 있는 리소스는 앞으로, 점수가 없는 리소스는 뒤로
        return scored
          .sort((a, b) => b.score - a.score)
          .map(item => item.resource);
      },
      role,
      { resourceCount: resources.length }
    );
  }

  /**
   * 캐시 무효화
   */
  clearCache(role?: AgentRole): void {
    if (role) {
      const keysToDelete: string[] = [];
      this.recommendationCache.forEach((value, key) => {
        if (value.role === role) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.recommendationCache.delete(key));
    } else {
      this.recommendationCache.clear();
    }
  }

  /**
   * 성능 통계 조회
   */
  getPerformanceStats(): {
    cacheSize: number;
    indexBuilt: boolean;
    cacheHitRate?: number;
  } {
    return {
      cacheSize: this.recommendationCache.size,
      indexBuilt: this.resourceIndex !== null,
    };
  }
}

// 싱글톤 인스턴스
export const rolePerformanceOptimizer = new RolePerformanceOptimizer();

