/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useMemo } from 'react';
import { useRole } from '../contexts/RoleContext';
import { useResources } from '../contexts/ResourceContext';
import { rolePerformanceOptimizer } from '../services/optimization/rolePerformanceOptimizer';

/**
 * Role 기반 필터링 훅 (최적화된 버전)
 * - 인덱싱 및 캐싱을 통한 성능 향상
 * - 중복 계산 제거
 */
export function useRoleFilter() {
  const { currentRole } = useRole();
  const { resources } = useResources();

  const roleFilteredResources = useMemo(() => {
    if (!currentRole || currentRole === null) {
      return resources;
    }

    // 최적화된 서비스를 사용하여 필터링 (인덱싱 활용)
    return rolePerformanceOptimizer.getOptimizedFilteredResources(
      currentRole,
      resources
    );
  }, [currentRole, resources]);

  return roleFilteredResources;
}

