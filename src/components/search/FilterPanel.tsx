/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, useEffect } from 'react';
import { ResourceCategory } from '../../utils/types';
import { CategoryFilter } from './CategoryFilter';
import { HelpTooltip } from '../common/HelpTooltip';
import { useResources } from '../../contexts/ResourceContext';

export function FilterPanel() {
  const { searchResources, currentSearchQuery } = useResources();
  const [selectedCategories, setSelectedCategories] = useState<ResourceCategory[]>([]);

  // currentSearchQuery에서 카테고리 초기화
  useEffect(() => {
    if (currentSearchQuery.category && currentSearchQuery.category.length > 0) {
      setSelectedCategories(currentSearchQuery.category);
    } else if (!currentSearchQuery.category) {
      // category가 undefined일 때만 빈 배열로 초기화 (검색으로 추론된 경우 유지)
      setSelectedCategories([]);
    }
  }, [currentSearchQuery.category]);

  const handleCategoryToggle = (category: ResourceCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    // 기존 검색어는 유지하고 카테고리만 업데이트
    // 빈 배열이면 모든 카테고리를 보여주기 위해 빈 배열로 전달
    searchResources({ category: newCategories });
  };

  const handleClear = () => {
    setSelectedCategories([]);
    // 카테고리 필터를 초기화하려면 빈 배열을 명시적으로 전달
    searchResources({ category: [] });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4" role="region" aria-label="카테고리 필터">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">도구 유형 필터</h3>
        <HelpTooltip
          content="도구를 유형별로 필터링할 수 있습니다. 여러 유형을 동시에 선택할 수 있어요."
          title="필터 사용법"
        />
      </div>
      <CategoryFilter
        selectedCategories={selectedCategories}
        onToggle={handleCategoryToggle}
        onClear={handleClear}
      />
    </div>
  );
}

