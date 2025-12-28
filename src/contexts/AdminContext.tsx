/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface LayoutUnit {
  id: string;
  name: string;
  component: string;
  enabled: boolean;
  order: number;
  category?: string;
}

export interface AdminLayoutConfig {
  units: LayoutUnit[];
  updatedAt: string;
}

interface AdminContextType {
  isAdminMode: boolean;
  layoutConfig: AdminLayoutConfig;
  toggleAdminMode: () => void;
  updateUnitOrder: (unitIds: string[]) => void;
  toggleUnitVisibility: (unitId: string) => void;
  resetLayout: () => void;
  saveLayout: () => void;
}

type AdminAction =
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'SET_LAYOUT_CONFIG'; payload: AdminLayoutConfig }
  | { type: 'UPDATE_UNIT_ORDER'; payload: string[] }
  | { type: 'TOGGLE_UNIT_VISIBILITY'; payload: string }
  | { type: 'RESET_LAYOUT' };

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'vibe_coding_admin_layout';
const ADMIN_MODE_KEY = 'vibe_coding_admin_mode';

// 기본 레이아웃 단위 정의
const DEFAULT_UNITS: LayoutUnit[] = [
  { id: 'quick-start', name: '시작하기 가이드', component: 'QuickStartGuide', enabled: true, order: 0, category: 'guide' },
  { id: 'search', name: '검색 섹션', component: 'SearchBar', enabled: true, order: 1, category: 'search' },
  { id: 'filter', name: '필터 패널', component: 'FilterPanel', enabled: true, order: 2, category: 'search' },
  { id: 'goal-planner', name: '목표 기반 플래너', component: 'GoalPlanner', enabled: true, order: 3, category: 'planning' },
  { id: 'link-health', name: '링크 헬스 인디케이터', component: 'LinkHealthIndicator', enabled: true, order: 4, category: 'status' },
  { id: 'live-ops', name: '라이브 운영 바', component: 'LiveOpsBar', enabled: true, order: 5, category: 'status' },
  { id: 'error-message', name: '에러 메시지', component: 'ErrorMessage', enabled: true, order: 6, category: 'system' },
  { id: 'resource-grid', name: '추천 도구 그리드', component: 'ResourceGrid', enabled: true, order: 7, category: 'content' },
  { id: 'related-resources', name: '관련 도구', component: 'RelatedResources', enabled: true, order: 8, category: 'content' },
  { id: 'url-input', name: '새 도구 추가', component: 'URLInputForm', enabled: true, order: 9, category: 'ingestion' },
  { id: 'trending-harvest', name: '트렌딩 수집', component: 'TrendingHarvestPanel', enabled: true, order: 10, category: 'ingestion' },
  { id: 'workflow-agent', name: '워크플로우 에이전트', component: 'WorkflowAgentPanel', enabled: true, order: 11, category: 'advanced' },
  { id: 'optimization-batch', name: '최적화 배치', component: 'OptimizationBatch', enabled: true, order: 12, category: 'advanced' },
  { id: 'activity-feed', name: '활동 피드', component: 'ActivityFeed', enabled: true, order: 13, category: 'advanced' },
];

function adminReducer(state: {
  isAdminMode: boolean;
  layoutConfig: AdminLayoutConfig;
}, action: AdminAction) {
  switch (action.type) {
    case 'SET_ADMIN_MODE':
      return {
        ...state,
        isAdminMode: action.payload,
      };
    case 'SET_LAYOUT_CONFIG':
      return {
        ...state,
        layoutConfig: action.payload,
      };
    case 'UPDATE_UNIT_ORDER': {
      const newOrder = action.payload;
      const updatedUnits = state.layoutConfig.units.map((unit) => {
        const newIndex = newOrder.indexOf(unit.id);
        return {
          ...unit,
          order: newIndex !== -1 ? newIndex : unit.order,
        };
      }).sort((a, b) => a.order - b.order);
      
      const updatedConfig = {
        ...state.layoutConfig,
        units: updatedUnits,
        updatedAt: new Date().toISOString(),
      };
      
      // 자동 저장
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedConfig));
      } catch (error) {
        console.error('Failed to save layout:', error);
      }
      
      return {
        ...state,
        layoutConfig: updatedConfig,
      };
    }
    case 'TOGGLE_UNIT_VISIBILITY': {
      const updatedUnits = state.layoutConfig.units.map(unit =>
        unit.id === action.payload
          ? { ...unit, enabled: !unit.enabled }
          : unit
      );
      
      const updatedConfig = {
        ...state.layoutConfig,
        units: updatedUnits,
        updatedAt: new Date().toISOString(),
      };
      
      // 자동 저장
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(updatedConfig));
      } catch (error) {
        console.error('Failed to save layout:', error);
      }
      
      return {
        ...state,
        layoutConfig: updatedConfig,
      };
    }
    case 'RESET_LAYOUT':
      return {
        ...state,
        layoutConfig: {
          units: DEFAULT_UNITS.map((unit, index) => ({ ...unit, order: index })),
          updatedAt: new Date().toISOString(),
        },
      };
    default:
      return state;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    isAdminMode: false,
    layoutConfig: {
      units: DEFAULT_UNITS,
      updatedAt: new Date().toISOString(),
    },
  });

  // 초기 로드
  useEffect(() => {
    loadAdminConfig();
    loadAdminMode();
  }, []);

  const loadAdminConfig = () => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const config: AdminLayoutConfig = JSON.parse(stored);
        dispatch({ type: 'SET_LAYOUT_CONFIG', payload: config });
      }
    } catch (error) {
      console.error('Failed to load admin config:', error);
    }
  };

  const loadAdminMode = () => {
    try {
      const stored = localStorage.getItem(ADMIN_MODE_KEY);
      if (stored === 'true') {
        dispatch({ type: 'SET_ADMIN_MODE', payload: true });
      }
      // URL 파라미터로도 확인
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') {
        dispatch({ type: 'SET_ADMIN_MODE', payload: true });
        localStorage.setItem(ADMIN_MODE_KEY, 'true');
      }
    } catch (error) {
      console.error('Failed to load admin mode:', error);
    }
  };

  const saveLayout = () => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state.layoutConfig));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const toggleAdminMode = () => {
    const newMode = !state.isAdminMode;
    dispatch({ type: 'SET_ADMIN_MODE', payload: newMode });
    localStorage.setItem(ADMIN_MODE_KEY, String(newMode));
    
    // URL 업데이트
    const url = new URL(window.location.href);
    if (newMode) {
      url.searchParams.set('admin', 'true');
    } else {
      url.searchParams.delete('admin');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const updateUnitOrder = (unitIds: string[]) => {
    dispatch({ type: 'UPDATE_UNIT_ORDER', payload: unitIds });
  };

  const toggleUnitVisibility = (unitId: string) => {
    dispatch({ type: 'TOGGLE_UNIT_VISIBILITY', payload: unitId });
  };

  const resetLayout = () => {
    dispatch({ type: 'RESET_LAYOUT' });
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  return (
    <AdminContext.Provider
      value={{
        ...state,
        toggleAdminMode,
        updateUnitOrder,
        toggleUnitVisibility,
        resetLayout,
        saveLayout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

