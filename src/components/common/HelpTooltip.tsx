/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTooltip({ content, title, position = 'top' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="도움말"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {isOpen && (
        <div
          className={`absolute z-50 w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl ${positionClasses[position]}`}
        >
          {title && (
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="닫기"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-gray-200">{content}</p>
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 ${
              position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' :
              'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}

