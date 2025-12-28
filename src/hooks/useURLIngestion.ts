/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, useMemo } from 'react';
import { Resource } from '../utils/types';
import { IngestionSimulator } from '../services/simulation/ingestionSimulator';
import { LinkHealthService } from '../services/api/linkHealthService';
import { FeedParserService } from '../services/api/feedParserService';
import { useResources } from '../contexts/ResourceContext';
import { detectDangerousCommand } from '../utils/safety';

export function useURLIngestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [feedProgress, setFeedProgress] = useState<{ current: number; total: number } | null>(null);
  const { addResource, addResources, updateResource, addActivity } = useResources();
  
  // 인스턴스를 메모이제이션하여 불필요한 재생성 방지
  const ingestionSimulator = useMemo(() => new IngestionSimulator(), []);
  const linkHealthService = useMemo(() => new LinkHealthService(), []);
  const feedParserService = useMemo(() => new FeedParserService(), []);

  const ingest = async (url: string): Promise<Resource | null> => {
    setLoading(true);
    setError(null);
    setValidating(false);

    try {
      // 1. URL 분석 및 리소스 생성
      const resource = await ingestionSimulator.ingestURL(url);
      const risk = detectDangerousCommand(resource.command || '');
      if (risk.risky) {
        const message = `위험 명령어가 포함되어 추가를 중단했습니다: ${risk.reasons.join(', ')}`;
        setError(message);
        addActivity({
          id: `activity_${Date.now()}`,
          type: 'ingest',
          message,
          timestamp: new Date().toISOString(),
          resourceId: resource.id,
        });
        return null;
      }
      
      // 2. 링크 상태 검증
      setValidating(true);
      // 상태 반영을 보장하기 위해 한 틱 양보
      await Promise.resolve();
      const linkStatus = await linkHealthService.checkLink(url);
      
      // 3. 검증 결과를 리소스에 반영
      const validatedResource: Resource = {
        ...resource,
        linkStatus,
        lastCheckedAt: new Date().toISOString(),
      };
      
      // 4. 리소스 추가
      await addResource(validatedResource);
      
      // 5. 링크가 broken인 경우 자동 수정 시도
      if (linkStatus === 'broken') {
        try {
          const fixedResource = await linkHealthService.autoFixBrokenLink(validatedResource);
          if (fixedResource.linkStatus === 'fixed') {
            await updateResource(validatedResource.id, {
              url: fixedResource.url,
              linkStatus: fixedResource.linkStatus,
              lastCheckedAt: fixedResource.lastCheckedAt,
            });
            return fixedResource;
          }
        } catch (fixError) {
          // 자동 수정 실패는 무시 (broken 상태 유지)
          // 개발 환경에서만 경고 출력
          if (import.meta.env.DEV) {
            console.warn('Auto-fix failed:', fixError);
          }
        }
      }
      
      addActivity({
        id: `activity_${Date.now()}`,
        type: 'ingest',
        message: `리소스 추가: ${resource.title}`,
        timestamp: new Date().toISOString(),
        resourceId: resource.id,
      });
      return validatedResource;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to ingest URL';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  const ingestFeed = async (feedUrl: string): Promise<Resource[]> => {
    setLoading(true);
    setError(null);
    setFeedProgress(null);

    try {
      // 1. Feed 파싱
      const entries = await feedParserService.parseFeed(feedUrl);
      
      if (entries.length === 0) {
        setError('Feed에서 리소스를 찾을 수 없습니다.');
        return [];
      }

      // 2. 각 entry를 리소스로 변환
      const resources: Resource[] = [];
      let processed = 0;

      for (const entry of entries) {
        setFeedProgress({ current: processed, total: entries.length });
        
        try {
          // GitHub URL만 처리
          if (!entry.url.includes('github.com')) {
            processed++;
            continue;
          }

          // 리소스 생성
          const resource = await ingestionSimulator.ingestURL(entry.url);
          
          // 위험한 명령어 체크
          const risk = detectDangerousCommand(resource.command || '');
          if (risk.risky) {
            processed++;
            continue; // 위험한 리소스는 건너뛰기
          }

          // Feed에서 가져온 정보로 메타데이터 보강
          if (entry.description && entry.description.trim()) {
            // Feed description이 더 상세한 경우 사용
            if (!resource.description || resource.description === 'No description available' || entry.description.length > resource.description.length) {
              resource.description = entry.description;
            }
          }
          
          // Feed 제목 처리 (더 자연스럽게 변환)
          if (entry.title && entry.title.trim()) {
            // 제목을 더 읽기 쉽게 변환 (예: "Cporter202 Awesome Ai Tools" -> "Awesome AI Tools")
            const cleanedTitle = entry.title
              .replace(/\b([a-z])([A-Z])/g, '$1 $2') // camelCase를 공백으로
              .replace(/_/g, ' ') // 언더스코어를 공백으로
              .replace(/\s+/g, ' ') // 여러 공백을 하나로
              .trim();
            
            // GitHub 리포지토리 이름 추출 (owner/repo 형식)
            const urlMatch = entry.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (urlMatch && cleanedTitle.toLowerCase().includes(urlMatch[2].toLowerCase())) {
              // 제목이 리포지토리 이름을 포함하고 있으면 사용
              resource.title = cleanedTitle;
            } else if (!resource.title || resource.title === 'Untitled Resource') {
              resource.title = cleanedTitle;
            }
          }

          // 링크 상태 검증 (개발 환경에서는 스킵)
          if (!import.meta.env.DEV) {
            const linkStatus = await linkHealthService.checkLink(entry.url);
            resource.linkStatus = linkStatus;
            resource.lastCheckedAt = new Date().toISOString();
          } else {
            resource.linkStatus = 'active';
          }

          // source 정보 업데이트
          resource.source = 'Repository Showcase Feed';
          resource.sourceType = 'GITHUB';

          resources.push(resource);
        } catch (err) {
          // 개별 리소스 생성 실패는 무시하고 계속 진행
          console.warn(`Failed to process entry ${entry.url}:`, err);
        } finally {
          processed++;
        }
      }

      // 3. 리소스 일괄 추가
      if (resources.length > 0) {
        await addResources(resources);
        
        addActivity({
          id: `activity_${Date.now()}`,
          type: 'ingest',
          message: `Feed에서 ${resources.length}개의 리소스를 추가했습니다: ${feedUrl}`,
          timestamp: new Date().toISOString(),
        });
      }

      setFeedProgress(null);
      return resources;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to ingest feed';
      setError(errorMessage);
      setFeedProgress(null);
      return [];
    } finally {
      setLoading(false);
      setFeedProgress(null);
    }
  };

  return { ingest, ingestFeed, loading, error, validating, feedProgress };
}
