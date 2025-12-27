import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Resource, SearchQuery, AutoResearchStatus, LinkHealthStatus } from '../utils/types';
import { LocalStorageService } from '../services/storage/localStorageService';
import { LinkHealthService } from '../services/api/linkHealthService';
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
  
  // Actions
  addResource: (resource: Resource) => Promise<void>;
  updateResource: (id: string | number, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string | number) => Promise<void>;
  refreshResources: () => Promise<void>;
  
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
  | { type: 'UPDATE_LINK_HEALTH'; payload: LinkHealthStatus };

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

const storageService = new LocalStorageService();
const linkHealthService = new LinkHealthService();
const autoResearchSimulator = new AutoResearchSimulator();

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

function resourceReducer(state: {
  resources: Resource[];
  filteredResources: Resource[];
  loading: boolean;
  error: string | null;
  currentSearchQuery: SearchQuery;
  autoResearchStatus: AutoResearchStatus;
  linkHealthStatus: LinkHealthStatus;
}, action: ResourceAction) {
  switch (action.type) {
    case 'SET_RESOURCES':
      // 리소스가 설정될 때 현재 쿼리 유지하여 필터링
      const filteredOnSet = applyFilters(action.payload, state.currentSearchQuery);
      const linkHealthOnSet = {
        total: action.payload.length,
        checking: 0,
        active: action.payload.filter(r => r.linkStatus === 'active').length,
        broken: action.payload.filter(r => r.linkStatus === 'broken').length,
        fixed: action.payload.filter(r => r.linkStatus === 'fixed').length,
      };
      return {
        ...state,
        resources: action.payload,
        filteredResources: filteredOnSet,
        linkHealthStatus: linkHealthOnSet,
      };
    case 'ADD_RESOURCE':
      // 새로운 리소스 추가 시 현재 쿼리 유지하여 필터링
      const newResources = [action.payload, ...state.resources];
      const filteredOnAdd = applyFilters(newResources, state.currentSearchQuery);
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
        filteredResources: filteredOnAdd,
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
        filteredResources: reFilteredResources,
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
        filteredResources: filteredOnDelete,
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
        filteredResources: filteredOnQueryChange,
      };
    case 'UPDATE_AUTO_RESEARCH':
      return {
        ...state,
        autoResearchStatus: { ...state.autoResearchStatus, ...action.payload },
      };
    case 'UPDATE_LINK_HEALTH':
      return { ...state, linkHealthStatus: action.payload };
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
  });

  // 초기 로드
  useEffect(() => {
    loadResources();
    
    // Auto Research 상태 업데이트 리스너
    autoResearchSimulator.start((status) => {
      dispatch({ type: 'UPDATE_AUTO_RESEARCH', payload: status });
    });
  }, []);

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
      
      // 병합된 데이터를 localStorage에 저장 (새로운 항목이 있을 때만)
      if (newMockResources.length > 0 || storedResources.length === 0) {
        await storageService.saveResources(resources);
      }
      
      dispatch({ type: 'SET_RESOURCES', payload: resources });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load resources' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };


  const addResource = async (resource: Resource) => {
    try {
      await storageService.addResource(resource);
      dispatch({ type: 'ADD_RESOURCE', payload: resource });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add resource' });
      throw error;
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
  };

  const checkAllLinks = async () => {
    for (const resource of state.resources) {
      await checkLinkHealth(resource.id);
      // 각 링크 체크 사이에 약간의 지연 (Rate limit 방지)
      await new Promise(resolve => setTimeout(resolve, 100));
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
        updateResource,
        deleteResource,
        refreshResources,
        searchResources,
        clearSearch,
        checkLinkHealth,
        checkAllLinks,
        startAutoResearch,
        stopAutoResearch,
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

