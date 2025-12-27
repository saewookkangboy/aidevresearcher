/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { SearchQuery } from '../../utils/types';
import { inferCategoryFromQuery, inferResourceTypeFromQuery, extractKeywords } from '../../utils/nlpMatcher';

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = '검색어를 입력하세요...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

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

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="리소스 검색"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>
    </form>
  );
}
