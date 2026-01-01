import { useEffect, useRef } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { Resource } from '../utils/types';

export function useBehaviorRanking(resources: Resource[]) {
  const { recordInteraction } = useResources();
  const processedIdsRef = useRef<Set<string | number>>(new Set());

  useEffect(() => {
    // 소셜 지표 높은 리소스에 기본 가중치 부여 (한 번만 처리)
    resources.forEach((r) => {
      if (r.socialMetrics && r.socialMetrics.likes > 1000 && !processedIdsRef.current.has(r.id)) {
        processedIdsRef.current.add(r.id);
        recordInteraction(r.id, 'favorite');
      }
    });
    // recordInteraction은 안정적인 함수이므로 dependency에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources]);
}
