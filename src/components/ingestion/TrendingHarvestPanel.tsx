import { useState } from 'react';
import { Sparkles, Loader2, Upload } from 'lucide-react';
import { TrendingCollector } from '../../services/simulation/trendingCollector';
import { useResources } from '../../contexts/ResourceContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { SuccessMessage } from '../common/SuccessMessage';
import { ErrorMessage } from '../common/ErrorMessage';
import { HelpTooltip } from '../common/HelpTooltip';

export function TrendingHarvestPanel() {
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addResources, addActivity } = useResources();
  const collector = new TrendingCollector();

  const handleCollect = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const harvested = await collector.collect(keyword.trim());
      await addResources(harvested);
      addActivity({
        id: `activity_${Date.now()}`,
        type: 'ingest',
        message: `트렌드 수집 완료 (${keyword}) - ${harvested.length}개`,
        timestamp: new Date().toISOString(),
      });
      setSuccess(`${harvested.length}개의 리소스를 자동 수집했습니다.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('trending.error') || t('common.error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('trending.title')}</h3>
        <HelpTooltip
          content={t('trending.help')}
          title={t('trending.title')}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('trending.description')}
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('trending.placeholder')}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          onClick={handleCollect}
          disabled={loading || !keyword.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? t('trending.collecting') : t('trending.collect')}
        </button>
      </div>
      {success && (
        <div className="mt-3">
          <SuccessMessage message={success} />
        </div>
      )}
      {error && (
        <div className="mt-3">
          <ErrorMessage message={error} />
        </div>
      )}
    </div>
  );
}
