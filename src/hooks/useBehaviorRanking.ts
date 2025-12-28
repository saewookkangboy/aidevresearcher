import { useEffect } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { Resource } from '../utils/types';

export function useBehaviorRanking(resources: Resource[]) {
  const { recordInteraction } = useResources();

  useEffect(() => {
    // 소셜 지표 높은 리소스에 기본 가중치 부여
    resources.forEach((r) => {
      if (r.socialMetrics && r.socialMetrics.likes > 1000) {
        recordInteraction(r.id, 'favorite');
      }
    });
  }, [resources, recordInteraction]);
}
