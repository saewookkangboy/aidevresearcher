/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Resource, SearchQuery, AutoResearchStatus, LinkHealthStatus, ActivityEvent, InteractionType, LinkStatus } from '../utils/types';
import { LocalStorageService } from '../services/storage/localStorageService';
import { LinkHealthService } from '../services/api/linkHealthService';
import { ResourceValidator } from '../services/api/resourceValidator';
import { AutoResearchSimulator } from '../services/simulation/autoResearchSimulator';
import { mockResources } from '../data/mockData';
import { RESOURCE_TYPE_TO_CATEGORY } from '../utils/constants';

interface ResourceContextType {
  resources: Resource[];
  filteredResources: Resource[];
  loading: boolean;
  error: string | null;
  autoResearchStatus: AutoResearchStatus;
  linkHealthStatus: LinkHealthStatus;
  currentSearchQuery: SearchQuery;
  activityLog: ActivityEvent[];
  interactionScores: Record<string | number, number>;
  
  // Actions
  addResource: (resource: Resource) => Promise<void>;
  addResources: (resources: Resource[]) => Promise<void>;
  updateResource: (id: string | number, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string | number) => Promise<void>;
  refreshResources: () => Promise<void>;
  addActivity: (event: ActivityEvent) => void;
  clearActivity: () => void;
  recordInteraction: (id: string | number, type: InteractionType) => void;
  
  // Search & Filter
  searchResources: (query: SearchQuery) => void;
  clearSearch: () => void;
  
  // Link Health
  checkLinkHealth: (id: string | number) => Promise<void>;
  checkAllLinks: () => Promise<void>;
  
  // Auto Research
  startAutoResearch: () => void;
  stopAutoResearch: () => void;
}

type ResourceAction =
  | { type: 'SET_RESOURCES'; payload: Resource[] }
  | { type: 'ADD_RESOURCE'; payload: Resource }
  | { type: 'UPDATE_RESOURCE'; payload: { id: string | number; updates: Partial<Resource> } }
  | { type: 'DELETE_RESOURCE'; payload: string | number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERED_RESOURCES'; payload: Resource[] }
  | { type: 'SET_SEARCH_QUERY'; payload: SearchQuery }
  | { type: 'UPDATE_AUTO_RESEARCH'; payload: Partial<AutoResearchStatus> }
  | { type: 'UPDATE_LINK_HEALTH'; payload: LinkHealthStatus }
  | { type: 'ADD_ACTIVITY'; payload: ActivityEvent[] }
  | { type: 'CLEAR_ACTIVITY' }
  | { type: 'SET_INTERACTIONS'; payload: Record<string | number, number> };

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

const storageService = new LocalStorageService();
const linkHealthService = new LinkHealthService();
const autoResearchSimulator = new AutoResearchSimulator();
const ACTIVITY_STORAGE_KEY = 'vibe_coding_activity_log';
const BEHAVIOR_WEIGHTS: Record<InteractionType, number> = {
  copy: Number(import.meta.env.VITE_BEHAVIOR_WEIGHT_COPY || 1),
  run: Number(import.meta.env.VITE_BEHAVIOR_WEIGHT_RUN || 4),
  favorite: Number(import.meta.env.VITE_BEHAVIOR_WEIGHT_FAVORITE || 2),
};

// 필터링 로직을 재사용 가능한 함수로 추출
function applyFilters(resources: Resource[], query: SearchQuery): Resource[] {
  let filtered = [...resources];

  // 텍스트 검색
  if (query.text) {
    const lowerText = query.text.toLowerCase();
    filtered = filtered.filter(r =>
      r.title.toLowerCase().includes(lowerText) ||
      r.description.toLowerCase().includes(lowerText) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerText))
    );
  }

  // 타입 필터
  if (query.type && query.type.length > 0) {
    filtered = filtered.filter(r => query.type!.includes(r.type));
  }

  // 카테고리 필터 - 빈 배열이 아닐 때만 필터링 적용
  if (query.category !== undefined && query.category.length > 0) {
    filtered = filtered.filter(r => {
      const resourceCategory = RESOURCE_TYPE_TO_CATEGORY[r.type];
      return query.category!.includes(resourceCategory);
    });
  }

  // 플랫폼 필터
  if (query.platforms && query.platforms.length > 0) {
    filtered = filtered.filter(r =>
      r.platforms.some(p => query.platforms!.includes(p))
    );
  }

  // 소스 타입 필터
  if (query.sourceType && query.sourceType.length > 0) {
    filtered = filtered.filter(r => query.sourceType!.includes(r.sourceType));
  }

  return filtered;
}

// ModelContextProtocol 서버 링크 정규화 및 기본 상태 보정
function normalizeResourceLinks(resources: Resource[]): Resource[] {
  return resources.map((resource) => {
    if (!resource.url.includes('github.com/modelcontextprotocol/servers')) {
      return resource;
    }
    const fixedUrl = resource.url.replace('/tree/main/src/', '/tree/main/src/providers/');
    const fixedCommand = resource.command?.includes('/tree/main/src/')
      ? resource.command.replace('/tree/main/src/', '/tree/main/src/providers/')
      : resource.command;
    return {
      ...resource,
      url: fixedUrl,
      command: fixedCommand || resource.command,
      linkStatus: 'active',
      isVerified: true,
    };
  });
}

// 중복 제거: URL 또는 제목이 동일하면 최신 updatedAt 기준으로 남김
function deduplicateResources(resources: Resource[]): Resource[] {
  const map = new Map<string, Resource>();

  resources.forEach((resource) => {
    const key = (resource.url || resource.title).toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, resource);
      return;
    }
    const existingTime = new Date(existing.updatedAt || existing.createdAt).getTime();
    const currentTime = new Date(resource.updatedAt || resource.createdAt).getTime();
    if (currentTime >= existingTime) {
      map.set(key, resource);
    }
  });

  return Array.from(map.values());
}

// 간단한 상호작용 기반 랭킹
function applyRanking(resources: Resource[], scores: Record<string | number, number>): Resource[] {
  if (!resources.length) return resources;
  return [...resources].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
}

function resourceReducer(state: {
  resources: Resource[];
  filteredResources: Resource[];
  loading: boolean;
  error: string | null;
  currentSearchQuery: SearchQuery;
  autoResearchStatus: AutoResearchStatus;
  linkHealthStatus: LinkHealthStatus;
  activityLog: ActivityEvent[];
  interactionScores: Record<string | number, number>;
}, action: ResourceAction) {
  switch (action.type) {
    case 'SET_RESOURCES':
      // 리소스가 설정될 때 현재 쿼리 유지하여 필터링
      const dedupedOnSet = deduplicateResources(action.payload);
      const filteredOnSet = applyFilters(dedupedOnSet, state.currentSearchQuery);
      const linkHealthOnSet = {
        total: dedupedOnSet.length,
        checking: 0,
        active: dedupedOnSet.filter(r => r.linkStatus === 'active').length,
        broken: dedupedOnSet.filter(r => r.linkStatus === 'broken').length,
        fixed: dedupedOnSet.filter(r => r.linkStatus === 'fixed').length,
      };
      return {
        ...state,
        resources: dedupedOnSet,
        filteredResources: applyRanking(filteredOnSet, state.interactionScores),
        linkHealthStatus: linkHealthOnSet,
      };
    case 'ADD_RESOURCE':
      // 새로운 리소스 추가 시 현재 쿼리 유지하여 필터링
      const newResources = deduplicateResources([action.payload, ...state.resources]);
      const filteredOnAdd = applyFilters(normalizeResourceLinks(newResources), state.currentSearchQuery);
      const linkHealthOnAdd = {
        total: newResources.length,
        checking: 0,
        active: newResources.filter(r => r.linkStatus === 'active').length,
        broken: newResources.filter(r => r.linkStatus === 'broken').length,
        fixed: newResources.filter(r => r.linkStatus === 'fixed').length,
      };
      return {
        ...state,
        resources: newResources,
        filteredResources: applyRanking(filteredOnAdd, state.interactionScores),
        linkHealthStatus: linkHealthOnAdd,
      };
    case 'UPDATE_RESOURCE':
      const updatedResources = state.resources.map((r: Resource) =>
        r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
      );
      // 현재 검색 쿼리를 유지하면서 필터링 재적용
      const reFilteredResources = applyFilters(updatedResources, state.currentSearchQuery);
      const linkHealthOnUpdate = {
        total: updatedResources.length,
        checking: 0,
        active: updatedResources.filter(r => r.linkStatus === 'active').length,
        broken: updatedResources.filter(r => r.linkStatus === 'broken').length,
        fixed: updatedResources.filter(r => r.linkStatus === 'fixed').length,
      };
      return {
        ...state,
        resources: updatedResources,
        filteredResources: applyRanking(reFilteredResources, state.interactionScores),
        linkHealthStatus: linkHealthOnUpdate,
      };
    case 'DELETE_RESOURCE':
      // 리소스 삭제 시 현재 쿼리 유지하여 필터링
      const resourcesAfterDelete = state.resources.filter(r => r.id !== action.payload);
      const filteredOnDelete = applyFilters(resourcesAfterDelete, state.currentSearchQuery);
      const linkHealthOnDelete = {
        total: resourcesAfterDelete.length,
        checking: 0,
        active: resourcesAfterDelete.filter(r => r.linkStatus === 'active').length,
        broken: resourcesAfterDelete.filter(r => r.linkStatus === 'broken').length,
        fixed: resourcesAfterDelete.filter(r => r.linkStatus === 'fixed').length,
      };
      return {
        ...state,
        resources: resourcesAfterDelete,
        filteredResources: applyRanking(filteredOnDelete, state.interactionScores),
        linkHealthStatus: linkHealthOnDelete,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTERED_RESOURCES':
      return { ...state, filteredResources: action.payload };
    case 'SET_SEARCH_QUERY':
      // 검색 쿼리가 변경될 때 필터링 재적용
      const filteredOnQueryChange = applyFilters(state.resources, action.payload);
      return { 
        ...state, 
        currentSearchQuery: action.payload,
        filteredResources: applyRanking(filteredOnQueryChange, state.interactionScores),
      };
    case 'UPDATE_AUTO_RESEARCH':
      return {
        ...state,
        autoResearchStatus: { ...state.autoResearchStatus, ...action.payload },
      };
    case 'UPDATE_LINK_HEALTH':
      return { ...state, linkHealthStatus: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activityLog: action.payload };
    case 'CLEAR_ACTIVITY':
      return { ...state, activityLog: [] };
    case 'SET_INTERACTIONS':
      return { ...state, interactionScores: action.payload };
    default:
      return state;
  }
}

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resourceReducer, {
    resources: [],
    filteredResources: [],
    loading: false,
    error: null,
    currentSearchQuery: {},
    autoResearchStatus: {
      isActive: false,
      platform: null,
      lastScanTime: null,
      currentQuery: null,
      itemsFound: 0,
    },
    linkHealthStatus: {
      total: 0,
      checking: 0,
      active: 0,
      broken: 0,
      fixed: 0,
    },
    activityLog: [],
    interactionScores: {},
  });

  // 리소스 검증 및 자동 수정 함수
  async function validateAndFixResources(resources: Resource[]): Promise<Resource[]> {
    const linkHealthService = new LinkHealthService();
    const resourceValidator = new ResourceValidator();
    const fixedResources: Resource[] = [];
    
    // 1단계: URL과 command 일치성 검증 및 수정 (동기 처리)
    const validatedResources = resourceValidator.validateAndFixResources(resources);
    
    // 2단계: 링크 상태 확인 및 자동 수정 (비동기 처리, 개발 환경에서는 스킵)
    if (import.meta.env.DEV) {
      // 개발 환경에서는 검증만 수행
      return validatedResources;
    }
    
    // 배치 처리로 성능 최적화 (동시에 너무 많은 요청 방지)
    const batchSize = 5;
    for (let i = 0; i < validatedResources.length; i += batchSize) {
      const batch = validatedResources.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (resource) => {
          try {
            // 링크 상태 확인
            const linkStatus = await linkHealthService.checkLink(resource.url);
            
            // broken인 경우 자동 수정 시도
            if (linkStatus === 'broken') {
              const fixed = await linkHealthService.autoFixBrokenLink(resource);
              if (fixed.linkStatus === 'fixed') {
                // 수정된 URL로 command도 업데이트
                return resourceValidator.validateAndFixResource(fixed);
              }
              // 수정 실패 시 broken 상태 유지
              return {
                ...resource,
                linkStatus: 'broken' as LinkStatus,
                lastCheckedAt: new Date().toISOString(),
              };
            }
            
            // active인 경우 lastCheckedAt 업데이트
            if (linkStatus === 'active' && resource.linkStatus !== 'active') {
              return {
                ...resource,
                linkStatus: 'active' as LinkStatus,
                lastCheckedAt: new Date().toISOString(),
              };
            }
            
            return resource;
          } catch (error) {
            // 에러 발생 시 원본 리소스 반환
            return resource;
          }
        })
      );
      
      fixedResources.push(...batchResults);
      
      // 배치 간 지연 (rate limiting 방지)
      if (i + batchSize < validatedResources.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return fixedResources;
  };

  // 초기 로드
  useEffect(() => {
    loadResources();
    loadActivityLog();
    
    // Auto Research 상태 업데이트 리스너
    autoResearchSimulator.start((status) => {
      dispatch({ type: 'UPDATE_AUTO_RESEARCH', payload: status });
    });
  }, []);

  const loadActivityLog = () => {
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
      if (stored) {
        const parsed: ActivityEvent[] = JSON.parse(stored);
        dispatch({ type: 'ADD_ACTIVITY', payload: parsed });
      }
    } catch (err) {
      console.warn('활동 로그 로드 실패:', err);
    }
  };

  const loadResources = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let storedResources = await storageService.loadResources();
      
      // localStorage에 저장된 리소스와 mockResources 병합
      // URL 기준으로 중복 체크하여 새로운 항목만 추가
      const existingUrls = new Set(storedResources.map(r => r.url));
      const newMockResources = mockResources.filter(r => !existingUrls.has(r.url));
      
      // 새로운 mockResources를 기존 데이터 앞에 추가 (최신순 유지)
      let resources: Resource[];
      if (storedResources.length === 0) {
        // localStorage가 비어있으면 mockResources만 사용
        resources = mockResources;
      } else {
        // 기존 데이터가 있으면 새로운 mockResources를 앞에 추가
        resources = [...newMockResources, ...storedResources];
      }
      
      // 리소스 로드 후 자동으로 링크 검증 및 수정
      const validatedResources = await validateAndFixResources(resources);
      
      // 병합된 데이터를 localStorage에 저장 (새로운 항목이 있거나 수정된 경우)
      const hasChanges = newMockResources.length > 0 || 
                        storedResources.length === 0 ||
                        validatedResources.some((r, i) => r.url !== resources[i]?.url || r.linkStatus !== resources[i]?.linkStatus);
      
      if (hasChanges) {
        await storageService.saveResources(validatedResources);
      }
      
      const normalized = normalizeResourceLinks(validatedResources);
      dispatch({ type: 'SET_RESOURCES', payload: normalized });
      updateLinkHealthStatus(normalized);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load resources' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateLinkHealthStatus = (resources: Resource[]) => {
    const status: LinkHealthStatus = {
      total: resources.length,
      checking: resources.filter(r => r.linkStatus === 'checking').length,
      active: resources.filter(r => r.linkStatus === 'active').length,
      broken: resources.filter(r => r.linkStatus === 'broken').length,
      fixed: resources.filter(r => r.linkStatus === 'fixed').length,
    };
    dispatch({ type: 'UPDATE_LINK_HEALTH', payload: status });
  };

  const persistActivity = (events: ActivityEvent[]) => {
    try {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(events.slice(-50)));
    } catch (err) {
      // 개발 환경에서만 경고 출력
      if (import.meta.env.DEV) {
        console.warn('활동 로그 저장 실패:', err);
      }
    }
  };

  const addActivity = (event: ActivityEvent) => {
    const nextLog = [...state.activityLog, event].slice(-50);
    dispatch({ type: 'ADD_ACTIVITY', payload: nextLog });
    persistActivity(nextLog);
  };

  const clearActivity = () => {
    dispatch({ type: 'CLEAR_ACTIVITY' });
    persistActivity([]);
  };

  const recordInteraction = (id: string | number, type: InteractionType) => {
    const next = { ...state.interactionScores };
    next[id] = (next[id] || 0) + (BEHAVIOR_WEIGHTS[type] || 0);
    dispatch({ type: 'SET_INTERACTIONS', payload: next });
  };


  const addResource = async (resource: Resource) => {
    try {
      // 리소스 추가 전 검증 및 수정
      const resourceValidator = new ResourceValidator();
      const validatedResource = resourceValidator.validateAndFixResource(resource);
      
      await storageService.addResource(validatedResource);
      dispatch({ type: 'ADD_RESOURCE', payload: validatedResource });
      updateLinkHealthStatus([validatedResource, ...state.resources]);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add resource' });
      throw error;
    }
  };

  const addResources = async (resources: Resource[]) => {
    for (const res of resources) {
      await addResource(res);
    }
  };

  const updateResource = async (id: string | number, updates: Partial<Resource>) => {
    try {
      await storageService.updateResource(id, updates);
      dispatch({ type: 'UPDATE_RESOURCE', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update resource' });
    }
  };

  const deleteResource = async (id: string | number) => {
    try {
      await storageService.deleteResource(id);
      dispatch({ type: 'DELETE_RESOURCE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete resource' });
    }
  };

  const refreshResources = async () => {
    await loadResources();
  };

  const searchResources = (query: SearchQuery) => {
    // 기존 쿼리와 병합
    const mergedQuery: SearchQuery = {
      text: query.text !== undefined ? query.text : state.currentSearchQuery.text,
      category: query.category !== undefined ? query.category : state.currentSearchQuery.category,
      type: query.type !== undefined ? query.type : state.currentSearchQuery.type,
      platforms: query.platforms !== undefined ? query.platforms : state.currentSearchQuery.platforms,
      tags: query.tags !== undefined ? query.tags : state.currentSearchQuery.tags,
      sourceType: query.sourceType !== undefined ? query.sourceType : state.currentSearchQuery.sourceType,
    };

    // SET_SEARCH_QUERY 액션이 필터링도 함께 처리하므로 한 번만 디스패치
    dispatch({ type: 'SET_SEARCH_QUERY', payload: mergedQuery });
  };

  const clearSearch = () => {
    // 빈 쿼리로 설정하면 모든 리소스가 표시됨 (SET_SEARCH_QUERY에서 필터링 처리)
    dispatch({ type: 'SET_SEARCH_QUERY', payload: {} });
  };

  const checkLinkHealth = async (id: string | number) => {
    const resource = state.resources.find(r => r.id === id);
    if (!resource) return;

    try {
      // Backend에서만 checking 상태 처리 (Frontend에는 표시 안 함)
      const status = await linkHealthService.checkLink(resource.url);
      
      if (status === 'broken') {
        const fixed = await linkHealthService.autoFixBrokenLink(resource);
        // Frontend에는 최종 결과만 표시
        await updateResource(id, fixed);
      } else {
        // Frontend에는 최종 결과만 표시
        await updateResource(id, {
          linkStatus: status,
          lastCheckedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      // 에러를 조용히 처리 (콘솔에 출력하지 않음)
      // 링크 체크 실패는 broken으로 처리하지 않고 기존 상태 유지
    }
  };

  const checkAllLinks = async () => {
    // 리소스가 많을 경우 rate limiting을 피하기 위해 배치 처리
    const batchSize = 5;
    const delayBetweenBatches = 2000; // 2초
    const delayBetweenItems = 500; // 0.5초
    
    for (let i = 0; i < state.resources.length; i += batchSize) {
      const batch = state.resources.slice(i, i + batchSize);
      
      // 배치 내에서 순차 처리
      for (const resource of batch) {
        await checkLinkHealth(resource.id);
        // 각 링크 체크 사이에 지연 (Rate limit 방지)
        await new Promise(resolve => setTimeout(resolve, delayBetweenItems));
      }
      
      // 배치 사이에 더 긴 지연 (마지막 배치가 아니면)
      if (i + batchSize < state.resources.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }
  };

  const startAutoResearch = () => {
    autoResearchSimulator.start((status) => {
      dispatch({ type: 'UPDATE_AUTO_RESEARCH', payload: status });
    });
  };

  const stopAutoResearch = () => {
    autoResearchSimulator.stop();
    dispatch({
      type: 'UPDATE_AUTO_RESEARCH',
      payload: {
        isActive: false,
        platform: null,
        currentQuery: null,
      },
    });
  };

  return (
    <ResourceContext.Provider
      value={{
        ...state,
        addResource,
        addResources,
        updateResource,
        deleteResource,
        refreshResources,
        searchResources,
        clearSearch,
        checkLinkHealth,
        checkAllLinks,
        startAutoResearch,
        stopAutoResearch,
        addActivity,
        clearActivity,
        recordInteraction,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
}
