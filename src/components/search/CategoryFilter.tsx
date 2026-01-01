/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { ResourceCategory } from '../../utils/types';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../utils/constants';
import { X } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategories: ResourceCategory[];
  onToggle: (category: ResourceCategory) => void;
  onClear: () => void;
}

const ALL_CATEGORIES: ResourceCategory[] = ['SKILLS', 'TOOLS', 'EXTENSION', 'MCP'];

export function CategoryFilter({ selectedCategories, onToggle, onClear }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">카테고리:</span>
      {ALL_CATEGORIES.map((category) => {
        const isSelected = selectedCategories.includes(category);
        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isSelected
                ? 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <span>{CATEGORY_ICONS[category]}</span>
            <span>{CATEGORY_LABELS[category]}</span>
          </button>
        );
      })}
      {selectedCategories.length > 0 && (
        <button
          onClick={onClear}
          aria-label="필터 초기화"
          className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          <X className="w-4 h-4" />
          <span>초기화</span>
        </button>
      )}
    </div>
  );
}

