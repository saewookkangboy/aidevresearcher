import { useEffect, useState } from 'react';
import { ResourceProvider, useResources } from './contexts/ResourceContext';
import { Header } from './components/common/Header';
import { SearchBar } from './components/search/SearchBar';
import { FilterPanel } from './components/search/FilterPanel';
import { ResourceGrid } from './components/resource/ResourceGrid';
import { URLInputForm } from './components/ingestion/URLInputForm';
import { LinkHealthIndicator } from './components/status/LinkHealthIndicator';
import { LiveOpsBar } from './components/status/LiveOpsBar';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorMessage } from './components/common/ErrorMessage';
import { GoalPlanner } from './components/planner/GoalPlanner';
import { WorkflowAgentPanel } from './components/workflow/WorkflowAgentPanel';
import { OptimizationBatch } from './components/optimization/OptimizationBatch';
import { RelatedResources } from './components/resource/RelatedResources';
import { ActivityFeed } from './components/activity/ActivityFeed';
import { useLinkHealth } from './hooks/useLinkHealth';
import { useAutoResearch } from './hooks/useAutoResearch';
import { LINK_HEALTH_CHECK_DELAY } from './utils/constants';

function AppContent() {
  const { filteredResources, loading, error, searchResources, clearSearch, linkHealthStatus, refreshResources } = useResources();
  const { checkAll } = useLinkHealth();
  const { start } = useAutoResearch();
  const [dismissedError, setDismissedError] = useState(false);

  // 초기화: 링크 헬스 체크 및 Auto Research 시작
  useEffect(() => {
    // 1초 후 링크 헬스 체크 시작
    const healthCheckTimer = setTimeout(() => {
      checkAll();
    }, LINK_HEALTH_CHECK_DELAY);

    // Auto Research 시작
    start();

    return () => {
      clearTimeout(healthCheckTimer);
    };
  }, [checkAll, start]);

  // 에러가 변경되면 dismissed 상태 초기화
  useEffect(() => {
    if (error) {
      setDismissedError(false);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Search Section */}
        <div className="mb-8">
          <SearchBar onSearch={searchResources} placeholder="예: 이미지 분석 봇 만들고 싶어, Python AI 라이브러리..." />
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <FilterPanel />
        </div>

        {/* Link Health Indicator */}
        <div className="mb-8">
          <LinkHealthIndicator status={linkHealthStatus} />
        </div>

        <LiveOpsBar status={linkHealthStatus} onCheckAll={checkAll} onRefresh={refreshResources} />

        {/* Goal-based Planner */}
        <GoalPlanner />

        {/* Workflow Agent */}
        <WorkflowAgentPanel />

        {/* SEO/AI SEO/GEO/AIO Batch */}
        <OptimizationBatch />

        {/* Error Message */}
        {error && !dismissedError && (
          <div className="mb-8">
            <ErrorMessage
              message={error}
              onDismiss={() => setDismissedError(true)}
            />
          </div>
        )}

        {/* Resources Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" message="리소스를 불러오는 중..." />
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

        {/* URL Ingestion Form */}
        <div className="mb-8">
          <URLInputForm />
        </div>

        {/* Activity Feed */}
        <ActivityFeed />
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>AI Dev. Researcher - Don't search, Just Vibe.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ResourceProvider>
      <AppContent />
    </ResourceProvider>
  );
}

export default App;
