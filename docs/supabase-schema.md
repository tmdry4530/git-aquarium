# Supabase DB Schema (D9)

## Phase 1: Minimum Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  github_username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aquarium snapshots (daily)
CREATE TABLE aquarium_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  fish_count INTEGER NOT NULL,
  total_stars INTEGER DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(username, snapshot_date)
);

-- Indexes
CREATE INDEX idx_users_username ON users(github_username);
CREATE INDEX idx_snapshots_user ON aquarium_snapshots(username, snapshot_date);
CREATE INDEX idx_snapshots_date ON aquarium_snapshots(snapshot_date DESC);
```

---

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aquarium_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Users are publicly readable"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Snapshots are publicly readable"
  ON aquarium_snapshots FOR SELECT
  USING (true);

-- Service role only write access (no client-side writes)
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert snapshots"
  ON aquarium_snapshots FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

---

## TypeScript Types (Supabase)

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          github_username: string
          display_name: string | null
          avatar_url: string | null
          last_fetched_at: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      aquarium_snapshots: {
        Row: {
          id: string
          username: string
          snapshot_date: string
          fish_count: number
          total_stars: number
          data: AquariumData
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['aquarium_snapshots']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<
          Database['public']['Tables']['aquarium_snapshots']['Insert']
        >
      }
    }
  }
}
```

---

## Phase Expansion Roadmap

### Phase 2 (Social Features)

```sql
-- Leaderboard cache
CREATE TABLE leaderboard_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,       -- 'most_stars', 'most_fish', 'most_legendary'
  username TEXT NOT NULL,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leaderboard_category ON leaderboard_cache(category, rank);
```

### Phase 3 (Customization)

```sql
-- Fish customization
CREATE TABLE fish_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL,
  custom_color TEXT,
  custom_name TEXT,
  accessory TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, repo_name)
);
```

### Phase 4 (Analytics)

```sql
-- Page view analytics
CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  viewer_ip_hash TEXT,           -- hashed for privacy
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_page_views_username ON page_views(username, viewed_at DESC);
```

---

## Connection Setup

```typescript
// src/lib/cache/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Server-side client (service role)
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Client-side client (anon key — read only)
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

---

## Cache Strategy

Supabase is used as **persistent storage**, not primary cache.

- Primary cache: Upstash Redis (30min TTL for AquariumData)
- Persistent storage: Supabase (daily snapshots for trend data)
- Write path: Server only via service role key (never client-side)
