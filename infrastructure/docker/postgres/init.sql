-- Create databases for each service (schema separation)
CREATE SCHEMA IF NOT EXISTS team_service;
CREATE SCHEMA IF NOT EXISTS interaction_service;
CREATE SCHEMA IF NOT EXISTS analytics_service;
CREATE SCHEMA IF NOT EXISTS user_service;
CREATE SCHEMA IF NOT EXISTS notification_service;

-- Grant permissions
GRANT ALL ON SCHEMA team_service TO ttv_user;
GRANT ALL ON SCHEMA interaction_service TO ttv_user;
GRANT ALL ON SCHEMA analytics_service TO ttv_user;
GRANT ALL ON SCHEMA user_service TO ttv_user;
GRANT ALL ON SCHEMA notification_service TO ttv_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Team Service Tables
CREATE TABLE team_service.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('stream_aligned', 'platform', 'enabling', 'complicated_subsystem')),
    description TEXT,
    cognitive_load DECIMAL(3,2) CHECK (cognitive_load >= 0 AND cognitive_load <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_service.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE team_service.team_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES team_service.teams(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    responsibility_level VARCHAR(50) CHECK (responsibility_level IN ('primary', 'secondary', 'supporting'))
);

-- Interaction Service Tables
CREATE TABLE interaction_service.interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_a_id UUID NOT NULL,
    team_b_id UUID NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('collaboration', 'x_as_a_service', 'facilitating')),
    intensity VARCHAR(20) CHECK (intensity IN ('high', 'medium', 'low')),
    duration_type VARCHAR(20) CHECK (duration_type IN ('temporary', 'permanent')),
    start_date DATE NOT NULL,
    end_date DATE,
    purpose TEXT,
    expected_outcome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interaction_service.interaction_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interaction_id UUID NOT NULL REFERENCES interaction_service.interactions(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Service Tables
CREATE TABLE user_service.organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    subscription_tier VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_service.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    organization_id UUID REFERENCES user_service.organizations(id),
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics Service Tables
CREATE TABLE analytics_service.metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    value DECIMAL,
    metadata JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_service.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    generated_by UUID,
    data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notification Service Tables
CREATE TABLE notification_service.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_teams_organization ON team_service.teams(organization_id);
CREATE INDEX idx_team_members_team ON team_service.team_members(team_id);
CREATE INDEX idx_team_members_user ON team_service.team_members(user_id);
CREATE INDEX idx_interactions_teams ON interaction_service.interactions(team_a_id, team_b_id);
CREATE INDEX idx_interactions_dates ON interaction_service.interactions(start_date, end_date);
CREATE INDEX idx_users_organization ON user_service.users(organization_id);
CREATE INDEX idx_metrics_org_type ON analytics_service.metrics(organization_id, metric_type);
CREATE INDEX idx_notifications_user ON notification_service.notifications(user_id, read_at);