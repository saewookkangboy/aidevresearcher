/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, FormEvent, useMemo } from 'react';
import { Search } from 'lucide-react';
import { SearchQuery } from '../../utils/types';
import { useLanguage } from '../../contexts/LanguageContext';
import { inferCategoryFromQuery, inferResourceTypeFromQuery, extractKeywords } from '../../utils/nlpMatcher';

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const defaultPlaceholder = placeholder || t('search.placeholder');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const searchText = query.trim();
    
    const inferredCategories = inferCategoryFromQuery(searchText);
    const inferredTypes = inferResourceTypeFromQuery(searchText);
    const keywordTags = extractKeywords(searchText);

    onSearch({ 
      text: searchText || undefined,
      category: inferredCategories.length > 0 ? inferredCategories : undefined,
      type: inferredTypes.length > 0 ? inferredTypes : undefined,
      tags: keywordTags.length > 0 ? keywordTags : undefined,
    });
  };

  const exampleQueries = useMemo(() => {
    const lang = t('language.ko') === '한국어' ? 'ko' : 'en';
    if (lang === 'ko') {
      return [
        '이미지 분석 봇 만들기',
        'Python AI 라이브러리',
        '웹사이트 SEO 개선',
        '챗봇 만들기',
      ];
    }
    return [
      'Create image analysis bot',
      'Python AI library',
      'Improve website SEO',
      'Create chatbot',
    ];
  }, [t]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="w-full mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={defaultPlaceholder}
            aria-label={t('common.search')}
            className="block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base shadow-sm transition-all touch-manipulation"
          />
        </div>
      </form>
      {query.length === 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">{t('search.examples') || 'Examples'}:</span>
          {exampleQueries.map((example, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(example);
                const inferredCategories = inferCategoryFromQuery(example);
                const inferredTypes = inferResourceTypeFromQuery(example);
                const keywordTags = extractKeywords(example);
                onSearch({ 
                  text: example,
                  category: inferredCategories.length > 0 ? inferredCategories : undefined,
                  type: inferredTypes.length > 0 ? inferredTypes : undefined,
                  tags: keywordTags.length > 0 ? keywordTags : undefined,
                });
              }}
              className="text-xs px-2.5 sm:px-3 py-1.5 sm:py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors touch-manipulation min-h-[32px]"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
