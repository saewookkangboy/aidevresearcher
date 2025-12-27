/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useMemo, useState } from 'react';
import { useResources } from '../../contexts/ResourceContext';
import { Resource } from '../../utils/types';
import { Sparkles, Play, PauseCircle, Terminal, ListChecks } from 'lucide-react';

type StepStatus = 'pending' | 'running' | 'done';

interface Step {
  id: string;
  label: string;
  detail: string;
  status: StepStatus;
}

const BASE_STEPS: Step[] = [
  { id: 'intent', label: '의도 파악', detail: '입력한 목표/쿼리를 분석해 필요한 리소스를 매칭합니다.', status: 'pending' },
  { id: 'pick', label: '리소스 선택', detail: '가장 적합한 리소스를 선택하고 의존성을 확인합니다.', status: 'pending' },
  { id: 'plan', label: '실행 플로우 구성', detail: '설치·설정·검증 순서로 워크플로우를 생성합니다.', status: 'pending' },
  { id: 'run', label: '명령 실행', detail: 'dev-agent 명령을 순차 실행하고 로그를 수집합니다.', status: 'pending' },
  { id: 'summarize', label: '결과 요약', detail: '핵심 로그와 다음 액션을 요약합니다.', status: 'pending' },
];

function pickPrimaryResource(resources: Resource[]): Resource | null {
  if (!resources.length) return null;
  const preferred = resources.find((r) => r.title.toLowerCase().includes('dev-agent-kit'));
  return preferred || resources[0];
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function WorkflowAgentPanel() {
  const { filteredResources } = useResources();
  const [steps, setSteps] = useState<Step[]>(BASE_STEPS);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const target = useMemo(() => pickPrimaryResource(filteredResources), [filteredResources]);

  const reset = () => {
    setSteps(BASE_STEPS.map((s) => ({ ...s, status: 'pending' })));
    setLogs([]);
    setRunning(false);
  };

  const runWorkflow = async () => {
    if (!target || running) return;
    reset();
    setRunning(true);

    const nextSteps = [...BASE_STEPS];
    const updateStep = async (idx: number, status: StepStatus, note?: string) => {
      nextSteps[idx] = { ...nextSteps[idx], status };
      setSteps([...nextSteps]);
      if (note) {
        setLogs((prev) => [...prev, note]);
      }
    };

    await updateStep(0, 'running', `의도 파악: "${target.title}"와 유사 리소스 매칭`);
    await delay(500);
    await updateStep(0, 'done');

    await updateStep(1, 'running', `선택된 리소스: ${target.title} (${target.type})`);
    await delay(500);
    await updateStep(1, 'done');

    await updateStep(2, 'running', '플로우 구성: 설치 → 설정 → 검증');
    await delay(600);
    await updateStep(2, 'done');

    await updateStep(3, 'running', `실행: ${target.command || '명령 없음'}`);
    await delay(800);
    await updateStep(3, 'done', '로그 수집 완료');

    await updateStep(4, 'running', '요약 작성 및 다음 액션 제안');
    await delay(500);
    await updateStep(4, 'done', '워크플로우 완료 🎉');

    setRunning(false);
  };

  if (!target) {
    return null;
  }

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">워크플로우 에이전트</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
          <Terminal className="w-4 h-4" />
          <span>{target.title}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                step.status === 'done'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : step.status === 'running'
                    ? 'border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="mt-0.5">
                {step.status === 'done' ? (
                  <ListChecks className="w-4 h-4 text-green-600" />
                ) : step.status === 'running' ? (
                  <Play className="w-4 h-4 text-primary-600 animate-pulse" />
                ) : (
                  <PauseCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{step.detail}</p>
              </div>
              <div className="ml-auto text-xs font-semibold text-gray-600 dark:text-gray-300 capitalize">
                {step.status === 'pending' ? '대기' : step.status === 'running' ? '진행 중' : '완료'}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={runWorkflow}
              disabled={running}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {running ? '실행 중...' : '검색→선택→실행 자동화'}
            </button>
            <button
              onClick={reset}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              초기화
            </button>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm h-full">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">실행 로그</p>
          <div className="space-y-1 max-h-56 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">버튼을 눌러 워크플로우를 실행해보세요.</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="text-xs text-gray-800 dark:text-gray-200">
                  • {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
