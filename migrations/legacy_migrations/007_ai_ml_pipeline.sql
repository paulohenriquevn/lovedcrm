-- =============================================
-- 007_ai_ml_pipeline.sql  
-- AI/ML Pipeline Tables
-- Sistema: Next.js 14 + FastAPI + PostgreSQL
-- AI: OpenAI GPT-4 + Organization-specific learning
-- =============================================

\echo '🤖 Creating AI/ML pipeline tables...'

-- OpenAI GPT-4 conversation history
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    messages JSONB NOT NULL, -- OpenAI conversation format
    qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
    handoff_triggered BOOLEAN DEFAULT FALSE,
    handoff_reason VARCHAR(100),
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,6), -- OpenAI API cost tracking
    model_used VARCHAR(50) DEFAULT 'gpt-4', -- gpt-4, gpt-3.5-turbo, etc
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_handoff_reason CHECK (handoff_reason IN ('qualified', 'unqualified', 'user_request', 'timeout', 'error', 'custom'))
);

-- Indexes para AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_lead ON ai_conversations(organization_id, lead_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_session ON ai_conversations(organization_id, session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_org_created ON ai_conversations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_handoff ON ai_conversations(organization_id, handoff_triggered, qualification_score);

\echo '✅ AI conversations table created'

-- Dataset organization-specific para ML learning
CREATE TABLE IF NOT EXISTS ai_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    data_type VARCHAR(50) NOT NULL, -- lead_qualification, sentiment, scoring, response_prediction
    input_data JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    actual_output JSONB,
    feedback_score DECIMAL(3,2) CHECK (feedback_score >= 0.0 AND feedback_score <= 1.0),
    feedback_source VARCHAR(50), -- human, automatic, system
    model_version VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_data_type CHECK (data_type IN ('lead_qualification', 'sentiment', 'scoring', 'response_prediction', 'intent_classification', 'custom')),
    CONSTRAINT valid_feedback_source CHECK (feedback_source IN ('human', 'automatic', 'system', 'a_b_test'))
);

-- Indexes para training data
CREATE INDEX IF NOT EXISTS idx_ai_training_org_type ON ai_training_data(organization_id, data_type);
CREATE INDEX IF NOT EXISTS idx_ai_training_org_created ON ai_training_data(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_training_feedback ON ai_training_data(organization_id, feedback_score DESC);

\echo '✅ AI training data table created'

-- Modelos ML organizacionais
CREATE TABLE IF NOT EXISTS lead_scoring_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_config JSONB, -- hyperparameters, features, etc
    training_data_count INTEGER DEFAULT 0,
    accuracy_score DECIMAL(5,4) CHECK (accuracy_score >= 0.0000 AND accuracy_score <= 1.0000),
    precision_score DECIMAL(5,4) CHECK (precision_score >= 0.0000 AND precision_score <= 1.0000),
    recall_score DECIMAL(5,4) CHECK (recall_score >= 0.0000 AND recall_score <= 1.0000),
    f1_score DECIMAL(5,4) CHECK (f1_score >= 0.0000 AND f1_score <= 1.0000),
    is_active BOOLEAN DEFAULT FALSE,
    trained_at TIMESTAMPTZ,
    last_prediction_at TIMESTAMPTZ,
    predictions_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_org_active_model UNIQUE (organization_id, model_name, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes para scoring models
CREATE INDEX IF NOT EXISTS idx_lead_scoring_models_org_id ON lead_scoring_models(organization_id);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_models_org_active ON lead_scoring_models(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_lead_scoring_models_accuracy ON lead_scoring_models(organization_id, accuracy_score DESC);

\echo '✅ Lead scoring models table created'

-- Update schema version
INSERT INTO schema_versions (version, description) 
VALUES (7, 'AI/ML pipeline tables: ai_conversations, ai_training_data, lead_scoring_models')
ON CONFLICT (version) DO NOTHING;

\echo '🤖 AI/ML pipeline tables completed!'