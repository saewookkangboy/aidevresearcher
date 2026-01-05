/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { AgentRole } from '../../utils/types';

/**
 * 성능 메트릭 인터페이스
 */
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  role?: AgentRole;
  metadata?: Record<string, any>;
}

/**
 * 성능 모니터링 서비스
 * - Role별 성능 추적
 * - 자동 최적화 제안
 * - 성능 경고 및 알림
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly WARNING_THRESHOLD = 100; // 100ms 이상이면 경고
  private readonly CRITICAL_THRESHOLD = 500; // 500ms 이상이면 심각

  /**
   * 성능 메트릭 기록
   */
  recordMetric(
    name: string,
    value: number,
    role?: AgentRole,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      role,
      metadata,
    };

    this.metrics.push(metric);

    // 메트릭 개수 제한
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // 경고 체크
    this.checkWarnings(metric);
  }

  /**
   * 성능 경고 체크
   */
  private checkWarnings(metric: PerformanceMetric): void {
    if (metric.value >= this.CRITICAL_THRESHOLD) {
      console.warn(
        `[성능 경고] ${metric.name}이(가) ${metric.value}ms로 심각한 수준입니다.`,
        metric.role ? `Role: ${metric.role}` : '',
        metric.metadata
      );
    } else if (metric.value >= this.WARNING_THRESHOLD) {
      console.warn(
        `[성능 경고] ${metric.name}이(가) ${metric.value}ms로 느립니다.`,
        metric.role ? `Role: ${metric.role}` : '',
        metric.metadata
      );
    }
  }

  /**
   * Role별 평균 성능 조회
   */
  getRolePerformance(role: AgentRole): {
    average: number;
    max: number;
    min: number;
    count: number;
  } {
    const roleMetrics = this.metrics.filter(m => m.role === role);

    if (roleMetrics.length === 0) {
      return { average: 0, max: 0, min: 0, count: 0 };
    }

    const values = roleMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { average, max, min, count: roleMetrics.length };
  }

  /**
   * 특정 작업의 성능 통계 조회
   */
  getMetricStats(metricName: string, role?: AgentRole): {
    average: number;
    max: number;
    min: number;
    count: number;
    recentAverage: number; // 최근 10개 평균
  } {
    let filteredMetrics = this.metrics.filter(m => m.name === metricName);

    if (role) {
      filteredMetrics = filteredMetrics.filter(m => m.role === role);
    }

    if (filteredMetrics.length === 0) {
      return { average: 0, max: 0, min: 0, count: 0, recentAverage: 0 };
    }

    const values = filteredMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    // 최근 10개 평균
    const recentValues = filteredMetrics
      .slice(-10)
      .map(m => m.value);
    const recentSum = recentValues.reduce((a, b) => a + b, 0);
    const recentAverage = recentValues.length > 0 ? recentSum / recentValues.length : 0;

    return { average, max, min, count: filteredMetrics.length, recentAverage };
  }

  /**
   * 성능 측정 래퍼 함수
   */
  measure<T>(
    name: string,
    fn: () => T,
    role?: AgentRole,
    metadata?: Record<string, any>
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      const duration = end - start;

      this.recordMetric(name, duration, role, metadata);

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      this.recordMetric(`${name}_error`, duration, role, {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 비동기 성능 측정 래퍼 함수
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    role?: AgentRole,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;

      this.recordMetric(name, duration, role, metadata);

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      this.recordMetric(`${name}_error`, duration, role, {
        ...metadata,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 전체 성능 리포트 생성
   */
  generateReport(): {
    totalMetrics: number;
    rolePerformance: Record<string, { average: number; count: number; min: number; max: number }>;
    topSlowOperations: Array<{ name: string; average: number; count: number }>;
  } {
    const rolePerformance: Record<string, { average: number; count: number; min: number; max: number }> = {};
    const roles: AgentRole[] = ['frontend', 'backend', 'pm', 'fullstack', 'devops', 'designer'];

    roles.forEach((role: AgentRole) => {
      const perf = this.getRolePerformance(role);
      if (perf.count > 0) {
        rolePerformance[role] = perf;
      }
    });

    // 가장 느린 작업 상위 10개
    const metricNames = new Set(this.metrics.map(m => m.name));
    const topSlowOperations = Array.from(metricNames)
      .map(name => {
        const stats = this.getMetricStats(name);
        return { name, average: stats.average, count: stats.count };
      })
      .filter(op => op.count > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);

    return {
      totalMetrics: this.metrics.length,
      rolePerformance,
      topSlowOperations,
    };
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 최적화 제안 생성
   */
  getOptimizationSuggestions(role?: AgentRole): string[] {
    const suggestions: string[] = [];

    if (role) {
      const perf = this.getRolePerformance(role);
      if (perf.average > this.WARNING_THRESHOLD) {
        suggestions.push(
          `${role} Role의 평균 성능이 ${perf.average.toFixed(2)}ms로 느립니다. 캐시를 확인하거나 인덱스를 재구성해보세요.`
        );
      }
    }

    // 추천 계산 성능 체크
    const recommendationStats = this.getMetricStats('getRecommendations', role);
    if (recommendationStats.average > this.WARNING_THRESHOLD) {
      suggestions.push(
        `추천 계산이 ${recommendationStats.average.toFixed(2)}ms로 느립니다. 인덱싱을 활용하거나 결과를 캐싱하세요.`
      );
    }

    // 필터링 성능 체크
    const filterStats = this.getMetricStats('filterResources', role);
    if (filterStats.average > this.WARNING_THRESHOLD) {
      suggestions.push(
        `필터링이 ${filterStats.average.toFixed(2)}ms로 느립니다. 인덱스를 사용하여 성능을 개선하세요.`
      );
    }

    return suggestions;
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor();

