-- Git Aquarium Full Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- Phase 1: Core Tables
-- ============================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aquarium Snapshots
CREATE TABLE IF NOT EXISTS aquarium_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  fish_count INTEGER NOT NULL,
  total_stars INTEGER DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(username, snapshot_date)
);

-- ============================================
-- Phase 3: Social Tables
-- ============================================

-- Leaderboard (materialized view pattern)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'stars', 'fish', 'legendary', 'active'
  period TEXT NOT NULL DEFAULT 'all_time',  -- 'all_time', 'monthly', 'weekly'
  rank INTEGER NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(username, category, period)
);

-- Visits (guest fish system)
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID NOT NULL REFERENCES users(id),
  host_username TEXT NOT NULL,
  visitor_fish JSONB NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kudos (feed fish)
CREATE TABLE IF NOT EXISTS kudos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  giver_id UUID NOT NULL REFERENCES users(id),
  receiver_username TEXT NOT NULL,
  fish_id TEXT NOT NULL,
  kudo_type TEXT NOT NULL,       -- 'star', 'bug', 'idea'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reports (content moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID,
  target_type TEXT NOT NULL,     -- 'guestbook', 'username', 'content'
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Phase 4: Realtime Events
-- ============================================

CREATE TABLE IF NOT EXISTS aquarium_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(github_username);
CREATE INDEX IF NOT EXISTS idx_snapshots_user ON aquarium_snapshots(username, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON aquarium_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cat ON leaderboard(category, period, rank);
CREATE INDEX IF NOT EXISTS idx_visits_host ON visits(host_username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_visitor ON visits(visitor_id, host_username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kudos_receiver ON kudos(receiver_username, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kudos_giver_day ON kudos(giver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_user ON aquarium_events(username, created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquarium_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquarium_events ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read snapshots" ON aquarium_snapshots FOR SELECT USING (true);
CREATE POLICY "Public read leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read visits" ON visits FOR SELECT USING (true);
CREATE POLICY "Public read kudos" ON kudos FOR SELECT USING (true);
CREATE POLICY "Public read events" ON aquarium_events FOR SELECT USING (true);

-- Service role write
CREATE POLICY "Service write users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Service write snapshots" ON aquarium_snapshots FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write leaderboard" ON leaderboard FOR ALL USING (true);
CREATE POLICY "Service write visits" ON visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write kudos" ON kudos FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Service write events" ON aquarium_events FOR INSERT WITH CHECK (true);

-- ============================================
-- Realtime (enable for live features)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE aquarium_events;
