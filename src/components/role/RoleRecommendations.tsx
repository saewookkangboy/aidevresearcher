/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useResources } from '../../contexts/ResourceContext';
import { ResourceCard } from '../resource/ResourceCard';
import { ROLE_LABELS, ROLE_ICONS } from '../../contexts/RoleContext';
import { RoleRecommendation } from '../../utils/types';
import { Sparkles } from 'lucide-react';

const MAX_RECOMMENDATIONS = 6;
const DEBOUNCE_DELAY = 300; // 300ms 디바운스

/**
 * 디바운스 훅
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Role별 추천 리소스 컴포넌트 (최적화된 버전)
 * - 디바운싱을 통한 불필요한 재계산 방지
 * - 메모이제이션을 통한 렌더링 최적화
 */
export function RoleRecommendations() {
  const { currentRole, getRecommendations } = useRole();
  const { resources } = useResources();
  const [recommendations, setRecommendations] = useState<RoleRecommendation[]>([]);
  const isCalculatingRef = useRef(false);

  // 리소스 변경을 디바운스하여 불필요한 재계산 방지
  const debouncedResources = useDebounce(resources, DEBOUNCE_DELAY);

  // 추천 결과 계산 (메모이제이션)
  const calculatedRecommendations = useMemo(() => {
    if (!currentRole || debouncedResources.length === 0) {
      return [];
    }

    // 이미 계산 중이면 기다림
    if (isCalculatingRef.current) {
      return recommendations;
    }

    isCalculatingRef.current = true;
    try {
      const recs = getRecommendations(debouncedResources);
      return recs.slice(0, MAX_RECOMMENDATIONS);
    } finally {
      isCalculatingRef.current = false;
    }
  }, [currentRole, debouncedResources, getRecommendations]);

  // 추천 결과 업데이트
  useEffect(() => {
    if (currentRole) {
      setRecommendations(calculatedRecommendations);
    } else {
      setRecommendations([]);
    }
  }, [currentRole, calculatedRecommendations]);

  // 메모이제이션된 Role 정보
  const roleInfo = useMemo(() => {
    if (!currentRole) return null;
    return {
      icon: ROLE_ICONS[currentRole],
      label: ROLE_LABELS[currentRole],
    };
  }, [currentRole]);

  if (!currentRole || recommendations.length === 0 || !roleInfo) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {roleInfo.icon} {roleInfo.label} 추천 리소스
        </h2>
        <span className="text-sm text-gray-500">
          ({recommendations.length}개)
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.resource.id} className="relative">
            <ResourceCard resource={rec.resource} />
            <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {rec.score}점
            </div>
            <div className="mt-2 text-xs text-gray-500 px-1">
              💡 {rec.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
