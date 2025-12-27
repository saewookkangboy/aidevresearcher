import { Resource } from '../../utils/types';
import { STORAGE_KEY } from '../../utils/constants';

export class LocalStorageService {
  async saveResources(resources: Resource[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    } catch (error) {
      console.error('Failed to save resources:', error);
      throw new Error('Storage quota exceeded. Please clear some data.');
    }
  }

  async loadResources(): Promise<Resource[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load resources:', error);
      return [];
    }
  }

  async addResource(resource: Resource): Promise<void> {
    const resources = await this.loadResources();
    resources.unshift(resource); // 최상단 추가
    await this.saveResources(resources);
  }

  async updateResource(id: string | number, updates: Partial<Resource>): Promise<void> {
    const resources = await this.loadResources();
    const index = resources.findIndex(r => r.id === id);
    if (index !== -1) {
      resources[index] = {
        ...resources[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await this.saveResources(resources);
    }
  }

  async deleteResource(id: string | number): Promise<void> {
    const resources = await this.loadResources();
    const filtered = resources.filter(r => r.id !== id);
    await this.saveResources(filtered);
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

