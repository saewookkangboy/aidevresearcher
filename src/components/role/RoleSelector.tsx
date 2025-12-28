/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { useRole, ROLE_LABELS, ROLE_ICONS } from '../../contexts/RoleContext';
import { AgentRole } from '../../utils/types';
import { User, Check } from 'lucide-react';

const AVAILABLE_ROLES: Array<Exclude<AgentRole, null>> = ['frontend', 'backend', 'pm', 'fullstack', 'devops', 'designer'];

interface RoleSelectorProps {
  compact?: boolean;
}

export function RoleSelector({ compact = false }: RoleSelectorProps = {}) {
  const { currentRole, setRole, clearRole } = useRole();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleSelect = async (role: AgentRole) => {
    await setRole(role);
    setIsOpen(false);
  };

  const handleClearRole = async () => {
    await clearRole();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 sm:gap-2 ${
          compact 
            ? 'px-2.5 py-2 min-w-[44px] min-h-[44px] justify-center' 
            : 'px-3 sm:px-4 py-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0'
        } rounded-lg transition-all touch-manipulation ${
          currentRole
            ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700 hover:bg-primary-100 dark:hover:bg-primary-900/50 active:bg-primary-200 dark:active:bg-primary-900/70'
            : 'bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
        }`}
        title={currentRole ? `${ROLE_LABELS[currentRole]} 역할이 선택되었습니다` : '역할을 선택하면 맞춤 도구를 추천해드립니다'}
      >
        {currentRole ? (
          <>
            <span className="text-lg sm:text-xl flex-shrink-0">{ROLE_ICONS[currentRole]}</span>
            {!compact && (
              <>
                <span className="hidden sm:inline text-sm font-semibold text-primary-700 dark:text-primary-300">
                  {ROLE_LABELS[currentRole]}
                </span>
                <Check className="hidden sm:block w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              </>
            )}
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            {!compact && (
              <span className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-400">역할 선택</span>
            )}
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute top-full ${
            compact ? 'right-0' : 'right-0 sm:right-auto sm:left-0'
          } mt-2 w-[calc(100vw-2rem)] sm:w-72 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20`}>
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 mb-1">
                역할 선택
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 px-3 mb-2">
                역할을 선택하면 맞춤 도구를 추천해드립니다
              </p>
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm transition-all min-h-[44px] touch-manipulation ${
                    currentRole === role
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-primary-700 active:bg-primary-100 dark:active:bg-primary-900/50'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                  }`}
                >
                  <span className="text-xl">{ROLE_ICONS[role]}</span>
                  <span className="flex-1 text-left">{ROLE_LABELS[role]}</span>
                  {currentRole === role && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))}
              {currentRole && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={handleClearRole}
                    className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[44px] touch-manipulation"
                  >
                    <User className="w-4 h-4" />
                    <span>역할 초기화</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
