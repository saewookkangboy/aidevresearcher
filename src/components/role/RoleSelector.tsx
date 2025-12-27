import { useState } from 'react';
import { useRole, ROLE_LABELS, ROLE_ICONS } from '../../contexts/RoleContext';
import { AgentRole } from '../../utils/types';
import { User, Check } from 'lucide-react';

const AVAILABLE_ROLES: Array<Exclude<AgentRole, null>> = ['frontend', 'backend', 'pm', 'fullstack', 'devops', 'designer'];

export function RoleSelector() {
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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {currentRole ? (
          <>
            <span className="text-xl">{ROLE_ICONS[currentRole]}</span>
            <span className="text-sm font-medium text-gray-700">
              {ROLE_LABELS[currentRole]}
            </span>
            {currentRole && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </>
        ) : (
          <>
            <User className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">역할 선택</span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                역할 선택
              </div>
              {AVAILABLE_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    currentRole === role
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
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
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50 transition-colors"
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
