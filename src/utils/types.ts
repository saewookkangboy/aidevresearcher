/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export type ResourceType = 
  | 'CLI_EXTENSION' 
  | 'AGENT_SKILL' 
  | 'LIBRARY' 
  | 'VSCODE_EXT' 
  | 'API' 
  | 'STARTER_KIT';

export type ResourceCategory = 'SKILLS' | 'TOOLS' | 'EXTENSION' | 'MCP';

export type SourceType = 
  | 'GITHUB' 
  | 'OFFICIAL' 
  | 'SOCIAL_X' 
  | 'SOCIAL_THREADS' 
  | 'API' 
  | 'USER';

export type LinkStatus = 
  | 'idle' 
  | 'checking' 
  | 'active' 
  | 'broken' 
  | 'fixed';

export interface SocialMetrics {
  likes: number;
  shares: number;
  trendingDate: string;
  author?: string;
  platform?: 'X' | 'THREADS' | 'REDDIT';
}

export interface Resource {
  id: string | number;
  title: string;
  type: ResourceType;
  description: string;
  platforms: string[];
  tags: string[];
  command: string;
  url: string;
  stars?: number;
  isVerified: boolean;
  source: string;
  sourceType: SourceType;
  linkStatus: LinkStatus;
  meta?: {
    title?: string;
    statusCode?: number;
    contentType?: string;
    lastFetchedAt?: string;
  };
  socialMetrics?: SocialMetrics;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt?: string;
}

export interface SearchQuery {
  text?: string;
  type?: ResourceType[];
  category?: ResourceCategory[];
  platforms?: string[];
  tags?: string[];
  sourceType?: SourceType[];
}

export interface AutoResearchStatus {
  isActive: boolean;
  platform: 'X' | 'THREADS' | 'REDDIT' | null;
  lastScanTime: string | null;
  currentQuery: string | null;
  itemsFound: number;
}

export interface LinkHealthStatus {
  total: number;
  checking: number;
  active: number;
  broken: number;
  fixed: number;
}

export type AgentRole = 'frontend' | 'backend' | 'pm' | 'fullstack' | 'devops' | 'designer' | null;

export interface ActivityEvent {
  id: string;
  type: 'ingest' | 'run' | 'check' | 'share';
  message: string;
  timestamp: string;
  resourceId?: string | number;
}

export type InteractionType = 'copy' | 'run' | 'favorite';

export interface RoleConfig {
  role: AgentRole;
  preferences: {
    preferredPlatforms: string[];
    preferredTypes: ResourceType[];
    preferredTags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoleRecommendation {
  resource: Resource;
  score: number;
  reason: string;
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  tasks: DevelopmentTask[];
}

export interface DevelopmentTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  resources?: string[];
}

export interface DevelopmentChecklist {
  id: string;
  role: AgentRole;
  projectName: string;
  phases: DevelopmentPhase[];
  createdAt: string;
  updatedAt: string;
  completedPhases: number;
  totalPhases: number;
}
