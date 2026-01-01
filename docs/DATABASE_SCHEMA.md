# 데이터베이스 스키마 설계

## 개요

도구 수집 이력, 사용자 행동, AI 강화학습 추천을 위한 데이터베이스 스키마입니다.

## PostgreSQL 스키마

### 1. resources 테이블 (기존 확장)

```sql
-- resources 테이블 (기존 + 확장)
CREATE TABLE resources (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  platforms TEXT[],
  tags TEXT[],
  command TEXT,
  url TEXT NOT NULL,
  stars INTEGER,
  is_verified BOOLEAN DEFAULT false,
  source VARCHAR(100),
  source_type VARCHAR(50),
  link_status VARCHAR(20) DEFAULT 'checking',
  social_metrics JSONB,
  meta JSONB, -- 추가 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_checked_at TIMESTAMP,
  
  -- 강화학습 관련 필드
  recommendation_score DECIMAL(10, 4) DEFAULT 0.0,
  total_interactions INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  failed_uses INTEGER DEFAULT 0,
  last_recommended_at TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_platforms ON resources USING GIN(platforms);
CREATE INDEX idx_resources_url ON resources(url);
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_resources_recommendation_score ON resources(recommendation_score DESC);
CREATE INDEX idx_resources_total_interactions ON resources(total_interactions DESC);
```

### 2. user_interactions 테이블 (사용자 행동 추적)

```sql
-- 사용자 행동 추적 테이블
CREATE TABLE user_interactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255), -- 세션 ID 또는 사용자 ID
  resource_id VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL, -- 'view', 'copy', 'run', 'favorite', 'share', 'click'
  interaction_data JSONB, -- 추가 컨텍스트 데이터
  search_query TEXT, -- 검색 쿼리 (있는 경우)
  role VARCHAR(50), -- 사용자 역할 (frontend, backend 등)
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255), -- 세션 추적
  user_agent TEXT,
  referrer TEXT,
  
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_user_interactions_resource_id ON user_interactions(resource_id);
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_role ON user_interactions(role);
```

### 3. resource_history 테이블 (도구 이력)

```sql
-- 도구 수집 및 변경 이력 테이블
CREATE TABLE resource_history (
  id VARCHAR(255) PRIMARY KEY,
  resource_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'verified', 'broken', 'fixed'
  changes JSONB, -- 변경 사항 (before/after)
  source VARCHAR(100), -- 변경 소스 ('user', 'auto-research', 'link-health-check' 등)
  metadata JSONB, -- 추가 메타데이터
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_resource_history_resource_id ON resource_history(resource_id);
CREATE INDEX idx_resource_history_action ON resource_history(action);
CREATE INDEX idx_resource_history_timestamp ON resource_history(timestamp DESC);
CREATE INDEX idx_resource_history_source ON resource_history(source);
```

### 4. recommendation_models 테이블 (강화학습 모델)

```sql
-- AI 강화학습 모델 저장 테이블
CREATE TABLE recommendation_models (
  id VARCHAR(255) PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  model_type VARCHAR(50) NOT NULL, -- 'reinforcement-learning', 'collaborative-filtering' 등
  model_data JSONB NOT NULL, -- 모델 파라미터 및 가중치
  version INTEGER DEFAULT 1,
  training_episodes INTEGER DEFAULT 0,
  average_reward DECIMAL(10, 4),
  best_score DECIMAL(10, 4),
  training_data JSONB, -- 학습 데이터 요약
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- 인덱스
CREATE INDEX idx_recommendation_models_name ON recommendation_models(model_name);
CREATE INDEX idx_recommendation_models_active ON recommendation_models(is_active) WHERE is_active = true;
```

### 5. recommendation_log 테이블 (추천 로그)

```sql
-- AI 추천 로그 테이블
CREATE TABLE recommendation_log (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  query TEXT, -- 검색 쿼리
  role VARCHAR(50), -- 사용자 역할
  recommended_resources TEXT[], -- 추천된 리소스 ID 배열
  recommendation_scores JSONB, -- 각 리소스의 추천 점수
  model_id VARCHAR(255), -- 사용된 모델 ID
  context JSONB, -- 추천 컨텍스트 (검색어, 필터 등)
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (model_id) REFERENCES recommendation_models(id) ON DELETE SET NULL
);

-- 인덱스
CREATE INDEX idx_recommendation_log_user_id ON recommendation_log(user_id);
CREATE INDEX idx_recommendation_log_session_id ON recommendation_log(session_id);
CREATE INDEX idx_recommendation_log_timestamp ON recommendation_log(timestamp DESC);
CREATE INDEX idx_recommendation_log_model_id ON recommendation_log(model_id);
```

### 6. feedback 테이블 (피드백)

```sql
-- 사용자 피드백 테이블
CREATE TABLE feedback (
  id VARCHAR(255) PRIMARY KEY,
  recommendation_id VARCHAR(255), -- recommendation_log의 ID
  resource_id VARCHAR(255),
  user_id VARCHAR(255),
  feedback_type VARCHAR(50) NOT NULL, -- 'positive', 'negative', 'neutral'
  feedback_value INTEGER, -- 1-5 점수
  feedback_text TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (recommendation_id) REFERENCES recommendation_log(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_feedback_recommendation_id ON feedback(recommendation_id);
CREATE INDEX idx_feedback_resource_id ON feedback(resource_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_timestamp ON feedback(timestamp DESC);
```

### 7. activity_log 테이블 (활동 로그 - 기존 확장)

```sql
-- 활동 로그 테이블 (기존 확장)
CREATE TABLE activity_log (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  resource_id VARCHAR(255),
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  metadata JSONB,
  
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX idx_activity_log_resource_id ON activity_log(resource_id);
CREATE INDEX idx_activity_log_type ON activity_log(type);
```

## 뷰 (Views)

### 인기 리소스 뷰

```sql
CREATE VIEW popular_resources AS
SELECT 
  r.*,
  COUNT(DISTINCT ui.id) as interaction_count,
  COUNT(DISTINCT CASE WHEN ui.interaction_type = 'run' THEN ui.id END) as run_count,
  COUNT(DISTINCT CASE WHEN ui.interaction_type = 'favorite' THEN ui.id END) as favorite_count,
  AVG(f.feedback_value) as average_rating,
  r.recommendation_score
FROM resources r
LEFT JOIN user_interactions ui ON r.id = ui.resource_id
LEFT JOIN feedback f ON r.id = f.resource_id
GROUP BY r.id
ORDER BY r.recommendation_score DESC, interaction_count DESC;
```

### 역할별 추천 리소스 뷰

```sql
CREATE VIEW role_recommendations AS
SELECT 
  r.*,
  ui.role,
  COUNT(DISTINCT ui.id) as role_interaction_count,
  AVG(CASE WHEN ui.role = r.platforms[1] THEN 1 ELSE 0 END) as role_match_score
FROM resources r
LEFT JOIN user_interactions ui ON r.id = ui.resource_id
WHERE ui.role IS NOT NULL
GROUP BY r.id, ui.role
ORDER BY role_match_score DESC, role_interaction_count DESC;
```

## 함수 (Functions)

### 추천 점수 업데이트 함수

```sql
CREATE OR REPLACE FUNCTION update_recommendation_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources
  SET 
    recommendation_score = (
      -- 상호작용 가중치
      (SELECT COUNT(*) * 0.3 FROM user_interactions WHERE resource_id = NEW.resource_id) +
      -- 성공 사용 가중치
      (SELECT COUNT(*) * 0.5 FROM user_interactions WHERE resource_id = NEW.resource_id AND interaction_type = 'run') +
      -- 피드백 가중치
      (SELECT COALESCE(AVG(feedback_value), 0) * 0.2 FROM feedback WHERE resource_id = NEW.resource_id) +
      -- 기본 점수
      (SELECT COALESCE(stars, 0) * 0.001 FROM resources WHERE id = NEW.resource_id)
    ),
    total_interactions = (
      SELECT COUNT(*) FROM user_interactions WHERE resource_id = NEW.resource_id
    ),
    successful_uses = (
      SELECT COUNT(*) FROM user_interactions 
      WHERE resource_id = NEW.resource_id 
      AND interaction_type = 'run'
    ),
    last_recommended_at = NOW()
  WHERE id = NEW.resource_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_update_recommendation_score
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_score();
```

## 마이그레이션 스크립트

```sql
-- 기존 테이블이 있는 경우 마이그레이션
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS recommendation_score DECIMAL(10, 4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_interactions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS successful_uses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_uses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_recommended_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS meta JSONB;
```

