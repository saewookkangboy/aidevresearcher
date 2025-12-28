/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { RealTimeTicker } from '../status/RealTimeTicker';
import { RoleSelector } from '../role/RoleSelector';
import { useAutoResearch } from '../../hooks/useAutoResearch';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Sparkles, Moon, Sun, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onShowHelp?: () => void;
}

export function Header({ onShowHelp }: HeaderProps = {}) {
  const { status } = useAutoResearch();
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Title - 모바일에서 간소화 */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                AI Dev. Researcher
              </h1>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 italic">Don't search, Just Vibe.</span>
            </div>
          </div>
          
          {/* Actions - 모바일에서 간소화 */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* RoleSelector - 모바일에서 아이콘만 표시 */}
            <div className="hidden sm:block">
              <RoleSelector />
            </div>
            <div className="sm:hidden">
              <RoleSelector compact />
            </div>
            
            {/* RealTimeTicker - 태블릿 이상에서만 표시 */}
            <div className="hidden lg:flex flex-1 max-w-md">
              <RealTimeTicker status={status} />
            </div>
            
            {/* Help Button - 터치 친화적 크기 */}
            {onShowHelp && (
              <button
                onClick={onShowHelp}
                className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation"
                aria-label="도움말 보기"
                title="사용 가이드"
              >
                <HelpCircle className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            {/* Dark Mode Toggle - 터치 친화적 크기 */}
            <button
              onClick={toggle}
              className="p-2 sm:p-2.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors touch-manipulation"
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
