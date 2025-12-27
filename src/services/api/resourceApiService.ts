/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource, SearchQuery } from '../../utils/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ResourceApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async saveResources(resources: Resource[]): Promise<void> {
    // 배치 저장은 백엔드에서 지원하는 경우에만 사용
    // 현재는 개별 저장으로 처리
    for (const resource of resources) {
      try {
        await this.addResource(resource);
      } catch (error) {
        // 이미 존재하는 리소스는 업데이트 시도
        try {
          await this.updateResource(resource.id, resource);
        } catch (updateError) {
          console.warn(`Failed to save resource ${resource.id}:`, updateError);
        }
      }
    }
  }

  async loadResources(): Promise<Resource[]> {
    return this.request<Resource[]>('/api/resources/');
  }

  async getResource(id: string | number): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`);
  }

  async addResource(resource: Resource): Promise<Resource> {
    return this.request<Resource>('/api/resources/', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  async updateResource(
    id: string | number,
    updates: Partial<Resource>
  ): Promise<Resource> {
    return this.request<Resource>(`/api/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteResource(id: string | number): Promise<void> {
    await this.request(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  }

  async searchResources(query: SearchQuery): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (query.text) params.append('q', query.text);
    if (query.type && query.type.length > 0) {
      params.append('type', query.type[0]); // 첫 번째 타입만 전송 (백엔드에서 배열 지원 시 수정)
    }
    if (query.platforms && query.platforms.length > 0) {
      params.append('platform', query.platforms[0]); // 첫 번째 플랫폼만 전송
    }

    return this.request<Resource[]>(`/api/resources/search?${params}`);
  }

  async clearAll(): Promise<void> {
    // 백엔드에서 bulk delete 엔드포인트가 있는 경우 사용
    // 현재는 개별 삭제로 처리
    const resources = await this.loadResources();
    await Promise.all(resources.map(r => this.deleteResource(r.id)));
  }
}

