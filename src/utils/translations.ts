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
    
    // Resource Grid
    'resources.title': '추천 도구',
    'resources.count': '{{count}}개',
    'resources.description': '검색 결과에 맞는 도구들이 표시됩니다. 각 도구를 클릭하면 자세한 정보와 설치 방법을 확인할 수 있습니다.',
    'resources.help': '검색 결과나 필터에 맞는 도구들이 여기에 표시됩니다. 각 도구 카드를 클릭하면 자세한 정보와 설치 명령어를 확인할 수 있습니다. 스크롤하면 더 많은 도구를 볼 수 있어요.',
    'resources.loading': '도구를 불러오는 중...',
    
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
    
    // Trending Harvest
    'trending.title': '키워드 기반 자동 수집',
    'trending.description': '키워드나 주제를 입력하면 GitHub/소셜 트렌드에서 상위 리소스를 자동으로 가져옵니다.',
    'trending.help': '키워드나 주제를 입력하면 GitHub나 소셜 미디어에서 인기 있는 관련 도구들을 자동으로 찾아서 수집해드립니다. 예: \'AI\', \'React\', \'Python\' 등',
    'trending.placeholder': '키워드 입력 (예: AI, React, Python)',
    'trending.collect': '수집',
    'trending.collecting': '수집 중...',
    
    // Workflow Agent
    'workflow.title': '워크플로우 에이전트',
    'workflow.help': '검색한 도구를 자동으로 선택하고 실행하는 워크플로우를 만들어드립니다. 의도 파악 → 리소스 선택 → 실행 플로우 구성 → 명령 실행 → 결과 요약까지 자동으로 진행됩니다.',
    'workflow.run': '검색→선택→실행 자동화',
    'workflow.running': '실행 중...',
    'workflow.logs': '실행 로그',
    'workflow.logsEmpty': '버튼을 눌러 워크플로우를 실행해보세요.',
    
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
    
    // Resource Grid
    'resources.title': 'Recommended Tools',
    'resources.count': '{{count}} items',
    'resources.description': 'Tools matching your search results are displayed here. Click on each tool to see detailed information and installation instructions.',
    'resources.help': 'Tools matching your search or filter criteria are displayed here. Click on each tool card to see detailed information and installation commands. Scroll to see more tools.',
    'resources.loading': 'Loading tools...',
    
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
    
    // Trending Harvest
    'trending.title': 'Keyword-Based Auto Collection',
    'trending.description': 'Enter keywords or topics to automatically fetch top resources from GitHub/social trends.',
    'trending.help': 'Enter keywords or topics and we\'ll automatically find and collect popular related tools from GitHub or social media. Examples: \'AI\', \'React\', \'Python\', etc.',
    'trending.placeholder': 'Enter keyword (e.g., AI, React, Python)',
    'trending.collect': 'Collect',
    'trending.collecting': 'Collecting...',
    
    // Workflow Agent
    'workflow.title': 'Workflow Agent',
    'workflow.help': 'Automatically creates a workflow to select and execute searched tools. Automatically proceeds through: intent understanding → resource selection → execution flow setup → command execution → result summary.',
    'workflow.run': 'Auto: Search→Select→Execute',
    'workflow.running': 'Running...',
    'workflow.logs': 'Execution Logs',
    'workflow.logsEmpty': 'Click the button to run the workflow.',
    
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
  },
};

