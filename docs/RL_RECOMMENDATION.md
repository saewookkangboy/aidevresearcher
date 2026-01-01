# 강화학습 기반 추천 시스템

## 개요

Vibe Coding Navigator는 강화학습(Reinforcement Learning) 기반 AI 추천 시스템을 통해 사용자에게 최적의 개발 리소스를 추천합니다.

## 아키텍처

```
사용자 행동 추적
    ↓
데이터베이스 저장 (user_interactions)
    ↓
강화학습 모델 학습
    ↓
추천 점수 계산
    ↓
리소스 정렬 및 추천
```

## 주요 기능

### 1. 사용자 행동 추적

사용자의 모든 상호작용이 데이터베이스에 기록됩니다:

- **상호작용 타입**: `view`, `copy`, `run`, `favorite`, `share`, `click`
- **컨텍스트 정보**: 검색 쿼리, 사용자 역할, 세션 ID
- **타임스탬프**: 각 상호작용의 정확한 시간

### 2. 강화학습 모델

#### Q-Learning 알고리즘

- **상태(State)**: 리소스 목록, 사용자 역할, 검색 쿼리, 사용자 히스토리
- **행동(Action)**: 리소스 추천, 부스트, 억제
- **보상(Reward)**: 사용자 피드백, 성공 사용, 실패 사용

#### 점수 계산 요소

1. **상호작용 점수** (가중치: 0.3)
   - 사용자가 리소스와 상호작용한 횟수

2. **성공 사용 점수** (가중치: 0.5)
   - `run` 상호작용 횟수 (실제 사용)

3. **피드백 점수** (가중치: 0.2)
   - 사용자 피드백 (1-5점)

4. **최근성 점수** (가중치: 0.1)
   - 최근 상호작용일수록 높은 점수

5. **인기도 점수** (가중치: 0.15)
   - GitHub stars 수

6. **역할 매칭 점수** (가중치: 0.25)
   - 사용자 역할과 리소스 플랫폼 일치

7. **검색 쿼리 매칭 점수** (가중치: 0.2)
   - 검색어와 제목/설명/태그 일치

### 3. ε-greedy 정책

- **탐험(Exploration)**: 10% 확률로 랜덤 추천
- **활용(Exploitation)**: 90% 확률로 최적 추천

## 사용 방법

### 자동 추천

검색 시 자동으로 강화학습 기반 추천이 적용됩니다:

```typescript
// ResourceContext에서 자동으로 호출됨
const recommendations = await rlService.recommendResources(resources, {
  userRole: 'frontend',
  searchQuery: 'React component library',
  sessionId: 'session_123',
});
```

### 피드백 학습

사용자 피드백을 통해 모델이 학습합니다:

```typescript
await rlService.learnFromFeedback(
  resourceId,
  { positive: true, value: 5 },
  { userRole: 'frontend', searchQuery: 'React' }
);
```

## 데이터베이스 스키마

### user_interactions 테이블

```sql
CREATE TABLE user_interactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  resource_id VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB,
  search_query TEXT,
  role VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255)
);
```

### recommendation_log 테이블

```sql
CREATE TABLE recommendation_log (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  query TEXT,
  role VARCHAR(50),
  recommended_resources TEXT[],
  recommendation_scores JSONB,
  model_id VARCHAR(255),
  context JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

## 모델 통계

모델의 학습 상태를 확인할 수 있습니다:

```typescript
const stats = rlService.getModelStats();
// {
//   episodes: 100,
//   averageReward: 0.75,
//   bestScore: 0.95,
//   weights: { ... },
//   qTableSize: 500
// }
```

## 성능 최적화

### 캐싱

- Q-table은 로컬 스토리지에 캐시됩니다
- 모델 가중치는 주기적으로 업데이트됩니다

### 배치 처리

- 여러 상호작용을 배치로 처리하여 성능 향상
- 비동기 처리로 UI 블로킹 방지

## 향후 개선 사항

1. **딥 Q-네트워크 (DQN)**: 복잡한 패턴 학습
2. **협업 필터링**: 유사 사용자 기반 추천
3. **컨텍스트 밴딧**: 실시간 최적화
4. **A/B 테스팅**: 추천 알고리즘 비교

## 참고 자료

- [강화학습 기초](https://en.wikipedia.org/wiki/Reinforcement_learning)
- [Q-Learning 알고리즘](https://en.wikipedia.org/wiki/Q-learning)
- [추천 시스템 설계](https://en.wikipedia.org/wiki/Recommender_system)

