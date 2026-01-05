/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useMemo } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { useResources } from '../../contexts/ResourceContext';
import { ROLE_LABELS, ROLE_ICONS } from '../../utils/roleConfigs';
import { Target, ClipboardList, BadgeCheck } from 'lucide-react';

interface PlanStep {
  title: string;
  detail: string;
  resources?: string[]; // 관련 리소스 키워드
}

const BASE_STEPS: Record<string, PlanStep[]> = {
  default: [
    { title: '목표 정의', detail: '무엇을 만들고 싶은지 한 문장으로 적어주세요.' },
    { title: '기술 선택', detail: '선호 스택을 선택하고 대체 옵션을 추천합니다.' },
    { title: '리소스 실행', detail: '선택된 리소스의 명령을 순서대로 실행합니다.' },
    { title: '검증·배포', detail: '링크 헬스/테스트를 모의 실행하고 배포 체크리스트를 만듭니다.' },
  ],
  frontend: [
    { 
      title: '프로젝트 초기 설정', 
      detail: '프로젝트 구조를 설정하고 필요한 도구를 선택합니다. 빌드 도구(Vite, Webpack, Parcel)와 프레임워크(React, Vue, Angular)를 결정하세요.',
      resources: ['vite', 'webpack', 'parcel', 'react', 'vue', 'angular']
    },
    { 
      title: 'UI/프레임워크 선택', 
      detail: 'React/Vue/Angular 기반 UI 키트 선택 후 설치 명령 복사. 컴포넌트 라이브러리와 CSS 프레임워크를 선택하세요.',
      resources: ['component', 'ui library', 'tailwind', 'bootstrap']
    },
    { 
      title: '상태 관리 및 데이터', 
      detail: '상태 관리 라이브러리(Redux, Zustand, Jotai) 선택 및 API/SDK 연동 리소스 추천 및 설정 순서 안내.',
      resources: ['redux', 'zustand', 'jotai', 'api', 'sdk']
    },
    { 
      title: '품질·배포', 
      detail: '접근성(a11y) 체크, 성능 최적화, 테스트 설정 및 배포 가이드 생성.',
      resources: ['accessibility', 'a11y', 'testing', 'deployment']
    },
  ],
  backend: [
    { 
      title: 'API/서버 프레임워크 결정', 
      detail: 'FastAPI/Express/Django 등 선택, 보일러플레이트 실행. RESTful API 또는 GraphQL 설계 결정.',
      resources: ['fastapi', 'express', 'django', 'rest', 'graphql']
    },
    { 
      title: '데이터베이스 및 ORM', 
      detail: '데이터베이스 선택(PostgreSQL, MySQL, MongoDB) 및 ORM 라이브러리(Prisma, SQLAlchemy, TypeORM) 추천과 적용 순서 안내.',
      resources: ['database', 'orm', 'prisma', 'sqlalchemy', 'typeorm']
    },
    { 
      title: '인증·보안', 
      detail: '인증/인가 라이브러리(JWT, OAuth) 추천과 보안 설정 가이드.',
      resources: ['auth', 'jwt', 'oauth', 'security']
    },
    { 
      title: '관측/운영', 
      detail: '헬스체크/로깅/모니터링 기본 설정 제안 및 성능 최적화 도구.',
      resources: ['logging', 'monitoring', 'performance']
    },
  ],
  pm: [
    { 
      title: '요구사항 정의', 
      detail: 'Spec-kit/문서화를 시작하는 명령과 템플릿 제공. 프로젝트 목표와 범위 정의.',
      resources: ['spec', 'documentation', 'planning']
    },
    { 
      title: '프로젝트 관리 워크플로우', 
      detail: '스프린트 계획, 이슈 트래킹 시스템 설정, To-do/역할 설정 흐름을 자동 구성.',
      resources: ['project-management', 'sprint', 'issue-tracking']
    },
    { 
      title: '문서화 자동화', 
      detail: 'API 문서 자동 생성 도구, 스펙 문서 관리 시스템, 협업 문서 플랫폼 통합.',
      resources: ['api-documentation', 'spec-management', 'collaboration']
    },
    { 
      title: '인도/검증', 
      detail: '데모/QA 체크리스트 생성 및 사용자 피드백 수집 도구.',
      resources: ['qa', 'testing', 'feedback']
    },
  ],
  fullstack: [
    { 
      title: '엔드투엔드 보일러플레이트', 
      detail: '프론트+백 스타터를 선택하고 설치 순서를 제안. MERN, MEAN, LAMP 스택 선택.',
      resources: ['mern', 'mean', 'boilerplate', 'starter-kit']
    },
    { 
      title: 'API 연동 및 인증', 
      detail: '프론트엔드-백엔드 API 연동, 인증 시스템 통합, 타입 안전성 보장 도구(tRPC, GraphQL Codegen).',
      resources: ['api-client', 'trpc', 'graphql', 'authentication']
    },
    { 
      title: '데이터 파이프라인', 
      detail: '데이터 스토리지 설정, 캐싱 전략, 실시간 동기화 설정.',
      resources: ['storage', 'cache', 'realtime']
    },
    { 
      title: '테스팅/배포', 
      detail: 'E2E 테스트, CI/CD 파이프라인 설정, 멀티 환경 배포 전략.',
      resources: ['e2e', 'ci-cd', 'deployment']
    },
  ],
  devops: [
    { 
      title: 'CI/CD 파이프라인 설정', 
      detail: 'GitHub Actions, GitLab CI, Jenkins 등 배포 스크립트/파이프라인 템플릿 추천.',
      resources: ['github-actions', 'gitlab-ci', 'jenkins', 'ci-cd']
    },
    { 
      title: '인프라 자동화 (IaC)', 
      detail: 'Terraform, CloudFormation 등 IaC 도구, 컨테이너 오케스트레이션(Kubernetes, Docker Swarm), 클라우드 플랫폼별 배포 전략.',
      resources: ['terraform', 'kubernetes', 'docker', 'iac']
    },
    { 
      title: '보안 및 컴플라이언스', 
      detail: '컨테이너 보안 스캔 도구, 시크릿 관리 시스템, 규정 준수 자동화 도구.',
      resources: ['security-scan', 'secrets', 'compliance']
    },
    { 
      title: '모니터링 및 로깅', 
      detail: '알림/로그/헬스 체크 구성, 성능 모니터링, 재해 복구 도구.',
      resources: ['monitoring', 'logging', 'alerting', 'disaster-recovery']
    },
  ],
  designer: [
    { 
      title: '디자인 시스템 선택', 
      detail: '컴포넌트/토큰/테마 리소스 추천. 디자인 시스템 빌더 도구 선택.',
      resources: ['design-system', 'component', 'tokens', 'theme']
    },
    { 
      title: '디자인-개발 워크플로우', 
      detail: '디자인 파일에서 코드 생성 도구, 디자인 토큰 관리 시스템, Figma 플러그인 추천.',
      resources: ['figma', 'code-generation', 'design-tokens']
    },
    { 
      title: '프로토타이핑', 
      detail: '핵심 플로우에 대한 샘플 화면/애니메이션 제안 및 사용자 테스트 플랫폼.',
      resources: ['prototyping', 'animation', 'user-testing']
    },
    { 
      title: '접근성 및 Handoff', 
      detail: '색상 대비 검사, 접근성 테스트 도구, 개발 전달용 체크리스트 생성.',
      resources: ['accessibility', 'a11y', 'handoff', 'color-contrast']
    },
  ],
};

export function GoalPlanner() {
  const { currentRole, getRecommendations } = useRole();
  const { resources } = useResources();

  const steps = useMemo(() => {
    if (!currentRole || !BASE_STEPS[currentRole]) {
      return BASE_STEPS.default;
    }
    return BASE_STEPS[currentRole];
  }, [currentRole]);

  // 역할 기반 추천 도구 계산 (useMemo로 메모이제이션하여 무한 루프 방지)
  // resources 배열의 참조가 변경되어도 실제 내용이 같으면 재계산하지 않도록 resources의 ID 목록 사용
  const resourcesIds = useMemo(() => resources.map(r => r.id).join(','), [resources]);
  const topResources = useMemo(() => {
    if (currentRole && resources.length > 0) {
      const recommendations = getRecommendations(resources);
      // 상위 3개 추천 도구 선택
      return recommendations
        .slice(0, 3)
        .map(rec => rec.resource);
    } else {
      // 역할이 없으면 일반 리소스 상위 3개
      return resources.slice(0, 3);
    }
    // getRecommendations는 useCallback으로 메모이제이션되어 있지만, 
    // dependency에서 제외하여 resourcesIds와 currentRole만으로 재계산 제어
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole, resourcesIds, resources.length]);

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
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">추천 도구</p>
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
