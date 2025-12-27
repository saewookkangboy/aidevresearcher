/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AgentRole, RoleConfig, Resource, RoleRecommendation } from '../utils/types';
import { ROLE_PREFERENCES, ROLE_LABELS, ROLE_ICONS } from '../utils/roleConfigs';

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

  const getRecommendations = (resources: Resource[]): RoleRecommendation[] => {
    if (!state.currentRole) {
      return [];
    }

    const preferences = ROLE_PREFERENCES[state.currentRole];
    const recommendations: RoleRecommendation[] = [];

    resources.forEach((resource) => {
      let score = 0;
      const reasons: string[] = [];

      // 플랫폼 매칭 점수
      const platformMatch = resource.platforms.some(p =>
        preferences.preferredPlatforms.some(pref => 
          p.toLowerCase().includes(pref.toLowerCase()) || 
          pref.toLowerCase().includes(p.toLowerCase())
        )
      );
      if (platformMatch) {
        score += 30;
        reasons.push('플랫폼 일치');
      }

      // 타입 매칭 점수
      if (preferences.preferredTypes.includes(resource.type)) {
        score += 25;
        reasons.push('타입 일치');
      }

      // 태그 매칭 점수
      const tagMatches = resource.tags.filter(tag =>
        preferences.preferredTags.some(prefTag =>
          tag.toLowerCase().includes(prefTag.toLowerCase()) ||
          prefTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (tagMatches.length > 0) {
        score += tagMatches.length * 10;
        reasons.push(`${tagMatches.length}개 태그 일치`);
      }

      // 키워드 매칭 (제목, 설명)
      const searchText = `${resource.title} ${resource.description}`.toLowerCase();
      const keywordMatches = preferences.keywords.filter(keyword =>
        searchText.includes(keyword.toLowerCase())
      );
      if (keywordMatches.length > 0) {
        score += keywordMatches.length * 5;
        reasons.push(`${keywordMatches.length}개 키워드 일치`);
      }

      // 검증된 리소스 보너스
      if (resource.isVerified) {
        score += 10;
        reasons.push('검증된 리소스');
      }

      // 인기 리소스 보너스
      if (resource.stars && resource.stars > 1000) {
        score += 5;
        reasons.push('인기 리소스');
      }

      if (score > 0) {
        recommendations.push({
          resource,
          score,
          reason: reasons.join(', '),
        });
      }
    });

    // 점수순으로 정렬
    return recommendations.sort((a, b) => b.score - a.score);
  };

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
