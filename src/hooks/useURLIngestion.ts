import { useState } from 'react';
import { Resource } from '../utils/types';
import { IngestionSimulator } from '../services/simulation/ingestionSimulator';
import { LinkHealthService } from '../services/api/linkHealthService';
import { useResources } from '../contexts/ResourceContext';

export function useURLIngestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const { addResource, updateResource } = useResources();
  const ingestionSimulator = new IngestionSimulator();
  const linkHealthService = new LinkHealthService();

  const ingest = async (url: string): Promise<Resource | null> => {
    setLoading(true);
    setError(null);
    setValidating(false);

    try {
      // 1. URL 분석 및 리소스 생성
      const resource = await ingestionSimulator.ingestURL(url);
      
      // 2. 링크 상태 검증
      setValidating(true);
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
          console.warn('Auto-fix failed:', fixError);
        }
      }
      
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

  return { ingest, loading, error, validating };
}

