/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { Wand2, Globe2, Activity } from 'lucide-react';

type JobStatus = 'pending' | 'running' | 'done';

interface Job {
  id: string;
  label: string;
  command: (domain: string) => string;
  note: string;
  status: JobStatus;
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
  const [domain, setDomain] = useState('');
  const [jobs, setJobs] = useState<Job[]>(BASE_JOBS);
  const [running, setRunning] = useState(false);

  const reset = () => {
    setJobs(BASE_JOBS.map((job) => ({ ...job, status: 'pending' })));
    setRunning(false);
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

    setRunning(false);
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SEO / AI SEO / GEO / AIO 배치 실행</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              도메인 또는 페이지 URL
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              한 번에 SEO/AI SEO/GEO/AIO 명령을 순차 실행하고 보고서를 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runJobs}
              disabled={!domain.trim() || running}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {running ? '실행 중...' : '자동 최적화 실행'}
            </button>
            <button
              onClick={reset}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              초기화
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
    </div>
  );
}
