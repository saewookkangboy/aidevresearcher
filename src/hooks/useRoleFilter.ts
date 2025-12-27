import { useMemo } from 'react';
import { useRole } from '../contexts/RoleContext';
import { useResources } from '../contexts/ResourceContext';
import { Resource } from '../utils/types';
import { ROLE_PREFERENCES } from '../utils/roleConfigs';

export function useRoleFilter() {
  const { currentRole } = useRole();
  const { resources } = useResources();

  const roleFilteredResources = useMemo(() => {
    if (!currentRole || currentRole === null) {
      return resources;
    }

    const preferences = ROLE_PREFERENCES[currentRole];
    const scored = resources.map((resource: Resource) => {
      let score = 0;

      // 플랫폼 매칭
      const platformMatch = resource.platforms.some(p =>
        preferences.preferredPlatforms.some(pref =>
          p.toLowerCase().includes(pref.toLowerCase()) ||
          pref.toLowerCase().includes(p.toLowerCase())
        )
      );
      if (platformMatch) score += 1;

      // 타입 매칭
      if (preferences.preferredTypes.includes(resource.type)) {
        score += 1;
      }

      // 태그 매칭
      const tagMatches = resource.tags.filter(tag =>
        preferences.preferredTags.some(prefTag =>
          tag.toLowerCase().includes(prefTag.toLowerCase()) ||
          prefTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (tagMatches.length > 0) score += 0.5;

      return { resource, score };
    });

    // 점수가 있는 리소스는 앞으로, 점수가 없는 리소스는 뒤로
    return scored
      .sort((a, b) => b.score - a.score)
      .map(item => item.resource);
  }, [currentRole, resources]);

  return roleFilteredResources;
}

