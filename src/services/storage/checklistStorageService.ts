import { DevelopmentChecklist } from '../../utils/types';

const CHECKLIST_STORAGE_KEY = 'vibe_coding_checklists';

export class ChecklistStorageService {
  async saveChecklist(checklist: DevelopmentChecklist): Promise<void> {
    try {
      const checklists = await this.loadAllChecklists();
      const index = checklists.findIndex(c => c.id === checklist.id);
      
      if (index !== -1) {
        checklists[index] = checklist;
      } else {
        checklists.push(checklist);
      }
      
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklists));
    } catch (error) {
      console.error('Failed to save checklist:', error);
      throw new Error('Failed to save checklist');
    }
  }

  async loadAllChecklists(): Promise<DevelopmentChecklist[]> {
    try {
      const data = localStorage.getItem(CHECKLIST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load checklists:', error);
      return [];
    }
  }

  async loadChecklist(id: string): Promise<DevelopmentChecklist | null> {
    const checklists = await this.loadAllChecklists();
    return checklists.find(c => c.id === id) || null;
  }

  async deleteChecklist(id: string): Promise<void> {
    const checklists = await this.loadAllChecklists();
    const filtered = checklists.filter(c => c.id !== id);
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(filtered));
  }

  async getChecklistByRole(role: string | null): Promise<DevelopmentChecklist | null> {
    if (!role) return null;
    const checklists = await this.loadAllChecklists();
    return checklists.find(c => c.role === role) || null;
  }
}

