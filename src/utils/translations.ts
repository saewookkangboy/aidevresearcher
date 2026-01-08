/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export const translations = {
  ko: {
    // Header
    'header.title': 'AI Dev. Researcher',
    'header.tagline': 'Don\'t search, Just Vibe.',
    'header.help': '도움말 보기',
    'header.darkMode': '다크모드 토글',
    
    // Language
    'language.ko': '한국어',
    'language.en': 'English',
    'language.toggle': '언어 변경',
    
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.success': '성공',
    'common.close': '닫기',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.add': '추가',
    'common.search': '검색',
    'common.filter': '필터',
    'common.clear': '초기화',
    'common.refresh': '새로고침',
    'common.reset': '초기화',
    
    // Search
    'search.title': '무엇을 찾고 계신가요?',
    'search.placeholder': '예: 이미지 분석 봇 만들고 싶어, Python AI 라이브러리...',
    'search.description': '자연스러운 문장으로 검색하세요. 예: "이미지 분석 봇 만들기", "Python AI 라이브러리", "웹사이트 SEO 개선"',
    'search.help': '자연스러운 문장으로 검색하면 AI가 의미를 이해해서 관련 도구를 찾아드립니다. 예: \'이미지 분석 봇 만들고 싶어요\', \'Python으로 AI 라이브러리 찾기\' 등',
    'search.examples': '예시',
    
    // Filter
    'filter.title': '도구 필터링',
    'filter.description': '원하는 도구 유형을 선택하여 검색 결과를 좁혀보세요. 여러 유형을 동시에 선택할 수 있습니다.',
    'filter.help': '도구를 유형별로 필터링할 수 있습니다. 여러 유형을 동시에 선택하면 해당하는 모든 도구가 표시됩니다. 예: \'Skills\'와 \'Tools\'를 함께 선택하면 두 유형의 도구가 모두 보입니다.',
    
    // Goal Planner
    'planner.title': '목표 기반 플래너',
    'planner.description': '프로젝트 목표를 단계별로 나누어 필요한 도구와 실행 순서를 추천해드립니다.',
    'planner.help': '프로젝트 목표를 단계별로 나누어 필요한 도구와 실행 순서를 추천해드립니다. 역할을 선택하면 해당 역할에 맞는 맞춤 플랜이 자동으로 생성됩니다. 각 단계를 따라가면 프로젝트를 체계적으로 완성할 수 있어요.',
    'planner.roleBased': '역할을 선택하면 맞춤 플랜이 적용됩니다.',
    'planner.recommendedTools': '추천 도구',
    'planner.noResults': '검색 결과가 보이면 여기서 바로 실행할 수 있어요.',
    'planner.plan': '기준 플랜',
    
    // Resource Grid
    'resources.title': '추천 도구',
    'resources.count': '{{count}}개',
    'resources.description': '검색 결과에 맞는 도구들이 표시됩니다. 각 도구를 클릭하면 자세한 정보와 설치 방법을 확인할 수 있습니다.',
    'resources.help': '검색 결과나 필터에 맞는 도구들이 여기에 표시됩니다. 각 도구 카드를 클릭하면 자세한 정보와 설치 명령어를 확인할 수 있습니다. 스크롤하면 더 많은 도구를 볼 수 있어요.',
    'resources.loading': '도구를 불러오는 중...',
    'resources.loadMore': '더 보기',
    'resources.remaining': '남음',
    
    // Related Resources
    'related.title': '관련 도구',
    'related.description': '현재 도구와 함께 사용하기 좋은 관련 도구들을 추천해드립니다.',
    'related.help': '현재 선택한 도구와 유사하거나 함께 사용하기 좋은 도구들을 추천해드립니다. 태그, 플랫폼, 유형이 비슷한 도구들이 자동으로 표시됩니다.',
    'related.basedOn': '기준 리소스',
    
    // URL Input
    'urlInput.title': '새 도구 추가하기',
    'urlInput.description': 'GitHub, PyPI, 또는 문서 URL을 입력하면 자동으로 분석하여 추가합니다. 검색 기능으로도 도구를 찾을 수 있습니다.',
    'urlInput.help': 'GitHub 리포지토리, PyPI 패키지, 또는 문서 페이지의 URL을 입력하면 AI가 자동으로 분석하여 도구 정보를 추출합니다. 검색 기능을 사용하면 GitHub README나 Google 검색을 통해 도구를 찾을 수도 있어요.',
    'urlInput.searchTitle': '도구 검색 및 추가',
    'urlInput.searchDescription': 'GitHub README 내용 또는 Google 검색을 통해 도구를 찾아 추가할 수 있습니다.',
    'urlInput.searchPlaceholder': '예: Python AI 라이브러리, React 컴포넌트, MCP 서버...',
    'urlInput.searchButton': '검색',
    'urlInput.searching': '검색 중...',
    'urlInput.results': '검색 결과',
    'urlInput.add': '추가',
    'urlInput.adding': '추가 중...',
    'urlInput.directInput': '새 도구 추가하기 (URL 직접 입력)',
    
    // Link Health
    'linkHealth.title': '링크 상태 확인',
    'linkHealth.description': '모든 도구의 링크 상태를 한눈에 확인할 수 있습니다.',
    'linkHealth.help': '모든 도구의 링크가 정상적으로 작동하는지 확인합니다. \'정상\'은 링크가 잘 작동하고, \'깨짐\'은 링크가 작동하지 않으며, \'수정됨\'은 자동으로 수정된 링크입니다.',
    'linkHealth.total': '전체',
    'linkHealth.active': '정상',
    'linkHealth.broken': '깨짐',
    'linkHealth.fixed': '수정됨',
    
    // Live Ops
    'liveOps.title': '실시간 운영 상태',
    'liveOps.description': '도구들의 실시간 상태를 확인하고 관리할 수 있습니다.',
    'liveOps.help': '도구들의 실시간 상태를 확인하고 관리할 수 있습니다. \'링크 재검사\' 버튼으로 모든 링크를 다시 확인하고, \'새로고침\'으로 최신 정보를 가져올 수 있습니다. 자동 새로고침을 켜면 주기적으로 상태를 확인합니다.',
    'liveOps.realtime': '실시간 상태',
    'liveOps.total': '총',
    'liveOps.checkAll': '링크 재검사',
    'liveOps.refresh': '새로고침',
    'liveOps.autoRefresh': '자동 새로고침',
    
    // Role Dashboard
    'dashboard.title': '{{role}} 대시보드',
    'dashboard.description': '맞춤형 리소스 통계 및 추천',
    'dashboard.help': '선택한 역할에 맞는 맞춤형 통계와 추천 도구를 보여드립니다. 플랫폼별 분포, 타입별 분포, 인기 도구, 프레임워크별 분포 등을 한눈에 확인할 수 있습니다.',
    'dashboard.totalResources': '총 리소스',
    'dashboard.byPlatform': '플랫폼별 분포',
    'dashboard.byType': '타입별 분포',
    'dashboard.topResources': '인기 도구',
    'dashboard.frameworkDistribution': '프레임워크별 리소스 분포',
    'dashboard.noFramework': '프레임워크 정보가 있는 리소스가 없습니다.',
    'dashboard.averageStars': '평균 Stars',
    'dashboard.platformTypes': '플랫폼 종류',
    'dashboard.byStars': '기준',
    'common.items': '개',
    
    // Trending Harvest
    'trending.title': '키워드 기반 자동 수집',
    'trending.description': '키워드나 주제를 입력하면 GitHub/소셜 트렌드에서 상위 리소스를 자동으로 가져옵니다.',
    'trending.help': '키워드나 주제를 입력하면 GitHub나 소셜 미디어에서 인기 있는 관련 도구들을 자동으로 찾아서 수집해드립니다. 예: \'AI\', \'React\', \'Python\' 등',
    'trending.placeholder': '키워드 입력 (예: AI, React, Python)',
    'trending.collect': '수집',
    'trending.collecting': '수집 중...',
    'trending.error': '수집 중 오류가 발생했습니다',
    
    // Workflow Agent
    'workflow.title': '워크플로우 에이전트',
    'workflow.help': '검색한 도구를 자동으로 선택하고 실행하는 워크플로우를 만들어드립니다. 의도 파악 → 리소스 선택 → 실행 플로우 구성 → 명령 실행 → 결과 요약까지 자동으로 진행됩니다.',
    'workflow.run': '검색→선택→실행 자동화',
    'workflow.running': '실행 중...',
    'workflow.logs': '실행 로그',
    'workflow.logsEmpty': '버튼을 눌러 워크플로우를 실행해보세요.',
    'workflow.pending': '대기',
    'workflow.done': '완료',
    'workflow.step.intent': '의도 파악',
    'workflow.step.intentDetail': '입력한 목표/쿼리를 분석해 필요한 리소스를 매칭합니다.',
    'workflow.step.pick': '리소스 선택',
    'workflow.step.pickDetail': '가장 적합한 리소스를 선택하고 의존성을 확인합니다.',
    'workflow.step.plan': '실행 플로우 구성',
    'workflow.step.planDetail': '설치·설정·검증 순서로 워크플로우를 생성합니다.',
    'workflow.step.run': '명령 실행',
    'workflow.step.runDetail': 'dev-agent 명령을 순차 실행하고 로그를 수집합니다.',
    'workflow.step.summarize': '결과 요약',
    'workflow.step.summarizeDetail': '핵심 로그와 다음 액션을 요약합니다.',
    
    // Optimization Batch
    'optimization.title': 'SEO / AI SEO / GEO / AIO 배치 실행',
    'optimization.help': '웹사이트의 SEO(검색 엔진 최적화), AI SEO(AI 기반 SEO), GEO(생성형 엔진 최적화), AIO(통합 최적화)를 한 번에 실행하고 분석 결과를 확인할 수 있습니다. 도메인을 입력하고 실행하면 자동으로 분석이 진행됩니다.',
    'optimization.domain': '도메인 또는 페이지 URL',
    'optimization.domainPlaceholder': 'https://example.com',
    'optimization.domainHelp': '한 번에 SEO/AI SEO/GEO/AIO 명령을 순차 실행하고 보고서를 생성합니다.',
    'optimization.run': '자동 최적화 실행',
    'optimization.running': '실행 중...',
    
    // Activity Feed
    'activity.title': '활동 로그',
    'activity.help': '도구 추가, 검색, 필터링 등 모든 활동 내역을 시간순으로 확인할 수 있습니다. \'새로고침\'으로 최신 정보를 가져오고, \'비우기\'로 로그를 지울 수 있습니다.',
    'activity.clear': '비우기',
    
    // Footer
    'footer.tagline': 'AI Dev. Researcher - Don\'t search, Just Vibe.',
    'footer.description': '비개발자도 쉽게 사용할 수 있는 개발 도구 검색 플랫폼',
    
    // Quick Start
    'quickStart.title': '시작하기',
    'quickStart.description': '먼저 당신의 역할을 선택하면 맞춤 도구를 추천해드립니다. 역할을 선택하지 않아도 검색은 가능합니다.',
    'quickStart.guide': '가이드 보기',
    
    // Resource Types
    'resourceType.CLI_EXTENSION': 'CLI 확장',
    'resourceType.AGENT_SKILL': '에이전트 스킬',
    'resourceType.LIBRARY': '라이브러리',
    'resourceType.VSCODE_EXT': 'VS Code 확장',
    'resourceType.API': 'API',
    'resourceType.STARTER_KIT': '스타터 키트',
    
    // Categories
    'category.SKILLS': '스킬',
    'category.TOOLS': '도구',
    'category.EXTENSION': '확장',
    'category.MCP': 'MCP 서버',
    
    // Roles
    'role.frontend': '프론트엔드 개발자',
    'role.backend': '백엔드 개발자',
    'role.pm': '프로덕트 매니저',
    'role.fullstack': '풀스택 개발자',
    'role.devops': 'DevOps 엔지니어',
    'role.designer': 'UI/UX 디자이너',
    'role.none': '역할 없음',
    
    // Source Types
    'source.GITHUB': 'GitHub',
    'source.OFFICIAL': '공식',
    'source.SOCIAL_X': 'X (트위터)',
    'source.SOCIAL_THREADS': 'Threads',
    'source.API': 'API',
    'source.USER': '사용자 제출',
    
    // Resource Card
    'resourceCard.viewDetails': '자세히 보기',
    'resourceCard.copyCommand': '명령어 복사',
    'resourceCard.copied': '복사됨!',
    'resourceCard.autoWorkflow': '자동 워크플로우',
    'resourceCard.stars': '스타',
    'resourceCard.verified': '검증됨',
    'resourceCard.platforms': '플랫폼',
    'resourceCard.tags': '태그',
    'resourceCard.source': '출처',
    'resourceCard.type': '유형',
    'resourceCard.description': '설명',
    'resourceCard.noDescription': '설명 없음',
    'resourceCard.install': '설치',
    'resourceCard.execute': '실행',
    'resourceCard.setup': '설정',
    'resourceCard.checkDocs': '공식 문서/README 확인',
    'resourceCard.verify': '검증',
    'resourceCard.checkLinkHealth': '링크 헬스 체크 후 샘플 명령 실행',
    'resourceCard.trustHigh': '신뢰 높음',
    'resourceCard.trustMedium': '신뢰 보통',
    'resourceCard.trustLow': '검토 필요',
    'resourceCard.updated': '업데이트',
    'resourceCard.linkCheck': '링크 체크',
    'resourceCard.snapshot': '스냅샷',
    'resourceCard.statusType': '상태/타입',
    'resourceCard.safetyWarning': '안전 경고',
    'resourceCard.commandCheckRequired': '명령 확인 필요',
    'resourceCard.commandPreview': '명령어 미리보기',
    'resourceCard.commandPreviewDesc': '터미널에 붙여넣기 전에 실행 흐름을 확인할 수 있습니다.',
    'resourceCard.runSimulation': '실행 시뮬레이션',
    'resourceCard.editUrl': 'URL 수정',
    'resourceCard.urlRequired': 'URL을 입력해주세요',
    
    // URL Input Form
    'urlInput.urlPlaceholder': 'GitHub, PyPI, 또는 문서 URL 입력...',
    'urlInput.goalPlaceholder': '목표나 의도를 입력하세요 (선택사항)',
    'urlInput.domainPlaceholder': '도메인 입력 (선택사항)',
    'urlInput.stackPlaceholder': '기술 스택 입력 (선택사항)',
    'urlInput.addButton': '도구 추가',
    'urlInput.invalidUrl': '올바른 URL 형식이 아닙니다',
    'urlInput.checkingLink': '링크 확인 중...',
    'urlInput.linkActive': '링크가 정상적으로 작동합니다',
    'urlInput.linkBroken': '링크에 접근할 수 없습니다 (404 또는 오류)',
    'urlInput.linkError': '링크 확인 중 오류가 발생했습니다',
    'urlInput.searchError': '검색 중 오류가 발생했습니다',
    'urlInput.addError': '리소스 추가 중 오류가 발생했습니다',
    'urlInput.success': '도구가 성공적으로 추가되었습니다!',
    'urlInput.feedUrl': 'RSS 피드 URL',
    'urlInput.feedPlaceholder': 'RSS 피드 URL 입력...',
    'urlInput.feedButton': '피드 수집',
    'urlInput.feedCollecting': '수집 중...',
    'urlInput.feedSuccess': '피드에서 리소스를 성공적으로 수집했습니다!',
    'urlInput.githubReadme': 'GitHub README',
    'urlInput.googleSearch': 'Google 검색',
    'urlInput.noDescription': '설명 없음',
    'urlInput.items': '개',
    
    // Empty State
    'emptyState.noResults': '검색 결과가 없습니다',
    'emptyState.noResultsDescription': '다른 검색어를 시도해보세요.',
    'emptyState.clearSearch': '검색 초기화',
    
    // Error Message
    'error.dismiss': '닫기',
    
    // Success Message
    'success.dismiss': '닫기',
    
    // Admin Panel
    'admin.title': '관리자 패널',
    'admin.layoutManagement': '레이아웃 관리',
    'admin.unitOrder': '단위 순서',
    'admin.visibility': '표시 여부',
    'admin.saveLayout': '레이아웃 저장',
    'admin.resetLayout': '레이아웃 초기화',
    'admin.stats': '통계',
    'admin.total': '전체',
    'admin.enabled': '활성화',
    'admin.disabled': '비활성화',
    
    // Onboarding Guide
    'onboarding.title': '시작 가이드',
    'onboarding.close': '닫기',
    'onboarding.next': '다음',
    'onboarding.previous': '이전',
    'onboarding.skip': '건너뛰기',
    'onboarding.start': '시작하기',
    'onboarding.step1.title': '역할을 선택하세요',
    'onboarding.step1.description': '당신의 역할(프론트엔드, 백엔드, 디자이너 등)을 선택하면 맞춤 도구를 추천해드립니다.',
    'onboarding.step2.title': '원하는 것을 검색하세요',
    'onboarding.step2.description': '예: "이미지 분석 봇 만들기", "Python AI 라이브러리" 등 자연스러운 문장으로 검색하세요.',
    'onboarding.step3.title': '목표를 입력하세요',
    'onboarding.step3.description': '하고 싶은 일을 간단히 적으면 자동으로 필요한 도구를 찾아드립니다.',
    'onboarding.step4.title': '도구를 확인하고 사용하세요',
    'onboarding.step4.description': '추천된 도구의 설명과 사용 방법을 확인한 후, 명령어를 복사해서 바로 사용할 수 있습니다.',
    
    // Role Selector
    'roleSelector.selectRole': '역할 선택',
    'roleSelector.noRole': '역할 없음',
    
    // Common Advanced
    'common.advanced': '고급 기능',
    'common.empty': '비어있음',
    'common.all': '전체',
    'common.yes': '예',
    'common.no': '아니오',
    'common.ok': '확인',
  },
  en: {
    // Header
    'header.title': 'AI Dev. Researcher',
    'header.tagline': 'Don\'t search, Just Vibe.',
    'header.help': 'Show Help',
    'header.darkMode': 'Toggle Dark Mode',
    
    // Language
    'language.ko': '한국어',
    'language.en': 'English',
    'language.toggle': 'Change Language',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.refresh': 'Refresh',
    'common.reset': 'Reset',
    
    // Search
    'search.title': 'What are you looking for?',
    'search.placeholder': 'e.g., I want to create an image analysis bot, Python AI library...',
    'search.description': 'Search using natural language. Examples: "Create an image analysis bot", "Python AI library", "Improve website SEO"',
    'search.help': 'Search using natural language and AI will understand the meaning to find relevant tools. Examples: "I want to create an image analysis bot", "Find AI library for Python", etc.',
    'search.examples': 'Examples',
    
    // Filter
    'filter.title': 'Tool Filtering',
    'filter.description': 'Select the tool types you want to narrow down search results. You can select multiple types at once.',
    'filter.help': 'You can filter tools by type. Selecting multiple types will show all tools matching those types. For example, selecting both \'Skills\' and \'Tools\' will show tools from both categories.',
    
    // Goal Planner
    'planner.title': 'Goal-Based Planner',
    'planner.description': 'Break down your project goals into steps and get recommended tools and execution order.',
    'planner.help': 'Break down your project goals into steps and get recommended tools and execution order. Selecting a role will automatically generate a customized plan for that role. Follow each step to systematically complete your project.',
    'planner.roleBased': 'Select a role to get a customized plan.',
    'planner.recommendedTools': 'Recommended Tools',
    'planner.noResults': 'You can execute tools here once search results appear.',
    'planner.plan': 'plan',
    
    // Resource Grid
    'resources.title': 'Recommended Tools',
    'resources.count': '{{count}} items',
    'resources.description': 'Tools matching your search results are displayed here. Click on each tool to see detailed information and installation instructions.',
    'resources.help': 'Tools matching your search or filter criteria are displayed here. Click on each tool card to see detailed information and installation commands. Scroll to see more tools.',
    'resources.loading': 'Loading tools...',
    'resources.loadMore': 'Load More',
    'resources.remaining': 'remaining',
    
    // Related Resources
    'related.title': 'Related Tools',
    'related.description': 'Recommended tools that work well with the current tool.',
    'related.help': 'Recommended tools that are similar to or work well with the currently selected tool. Tools with similar tags, platforms, or types are automatically displayed.',
    'related.basedOn': 'Based on',
    
    // URL Input
    'urlInput.title': 'Add New Tool',
    'urlInput.description': 'Enter a GitHub, PyPI, or documentation URL to automatically analyze and add it. You can also search for tools.',
    'urlInput.help': 'Enter a GitHub repository, PyPI package, or documentation page URL and AI will automatically analyze and extract tool information. You can also use the search feature to find tools through GitHub README or Google search.',
    'urlInput.searchTitle': 'Search and Add Tools',
    'urlInput.searchDescription': 'Find and add tools through GitHub README content or Google search.',
    'urlInput.searchPlaceholder': 'e.g., Python AI library, React component, MCP server...',
    'urlInput.searchButton': 'Search',
    'urlInput.searching': 'Searching...',
    'urlInput.results': 'Search Results',
    'urlInput.add': 'Add',
    'urlInput.adding': 'Adding...',
    'urlInput.directInput': 'Add New Tool (Direct URL Input)',
    
    // Link Health
    'linkHealth.title': 'Link Status Check',
    'linkHealth.description': 'Check the link status of all tools at a glance.',
    'linkHealth.help': 'Check if all tool links are working properly. \'Active\' means the link works, \'Broken\' means it doesn\'t work, and \'Fixed\' means it was automatically fixed.',
    'linkHealth.total': 'Total',
    'linkHealth.active': 'Active',
    'linkHealth.broken': 'Broken',
    'linkHealth.fixed': 'Fixed',
    
    // Live Ops
    'liveOps.title': 'Real-time Operations Status',
    'liveOps.description': 'Check and manage the real-time status of tools.',
    'liveOps.help': 'Check and manage the real-time status of tools. Use the \'Recheck Links\' button to verify all links again, and \'Refresh\' to get the latest information. Enable auto-refresh to periodically check status.',
    'liveOps.realtime': 'Real-time Status',
    'liveOps.total': 'Total',
    'liveOps.checkAll': 'Recheck Links',
    'liveOps.refresh': 'Refresh',
    'liveOps.autoRefresh': 'Auto Refresh',
    
    // Role Dashboard
    'dashboard.title': '{{role}} Dashboard',
    'dashboard.description': 'Customized resource statistics and recommendations',
    'dashboard.help': 'Shows customized statistics and recommended tools for the selected role. View platform distribution, type distribution, popular tools, framework distribution, and more at a glance.',
    'dashboard.totalResources': 'Total Resources',
    'dashboard.byPlatform': 'Platform Distribution',
    'dashboard.byType': 'Type Distribution',
    'dashboard.topResources': 'Popular Tools',
    'dashboard.frameworkDistribution': 'Framework Resource Distribution',
    'dashboard.noFramework': 'No resources with framework information.',
    'dashboard.averageStars': 'Average Stars',
    'dashboard.platformTypes': 'Platform Types',
    'dashboard.byStars': 'based on',
    'common.items': 'items',
    
    // Trending Harvest
    'trending.title': 'Keyword-Based Auto Collection',
    'trending.description': 'Enter keywords or topics to automatically fetch top resources from GitHub/social trends.',
    'trending.help': 'Enter keywords or topics and we\'ll automatically find and collect popular related tools from GitHub or social media. Examples: \'AI\', \'React\', \'Python\', etc.',
    'trending.placeholder': 'Enter keyword (e.g., AI, React, Python)',
    'trending.collect': 'Collect',
    'trending.collecting': 'Collecting...',
    'trending.error': 'Error occurred while collecting',
    
    // Workflow Agent
    'workflow.title': 'Workflow Agent',
    'workflow.help': 'Automatically creates a workflow to select and execute searched tools. Automatically proceeds through: intent understanding → resource selection → execution flow setup → command execution → result summary.',
    'workflow.run': 'Auto: Search→Select→Execute',
    'workflow.running': 'Running...',
    'workflow.logs': 'Execution Logs',
    'workflow.logsEmpty': 'Click the button to run the workflow.',
    'workflow.pending': 'Pending',
    'workflow.done': 'Done',
    'workflow.step.intent': 'Intent Understanding',
    'workflow.step.intentDetail': 'Analyze the entered goal/query and match necessary resources.',
    'workflow.step.pick': 'Resource Selection',
    'workflow.step.pickDetail': 'Select the most suitable resource and check dependencies.',
    'workflow.step.plan': 'Execution Flow Setup',
    'workflow.step.planDetail': 'Create workflow in order: install → setup → verify.',
    'workflow.step.run': 'Command Execution',
    'workflow.step.runDetail': 'Execute dev-agent commands sequentially and collect logs.',
    'workflow.step.summarize': 'Result Summary',
    'workflow.step.summarizeDetail': 'Summarize key logs and next actions.',
    
    // Optimization Batch
    'optimization.title': 'SEO / AI SEO / GEO / AIO Batch Execution',
    'optimization.help': 'Run SEO (Search Engine Optimization), AI SEO (AI-based SEO), GEO (Generative Engine Optimization), and AIO (All-in-One Optimization) all at once and view analysis results. Enter a domain and run to automatically start analysis.',
    'optimization.domain': 'Domain or Page URL',
    'optimization.domainPlaceholder': 'https://example.com',
    'optimization.domainHelp': 'Run SEO/AI SEO/GEO/AIO commands sequentially and generate a report.',
    'optimization.run': 'Run Auto Optimization',
    'optimization.running': 'Running...',
    
    // Activity Feed
    'activity.title': 'Activity Log',
    'activity.help': 'View all activity history including tool additions, searches, and filtering in chronological order. Use \'Refresh\' to get the latest information and \'Clear\' to clear logs.',
    'activity.clear': 'Clear',
    
    // Footer
    'footer.tagline': 'AI Dev. Researcher - Don\'t search, Just Vibe.',
    'footer.description': 'A developer tool search platform that\'s easy for non-developers to use',
    
    // Quick Start
    'quickStart.title': 'Get Started',
    'quickStart.description': 'First, select your role to get customized tool recommendations. You can search without selecting a role.',
    'quickStart.guide': 'View Guide',
    
    // Common Advanced
    'common.advanced': 'Advanced Features',
    
    // Resource Types
    'resourceType.CLI_EXTENSION': 'CLI Extension',
    'resourceType.AGENT_SKILL': 'Agent Skill',
    'resourceType.LIBRARY': 'Library',
    'resourceType.VSCODE_EXT': 'VS Code Extension',
    'resourceType.API': 'API',
    'resourceType.STARTER_KIT': 'Starter Kit',
    
    // Categories
    'category.SKILLS': 'Skills',
    'category.TOOLS': 'Tools',
    'category.EXTENSION': 'Extension',
    'category.MCP': 'MCP Server',
    
    // Roles
    'role.frontend': 'Frontend Developer',
    'role.backend': 'Backend Developer',
    'role.pm': 'Product Manager',
    'role.fullstack': 'Full Stack Developer',
    'role.devops': 'DevOps Engineer',
    'role.designer': 'UI/UX Designer',
    'role.none': 'No Role',
    
    // Source Types
    'source.GITHUB': 'GitHub',
    'source.OFFICIAL': 'Official',
    'source.SOCIAL_X': 'X (Twitter)',
    'source.SOCIAL_THREADS': 'Threads',
    'source.API': 'API',
    'source.USER': 'User Submitted',
    
    // Resource Card
    'resourceCard.viewDetails': 'View Details',
    'resourceCard.copyCommand': 'Copy Command',
    'resourceCard.copied': 'Copied!',
    'resourceCard.autoWorkflow': 'Auto Workflow',
    'resourceCard.stars': 'Stars',
    'resourceCard.verified': 'Verified',
    'resourceCard.platforms': 'Platforms',
    'resourceCard.tags': 'Tags',
    'resourceCard.source': 'Source',
    'resourceCard.type': 'Type',
    'resourceCard.description': 'Description',
    'resourceCard.noDescription': 'No description',
    'resourceCard.install': 'Install',
    'resourceCard.execute': 'execute',
    'resourceCard.setup': 'Setup',
    'resourceCard.checkDocs': 'Check official docs/README',
    'resourceCard.verify': 'Verify',
    'resourceCard.checkLinkHealth': 'Check link health and run sample command',
    'resourceCard.trustHigh': 'High Trust',
    'resourceCard.trustMedium': 'Medium Trust',
    'resourceCard.trustLow': 'Review Needed',
    'resourceCard.updated': 'Updated',
    'resourceCard.linkCheck': 'Link Check',
    'resourceCard.snapshot': 'Snapshot',
    'resourceCard.statusType': 'Status/Type',
    'resourceCard.safetyWarning': 'Safety Warning',
    'resourceCard.commandCheckRequired': 'Command verification required',
    'resourceCard.commandPreview': 'Command Preview',
    'resourceCard.commandPreviewDesc': 'You can check the execution flow before pasting into the terminal.',
    'resourceCard.runSimulation': 'Run Simulation',
    'resourceCard.editUrl': 'Edit URL',
    'resourceCard.urlRequired': 'Please enter URL',
    
    // URL Input Form
    'urlInput.urlPlaceholder': 'Enter GitHub, PyPI, or documentation URL...',
    'urlInput.goalPlaceholder': 'Enter goal or intent (optional)',
    'urlInput.domainPlaceholder': 'Enter domain (optional)',
    'urlInput.stackPlaceholder': 'Enter tech stack (optional)',
    'urlInput.addButton': 'Add Tool',
    'urlInput.invalidUrl': 'Invalid URL format',
    'urlInput.checkingLink': 'Checking link...',
    'urlInput.linkActive': 'Link is working properly',
    'urlInput.linkBroken': 'Cannot access link (404 or error)',
    'urlInput.linkError': 'Error occurred while checking link',
    'urlInput.searchError': 'Error occurred while searching',
    'urlInput.addError': 'Error occurred while adding resource',
    'urlInput.success': 'Tool added successfully!',
    'urlInput.feedUrl': 'RSS Feed URL',
    'urlInput.feedPlaceholder': 'Enter RSS feed URL...',
    'urlInput.feedButton': 'Collect Feed',
    'urlInput.feedCollecting': 'Collecting...',
    'urlInput.feedSuccess': 'Successfully collected resources from feed!',
    'urlInput.feedDescription': 'Enter RSS/Atom Feed URL to automatically collect GitHub repositories from the feed.',
    'urlInput.githubReadme': 'GitHub README',
    'urlInput.googleSearch': 'Google Search',
    'urlInput.noDescription': 'No description',
    'urlInput.items': 'items',
    
    // Empty State
    'emptyState.noResults': 'No search results',
    'emptyState.noResultsDescription': 'Try a different search term.',
    'emptyState.clearSearch': 'Clear Search',
    
    // Error Message
    'error.dismiss': 'Dismiss',
    
    // Success Message
    'success.dismiss': 'Dismiss',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.layoutManagement': 'Layout Management',
    'admin.unitOrder': 'Unit Order',
    'admin.visibility': 'Visibility',
    'admin.saveLayout': 'Save Layout',
    'admin.resetLayout': 'Reset Layout',
    'admin.stats': 'Statistics',
    'admin.total': 'Total',
    'admin.enabled': 'Enabled',
    'admin.disabled': 'Disabled',
    
    // Onboarding Guide
    'onboarding.title': 'Getting Started Guide',
    'onboarding.close': 'Close',
    'onboarding.next': 'Next',
    'onboarding.previous': 'Previous',
    'onboarding.skip': 'Skip',
    'onboarding.start': 'Get Started',
    'onboarding.step1.title': 'Select Your Role',
    'onboarding.step1.description': 'Select your role (Frontend, Backend, Designer, etc.) to get customized tool recommendations.',
    'onboarding.step2.title': 'Search for What You Want',
    'onboarding.step2.description': 'Search using natural language. Examples: "Create an image analysis bot", "Python AI library", etc.',
    'onboarding.step3.title': 'Enter Your Goal',
    'onboarding.step3.description': 'Simply describe what you want to do, and we\'ll automatically find the necessary tools.',
    'onboarding.step4.title': 'Check and Use Tools',
    'onboarding.step4.description': 'Review the description and usage of recommended tools, then copy the commands to use them right away.',
    
    // Role Selector
    'roleSelector.selectRole': 'Select Role',
    'roleSelector.noRole': 'No Role',
    'roleSelector.selected': 'Role is selected',
    'roleSelector.description': 'Select a role to get customized tool recommendations',
    'roleSelector.clearRole': 'Clear Role',
    
    // Common Advanced
    'common.empty': 'Empty',
    'common.all': 'All',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
  },
};

