import { useState } from 'react';
import { Resource } from '../utils/types';
import { IngestionSimulator } from '../services/simulation/ingestionSimulator';
import { LinkHealthService } from '../services/api/linkHealthService';
import { useResources } from '../contexts/ResourceContext';
import { detectDangerousCommand } from '../utils/safety';

export function useURLIngestion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const { addResource, updateResource, addActivity } = useResources();
  const ingestionSimulator = new IngestionSimulator();
  const linkHealthService = new LinkHealthService();

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

  return { ingest, loading, error, validating };
}
