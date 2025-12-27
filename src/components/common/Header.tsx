/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { RealTimeTicker } from '../status/RealTimeTicker';
import { useAutoResearch } from '../../hooks/useAutoResearch';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Sparkles, Moon, Sun } from 'lucide-react';

export function Header() {
  const { status } = useAutoResearch();
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Dev. Researcher
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400 italic">Don't search, Just Vibe.</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <RealTimeTicker status={status} />
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="다크모드 토글"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
