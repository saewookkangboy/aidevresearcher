/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { Wand2, Globe2, Activity, X, FileText, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';
import { useLanguage } from '../../contexts/LanguageContext';

type JobStatus = 'pending' | 'running' | 'done';

interface Job {
  id: string;
  label: string;
  command: (domain: string) => string;
  note: string;
  status: JobStatus;
  result?: JobResult;
}

interface JobResult {
  success: boolean;
  findings: string[];
  recommendations: string[];
  metrics?: Record<string, number | string>;
}

const BASE_JOBS: Job[] = [
  {
    id: 'seo',
    label: 'SEO 분석',
    command: (domain) => `dev-agent seo analyze ${domain}`,
    note: '메타/헤딩/robots/sitemap 체크',
    status: 'pending',
  },
  {
    id: 'ai-seo',
    label: 'AI SEO',
    command: (domain) => `dev-agent ai-seo keywords "${domain}"`,
    note: '키워드·컨텐츠 최적화 초안 생성',
    status: 'pending',
  },
  {
    id: 'geo',
    label: 'GEO',
    command: (domain) => `dev-agent geo analyze ${domain}`,
    note: '생성형 엔진 친화 구조/FAQ 스키마',
    status: 'pending',
  },
  {
    id: 'aio',
    label: 'AIO 종합',
    command: (domain) => `dev-agent aio optimize ${domain}`,
    note: 'SEO/GEO/콘텐츠 일괄 검증',
    status: 'pending',
  },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function OptimizationBatch() {
  const { t } = useLanguage();
  const [domain, setDomain] = useState('');
  const [jobs, setJobs] = useState<Job[]>(BASE_JOBS);
  const [running, setRunning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<Job[]>([]);

  const reset = () => {
    setJobs(BASE_JOBS.map((job) => ({ ...job, status: 'pending', result: undefined })));
    setRunning(false);
    setShowReport(false);
    setReportData([]);
  };

  // 모의 보고서 데이터 생성
  const generateReportData = (completedJobs: Job[]): Job[] => {
    return completedJobs.map((job) => {
      let result: JobResult = {
        success: true,
        findings: [],
        recommendations: [],
        metrics: {},
      };

      switch (job.id) {
        case 'seo':
          result = {
            success: true,
            findings: [
              '메타 태그가 모든 페이지에 존재합니다',
              'H1 태그가 적절히 사용되고 있습니다',
              'robots.txt 파일이 존재합니다',
              'sitemap.xml이 생성되었습니다',
            ],
            recommendations: [
              '메타 description 길이를 120-160자로 최적화하세요',
              'Open Graph 태그를 추가하여 소셜 미디어 공유를 개선하세요',
              '구조화된 데이터(Schema.org)를 추가하세요',
            ],
            metrics: {
              '페이지 속도': '2.3초',
              '모바일 친화성': '95점',
              '접근성 점수': '88점',
            },
          };
          break;
        case 'ai-seo':
          result = {
            success: true,
            findings: [
              '주요 키워드: 웹 개발, 프론트엔드, 백엔드',
              '콘텐츠 밀도가 적절합니다',
              '내부 링크 구조가 잘 구성되어 있습니다',
            ],
            recommendations: [
              '장꼬리 키워드(long-tail keywords)를 추가하세요',
              '콘텐츠를 2000자 이상으로 확장하세요',
              '관련 키워드 클러스터를 생성하세요',
            ],
            metrics: {
              '키워드 밀도': '2.5%',
              '콘텐츠 점수': '82점',
              '제안된 키워드': '15개',
            },
          };
          break;
        case 'geo':
          result = {
            success: true,
            findings: [
              'FAQ 스키마가 구현되어 있습니다',
              '생성형 엔진 친화적인 구조가 확인되었습니다',
              'JSON-LD 구조화된 데이터가 존재합니다',
            ],
            recommendations: [
              '더 많은 FAQ 항목을 추가하세요 (최소 10개)',
              'HowTo 스키마를 추가하여 단계별 가이드를 제공하세요',
              'Review 스키마를 활용하여 신뢰도를 높이세요',
            ],
            metrics: {
              'FAQ 항목': '7개',
              '스키마 점수': '90점',
              '생성형 엔진 최적화': '85점',
            },
          };
          break;
        case 'aio':
          result = {
            success: true,
            findings: [
              'SEO 최적화: 양호',
              'AI SEO 최적화: 양호',
              'GEO 최적화: 양호',
              '전체 점수: 87점',
            ],
            recommendations: [
              '이미지 최적화를 진행하세요 (WebP 형식 사용)',
              '캐싱 전략을 개선하세요',
              'CDN을 활용하여 전역 성능을 향상시키세요',
            ],
            metrics: {
              '종합 점수': '87점',
              '개선 가능 항목': '5개',
              '예상 성능 향상': '15%',
            },
          };
          break;
      }

      return { ...job, result };
    });
  };

  const runJobs = async () => {
    if (!domain.trim() || running) return;
    setRunning(true);
    const nextJobs = [...jobs];

    for (let i = 0; i < nextJobs.length; i += 1) {
      nextJobs[i] = { ...nextJobs[i], status: 'running' };
      setJobs([...nextJobs]);
      await delay(600);
      nextJobs[i] = { ...nextJobs[i], status: 'done' };
      setJobs([...nextJobs]);
    }

    // 보고서 데이터 생성
    const report = generateReportData(nextJobs);
    setReportData(report);
    setRunning(false);
    setShowReport(true);
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('optimization.title')}</h2>
        <HelpTooltip
          content={t('optimization.help')}
          title={t('optimization.title')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('optimization.domain')}
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t('optimization.domainPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('optimization.domainHelp')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runJobs}
              disabled={!domain.trim() || running}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {running ? t('optimization.running') : t('optimization.run')}
            </button>
            <button
              onClick={reset}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`p-3 rounded-lg border ${
                job.status === 'done'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : job.status === 'running'
                    ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Globe2 className="w-4 h-4 text-primary-600" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.label}</p>
                <span className="ml-auto text-xs text-gray-600 dark:text-gray-300">
                  {job.status === 'pending' ? '대기' : job.status === 'running' ? '진행' : '완료'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">{job.command(domain || '<domain>')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {job.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 보고서 모달 */}
      {showReport && (
        <ReportModal
          domain={domain}
          reportData={reportData}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

/**
 * 보고서 모달 컴포넌트
 */
interface ReportModalProps {
  domain: string;
  reportData: Job[];
  onClose: () => void;
}

function ReportModal({ domain, reportData, onClose }: ReportModalProps) {
  const completedCount = reportData.filter((job) => job.status === 'done').length;
  const successCount = reportData.filter((job) => job.result?.success).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                최적화 보고서
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {domain} · {completedCount}개 작업 완료
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg transition-colors touch-manipulation"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* 요약 통계 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">완료된 작업</p>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedCount}/{reportData.length}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">성공률</p>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round((successCount / completedCount) * 100)}%
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">개선 제안</p>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {reportData.reduce((sum, job) => sum + (job.result?.recommendations?.length || 0), 0)}개
              </p>
            </div>
          </div>

          {/* 각 작업별 상세 보고서 */}
          <div className="space-y-4">
            {reportData.map((job) => (
              <div
                key={job.id}
                className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    job.result?.success
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {job.result?.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {job.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {job.command(domain)}
                    </p>
                  </div>
                </div>

                {job.result && (
                  <div className="space-y-4">
                    {/* 발견 사항 */}
                    {job.result.findings.length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          발견 사항
                        </p>
                        <ul className="space-y-1">
                          {job.result.findings.map((finding, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 개선 제안 */}
                    {job.result.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          개선 제안
                        </p>
                        <ul className="space-y-1">
                          {job.result.recommendations.map((rec, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                            >
                              <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 메트릭 */}
                    {job.result.metrics && Object.keys(job.result.metrics).length > 0 && (
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          주요 지표
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Object.entries(job.result.metrics).map(([key, value]) => (
                            <div
                              key={key}
                              className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2"
                            >
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {key}
                              </p>
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => {
              // 보고서 다운로드 기능 (향후 구현)
              const reportText = reportData
                .map((job) => {
                  return `## ${job.label}\n\n${job.result?.findings.join('\n') || ''}\n\n${job.result?.recommendations.join('\n') || ''}`;
                })
                .join('\n\n---\n\n');
              const blob = new Blob([reportText], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `optimization-report-${domain.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            보고서 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
