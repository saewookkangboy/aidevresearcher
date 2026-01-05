/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useMemo } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useResources } from '../../contexts/ResourceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Resource, AgentRole } from '../../utils/types';
import { ROLE_ICONS, ROLE_PREFERENCES } from '../../utils/roleConfigs';
import { BarChart3, TrendingUp, Package, Star } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

interface RoleStatistics {
  totalResources: number;
  byPlatform: Record<string, number>;
  byType: Record<string, number>;
  topResources: Resource[];
  averageStars: number;
}

/**
 * Role별 통계 계산
 */
function calculateRoleStatistics(
  role: AgentRole,
  resources: Resource[]
): RoleStatistics {
  if (!role || resources.length === 0) {
    return {
      totalResources: 0,
      byPlatform: {},
      byType: {},
      topResources: [],
      averageStars: 0,
    };
  }

  const preferences = ROLE_PREFERENCES[role];
  
  // Role별 필터링된 리소스 (Role 선호도 기반)
  const filteredResources = resources.filter((resource) => {
    // 플랫폼 매칭
    const platformMatch = resource.platforms.some(platform =>
      preferences.preferredPlatforms.some(pref =>
        platform.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(platform.toLowerCase())
      )
    );
    
    // 타입 매칭
    const typeMatch = preferences.preferredTypes.includes(resource.type);
    
    // 태그 매칭
    const tagMatch = resource.tags.some(tag =>
      preferences.preferredTags.some(prefTag =>
        tag.toLowerCase().includes(prefTag.toLowerCase()) ||
        prefTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
    
    // 키워드 매칭 (제목, 설명)
    const searchText = `${resource.title} ${resource.description}`.toLowerCase();
    const keywordMatch = preferences.keywords.some(keyword =>
      searchText.includes(keyword.toLowerCase())
    );
    
    // 하나라도 매칭되면 포함
    return platformMatch || typeMatch || tagMatch || keywordMatch;
  });

  // 플랫폼별 통계
  const byPlatform: Record<string, number> = {};
  filteredResources.forEach((resource) => {
    resource.platforms?.forEach((platform) => {
      byPlatform[platform] = (byPlatform[platform] || 0) + 1;
    });
  });

  // 타입별 통계
  const byType: Record<string, number> = {};
  filteredResources.forEach((resource) => {
    byType[resource.type] = (byType[resource.type] || 0) + 1;
  });

  // 상위 리소스 (stars 기준)
  const topResources = [...filteredResources]
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 5);

  // 평균 stars
  const totalStars = filteredResources.reduce(
    (sum, r) => sum + (r.stars || 0),
    0
  );
  const averageStars =
    filteredResources.length > 0
      ? Math.round(totalStars / filteredResources.length)
      : 0;

  return {
    totalResources: filteredResources.length,
    byPlatform,
    byType,
    topResources,
    averageStars,
  };
}

/**
 * Role별 전용 대시보드 컴포넌트
 */
export function RoleDashboard() {
  const { t } = useLanguage();
  const { currentRole } = useRole();
  const { resources } = useResources();

  const statistics = useMemo(() => {
    if (!currentRole) return null;
    return calculateRoleStatistics(currentRole, resources);
  }, [currentRole, resources]);

  if (!currentRole || !statistics) {
    return null;
  }

  const roleIcon = ROLE_ICONS[currentRole];

  // 플랫폼별 통계를 배열로 변환 (상위 5개)
  const platformStats = Object.entries(statistics.byPlatform)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 타입별 통계를 배열로 변환
  const typeStats = Object.entries(statistics.byType)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl">
            {roleIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.title', { role: t(`role.${currentRole}`) })}
              </h2>
              <HelpTooltip
                content={t('dashboard.help')}
                title={t('dashboard.title', { role: t(`role.${currentRole}`) })}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dashboard.description')}
            </p>
          </div>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('dashboard.totalResources')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.totalResources}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('dashboard.averageStars') || 'Average Stars'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {statistics.averageStars.toLocaleString()}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('dashboard.platformTypes') || 'Platform Types'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Object.keys(statistics.byPlatform).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 플랫폼별 분포 */}
        {platformStats.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.byPlatform')}
              </h3>
            </div>
            <div className="space-y-3">
              {platformStats.map(([platform, count]) => {
                const percentage =
                  (count / statistics.totalResources) * 100;
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {platform}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}{t('common.items') || '개'} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 타입별 분포 */}
        {typeStats.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('dashboard.byType')}
              </h3>
            </div>
            <div className="space-y-3">
              {typeStats.map(([type, count]) => {
                const percentage =
                  (count / statistics.totalResources) * 100;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {count}{t('common.items') || '개'} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 인기 리소스 */}
      {statistics.topResources.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('dashboard.topResources')} ({t('resourceCard.stars')} {t('dashboard.byStars') || '기준'})
            </h3>
          </div>
          <div className="space-y-2">
            {statistics.topResources.map((resource, index) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {resource.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {resource.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role별 특화 섹션 */}
      {currentRole === 'frontend' && (
        <FrontendSpecificSection resources={resources} />
      )}
      {currentRole === 'backend' && (
        <BackendSpecificSection resources={resources} />
      )}
      {currentRole === 'pm' && (
        <PMSpecificSection resources={resources} />
      )}
      {currentRole === 'fullstack' && (
        <FullStackSpecificSection resources={resources} />
      )}
      {currentRole === 'devops' && (
        <DevOpsSpecificSection resources={resources} />
      )}
      {currentRole === 'designer' && (
        <DesignerSpecificSection resources={resources} />
      )}
    </div>
  );
}

/**
 * Frontend Developer 특화 섹션
 */
function FrontendSpecificSection({ resources }: { resources: Resource[] }) {
  const { t } = useLanguage();
  // 프레임워크별 통계 (platforms 배열과 텍스트 분석 결합)
  const frameworkStats = useMemo(() => {
    const stats: Record<string, number> = {};
    
    // 주요 프레임워크 목록
    const frameworks = [
      'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'Remix',
      'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Go', 'Rust',
      'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI', 'Ant Design'
    ];
    
    resources.forEach((resource) => {
      // platforms 배열에서 직접 확인
      const platformMatches = new Set<string>();
      resource.platforms.forEach(platform => {
        const platformLower = platform.toLowerCase();
        frameworks.forEach(fw => {
          const fwLower = fw.toLowerCase();
          // 정확한 매칭 또는 포함 관계 확인
          if (platformLower === fwLower || 
              platformLower.includes(fwLower) || 
              fwLower.includes(platformLower)) {
            platformMatches.add(fw);
          }
        });
      });
      
      // 텍스트 분석 (platforms에 없을 경우)
      if (platformMatches.size === 0) {
        const titleLower = resource.title.toLowerCase();
        const descLower = resource.description.toLowerCase();
        const tagsLower = resource.tags.join(' ').toLowerCase();
        const allText = `${titleLower} ${descLower} ${tagsLower}`;
        
        frameworks.forEach(fw => {
          const fwLower = fw.toLowerCase();
          // 정확한 단어 경계를 고려한 매칭
          const regex = new RegExp(`\\b${fwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          if (regex.test(allText)) {
            platformMatches.add(fw);
          }
        });
      }
      
      // 통계 업데이트
      platformMatches.forEach(fw => {
        stats[fw] = (stats[fw] || 0) + 1;
      });
    });
    
    // 상위 프레임워크만 반환 (최소 1개 이상)
    return Object.fromEntries(
      Object.entries(stats)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // 상위 10개만
    );
  }, [resources]);

  // UI 컴포넌트 라이브러리
  const uiLibraries = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('component') ||
          text.includes('ui library') ||
          text.includes('design system') ||
          r.tags.some(tag => ['component', 'ui', 'library'].includes(tag.toLowerCase()))
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // CSS 프레임워크
  const cssFrameworks = useMemo(() => {
    const frameworks: Record<string, { count: number; resources: Resource[] }> = {};
    resources.forEach((resource) => {
      const text = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase();
      ['tailwind', 'bootstrap', 'material-ui', 'chakra', 'ant design', 'styled-components'].forEach((fw) => {
        if (text.includes(fw.toLowerCase())) {
          if (!frameworks[fw]) {
            frameworks[fw] = { count: 0, resources: [] };
          }
          frameworks[fw].count++;
          frameworks[fw].resources.push(resource);
        }
      });
    });
    return frameworks;
  }, [resources]);

  // 접근성(a11y) 리소스
  const a11yResources = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes('accessibility') || text.includes('a11y') || text.includes('aria');
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // VS Code 확장도구
  const vscodeExtensions = useMemo(() => {
    return resources
      .filter((r) => r.type === 'VSCODE_EXT')
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      {/* 프레임워크별 통계 */}
      {Object.keys(frameworkStats).length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎨 {t('dashboard.frameworkDistribution')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(frameworkStats)
              .sort(([, a], [, b]) => b - a)
              .map(([framework, count]) => {
                const total = resources.length;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div 
                    key={framework} 
                    className="text-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate" title={framework}>
                      {framework}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
          </div>
          {Object.keys(frameworkStats).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              {t('dashboard.noFramework')}
            </p>
          )}
        </div>
      )}

      {/* UI 컴포넌트 라이브러리 */}
      {uiLibraries.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📦 인기 UI 컴포넌트 라이브러리
          </h3>
          <div className="space-y-2">
            {uiLibraries.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS 프레임워크 비교 */}
      {Object.keys(cssFrameworks).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎨 CSS 프레임워크 비교
          </h3>
          <div className="space-y-3">
            {Object.entries(cssFrameworks)
              .sort(([, a], [, b]) => b.count - a.count)
              .map(([framework, data]) => (
                <div key={framework}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {framework}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {data.count}개 리소스
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(data.count / Object.values(cssFrameworks).reduce((sum, d) => sum + d.count, 0)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 접근성 리소스 */}
      {a11yResources.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ♿ 접근성(a11y) 리소스
          </h3>
          <div className="space-y-2">
            {a11yResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VS Code 확장도구 */}
      {vscodeExtensions.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔌 VS Code 확장도구 추천
          </h3>
          <div className="space-y-2">
            {vscodeExtensions.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빌드 도구 비교 */}
      <BuildToolsComparison resources={resources} />

      {/* 상태 관리 라이브러리 비교 */}
      <StateManagementComparison resources={resources} />
    </div>
  );
}

/**
 * 빌드 도구 비교 컴포넌트
 */
function BuildToolsComparison({ resources }: { resources: Resource[] }) {
  const buildTools = useMemo(() => {
    const tools: Record<string, { count: number; resources: Resource[]; avgStars: number }> = {};
    ['vite', 'webpack', 'parcel', 'rollup', 'esbuild'].forEach((tool) => {
      const matching = resources.filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes(tool.toLowerCase());
      });
      if (matching.length > 0) {
        const avgStars = matching.reduce((sum, r) => sum + (r.stars || 0), 0) / matching.length;
        tools[tool] = {
          count: matching.length,
          resources: matching,
          avgStars: Math.round(avgStars),
        };
      }
    });
    return tools;
  }, [resources]);

  if (Object.keys(buildTools).length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        ⚙️ 빌드 도구 비교 (Vite, Webpack, Parcel)
      </h3>
      <div className="space-y-3">
        {Object.entries(buildTools)
          .sort(([, a], [, b]) => b.avgStars - a.avgStars)
          .map(([tool, data]) => (
            <div key={tool} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {tool}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span>{data.count}개 리소스</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>평균 {data.avgStars.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {data.resources.slice(0, 2).map((resource) => (
                <div key={resource.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  • {resource.title}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * 상태 관리 라이브러리 비교 컴포넌트
 */
function StateManagementComparison({ resources }: { resources: Resource[] }) {
  const stateLibs = useMemo(() => {
    const libs: Record<string, { count: number; resources: Resource[]; avgStars: number }> = {};
    ['redux', 'zustand', 'jotai', 'recoil', 'mobx', 'valtio'].forEach((lib) => {
      const matching = resources.filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes(lib.toLowerCase());
      });
      if (matching.length > 0) {
        const avgStars = matching.reduce((sum, r) => sum + (r.stars || 0), 0) / matching.length;
        libs[lib] = {
          count: matching.length,
          resources: matching,
          avgStars: Math.round(avgStars),
        };
      }
    });
    return libs;
  }, [resources]);

  if (Object.keys(stateLibs).length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🔄 상태 관리 라이브러리 비교 (Redux, Zustand, Jotai)
      </h3>
      <div className="space-y-3">
        {Object.entries(stateLibs)
          .sort(([, a], [, b]) => b.avgStars - a.avgStars)
          .map(([lib, data]) => (
            <div key={lib} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {lib}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span>{data.count}개 리소스</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>평균 {data.avgStars.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {data.resources.slice(0, 2).map((resource) => (
                <div key={resource.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  • {resource.title}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * Backend Developer 특화 섹션
 */
function BackendSpecificSection({ resources }: { resources: Resource[] }) {
  // 언어별 통계
  const languageStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ['Python', 'Node.js', 'Java', 'Go', 'Rust'].forEach((lang) => {
      stats[lang] = resources.filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes(lang.toLowerCase());
      }).length;
    });
    return stats;
  }, [resources]);

  // API 프레임워크
  const apiFrameworks = useMemo(() => {
    const frameworks: Record<string, number> = {};
    ['FastAPI', 'Express', 'Django', 'Flask', 'Spring', 'Gin'].forEach((fw) => {
      frameworks[fw] = resources.filter((r) => {
        const text = `${r.title} ${r.description}`.toLowerCase();
        return text.includes(fw.toLowerCase());
      }).length;
    });
    return frameworks;
  }, [resources]);

  // 보안/성능 리소스
  const securityResources = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('security') ||
          text.includes('auth') ||
          text.includes('jwt') ||
          text.includes('oauth') ||
          text.includes('performance') ||
          text.includes('optimization')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      {/* 언어별 통계 */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          ⚙️ 언어별 리소스 분포
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(languageStats).map(([lang, count]) => (
            <div key={lang} className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{lang}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API 프레임워크 비교 */}
      {Object.keys(apiFrameworks).length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔌 API 프레임워크 인기도
          </h3>
          <div className="space-y-3">
            {Object.entries(apiFrameworks)
              .filter(([, count]) => count > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([framework, count]) => (
                <div key={framework}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {framework}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{count}개</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 보안/성능 리소스 */}
      {securityResources.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔒 보안 및 성능 리소스
          </h3>
          <div className="space-y-2">
            {securityResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 데이터베이스 도구 */}
      <DatabaseToolsSection resources={resources} />

      {/* ORM 라이브러리 비교 */}
      <ORMComparison resources={resources} />

      {/* REST vs GraphQL 비교 */}
      <APIStyleComparison resources={resources} />
    </div>
  );
}

/**
 * 데이터베이스 도구 섹션
 */
function DatabaseToolsSection({ resources }: { resources: Resource[] }) {
  const dbTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('database') ||
          text.includes('db') ||
          text.includes('postgresql') ||
          text.includes('mysql') ||
          text.includes('mongodb') ||
          text.includes('sqlite')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  if (dbTools.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🗄️ 데이터베이스 도구 추천
      </h3>
      <div className="space-y-2">
        {dbTools.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {resource.title}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{(resource.stars || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ORM 라이브러리 비교 컴포넌트
 */
function ORMComparison({ resources }: { resources: Resource[] }) {
  const ormLibs = useMemo(() => {
    const libs: Record<string, { count: number; resources: Resource[]; avgStars: number }> = {};
    ['prisma', 'sqlalchemy', 'typeorm', 'sequelize', 'drizzle', 'knex'].forEach((orm) => {
      const matching = resources.filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes(orm.toLowerCase());
      });
      if (matching.length > 0) {
        const avgStars = matching.reduce((sum, r) => sum + (r.stars || 0), 0) / matching.length;
        libs[orm] = {
          count: matching.length,
          resources: matching,
          avgStars: Math.round(avgStars),
        };
      }
    });
    return libs;
  }, [resources]);

  if (Object.keys(ormLibs).length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🔗 ORM 라이브러리 비교
      </h3>
      <div className="space-y-3">
        {Object.entries(ormLibs)
          .sort(([, a], [, b]) => b.avgStars - a.avgStars)
          .map(([orm, data]) => (
            <div key={orm} className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {orm}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span>{data.count}개 리소스</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>평균 {data.avgStars.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {data.resources.slice(0, 2).map((resource) => (
                <div key={resource.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  • {resource.title}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * REST vs GraphQL 비교 컴포넌트
 */
function APIStyleComparison({ resources }: { resources: Resource[] }) {
  const apiStyles = useMemo(() => {
    const rest = resources.filter((r) => {
      const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
      return text.includes('rest') && !text.includes('graphql');
    });
    const graphql = resources.filter((r) => {
      const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
      return text.includes('graphql');
    });
    return { rest, graphql };
  }, [resources]);

  if (apiStyles.rest.length === 0 && apiStyles.graphql.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🔌 REST vs GraphQL 비교
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            REST API
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {apiStyles.rest.length}개 리소스
          </div>
          {apiStyles.rest.slice(0, 2).map((resource) => (
            <div key={resource.id} className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              • {resource.title}
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            GraphQL
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {apiStyles.graphql.length}개 리소스
          </div>
          {apiStyles.graphql.slice(0, 2).map((resource) => (
            <div key={resource.id} className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              • {resource.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Product Manager 특화 섹션
 */
function PMSpecificSection({ resources }: { resources: Resource[] }) {
  // 프로젝트 관리 도구
  const projectManagementTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('project') ||
          text.includes('management') ||
          text.includes('planning') ||
          text.includes('kanban') ||
          text.includes('scrum')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 문서화 자동화 도구
  const documentationTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('documentation') ||
          text.includes('api-doc') ||
          text.includes('spec') ||
          text.includes('swagger') ||
          text.includes('openapi')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 이슈 트래킹 시스템
  const issueTrackingTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('issue') ||
          text.includes('tracking') ||
          text.includes('ticket') ||
          text.includes('jira') ||
          text.includes('github issues')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      {projectManagementTools.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📋 프로젝트 관리 도구
          </h3>
          <div className="space-y-2">
            {projectManagementTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documentationTools.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📝 문서화 자동화 도구
          </h3>
          <div className="space-y-2">
            {documentationTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {issueTrackingTools.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎫 이슈 트래킹 시스템
          </h3>
          <div className="space-y-2">
            {issueTrackingTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Full Stack Developer 특화 섹션
 */
function FullStackSpecificSection({ resources }: { resources: Resource[] }) {
  // 스택별 리소스
  const stackStats = useMemo(() => {
    const stats: Record<string, number> = { MERN: 0, MEAN: 0, LAMP: 0 };
    resources.forEach((resource) => {
      const text = `${resource.title} ${resource.description} ${resource.tags.join(' ')}`.toLowerCase();
      if (text.includes('mern') || (text.includes('mongodb') && text.includes('express') && text.includes('react'))) {
        stats.MERN++;
      }
      if (text.includes('mean') || (text.includes('mongodb') && text.includes('express') && text.includes('angular'))) {
        stats.MEAN++;
      }
      if (text.includes('lamp') || (text.includes('linux') && text.includes('apache') && text.includes('mysql'))) {
        stats.LAMP++;
      }
    });
    return stats;
  }, [resources]);

  // 보일러플레이트 추천
  const boilerplates = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          r.type === 'STARTER_KIT' ||
          text.includes('boilerplate') ||
          text.includes('starter') ||
          text.includes('template')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // API 클라이언트 라이브러리
  const apiClients = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('api client') ||
          text.includes('axios') ||
          text.includes('fetch') ||
          text.includes('trpc') ||
          text.includes('graphql client')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🚀 스택별 리소스 분포
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stackStats).map(([stack, count]) => (
            <div key={stack} className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stack}</p>
            </div>
          ))}
        </div>
      </div>

      {boilerplates.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 스택별 보일러플레이트 추천
          </h3>
          <div className="space-y-2">
            {boilerplates.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {apiClients.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔌 API 클라이언트 라이브러리 (tRPC, GraphQL Codegen)
          </h3>
          <div className="space-y-2">
            {apiClients.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DevOps Engineer 특화 섹션
 */
function DevOpsSpecificSection({ resources }: { resources: Resource[] }) {
  // CI/CD 도구
  const cicdTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('ci-cd') ||
          text.includes('github actions') ||
          text.includes('jenkins') ||
          text.includes('gitlab') ||
          text.includes('circleci')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // IaC 도구
  const iacTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('terraform') ||
          text.includes('cloudformation') ||
          text.includes('pulumi') ||
          text.includes('iac') ||
          text.includes('infrastructure as code')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 컨테이너 오케스트레이션
  const containerTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('kubernetes') ||
          text.includes('k8s') ||
          text.includes('docker swarm') ||
          text.includes('nomad')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 보안 스캔 도구
  const securityScanTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('security scan') ||
          text.includes('vulnerability') ||
          text.includes('snyk') ||
          text.includes('trivy') ||
          text.includes('clair')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      {cicdTools.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔧 CI/CD 파이프라인 도구
          </h3>
          <div className="space-y-2">
            {cicdTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {iacTools.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🏗️ Infrastructure as Code (IaC) 도구
          </h3>
          <div className="space-y-2">
            {iacTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {containerTools.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🐳 컨테이너 오케스트레이션 (Kubernetes, Docker Swarm)
          </h3>
          <div className="space-y-2">
            {containerTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {securityScanTools.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🔒 컨테이너 보안 스캔 도구
          </h3>
          <div className="space-y-2">
            {securityScanTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * UI/UX Designer 특화 섹션
 */
function DesignerSpecificSection({ resources }: { resources: Resource[] }) {
  // 디자인 도구
  const designTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('figma') ||
          text.includes('design') ||
          text.includes('ui') ||
          text.includes('ux') ||
          text.includes('component library')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // Figma 플러그인
  const figmaPlugins = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return text.includes('figma') && (text.includes('plugin') || text.includes('extension'));
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 디자인 토큰 관리
  const designTokenTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('design token') ||
          text.includes('design system') ||
          text.includes('style guide')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  // 접근성 도구
  const accessibilityTools = useMemo(() => {
    return resources
      .filter((r) => {
        const text = `${r.title} ${r.description} ${r.tags.join(' ')}`.toLowerCase();
        return (
          text.includes('accessibility') ||
          text.includes('a11y') ||
          text.includes('color contrast') ||
          text.includes('wcag')
        );
      })
      .sort((a, b) => (b.stars || 0) - (a.stars || 0))
      .slice(0, 5);
  }, [resources]);

  return (
    <div className="mt-6 space-y-6">
      {designTools.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ✨ 디자인 도구 및 컴포넌트 라이브러리
          </h3>
          <div className="space-y-2">
            {designTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {figmaPlugins.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎨 Figma 플러그인 추천
          </h3>
          <div className="space-y-2">
            {figmaPlugins.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {designTokenTools.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            🎯 디자인 토큰 관리 시스템
          </h3>
          <div className="space-y-2">
            {designTokenTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accessibilityTools.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ♿ 접근성 테스트 도구 (색상 대비, WCAG)
          </h3>
          <div className="space-y-2">
            {accessibilityTools.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {resource.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(resource.stars || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

