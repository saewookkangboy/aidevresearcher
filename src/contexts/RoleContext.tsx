/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { AgentRole, RoleConfig, Resource, RoleRecommendation } from '../utils/types';
import { ROLE_PREFERENCES, ROLE_LABELS, ROLE_ICONS } from '../utils/roleConfigs';
import { rolePerformanceOptimizer } from '../services/optimization/rolePerformanceOptimizer';

interface RoleContextType {
  currentRole: AgentRole;
  roleConfig: RoleConfig | null;
  recommendedResources: RoleRecommendation[];
  
  // Actions
  setRole: (role: AgentRole) => Promise<void>;
  clearRole: () => Promise<void>;
  getRecommendations: (resources: Resource[]) => RoleRecommendation[];
  updateRolePreferences: (preferences: Partial<RoleConfig['preferences']>) => Promise<void>;
}

type RoleAction =
  | { type: 'SET_ROLE'; payload: AgentRole }
  | { type: 'SET_ROLE_CONFIG'; payload: RoleConfig }
  | { type: 'SET_RECOMMENDATIONS'; payload: RoleRecommendation[] }
  | { type: 'CLEAR_ROLE' };

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'vibe_coding_role_config';

function roleReducer(state: {
  currentRole: AgentRole;
  roleConfig: RoleConfig | null;
  recommendedResources: RoleRecommendation[];
}, action: RoleAction) {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        currentRole: action.payload,
      };
    case 'SET_ROLE_CONFIG':
      return {
        ...state,
        roleConfig: action.payload,
        currentRole: action.payload.role,
      };
    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendedResources: action.payload,
      };
    case 'CLEAR_ROLE':
      return {
        ...state,
        currentRole: null,
        roleConfig: null,
        recommendedResources: [],
      };
    default:
      return state;
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roleReducer, {
    currentRole: null,
    roleConfig: null,
    recommendedResources: [],
  });

  // 초기 로드
  useEffect(() => {
    loadRoleConfig();
  }, []);

  const loadRoleConfig = async () => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored) {
        const config: RoleConfig = JSON.parse(stored);
        dispatch({ type: 'SET_ROLE_CONFIG', payload: config });
      }
    } catch (error) {
      console.error('Failed to load role config:', error);
    }
  };

  const saveRoleConfig = async (config: RoleConfig) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save role config:', error);
    }
  };

  const setRole = async (role: AgentRole) => {
    if (!role || role === null) {
      return;
    }
    
    // Role 변경 시 이전 Role의 캐시는 유지 (다시 선택할 수 있으므로)
    const preferences = ROLE_PREFERENCES[role];
    const config: RoleConfig = {
      role,
      preferences: {
        preferredPlatforms: preferences.preferredPlatforms,
        preferredTypes: preferences.preferredTypes,
        preferredTags: preferences.preferredTags,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveRoleConfig(config);
    dispatch({ type: 'SET_ROLE_CONFIG', payload: config });
  };

  const clearRole = async () => {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    // 캐시 무효화
    rolePerformanceOptimizer.clearCache();
    dispatch({ type: 'CLEAR_ROLE' });
  };

  const updateRolePreferences = async (updates: Partial<RoleConfig['preferences']>) => {
    if (!state.roleConfig) return;

    const updatedConfig: RoleConfig = {
      ...state.roleConfig,
      preferences: {
        ...state.roleConfig.preferences,
        ...updates,
      },
      updatedAt: new Date().toISOString(),
    };

    await saveRoleConfig(updatedConfig);
    dispatch({ type: 'SET_ROLE_CONFIG', payload: updatedConfig });
  };

  const getRecommendations = useCallback((resources: Resource[]): RoleRecommendation[] => {
    if (!state.currentRole) {
      return [];
    }

    // 최적화된 서비스를 사용하여 추천 계산 (캐싱 및 인덱싱 활용)
    return rolePerformanceOptimizer.getOptimizedRecommendations(
      state.currentRole,
      resources
    );
  }, [state.currentRole]);

  return (
    <RoleContext.Provider
      value={{
        ...state,
        setRole,
        clearRole,
        getRecommendations,
        updateRolePreferences,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

export { ROLE_LABELS, ROLE_ICONS };
