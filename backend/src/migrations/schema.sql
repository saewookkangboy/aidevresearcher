-- Vibe Coding Navigator PostgreSQL 스키마
-- Railway PostgreSQL 데이터베이스 마이그레이션

-- 1. resources 테이블 (기존 + 확장)
CREATE TABLE IF NOT EXISTS resources (
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
  meta JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_checked_at TIMESTAMP,
  recommendation_score DECIMAL(10, 4) DEFAULT 0.0,
  total_interactions INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  failed_uses INTEGER DEFAULT 0,
  last_recommended_at TIMESTAMP
);

-- resources 인덱스
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_resources_platforms ON resources USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_resources_url ON resources(url);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_recommendation_score ON resources(recommendation_score DESC);
CREATE INDEX IF NOT EXISTS idx_resources_total_interactions ON resources(total_interactions DESC);

-- 2. user_interactions 테이블
CREATE TABLE IF NOT EXISTS user_interactions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  resource_id VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_data JSONB,
  search_query TEXT,
  role VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- user_interactions 인덱스
CREATE INDEX IF NOT EXISTS idx_user_interactions_resource_id ON user_interactions(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_role ON user_interactions(role);

-- 3. resource_history 테이블
CREATE TABLE IF NOT EXISTS resource_history (
  id VARCHAR(255) PRIMARY KEY,
  resource_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  source VARCHAR(100),
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- resource_history 인덱스
CREATE INDEX IF NOT EXISTS idx_resource_history_resource_id ON resource_history(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_history_action ON resource_history(action);
CREATE INDEX IF NOT EXISTS idx_resource_history_timestamp ON resource_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_resource_history_source ON resource_history(source);

-- 4. recommendation_models 테이블
CREATE TABLE IF NOT EXISTS recommendation_models (
  id VARCHAR(255) PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  model_type VARCHAR(50) NOT NULL,
  model_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  training_episodes INTEGER DEFAULT 0,
  average_reward DECIMAL(10, 4),
  best_score DECIMAL(10, 4),
  training_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false
);

-- recommendation_models 인덱스
CREATE INDEX IF NOT EXISTS idx_recommendation_models_name ON recommendation_models(model_name);
CREATE INDEX IF NOT EXISTS idx_recommendation_models_active ON recommendation_models(is_active) WHERE is_active = true;

-- 5. recommendation_log 테이블
CREATE TABLE IF NOT EXISTS recommendation_log (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  query TEXT,
  role VARCHAR(50),
  recommended_resources TEXT[],
  recommendation_scores JSONB,
  model_id VARCHAR(255),
  context JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (model_id) REFERENCES recommendation_models(id) ON DELETE SET NULL
);

-- recommendation_log 인덱스
CREATE INDEX IF NOT EXISTS idx_recommendation_log_user_id ON recommendation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_log_session_id ON recommendation_log(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_log_timestamp ON recommendation_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_log_model_id ON recommendation_log(model_id);

-- 6. feedback 테이블
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(255) PRIMARY KEY,
  recommendation_id VARCHAR(255),
  resource_id VARCHAR(255),
  user_id VARCHAR(255),
  feedback_type VARCHAR(50) NOT NULL,
  feedback_value INTEGER,
  feedback_text TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (recommendation_id) REFERENCES recommendation_log(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- feedback 인덱스
CREATE INDEX IF NOT EXISTS idx_feedback_recommendation_id ON feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_feedback_resource_id ON feedback(resource_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON feedback(timestamp DESC);

-- 7. activity_log 테이블
CREATE TABLE IF NOT EXISTS activity_log (
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

-- activity_log 인덱스
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource_id ON activity_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);

-- 추천 점수 업데이트 함수
CREATE OR REPLACE FUNCTION update_recommendation_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources
  SET 
    recommendation_score = (
      (SELECT COUNT(*) * 0.3 FROM user_interactions WHERE resource_id = NEW.resource_id) +
      (SELECT COUNT(*) * 0.5 FROM user_interactions WHERE resource_id = NEW.resource_id AND interaction_type = 'run') +
      (SELECT COALESCE(AVG(feedback_value), 0) * 0.2 FROM feedback WHERE resource_id = NEW.resource_id) +
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
DROP TRIGGER IF EXISTS trigger_update_recommendation_score ON user_interactions;
CREATE TRIGGER trigger_update_recommendation_score
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_recommendation_score();

