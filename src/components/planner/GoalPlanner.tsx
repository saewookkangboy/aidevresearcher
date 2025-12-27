import { useMemo } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useResources } from '../../contexts/ResourceContext';
import { ROLE_LABELS, ROLE_ICONS } from '../../utils/roleConfigs';
import { Target, ClipboardList, BadgeCheck } from 'lucide-react';

interface PlanStep {
  title: string;
  detail: string;
}

const BASE_STEPS: Record<string, PlanStep[]> = {
  default: [
    { title: '목표 정의', detail: '무엇을 만들고 싶은지 한 문장으로 적어주세요.' },
    { title: '기술 선택', detail: '선호 스택을 선택하고 대체 옵션을 추천합니다.' },
    { title: '리소스 실행', detail: '선택된 리소스의 명령을 순서대로 실행합니다.' },
    { title: '검증·배포', detail: '링크 헬스/테스트를 모의 실행하고 배포 체크리스트를 만듭니다.' },
  ],
  frontend: [
    { title: 'UI/프레임워크 선택', detail: 'React/Vue 기반 UI 키트 선택 후 설치 명령 복사.' },
    { title: '상태·데이터', detail: 'API/SDK 연동 리소스 추천 및 설정 순서 안내.' },
    { title: '품질·배포', detail: '접근성/성능 체크리스트와 배포 가이드 생성.' },
  ],
  backend: [
    { title: 'API/서버 프레임 결정', detail: 'FastAPI/Express 등 선택, 보일러플레이트 실행.' },
    { title: '데이터·보안', detail: 'DB/인증 라이브러리 추천과 적용 순서 안내.' },
    { title: '관측/운영', detail: '헬스체크/로그/모니터링 기본 설정 제안.' },
  ],
  pm: [
    { title: '요구정의', detail: 'Spec-kit/문서화를 시작하는 명령과 템플릿 제공.' },
    { title: '워크플로우', detail: 'To-do/역할 설정 흐름을 자동 구성.' },
    { title: '인도/검증', detail: '데모/QA 체크리스트 생성.' },
  ],
  fullstack: [
    { title: '엔드투엔드 보일러플레이트', detail: '프론트+백 스타터를 선택하고 설치 순서를 제안.' },
    { title: '데이터 파이프라인', detail: 'API 연동과 인증/스토리지 설정 순서.' },
    { title: '테스팅/배포', detail: 'E2E/CI 기본 세트 안내.' },
  ],
  devops: [
    { title: 'CI/CD 설정', detail: '배포 스크립트/파이프라인 템플릿 추천.' },
    { title: '인프라 자동화', detail: 'IaC/컨테이너 빌드·보안 체크 순서.' },
    { title: '모니터링', detail: '알림/로그/헬스 체크 구성.' },
  ],
  designer: [
    { title: '디자인 시스템 선택', detail: '컴포넌트/토큰/테마 리소스 추천.' },
    { title: '프로토타이핑', detail: '핵심 플로우에 대한 샘플 화면/애니메이션 제안.' },
    { title: 'handoff', detail: '개발 전달용 체크리스트 생성.' },
  ],
};

export function GoalPlanner() {
  const { currentRole } = useRole();
  const { filteredResources } = useResources();

  const steps = useMemo(() => {
    if (!currentRole || !BASE_STEPS[currentRole]) {
      return BASE_STEPS.default;
    }
    return BASE_STEPS[currentRole];
  }, [currentRole]);

  const topResources = filteredResources.slice(0, 3);

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">목표 기반 플래너</h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {currentRole ? `${ROLE_ICONS[currentRole]} ${ROLE_LABELS[currentRole]} 기준 플랜` : '역할을 선택하면 맞춤 플랜이 적용됩니다.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-primary-600" />
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">추천 리소스</p>
          </div>
          {topResources.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">검색 결과가 보이면 여기서 바로 실행할 수 있어요.</p>
          ) : (
            <ul className="space-y-2">
              {topResources.map((resource) => (
                <li key={resource.id} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-200">
                  <BadgeCheck className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{resource.title}</p>
                    <p className="text-gray-500 dark:text-gray-400">{resource.command || resource.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
