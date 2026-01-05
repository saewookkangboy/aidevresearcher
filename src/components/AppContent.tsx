/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useEffect, useState, useMemo } from 'react';
import { useResources } from '../contexts/ResourceContext';
import { useRole } from '../contexts/RoleContext';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLinkHealth } from '../hooks/useLinkHealth';
import { useAutoResearch } from '../hooks/useAutoResearch';
import { LINK_HEALTH_CHECK_DELAY } from '../utils/constants';
import { Header } from './common/Header';
import { OnboardingGuide } from './common/OnboardingGuide';
import { AdminPanel } from './admin/AdminPanel';
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
import { RoleDashboard } from './role/RoleDashboard';
import { useBehaviorRanking } from '../hooks/useBehaviorRanking';
import { Sparkles, Search, Target, BookOpen, HelpCircle } from 'lucide-react';
import { HelpTooltip } from './common/HelpTooltip';

// 컴포넌트 매핑
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  QuickStartGuide: () => null, // 특별 처리 필요
  SearchBar: SearchBar,
  FilterPanel: FilterPanel,
  GoalPlanner: GoalPlanner,
  RoleDashboard: RoleDashboard,
  LinkHealthIndicator: LinkHealthIndicator,
  LiveOpsBar: LiveOpsBar,
  ErrorMessage: ErrorMessage,
  ResourceGrid: ResourceGrid,
  RelatedResources: RelatedResources,
  URLInputForm: URLInputForm,
  TrendingHarvestPanel: TrendingHarvestPanel,
  WorkflowAgentPanel: WorkflowAgentPanel,
  OptimizationBatch: OptimizationBatch,
  ActivityFeed: ActivityFeed,
};

export function AppContent() {
  const { filteredResources, loading, error, searchResources, clearSearch, linkHealthStatus, refreshResources } = useResources();
  const { checkAll } = useLinkHealth();
  const { start } = useAutoResearch();
  const { currentRole } = useRole();
  const { layoutConfig } = useAdmin();
  const { t } = useLanguage();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

  // 에러가 변경되면 dismissed 상태 초기화
  useEffect(() => {
    if (error) {
      setDismissedError(false);
    }
  }, [error]);

  // 레이아웃 설정에 따라 정렬된 단위 목록
  const sortedUnits = useMemo(() => {
    return [...layoutConfig.units]
      .filter(unit => unit.enabled)
      .sort((a, b) => a.order - b.order);
  }, [layoutConfig.units]);

  // 컴포넌트 렌더링 함수
  const renderComponent = (unitId: string, componentName: string) => {
    const Component = COMPONENT_MAP[componentName];
    if (!Component) return null;

    switch (unitId) {
      case 'quick-start':
        if (!currentRole && !showQuickStart) {
          return (
            <div className="mb-4 sm:mb-6 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('quickStart.title')}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
                    {t('quickStart.description')}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowQuickStart(true)}
                      className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium min-h-[44px] sm:min-h-0 px-2 touch-manipulation"
                    >
                      <span className="hidden sm:inline">{t('quickStart.guide')} →</span>
                      <span className="sm:hidden">{t('quickStart.guide')}</span>
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
          );
        }
        return null;

      case 'search':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('search.title')}
                </h2>
                <HelpTooltip
                  content={t('search.help')}
                  title={t('search.title')}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {t('search.description')}
              </p>
            </div>
            <Component onSearch={searchResources} placeholder={t('search.placeholder')} />
          </div>
        );

      case 'filter':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  도구 필터링
                </h2>
                <HelpTooltip
                  content="도구를 유형별로 필터링할 수 있습니다. 여러 유형을 동시에 선택하면 해당하는 모든 도구가 표시됩니다. 예: 'Skills'와 'Tools'를 함께 선택하면 두 유형의 도구가 모두 보입니다."
                  title="필터 사용법"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                원하는 도구 유형을 선택하여 검색 결과를 좁혀보세요. 여러 유형을 동시에 선택할 수 있습니다.
              </p>
            </div>
            <Component />
          </div>
        );

      case 'goal-planner':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  목표 기반 플래너
                </h2>
                <HelpTooltip
                  content="프로젝트 목표를 단계별로 나누어 추천 도구와 실행 순서를 안내해드립니다. 역할을 선택하면 해당 역할에 맞는 맞춤 플랜이 자동으로 생성됩니다."
                  title="플래너 사용법"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                프로젝트 목표를 단계별로 나누어 필요한 도구와 실행 순서를 추천해드립니다.
              </p>
            </div>
            <Component />
          </div>
        );

      case 'role-dashboard':
        return (
          <div className="mb-6 sm:mb-8">
            <Component />
          </div>
        );

      case 'link-health':
        return (
          <div className="mb-4 sm:mb-6">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  링크 상태 확인
                </h2>
                <HelpTooltip
                  content="모든 도구의 링크가 정상적으로 작동하는지 확인합니다. '정상'은 링크가 잘 작동하고, '깨짐'은 링크가 작동하지 않으며, '수정됨'은 자동으로 수정된 링크입니다."
                  title="링크 상태"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                모든 도구의 링크 상태를 한눈에 확인할 수 있습니다.
              </p>
            </div>
            <Component status={linkHealthStatus} />
          </div>
        );

      case 'live-ops':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  실시간 운영 상태
                </h2>
                <HelpTooltip
                  content="도구들의 실시간 상태를 확인하고 관리할 수 있습니다. '링크 재검사' 버튼으로 모든 링크를 다시 확인하고, '새로고침'으로 최신 정보를 가져올 수 있습니다. 자동 새로고침을 켜면 주기적으로 상태를 확인합니다."
                  title="운영 상태 관리"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                도구들의 실시간 상태를 확인하고 관리할 수 있습니다.
              </p>
            </div>
            <Component status={linkHealthStatus} onCheckAll={checkAll} onRefresh={refreshResources} />
          </div>
        );

      case 'error-message':
        if (error && !dismissedError) {
          return (
            <div className="mb-6 sm:mb-8">
              <Component
                message={error}
                onDismiss={() => setDismissedError(true)}
              />
            </div>
          );
        }
        return null;

      case 'resource-grid':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-2 sm:mb-3">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  추천 도구 {filteredResources.length > 0 && `(${filteredResources.length}개)`}
                </h2>
                <HelpTooltip
                  content="검색 결과나 필터에 맞는 도구들이 여기에 표시됩니다. 각 도구 카드를 클릭하면 자세한 정보와 설치 명령어를 확인할 수 있습니다. 스크롤하면 더 많은 도구를 볼 수 있어요."
                  title="추천 도구"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                검색 결과에 맞는 도구들이 표시됩니다. 각 도구를 클릭하면 자세한 정보와 설치 방법을 확인할 수 있습니다.
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" message="도구를 불러오는 중..." />
              </div>
            ) : (
              <Component
                resources={filteredResources}
                onClearSearch={clearSearch}
              />
            )}
          </div>
        );

      case 'related-resources':
        if (!loading && filteredResources.length > 1) {
          return (
            <div className="mb-6 sm:mb-8">
              <div className="mb-2 sm:mb-3">
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    관련 도구
                  </h2>
                  <HelpTooltip
                    content="현재 선택한 도구와 유사하거나 함께 사용하기 좋은 도구들을 추천해드립니다. 태그, 플랫폼, 유형이 비슷한 도구들이 자동으로 표시됩니다."
                    title="관련 도구 추천"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  현재 도구와 함께 사용하기 좋은 관련 도구들을 추천해드립니다.
                </p>
              </div>
              <Component resources={filteredResources} />
            </div>
          );
        }
        return null;

      case 'url-input':
        return (
          <div className="mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  새 도구 추가하기
                </h2>
                <HelpTooltip
                  content="GitHub 리포지토리, PyPI 패키지, 또는 문서 페이지의 URL을 입력하면 AI가 자동으로 분석하여 도구 정보를 추출합니다. 검색 기능을 사용하면 GitHub README나 Google 검색을 통해 도구를 찾을 수도 있어요."
                  title="도구 추가 방법"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                GitHub, PyPI, 또는 문서 URL을 입력하면 자동으로 분석하여 추가합니다. 검색 기능으로도 도구를 찾을 수 있습니다.
              </p>
            </div>
            <Component />
          </div>
        );

      case 'trending-harvest':
        return (
          <div className="mb-6 sm:mb-8">
            <Component />
          </div>
        );

      case 'workflow-agent':
      case 'optimization-batch':
      case 'activity-feed':
        // Advanced Features 섹션에서 처리
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header onShowHelp={() => setShowQuickStart(true)} />
      <OnboardingGuide forceOpen={showQuickStart} onClose={() => setShowQuickStart(false)} />
      <AdminPanel />
      
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full">
        {/* 동적 레이아웃 렌더링 */}
        {sortedUnits.map((unit) => (
          <div key={unit.id} data-unit-id={unit.id}>
            {renderComponent(unit.id, unit.component)}
          </div>
        ))}

        {/* Advanced Features - 접을 수 있게 (고정 위치) */}
        {sortedUnits.some(unit => ['workflow-agent', 'optimization-batch', 'activity-feed'].includes(unit.id)) && (
          <details className="mb-8">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
              고급 기능 보기
            </summary>
            <div className="space-y-6 mt-4">
              {sortedUnits
                .filter(unit => ['workflow-agent', 'optimization-batch', 'activity-feed'].includes(unit.id))
                .map((unit) => {
                  const Component = COMPONENT_MAP[unit.component];
                  if (!Component) return null;
                  return (
                    <div key={unit.id} data-unit-id={unit.id}>
                      <Component />
                    </div>
                  );
                })}
            </div>
          </details>
        )}
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
