/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect, useState } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { useRole } from '../contexts/RoleContext';
import { useLinkHealth } from '../hooks/useLinkHealth';
import { useAutoResearch } from '../hooks/useAutoResearch';
import { LINK_HEALTH_CHECK_DELAY } from '../utils/constants';
import { Header } from './common/Header';
import { OnboardingGuide } from './common/OnboardingGuide';
import { SearchBar } from './search/SearchBar';
import { FilterPanel } from './search/FilterPanel';
import { ResourceGrid } from './resource/ResourceGrid';
import { URLInputForm } from './ingestion/URLInputForm';
import { LinkHealthIndicator } from './status/LinkHealthIndicator';
import { LiveOpsBar } from './status/LiveOpsBar';
import { TrendingHarvestPanel } from './ingestion/TrendingHarvestPanel';
import { LoadingSpinner } from './common/LoadingSpinner';
import { ErrorMessage } from './common/ErrorMessage';
import { GoalPlanner } from './planner/GoalPlanner';
import { WorkflowAgentPanel } from './workflow/WorkflowAgentPanel';
import { OptimizationBatch } from './optimization/OptimizationBatch';
import { RelatedResources } from './resource/RelatedResources';
import { ActivityFeed } from './activity/ActivityFeed';
import { useBehaviorRanking } from '../hooks/useBehaviorRanking';
import { Sparkles, Search, Target, BookOpen, HelpCircle } from 'lucide-react';

export function AppContent() {
  const { filteredResources, loading, error, searchResources, clearSearch, linkHealthStatus, refreshResources } = useResources();
  const { checkAll } = useLinkHealth();
  const { start } = useAutoResearch();
  const { currentRole } = useRole();
  const [dismissedError, setDismissedError] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  useBehaviorRanking(filteredResources);

  // 초기화: 링크 헬스 체크 및 Auto Research 시작
  useEffect(() => {
    // 개발 환경에서는 초기 링크 체크를 건너뛰어 CORS 오류 방지
    // 필요시 수동으로 체크 가능
    if (!import.meta.env.DEV) {
      // 프로덕션 환경에서만 자동 체크
      const healthCheckTimer = setTimeout(() => {
        checkAll();
      }, LINK_HEALTH_CHECK_DELAY);

      return () => {
        clearTimeout(healthCheckTimer);
      };
    }

    // Auto Research 시작
    start();
  }, [checkAll, start]);

  // 에러가 변경되면 dismissed 상태 초기화
  useEffect(() => {
    if (error) {
      setDismissedError(false);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onShowHelp={() => setShowQuickStart(true)} />
      <OnboardingGuide forceOpen={showQuickStart} onClose={() => setShowQuickStart(false)} />
      
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        {/* Quick Start Guide - 첫 방문 시 또는 역할 미선택 시 */}
        {!currentRole && !showQuickStart && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    시작하기
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                  먼저 당신의 역할을 선택하면 맞춤 도구를 추천해드립니다. 역할을 선택하지 않아도 검색은 가능합니다.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuickStart(true)}
                    className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium min-h-[44px] sm:min-h-0 px-2 touch-manipulation"
                  >
                    <span className="hidden sm:inline">가이드 보기 →</span>
                    <span className="sm:hidden">가이드</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowQuickStart(true)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                aria-label="도움말 보기"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Search Section */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 sm:mb-3">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                무엇을 찾고 계신가요?
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              자연스러운 문장으로 검색하세요. 예: "이미지 분석 봇 만들기", "Python AI 라이브러리", "웹사이트 SEO 개선"
            </p>
          </div>
          <SearchBar onSearch={searchResources} placeholder="예: 이미지 분석 봇 만들고 싶어, Python AI 라이브러리..." />
        </div>

        {/* Step 2: Category Filter */}
        <div className="mb-6 sm:mb-8">
          <FilterPanel />
        </div>

        {/* Goal-based Planner - 더 눈에 띄게 */}
        <div className="mb-6 sm:mb-8">
          <GoalPlanner />
        </div>

        {/* Link Health Indicator - 간소화 */}
        <div className="mb-4 sm:mb-6">
          <LinkHealthIndicator status={linkHealthStatus} />
        </div>

        <LiveOpsBar status={linkHealthStatus} onCheckAll={checkAll} onRefresh={refreshResources} />

        {/* Error Message */}
        {error && !dismissedError && (
          <div className="mb-8">
            <ErrorMessage
              message={error}
              onDismiss={() => setDismissedError(true)}
            />
          </div>
        )}

        {/* Step 3: Resources Grid */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                추천 도구 {filteredResources.length > 0 && `(${filteredResources.length}개)`}
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" message="도구를 불러오는 중..." />
            </div>
          ) : (
            <ResourceGrid
              resources={filteredResources}
              onClearSearch={clearSearch}
            />
          )}
        </div>

        {/* Related Resources */}
        {!loading && filteredResources.length > 1 && (
          <RelatedResources resources={filteredResources} />
        )}

        {/* Step 4: Add New Tool */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                새 도구 추가하기
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              GitHub, PyPI, 또는 문서 URL을 입력하면 자동으로 분석하여 추가합니다.
            </p>
          </div>
          <URLInputForm />
        </div>

        {/* Trending auto-harvest */}
        <div className="mb-8">
          <TrendingHarvestPanel />
        </div>

        {/* Advanced Features - 접을 수 있게 */}
        <details className="mb-8">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
            고급 기능 보기
          </summary>
          <div className="space-y-6 mt-4">
            <WorkflowAgentPanel />
            <OptimizationBatch />
            <ActivityFeed />
          </div>
        </details>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 sm:py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>AI Dev. Researcher - Don't search, Just Vibe.</p>
          <p className="mt-1 text-[10px] sm:text-xs">비개발자도 쉽게 사용할 수 있는 개발 도구 검색 플랫폼</p>
        </div>
      </footer>
    </div>
  );
}
