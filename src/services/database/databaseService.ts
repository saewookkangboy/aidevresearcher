/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource, InteractionType, ActivityEvent } from '../../utils/types';

// 환경 변수에서 API URL 가져오기 (백엔드 API가 있는 경우)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UserInteraction {
  id: string;
  userId?: string;
  resourceId: string | number;
  interactionType: InteractionType | 'view' | 'click';
  interactionData?: Record<string, any>;
  searchQuery?: string;
  role?: string;
  timestamp: string;
  sessionId?: string;
}

export interface ResourceHistory {
  id: string;
  resourceId: string | number;
  action: 'created' | 'updated' | 'deleted' | 'verified' | 'broken' | 'fixed';
  changes?: {
    before?: Partial<Resource>;
    after?: Partial<Resource>;
  };
  source: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface RecommendationModel {
  id: string;
  modelName: string;
  modelType: string;
  modelData: Record<string, any>;
  version: number;
  trainingEpisodes: number;
  averageReward: number;
  bestScore: number;
  isActive: boolean;
}

export interface RecommendationLog {
  id: string;
  userId?: string;
  sessionId?: string;
  query?: string;
  role?: string;
  recommendedResources: (string | number)[];
  recommendationScores: Record<string, number>;
  modelId?: string;
  context?: Record<string, any>;
  timestamp: string;
}

/**
 * 데이터베이스 서비스
 * 백엔드 API가 있으면 API를 사용하고, 없으면 IndexedDB를 사용
 */
export class DatabaseService {
  private dbName = 'vibe-coding-navigator';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private useAPI: boolean;

  constructor() {
    // API URL이 설정되어 있으면 API 사용, 아니면 IndexedDB 사용
    this.useAPI = !!import.meta.env.VITE_API_BASE_URL;
  }

  /**
   * IndexedDB 초기화
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // user_interactions 테이블
        if (!db.objectStoreNames.contains('user_interactions')) {
          const interactionStore = db.createObjectStore('user_interactions', { keyPath: 'id' });
          interactionStore.createIndex('resourceId', 'resourceId', { unique: false });
          interactionStore.createIndex('userId', 'userId', { unique: false });
          interactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          interactionStore.createIndex('interactionType', 'interactionType', { unique: false });
        }

        // resource_history 테이블
        if (!db.objectStoreNames.contains('resource_history')) {
          const historyStore = db.createObjectStore('resource_history', { keyPath: 'id' });
          historyStore.createIndex('resourceId', 'resourceId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          historyStore.createIndex('action', 'action', { unique: false });
        }

        // recommendation_log 테이블
        if (!db.objectStoreNames.contains('recommendation_log')) {
          const recStore = db.createObjectStore('recommendation_log', { keyPath: 'id' });
          recStore.createIndex('userId', 'userId', { unique: false });
          recStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * 사용자 상호작용 기록
   */
  async recordInteraction(interaction: Omit<UserInteraction, 'id' | 'timestamp'>): Promise<void> {
    if (this.useAPI) {
      await this.apiRequest('/api/interactions', {
        method: 'POST',
        body: JSON.stringify({
          ...interaction,
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    const db = await this.initDB();
    const transaction = db.transaction(['user_interactions'], 'readwrite');
    const store = transaction.objectStore('user_interactions');

    const record: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...interaction,
      timestamp: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 리소스 이력 기록
   */
  async recordResourceHistory(history: Omit<ResourceHistory, 'id' | 'timestamp'>): Promise<void> {
    if (this.useAPI) {
      await this.apiRequest('/api/resource-history', {
        method: 'POST',
        body: JSON.stringify({
          ...history,
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    const db = await this.initDB();
    const transaction = db.transaction(['resource_history'], 'readwrite');
    const store = transaction.objectStore('resource_history');

    const record: ResourceHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...history,
      timestamp: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 추천 로그 기록
   */
  async recordRecommendation(log: Omit<RecommendationLog, 'id' | 'timestamp'>): Promise<void> {
    if (this.useAPI) {
      await this.apiRequest('/api/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          ...log,
          timestamp: new Date().toISOString(),
        }),
      });
      return;
    }

    const db = await this.initDB();
    const transaction = db.transaction(['recommendation_log'], 'readwrite');
    const store = transaction.objectStore('recommendation_log');

    const record: RecommendationLog = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...log,
      timestamp: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 리소스별 상호작용 통계 조회
   */
  async getResourceInteractions(resourceId: string | number): Promise<UserInteraction[]> {
    if (this.useAPI) {
      const data = await this.apiRequest<UserInteraction[]>(`/api/interactions/resource/${resourceId}`);
      return data;
    }

    const db = await this.initDB();
    const transaction = db.transaction(['user_interactions'], 'readonly');
    const store = transaction.objectStore('user_interactions');
    const index = store.index('resourceId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(resourceId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 리소스 이력 조회
   */
  async getResourceHistory(resourceId: string | number): Promise<ResourceHistory[]> {
    if (this.useAPI) {
      const data = await this.apiRequest<ResourceHistory[]>(`/api/resource-history/${resourceId}`);
      return data;
    }

    const db = await this.initDB();
    const transaction = db.transaction(['resource_history'], 'readonly');
    const store = transaction.objectStore('resource_history');
    const index = store.index('resourceId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(resourceId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * API 요청 헬퍼
   */
  private async apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

