/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { DevelopmentChecklist, DevelopmentPhase, DevelopmentTask, AgentRole } from '../utils/types';
import { ChecklistStorageService } from '../services/storage/checklistStorageService';
import { ROLE_DEVELOPMENT_PHASES } from '../utils/developmentPhases';

interface ChecklistContextType {
  currentChecklist: DevelopmentChecklist | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createChecklist: (role: AgentRole, projectName: string) => Promise<void>;
  updateTask: (phaseId: string, taskId: string, updates: Partial<DevelopmentTask>) => Promise<void>;
  toggleTask: (phaseId: string, taskId: string) => Promise<void>;
  updatePhase: (phaseId: string, updates: Partial<DevelopmentPhase>) => Promise<void>;
  loadChecklist: (role: AgentRole) => Promise<void>;
  deleteChecklist: () => Promise<void>;
  getProgress: () => { completed: number; total: number; percentage: number };
}

type ChecklistAction =
  | { type: 'SET_CHECKLIST'; payload: DevelopmentChecklist | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TASK'; payload: { phaseId: string; taskId: string; updates: Partial<DevelopmentTask> } }
  | { type: 'UPDATE_PHASE'; payload: { phaseId: string; updates: Partial<DevelopmentPhase> } };

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

const storageService = new ChecklistStorageService();

function checklistReducer(state: {
  currentChecklist: DevelopmentChecklist | null;
  loading: boolean;
  error: string | null;
}, action: ChecklistAction) {
  switch (action.type) {
    case 'SET_CHECKLIST':
      return { ...state, currentChecklist: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_TASK': {
      if (!state.currentChecklist) return state;
      
      const updatedPhases = state.currentChecklist.phases.map(phase => {
        if (phase.id === action.payload.phaseId) {
          const updatedTasks = phase.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, ...action.payload.updates }
              : task
          );
          return { ...phase, tasks: updatedTasks };
        }
        return phase;
      });

      const completedPhases = updatedPhases.filter(phase =>
        phase.tasks.every(task => task.completed)
      ).length;

      return {
        ...state,
        currentChecklist: {
          ...state.currentChecklist,
          phases: updatedPhases,
          completedPhases,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    case 'UPDATE_PHASE': {
      if (!state.currentChecklist) return state;
      
      const updatedPhases = state.currentChecklist.phases.map(phase =>
        phase.id === action.payload.phaseId
          ? { ...phase, ...action.payload.updates }
          : phase
      );

      return {
        ...state,
        currentChecklist: {
          ...state.currentChecklist,
          phases: updatedPhases,
          updatedAt: new Date().toISOString(),
        },
      };
    }
    default:
      return state;
  }
}

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checklistReducer, {
    currentChecklist: null,
    loading: false,
    error: null,
  });

  const createChecklist = async (role: AgentRole, projectName: string) => {
    if (!role || role === null) {
      dispatch({ type: 'SET_ERROR', payload: 'Role is required' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rolePhases = ROLE_DEVELOPMENT_PHASES[role as Exclude<AgentRole, null>];
      if (!rolePhases) {
        dispatch({ type: 'SET_ERROR', payload: 'Invalid role' });
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      const phases = rolePhases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => ({ ...task, completed: false })),
      }));

      const checklist: DevelopmentChecklist = {
        id: `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        projectName,
        phases,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedPhases: 0,
        totalPhases: phases.length,
      };

      await storageService.saveChecklist(checklist);
      dispatch({ type: 'SET_CHECKLIST', payload: checklist });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create checklist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadChecklist = async (role: AgentRole) => {
    if (!role || role === null) {
      dispatch({ type: 'SET_CHECKLIST', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const checklist = await storageService.getChecklistByRole(role);
      dispatch({ type: 'SET_CHECKLIST', payload: checklist });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load checklist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (phaseId: string, taskId: string, updates: Partial<DevelopmentTask>) => {
    if (!state.currentChecklist) return;

    dispatch({ type: 'UPDATE_TASK', payload: { phaseId, taskId, updates } });
    
    // 저장
    try {
      await storageService.saveChecklist(state.currentChecklist);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update task' });
    }
  };

  const toggleTask = async (phaseId: string, taskId: string) => {
    if (!state.currentChecklist) return;

    const phase = state.currentChecklist.phases.find(p => p.id === phaseId);
    const task = phase?.tasks.find(t => t.id === taskId);
    
    if (task) {
      await updateTask(phaseId, taskId, { completed: !task.completed });
    }
  };

  const updatePhase = async (phaseId: string, updates: Partial<DevelopmentPhase>) => {
    if (!state.currentChecklist) return;

    dispatch({ type: 'UPDATE_PHASE', payload: { phaseId, updates } });
    
    try {
      await storageService.saveChecklist(state.currentChecklist);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update phase' });
    }
  };

  const deleteChecklist = async () => {
    if (!state.currentChecklist) return;

    try {
      await storageService.deleteChecklist(state.currentChecklist.id);
      dispatch({ type: 'SET_CHECKLIST', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete checklist' });
    }
  };

  const getProgress = () => {
    if (!state.currentChecklist) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const totalTasks = state.currentChecklist.phases.reduce(
      (sum, phase) => sum + phase.tasks.length,
      0
    );
    const completedTasks = state.currentChecklist.phases.reduce(
      (sum, phase) => sum + phase.tasks.filter(task => task.completed).length,
      0
    );

    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  };

  return (
    <ChecklistContext.Provider
      value={{
        ...state,
        createChecklist,
        updateTask,
        toggleTask,
        updatePhase,
        loadChecklist,
        deleteChecklist,
        getProgress,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
}
