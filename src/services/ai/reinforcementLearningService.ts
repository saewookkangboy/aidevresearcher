/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource } from '../../utils/types';
import { DatabaseService, UserInteraction, RecommendationLog } from '../database/databaseService';

export interface RLState {
  resources: Resource[];
  userRole?: string;
  searchQuery?: string;
  userHistory: UserInteraction[];
  context: Record<string, any>;
}

export interface RLAction {
  resourceId: string | number;
  action: 'recommend' | 'boost' | 'suppress';
  score: number;
}

export interface RLReward {
  value: number;
  reason: string;
}

/**
 * 강화학습 기반 추천 시스템
 */
export class ReinforcementLearningService {
  private dbService: DatabaseService;
  private model: {
    weights: Record<string, number>;
    qTable: Record<string, number>;
    episodes: number;
    averageReward: number;
    bestScore: number;
  };

  constructor() {
    this.dbService = new DatabaseService();
    this.model = this.loadModel();
  }

  /**
   * 모델 로드 (로컬 스토리지 또는 DB에서)
   */
  private loadModel() {
    try {
      const saved = localStorage.getItem('rl_model');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load RL model:', error);
    }

    // 기본 모델 초기화
    return {
      weights: {
        interaction: 0.3,
        success: 0.5,
        feedback: 0.2,
        recency: 0.1,
        popularity: 0.15,
        roleMatch: 0.25,
        queryMatch: 0.2,
      },
      qTable: {},
      episodes: 0,
      averageReward: 0,
      bestScore: 0,
    };
  }

  /**
   * 모델 저장
   */
  private saveModel() {
    try {
      localStorage.setItem('rl_model', JSON.stringify(this.model));
    } catch (error) {
      console.warn('Failed to save RL model:', error);
    }
  }

  /**
   * 상태 평가 (State Evaluation)
   */
  private evaluateState(state: RLState): number {
    let score = 0;

    // 리소스 품질 점수
    const qualityScore = state.resources.reduce((sum, r) => {
      return sum + (r.stars || 0) * 0.001 + (r.isVerified ? 0.1 : 0);
    }, 0);

    // 사용자 히스토리 점수
    const historyScore = state.userHistory.length * 0.01;

    // 컨텍스트 매칭 점수
    const contextScore = Object.keys(state.context).length * 0.05;

    score = qualityScore + historyScore + contextScore;
    return score;
  }

  /**
   * 행동 선택 (Action Selection) - ε-greedy 정책
   */
  private selectAction(state: RLState, resources: Resource[]): RLAction[] {
    const epsilon = 0.1; // 탐험 확률
    const actions: RLAction[] = [];

    for (const resource of resources) {
      const stateKey = this.getStateKey(state, resource);
      const qValue = this.model.qTable[stateKey] || 0;

      // ε-greedy: 랜덤 탐험 또는 최적 행동
      if (Math.random() < epsilon) {
        // 탐험: 랜덤 점수
        actions.push({
          resourceId: resource.id,
          action: 'recommend',
          score: Math.random() * 0.5 + 0.5,
        });
      } else {
        // 활용: Q-value 기반 점수
        const score = this.calculateRecommendationScore(resource, state);
        actions.push({
          resourceId: resource.id,
          action: score > 0.7 ? 'boost' : score > 0.3 ? 'recommend' : 'suppress',
          score,
        });
      }
    }

    // 점수순 정렬
    return actions.sort((a, b) => b.score - a.score);
  }

  /**
   * 추천 점수 계산
   */
  private calculateRecommendationScore(resource: Resource, state: RLState): number {
    const weights = this.model.weights;
    let score = 0;

    // 1. 상호작용 점수
    const interactionCount = state.userHistory.filter(
      h => h.resourceId === resource.id
    ).length;
    score += (interactionCount * weights.interaction) / 10;

    // 2. 성공 사용 점수
    const successCount = state.userHistory.filter(
      h => h.resourceId === resource.id && h.interactionType === 'run'
    ).length;
    score += (successCount * weights.success) / 5;

    // 3. 최근성 점수
    const recentInteraction = state.userHistory
      .filter(h => h.resourceId === resource.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if (recentInteraction) {
      const daysSince = (Date.now() - new Date(recentInteraction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      score += (1 / (1 + daysSince)) * weights.recency;
    }

    // 4. 인기도 점수
    if (resource.stars) {
      score += Math.log10(resource.stars + 1) * weights.popularity;
    }

    // 5. 역할 매칭 점수
    if (state.userRole && resource.platforms.includes(state.userRole)) {
      score += weights.roleMatch;
    }

    // 6. 검색 쿼리 매칭 점수
    if (state.searchQuery) {
      const queryLower = state.searchQuery.toLowerCase();
      const titleMatch = resource.title.toLowerCase().includes(queryLower) ? 1 : 0;
      const descMatch = resource.description.toLowerCase().includes(queryLower) ? 0.5 : 0;
      const tagMatch = resource.tags.some(t => t.toLowerCase().includes(queryLower)) ? 0.3 : 0;
      score += (titleMatch + descMatch + tagMatch) * weights.queryMatch;
    }

    // 7. 검증된 리소스 보너스
    if (resource.isVerified) {
      score += 0.1;
    }

    // 정규화 (0-1 범위)
    return Math.min(1, Math.max(0, score));
  }

  /**
   * 상태 키 생성
   */
  private getStateKey(state: RLState, resource: Resource): string {
    return `${resource.id}_${state.userRole || 'none'}_${state.searchQuery || 'none'}`;
  }

  /**
   * 보상 계산 (Reward Calculation)
   */
  private calculateReward(
    action: RLAction,
    feedback?: { positive: boolean; value?: number }
  ): RLReward {
    let reward = 0;

    if (feedback) {
      // 피드백 기반 보상
      if (feedback.positive) {
        reward = feedback.value || 1.0;
      } else {
        reward = -(feedback.value || 0.5);
      }
    } else {
      // 행동 기반 기본 보상
      switch (action.action) {
        case 'boost':
          reward = 0.3;
          break;
        case 'recommend':
          reward = 0.1;
          break;
        case 'suppress':
          reward = -0.1;
          break;
      }
    }

    return {
      value: reward,
      reason: feedback ? 'user_feedback' : 'action_based',
    };
  }

  /**
   * Q-learning 업데이트
   */
  private updateQValue(state: RLState, action: RLAction, reward: RLReward) {
    // action에서 resource 찾기
    const resource = state.resources.find(r => r.id === action.resourceId);
    if (!resource) return;

    const stateKey = this.getStateKey(state, resource);
    const learningRate = 0.1;
    const discountFactor = 0.9;

    const currentQ = this.model.qTable[stateKey] || 0;
    const newQ = currentQ + learningRate * (reward.value + discountFactor * 0 - currentQ);

    this.model.qTable[stateKey] = newQ;
    this.saveModel();
  }

  /**
   * 리소스 추천
   */
  async recommendResources(
    resources: Resource[],
    context: {
      userRole?: string;
      searchQuery?: string;
      userId?: string;
      sessionId?: string;
    }
  ): Promise<Array<{ resource: Resource; score: number; reason: string }>> {
    // 사용자 히스토리 로드
    const userHistory: UserInteraction[] = [];
    if (context.userId) {
      try {
        // DB에서 사용자 히스토리 가져오기 (비동기)
        // 현재는 빈 배열 사용
      } catch (error) {
        console.warn('Failed to load user history:', error);
      }
    }

    // 상태 생성
    const state: RLState = {
      resources,
      userRole: context.userRole,
      searchQuery: context.searchQuery,
      userHistory,
      context: {
        timestamp: new Date().toISOString(),
        ...context,
      },
    };

    // 행동 선택
    const actions = this.selectAction(state, resources);

    // 추천 결과 생성
    const recommendations = actions
      .filter(a => a.action !== 'suppress')
      .map(action => {
        const resource = resources.find(r => r.id === action.resourceId);
        if (!resource) return null;

        return {
          resource,
          score: action.score,
          reason: this.getRecommendationReason(resource, state, action),
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score);

    // 추천 로그 기록
    try {
      await this.dbService.recordRecommendation({
        userId: context.userId,
        sessionId: context.sessionId,
        query: context.searchQuery,
        role: context.userRole,
        recommendedResources: recommendations.map(r => r.resource.id),
        recommendationScores: recommendations.reduce((acc, r) => {
          acc[String(r.resource.id)] = r.score;
          return acc;
        }, {} as Record<string, number>),
        context: state.context,
      });
    } catch (error) {
      console.warn('Failed to record recommendation:', error);
    }

    return recommendations;
  }

  /**
   * 추천 이유 생성
   */
  private getRecommendationReason(
    resource: Resource,
    state: RLState,
    action: RLAction
  ): string {
    const reasons: string[] = [];

    if (state.userRole && resource.platforms.includes(state.userRole)) {
      reasons.push(`${state.userRole} 개발자에게 적합`);
    }

    if (state.searchQuery) {
      const queryLower = state.searchQuery.toLowerCase();
      if (resource.title.toLowerCase().includes(queryLower)) {
        reasons.push('제목이 검색어와 일치');
      }
      if (resource.tags.some(t => t.toLowerCase().includes(queryLower))) {
        reasons.push('태그가 검색어와 일치');
      }
    }

    const interactionCount = state.userHistory.filter(
      h => h.resourceId === resource.id
    ).length;
    if (interactionCount > 0) {
      reasons.push(`${interactionCount}번 사용됨`);
    }

    if (resource.stars && resource.stars > 1000) {
      reasons.push('인기 리소스');
    }

    if (resource.isVerified) {
      reasons.push('검증된 리소스');
    }

    return reasons.length > 0 ? reasons.join(', ') : '추천 리소스';
  }

  /**
   * 피드백 학습
   */
  async learnFromFeedback(
    resourceId: string | number,
    feedback: { positive: boolean; value?: number },
    context: {
      userRole?: string;
      searchQuery?: string;
      userId?: string;
    }
  ): Promise<void> {
    const state: RLState = {
      resources: [],
      userRole: context.userRole,
      searchQuery: context.searchQuery,
      userHistory: [],
      context,
    };

    const action: RLAction = {
      resourceId,
      action: 'recommend',
      score: 0,
    };

    const reward = this.calculateReward(action, feedback);
    this.updateQValue(state, action, reward);

    // 모델 통계 업데이트
    this.model.episodes += 1;
    this.model.averageReward =
      (this.model.averageReward * (this.model.episodes - 1) + reward.value) /
      this.model.episodes;

    if (reward.value > this.model.bestScore) {
      this.model.bestScore = reward.value;
    }

    this.saveModel();
  }

  /**
   * 모델 통계 조회
   */
  getModelStats() {
    return {
      episodes: this.model.episodes,
      averageReward: this.model.averageReward,
      bestScore: this.model.bestScore,
      weights: this.model.weights,
      qTableSize: Object.keys(this.model.qTable).length,
    };
  }
}

