/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Resource } from '../../utils/types';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from '../common/EmptyState';
import { useLanguage } from '../../contexts/LanguageContext';

interface ResourceGridProps {
  resources: Resource[];
  onViewDetails?: (resource: Resource) => void;
  onClearSearch?: () => void;
}

const INITIAL_ITEMS = 12; // 초기 표시 개수
const LOAD_MORE_ITEMS = 12; // 추가 로드 개수
const THRESHOLD = 300; // 스크롤 임계값 (px)

/**
 * 메모이제이션된 ResourceCard 컴포넌트
 */
const MemoizedResourceCard = memo(ResourceCard, (prev, next) => {
  return prev.resource.id === next.resource.id &&
         prev.resource.updatedAt === next.resource.updatedAt;
});

MemoizedResourceCard.displayName = 'MemoizedResourceCard';

/**
 * 리소스 그리드 컴포넌트 (최적화된 버전)
 * - 지연 로딩을 통한 초기 렌더링 최적화
 * - 무한 스크롤 지원
 * - 메모이제이션을 통한 불필요한 재렌더링 방지
 */
export function ResourceGrid({ resources, onViewDetails, onClearSearch }: ResourceGridProps) {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const [isLoading, setIsLoading] = useState(false);

  // 표시할 리소스만 메모이제이션
  const visibleResources = useMemo(() => {
    return resources.slice(0, visibleCount);
  }, [resources, visibleCount]);

  // 더 로드할 항목이 있는지 확인
  const hasMore = useMemo(() => {
    return visibleCount < resources.length;
  }, [visibleCount, resources.length]);

  // 추가 항목 로드
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    // 약간의 지연을 두어 부드러운 UX 제공
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + LOAD_MORE_ITEMS, resources.length));
      setIsLoading(false);
    }, 100);
  }, [isLoading, hasMore, resources.length]);

  // 스크롤 이벤트 핸들러
  useEffect(() => {
    if (!hasMore) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 스크롤이 하단 근처에 도달하면 추가 로드
      if (documentHeight - (scrollTop + windowHeight) < THRESHOLD) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);

  // 리소스가 변경되면 표시 개수 초기화
  useEffect(() => {
    setVisibleCount(INITIAL_ITEMS);
  }, [resources.length]);

  if (resources.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="도구를 찾을 수 없습니다"
        description="검색어를 변경하거나 필터를 조정해보세요. 다른 키워드로 검색하면 원하는 도구를 찾을 수 있습니다."
        action={onClearSearch ? {
          label: '필터 초기화',
          onClick: onClearSearch,
        } : undefined}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {visibleResources.map((resource, index) => (
          <MemoizedResourceCard
            key={`${resource.id}-${index}`}
            resource={resource}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? t('common.loading') : `${t('resources.loadMore') || '더 보기'} (${resources.length - visibleCount}${t('common.items') || '개'} ${t('resources.remaining') || '남음'})`}
          </button>
        </div>
      )}
    </>
  );
}
