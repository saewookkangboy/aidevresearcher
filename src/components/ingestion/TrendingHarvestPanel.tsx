import { Sparkles } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { HelpTooltip } from '../common/HelpTooltip';

export function TrendingHarvestPanel() {
  const { t } = useLanguage();
  const { resources } = useResources();
  
  // Backend에서 자동으로 수집된 트렌딩 리소스 개수 계산
  const trendingResources = resources.filter(r => 
    r.tags?.includes('trending') || r.sourceType === 'GITHUB'
  );

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('trending.title')}</h3>
        <HelpTooltip
          content={t('trending.help') || 'Backend에서 자동으로 도구 및 리소스를 수집하고 있습니다. 수집된 결과가 리소스 그리드에 표시됩니다.'}
          title={t('trending.title')}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {t('trending.description') || '도구 및 리소스 수집은 Backend에서 자동으로 진행되고 있습니다.'}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500">
        현재 수집된 트렌딩 리소스: <span className="font-semibold text-primary-600 dark:text-primary-400">{trendingResources.length}개</span>
      </p>
    </div>
  );
}
