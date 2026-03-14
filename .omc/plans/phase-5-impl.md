# Phase 5: 게이미피케이션 — "바다를 키우다" (8주)

## 1. 개요

**목표:** 업적, 시즌 이벤트, 퀘스트, 커스터마이징으로 리텐션 극대화, 도감 105종 완성
**기간:** 8주
**태스크 수:** 11개 | **실행 배치:** 4개
**전제조건:** Phase 4 완료, Supabase DB 확장

---

## 2. 환경 사전조건

- Phase 4까지의 모든 인프라 동작 확인
- Supabase에 새 테이블 생성 권한
- 시즌 이벤트용 추가 GLB 모델/텍스처 (선택적)

---

## 3. Supabase 테이블 스키마

```sql
-- 업적 정의 (정적 데이터, seed)
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,                -- 'first_splash', 'diverse_ocean', etc.
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  condition_type TEXT NOT NULL,       -- 'aquarium_created', 'language_count', etc.
  condition_value INTEGER NOT NULL,   -- 임계값
  reward_type TEXT NOT NULL,          -- 'theme', 'badge', 'effect', 'frame'
  reward_id TEXT NOT NULL,            -- 해제되는 보상 ID
  icon TEXT NOT NULL,                 -- emoji 또는 아이콘 키
  sort_order INTEGER DEFAULT 0
);

-- 유저 업적 (해제 기록)
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- 시즌 정의
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,                -- 'spring_2026', 'summer_2026'
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  theme_id TEXT NOT NULL,             -- 테마 키
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  species_ids TEXT[] DEFAULT '{}',    -- 한정 종 목록
  is_active BOOLEAN DEFAULT false
);

-- 퀘스트 정의
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                 -- 'daily', 'weekly', 'challenge'
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ko TEXT NOT NULL,
  condition_type TEXT NOT NULL,       -- 'commit_count', 'new_repo', 'visit_count'
  condition_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  season_id TEXT REFERENCES seasons(id),  -- NULL = 상시
  is_active BOOLEAN DEFAULT true
);

-- 유저 퀘스트 진행
CREATE TABLE user_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id TEXT REFERENCES quests(id),
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed_at TIMESTAMPTZ,
  reset_at TIMESTAMPTZ,              -- daily/weekly 리셋 시점
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 커스터마이징 아이템 정의
CREATE TABLE customizations (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,             -- 'background', 'decoration', 'lighting', 'frame'
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  preview_url TEXT,                   -- 미리보기 이미지
  unlock_method TEXT NOT NULL,        -- 'achievement', 'season', 'kudos', 'default'
  unlock_ref TEXT,                    -- 연결된 업적/시즌/쿠도스 ID
  sort_order INTEGER DEFAULT 0
);

-- 유저 커스터마이징 설정
CREATE TABLE user_customizations (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  background_id TEXT REFERENCES customizations(id) DEFAULT 'default_bg',
  decoration_ids TEXT[] DEFAULT '{}',
  lighting_id TEXT REFERENCES customizations(id) DEFAULT 'default_light',
  frame_id TEXT REFERENCES customizations(id) DEFAULT 'default_frame',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 정책
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own quests"
  ON user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read/update own customizations"
  ON user_customizations FOR ALL USING (auth.uid() = user_id);

-- 공개 읽기 (다른 유저의 업적/커스터마이징 조회)
CREATE POLICY "Anyone can read achievements definitions"
  ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can read customization definitions"
  ON customizations FOR SELECT USING (true);
CREATE POLICY "Anyone can read seasons"
  ON seasons FOR SELECT USING (true);
```

---

## 4. TypeScript 인터페이스

```typescript
// src/types/gamification.ts

// ===== 업적 =====
interface Achievement {
  id: string
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
  conditionType: AchievementCondition
  conditionValue: number
  rewardType: 'theme' | 'badge' | 'effect' | 'frame'
  rewardId: string
  icon: string
}

type AchievementCondition =
  | 'aquarium_created' // First Splash: 1
  | 'language_count' // Diverse Ocean: 5
  | 'fossil_count' // Fossil Hunter: 10
  | 'total_stars' // Star Collector: 100
  | 'commit_streak' // Commit Streak: 30
  | 'visit_count' // Deep Diver: 50
  | 'social_visits' // Social Butterfly: 10
  | 'legendary_count' // Legendary Tamer: 1
  | 'codex_percent' // Codex Master: 80
  | 'all_achievements' // Ocean King: 9 (모든 다른 업적)

interface UserAchievement {
  achievementId: string
  unlockedAt: string
}

// 10개 업적 정의
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_splash',
    nameEn: 'First Splash',
    nameKo: '첫 물결',
    descriptionEn: 'Create your first aquarium',
    descriptionKo: '첫 수족관을 생성하세요',
    conditionType: 'aquarium_created',
    conditionValue: 1,
    rewardType: 'theme',
    rewardId: 'basic_theme',
    icon: '🌊',
  },
  {
    id: 'diverse_ocean',
    nameEn: 'Diverse Ocean',
    nameKo: '다양한 바다',
    descriptionEn: 'Own fish from 5+ languages',
    descriptionKo: '5개 이상 언어의 물고기를 보유하세요',
    conditionType: 'language_count',
    conditionValue: 5,
    rewardType: 'badge',
    rewardId: 'diversity_badge',
    icon: '🌈',
  },
  {
    id: 'fossil_hunter',
    nameEn: 'Fossil Hunter',
    nameKo: '화석 사냥꾼',
    descriptionEn: 'Have 10+ fossil fish',
    descriptionKo: '화석 물고기 10마리 이상 보유',
    conditionType: 'fossil_count',
    conditionValue: 10,
    rewardType: 'theme',
    rewardId: 'ancient_seabed',
    icon: '🦴',
  },
  {
    id: 'star_collector',
    nameEn: 'Star Collector',
    nameKo: '별빛 수집가',
    descriptionEn: 'Accumulate 100+ total stars',
    descriptionKo: '총 스타 100개 이상 획득',
    conditionType: 'total_stars',
    conditionValue: 100,
    rewardType: 'effect',
    rewardId: 'enhanced_starlight',
    icon: '⭐',
  },
  {
    id: 'commit_streak',
    nameEn: 'Commit Streak',
    nameKo: '연속 커밋',
    descriptionEn: '30-day commit streak',
    descriptionKo: '30일 연속 커밋',
    conditionType: 'commit_streak',
    conditionValue: 30,
    rewardType: 'effect',
    rewardId: 'current_effect',
    icon: '🔥',
  },
  {
    id: 'deep_diver',
    nameEn: 'Deep Diver',
    nameKo: '심해 다이버',
    descriptionEn: 'Visit aquarium 50+ times',
    descriptionKo: '수족관 50회 이상 방문',
    conditionType: 'visit_count',
    conditionValue: 50,
    rewardType: 'theme',
    rewardId: 'deep_sea_theme',
    icon: '🤿',
  },
  {
    id: 'social_butterfly',
    nameEn: 'Social Butterfly',
    nameKo: '사교적 나비',
    descriptionEn: 'Visit 10+ different aquariums',
    descriptionKo: '10명 이상의 수족관 방문',
    conditionType: 'social_visits',
    conditionValue: 10,
    rewardType: 'decoration',
    rewardId: 'rainbow_coral',
    icon: '🦋',
  },
  {
    id: 'legendary_tamer',
    nameEn: 'Legendary Tamer',
    nameKo: '전설의 조련사',
    descriptionEn: 'Own 1+ legendary fish',
    descriptionKo: '전설급 물고기 1마리 이상 보유',
    conditionType: 'legendary_count',
    conditionValue: 1,
    rewardType: 'frame',
    rewardId: 'golden_frame',
    icon: '👑',
  },
  {
    id: 'codex_master',
    nameEn: 'Codex Master',
    nameKo: '도감 마스터',
    descriptionEn: 'Complete 80%+ of the codex',
    descriptionKo: '도감 80% 이상 완성',
    conditionType: 'codex_percent',
    conditionValue: 80,
    rewardType: 'badge',
    rewardId: 'codex_master_title',
    icon: '📖',
  },
  {
    id: 'ocean_king',
    nameEn: 'Ocean King',
    nameKo: '바다의 왕',
    descriptionEn: 'Unlock all other achievements',
    descriptionKo: '모든 업적 달성',
    conditionType: 'all_achievements',
    conditionValue: 9,
    rewardType: 'decoration',
    rewardId: 'crown_skin',
    icon: '🏆',
  },
]

// ===== 시즌 =====
interface SeasonConfig {
  id: string
  nameEn: string
  nameKo: string
  themeId: string
  startDate: string // ISO date
  endDate: string
  speciesIds: string[] // 한정 종
  isActive: boolean
}

// ===== 퀘스트 =====
type QuestType = 'daily' | 'weekly' | 'challenge'

interface Quest {
  id: string
  type: QuestType
  nameEn: string
  nameKo: string
  descriptionEn: string
  descriptionKo: string
  conditionType: string
  conditionValue: number
  rewardType: string
  rewardId: string
  seasonId: string | null
}

interface UserQuest {
  questId: string
  progress: number
  target: number
  completedAt: string | null
  resetAt: string | null
}

// ===== 커스터마이징 =====
type CustomizationCategory = 'background' | 'decoration' | 'lighting' | 'frame'

interface Customization {
  id: string
  category: CustomizationCategory
  nameEn: string
  nameKo: string
  previewUrl: string | null
  unlockMethod: 'achievement' | 'season' | 'kudos' | 'default'
  unlockRef: string | null
}

interface UserCustomization {
  backgroundId: string
  decorationIds: string[]
  lightingId: string
  frameId: string
}

// ===== 바닥재 =====
type SubstrateType = 'sand' | 'gravel' | 'volcanic'

interface SubstrateConfig {
  type: SubstrateType
  nameEn: string
  nameKo: string
  unlockMethod: 'default' | 'achievement'
  unlockRef: string | null // 관련 업적 ID
  materialKey: string // Three.js MeshStandardMaterial 키
  bumpScale: number // 지형 요철 강도 0-1
  color: string // 기본 색조 (hex)
}

// ===== 시즌 특수 이벤트 =====
interface SpecialEventConfig {
  id: string // 'hacktoberfest_2026', 'github_universe_2026'
  nameEn: string
  nameKo: string
  activePeriod: {
    startDate: string // ISO date (예: '2026-10-01')
    endDate: string // ISO date (예: '2026-10-31')
  }
  triggerCondition: {
    type: 'pr_count' | 'flag' // hacktoberfest: pr_count, universe: flag
    value: number | null // pr_count: 4, flag: null
  }
  rewardSpeciesId: string // 출현하는 특별 종 ID
  isActive: boolean // 어드민 플래그로 수동 제어 가능
  speciesRetainedAfterEnd: boolean // 시즌 종료 후 도감 유지 여부
}

// ===== 도감 v2 =====
interface CodexV2Entry {
  id: string
  species: string
  evolutionStage: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  isSecret: boolean
  seasonId: string | null // 시즌 한정 여부
  discoveredAt: string | null
  sightedAt: string | null // 다른 수족관에서 목격
}
```

---

## 5. 실행 배치

### Batch 5-1: 업적 + 시즌 프레임워크 (2개, 순차)

#### P5-01: 업적 시스템 (10개 업적)

**목적:** 10개 업적 조건 체크, DB 저장, 해제 트리거

**파일:**

- `src/lib/gamification/achievements.ts` (생성)
- `src/lib/gamification/achievement-checker.ts` (생성)
- `src/lib/gamification/types.ts` (생성)
- `tests/unit/achievements.test.ts` (생성)

**구현 상세:**

```typescript
// src/lib/gamification/achievement-checker.ts

async function checkAchievements(
  userId: string,
  aquariumData: AquariumData,
  userStats: UserStats,
): Promise<Achievement[]> {
  const unlocked = await getUserAchievements(userId)
  const unlockedIds = new Set(unlocked.map((a) => a.achievementId))
  const newlyUnlocked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue

    const met = evaluateCondition(
      achievement.conditionType,
      achievement.conditionValue,
      aquariumData,
      userStats,
    )

    if (met) {
      await saveAchievement(userId, achievement.id)
      newlyUnlocked.push(achievement)
    }
  }

  return newlyUnlocked
}

function evaluateCondition(
  type: AchievementCondition,
  value: number,
  data: AquariumData,
  stats: UserStats,
): boolean {
  switch (type) {
    case 'aquarium_created':
      return stats.aquariumsCreated >= value
    case 'language_count':
      return (
        new Set(data.fish.map((f) => f.language).filter(Boolean)).size >= value
      )
    case 'fossil_count':
      return (
        data.fish.filter((f) => f.evolutionStage === 'fossil').length >= value
      )
    case 'total_stars':
      return data.fish.reduce((sum, f) => sum + f.stars, 0) >= value
    case 'commit_streak':
      return stats.currentStreak >= value
    case 'visit_count':
      return stats.totalVisits >= value
    case 'social_visits':
      return stats.uniqueAquariumsVisited >= value
    case 'legendary_count':
      return (
        data.fish.filter((f) => f.evolutionStage === 'legendary').length >=
        value
      )
    case 'codex_percent':
      return stats.codexCompletion >= value
    case 'all_achievements':
      return stats.achievementCount >= value
  }
}
```

- 업적 체크 트리거: 수족관 페이지 로드 시, Webhook 이벤트 수신 시
- 새 업적 해제 시 `achievement_unlocked` 이벤트 발생 → Phase 4 이벤트 시스템 연동
- DB seed 스크립트로 10개 업적 데이터 삽입

**검증:**

```bash
pnpm test -- achievements
# 각 조건별 경계값 테스트
# - language_count: 4 → false, 5 → true
# - fossil_count: 9 → false, 10 → true
# - all_achievements: 8 → false, 9 → true
```

#### P5-03: 시즌 이벤트 프레임워크

**목적:** 분기별 한정 테마 & 물고기 종 관리 시스템

**파일:**

- `src/lib/gamification/seasons.ts` (생성)
- `src/lib/gamification/season-species.ts` (생성)

**구현 상세:**

```typescript
// src/lib/gamification/seasons.ts

async function getActiveSeason(): Promise<SeasonConfig | null> {
  const { data } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .single()
  return data
}

function applySeasonTheme(scene: AquariumScene, season: SeasonConfig): void {
  // 시즌별 환경 변경: 배경색, 파티클, 특수 오브젝트
  // spring: 벚꽃 파티클, 핑크 조명
  // summer: 열대 파티클, 강한 조명
  // autumn: 심해 분위기, 어두운 조명
  // winter: 눈 파티클, 차가운 조명
}
```

- 시즌 활성화/비활성화는 날짜 기반 자동 관리
- 시즌 한정 종: species-map에 시즌 필드 추가
- 시즌 종료 후 한정 종은 도감에 "시즌 한정" 태그로 표시

**Hacktoberfest 연동 상세 (PRD P5-F02):**

```typescript
// src/lib/gamification/special-events.ts

async function checkHacktoberfestEligibility(
  username: string,
  year: number,
): Promise<boolean> {
  // GitHub API: 10월 1일~31일 사이 merged PR 개수 조회
  // GET /search/issues?q=author:{username}+type:pr+merged:2026-10-01..2026-10-31
  const { data } = await octokit.rest.search.issuesAndPullRequests({
    q: `author:${username} type:pr merged:${year}-10-01..${year}-10-31`,
  })
  return data.total_count >= 4
}

async function activateHacktoberfestFish(
  userId: string,
  username: string,
): Promise<void> {
  const eligible = await checkHacktoberfestEligibility(
    username,
    new Date().getFullYear(),
  )
  if (!eligible) return

  // Hacktoberfest Fish (주황색 특별 종) 수족관에 추가
  await spawnSpecialFish(userId, 'hacktoberfest_fish')
  // 도감 등록 (시즌 종료 후에도 유지)
  await registerCodexEntry(userId, 'hacktoberfest_fish')
}
```

- 활성 기간: 매년 10월 1일~31일 (`SpecialEventConfig` 기반)
- 조건: 해당 10월 내 PR 4개 이상 merged
- 보상: `hacktoberfest_fish` (주황색, 도트 무늬 특별 종)
- 체크 시점: 10월 중 수족관 페이지 로드 시 + 11월 1일 cron
- 시즌 종료 후 획득한 물고기는 수족관에 유지, 도감에 "Hacktoberfest 2026" 태그

**GitHub Universe 한정 물고기 (PRD P5-F02):**

```typescript
// special_events 테이블에 GitHub Universe 이벤트 등록
// id: 'github_universe_2026'
// activePeriod: 보통 11월 중 컨퍼런스 기간 (어드민이 날짜 설정)
// triggerCondition: { type: 'flag', value: null }  → 어드민이 수동 배포
// rewardSpeciesId: 'universe_fish'
```

- 활성 기간: GitHub Universe 컨퍼런스 기간(보통 11월, 어드민 플래그로 제어)
- 조건: 이벤트 활성 기간 중 수족관 방문 시 자동 출현
- 보상: `universe_fish` (은하 패턴 특별 종)
- 어드민 대시보드(`/admin/seasons`)에서 `is_active` 토글로 제어
- 시즌 종료 후 도감에 "GitHub Universe 2026" 태그로만 남음

**Supabase 테이블 추가:**

```sql
CREATE TABLE special_events (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  trigger_type TEXT NOT NULL,    -- 'pr_count' | 'flag'
  trigger_value INTEGER,         -- pr_count용 임계값
  reward_species_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  species_retained BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_special_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES special_events(id),
  activated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, event_id)
);
```

**검증:**

```bash
pnpm test -- seasons
# 활성 시즌 조회 테스트
# 날짜 범위 검증
# Hacktoberfest PR 카운트 조건 테스트 (3개 → false, 4개 → true)
# GitHub Universe 플래그 활성/비활성 테스트
```

---

### Batch 5-2: 업적 UI + 퀘스트 + 커스터마이징 기반 (4개, 병렬)

#### P5-02: 업적 UI + 해제 애니메이션

**파일:**

- `src/components/ui/AchievementToast.tsx` (생성)
- `src/components/ui/AchievementGallery.tsx` (생성)
- `src/app/[locale]/[username]/achievements/page.tsx` (생성)

**구현 상세:**

- 토스트: 업적 해제 시 화면 중앙 상단에 3초간 표시
  - 아이콘 + 이름 + "업적 해제!" 텍스트
  - Framer Motion: scale 0→1.2→1, opacity 0→1→0 (3초)
  - 금색 테두리 글로우 이펙트
- 갤러리: `/achievements` 페이지
  - 해제된 업적: 컬러 카드 + 해제 날짜
  - 미해제: 흑백 카드 + 조건 힌트
  - 진행률 바 (전체 업적 해제 %)

**검증:**

```bash
pnpm dev
# /en/{username}/achievements 페이지 확인
# 업적 해제 토스트 시뮬레이션
```

#### P5-04: 퀘스트 시스템 (일일/주간/도전)

**파일:**

- `src/lib/gamification/quests.ts` (생성)
- `src/lib/gamification/quest-tracker.ts` (생성)
- `src/components/ui/QuestPanel.tsx` (생성)

**구현 상세:**

```typescript
// src/lib/gamification/quest-tracker.ts

async function updateQuestProgress(
  userId: string,
  conditionType: string,
  incrementBy: number = 1,
): Promise<UserQuest[]> {
  // 해당 conditionType에 맞는 활성 퀘스트 조회
  // progress 증가
  // target 도달 시 completed_at 기록 + 보상 지급
  // 완료된 퀘스트 반환
}

// 일일 리셋: 매일 UTC 00:00
// 주간 리셋: 매주 월요일 UTC 00:00
async function resetDailyQuests(): Promise<void> {
  await supabase
    .from('user_quests')
    .update({
      progress: 0,
      completed_at: null,
      reset_at: new Date().toISOString(),
    })
    .eq('quest_type', 'daily')
    .lt('reset_at', startOfToday())
}
```

- 퀘스트 예시:
  - 일일: "오늘 커밋 3개" → 먹이 보너스
  - 주간: "이번 주 새 레포 1개" → 알 장식
  - 도전: "TypeScript 레포로 만타레이 출현" → 특수 스킨
- UI: 우측 사이드 패널, 접기/펼치기
- 퀘스트 완료 시 업적 체크 트리거

**검증:**

```bash
pnpm test -- quests
# 진행도 업데이트 테스트
# 리셋 로직 테스트
# 보상 지급 테스트
```

#### P5-05: 커스터마이징 — 배경 테마

**파일:**

- `src/lib/customization/backgrounds.ts` (생성)
- `src/engine/customization/BackgroundRenderer.tsx` (생성)
- `src/components/ui/CustomizationPanel.tsx` (생성)

**구현 상세:**

6종 배경:
| ID | 이름 | 비주얼 | 해제 조건 |
|----|------|--------|----------|
| `tropical` | 열대 | 밝은 산호초, 터키색 물, 풍부한 식물 | 기본 |
| `deep_sea` | 심해 | 어두운 배경, 발광 파티클, 안개 | Deep Diver 업적 |
| `coral_reef` | 산호초 | 화려한 산호, 중간 밝기 | Diverse Ocean 업적 |
| `shipwreck` | 난파선 | 침몰한 배, 녹슨 금속, 해초 | Star Collector 업적 |
| `cave` | 수중동굴 | 좁은 공간, 종유석, 은밀한 느낌 | Fossil Hunter 업적 |
| `volcano` | 해저화산 | 용암 빛, 검은 바위, 열수 분출구 | Legendary Tamer 업적 |

```typescript
// src/engine/customization/BackgroundRenderer.tsx
function BackgroundRenderer({ backgroundId }: { backgroundId: string }) {
  const config = BACKGROUND_CONFIGS[backgroundId]

  return (
    <>
      <fog attach="fog" args={[config.fogColor, config.fogNear, config.fogFar]} />
      <ambientLight intensity={config.ambientIntensity} color={config.ambientColor} />
      <directionalLight
        intensity={config.sunIntensity}
        color={config.sunColor}
        position={config.sunPosition}
      />
      {config.particles && <BackgroundParticles config={config.particles} />}
      {config.props && config.props.map((prop) => <SceneProp key={prop.id} {...prop} />)}
    </>
  )
}
```

**검증:**

```bash
pnpm dev
# 각 배경 테마 전환 시각적 확인
# 성능: 각 배경에서 60fps 유지
```

#### P5-09: 쿠도스 마일스톤 보상

**파일:**

- `src/lib/gamification/kudos-milestones.ts` (생성)

**구현 상세:**

| 누적 쿠도스 | 보상                    |
| ----------- | ----------------------- |
| 10          | 기본 장식품 (조개 세트) |
| 50          | 특별 장식품 (보물상자)  |
| 100         | 테마 (네온)             |
| 500         | 프레임 (크리스탈)       |
| 1000        | 전설 장식품 (황금 왕관) |

- Phase 3 쿠도스 시스템과 연동
- 마일스톤 도달 시 자동 해제 + 토스트 알림
- 해제된 아이템은 커스터마이징 패널에서 선택 가능

**검증:**

```bash
pnpm test -- kudos-milestones
```

---

### Batch 5-3: 세부 커스터마이징 (3개, 병렬)

#### P5-06: 커스터마이징 — 장식품 + 바닥재

**파일:**

- `src/engine/customization/Decorations.tsx` (생성)
- `src/engine/customization/decorations/TreasureChest.tsx` (생성)
- `src/engine/customization/decorations/DiverFigure.tsx` (생성)
- `src/engine/customization/decorations/Castle.tsx` (생성)
- `src/engine/customization/decorations/PirateShip.tsx` (생성)
- `src/engine/customization/Terrain.tsx` (업데이트 — 바닥재 머티리얼 교체)
- `src/lib/customization/substrates.ts` (생성)

**구현 상세 — 장식품:**

- 장식품은 수족관 내 특정 위치에 배치 (드래그로 위치 조정 가능)
- 각 장식품은 간단한 애니메이션 포함 (보물상자: 열림/닫힘, 다이버: 호흡 버블)
- 최대 5개 동시 배치
- 위치 정보는 `user_customizations.decoration_ids`와 함께 저장

**구현 상세 — 바닥재 커스터마이징 (PRD P5-F04):**

3종 바닥재:
| ID | 이름 | 텍스처 | 지형 강도 | 해제 조건 |
|----|------|--------|-----------|----------|
| `sand` | 모래 | 밝은 베이지, 부드러운 물결 | 낮음 (0.1) | 기본 (해제 불필요) |
| `gravel` | 자갈 | 회색 반점, 불규칙 돌기 | 중간 (0.3) | Fossil Hunter 업적 |
| `volcanic` | 화산암 | 검은 거친 암석, 붉은 틈새 | 높음 (0.5) | Legendary Tamer 업적 |

```typescript
// src/lib/customization/substrates.ts
const SUBSTRATE_CONFIGS: Record<SubstrateType, SubstrateConfig> = {
  sand: {
    type: 'sand',
    nameEn: 'Sand',
    nameKo: '모래',
    unlockMethod: 'default',
    unlockRef: null,
    materialKey: 'substrate_sand',
    bumpScale: 0.1,
    color: '#D4B896',
  },
  gravel: {
    type: 'gravel',
    nameEn: 'Gravel',
    nameKo: '자갈',
    unlockMethod: 'achievement',
    unlockRef: 'fossil_hunter',
    materialKey: 'substrate_gravel',
    bumpScale: 0.3,
    color: '#8A8A8A',
  },
  volcanic: {
    type: 'volcanic',
    nameEn: 'Volcanic Rock',
    nameKo: '화산암',
    unlockMethod: 'achievement',
    unlockRef: 'legendary_tamer',
    materialKey: 'substrate_volcanic',
    bumpScale: 0.5,
    color: '#2A1A1A',
  },
}

// src/engine/customization/Terrain.tsx 업데이트
// 기존 Terrain 컴포넌트의 MeshStandardMaterial을
// substrateId prop에 따라 동적으로 교체
function Terrain({ substrateId = 'sand' }: { substrateId?: SubstrateType }) {
  const config = SUBSTRATE_CONFIGS[substrateId]
  // 텍스처 로드 + bumpScale 적용
  // MeshStandardMaterial 교체
}
```

- `user_customizations` 테이블에 `substrate_id TEXT DEFAULT 'sand'` 컬럼 추가
- 바닥재 전환 시 1초 페이드 전환 (opacity 보간)
- 커스터마이징 패널에 "바닥재" 섹션 추가 (P5-05와 동일 패널 내)

**Supabase 마이그레이션:**

```sql
ALTER TABLE user_customizations
  ADD COLUMN substrate_id TEXT DEFAULT 'sand';
```

**검증:**

```bash
pnpm dev
# 장식품 배치 및 렌더링 확인
# 드래그 이동 확인
# 5개 제한 확인
# 바닥재 3종 전환 시각적 확인
# 미해제 바닥재 선택 시 잠금 표시 확인
```

#### P5-07: 커스터마이징 — 조명 프리셋

**파일:**

- `src/engine/customization/LightingPresets.tsx` (생성)

**구현 상세:**

| ID          | 이름     | 설정                                              |
| ----------- | -------- | ------------------------------------------------- |
| `normal`    | 일반     | ambient 0.4, directional 1.0, 따뜻한 백색         |
| `neon`      | 네온     | ambient 0.2, 다색 포인트라이트, bloom 강화        |
| `moonlight` | 문라이트 | ambient 0.1, 차가운 파랑 directional, 은은한 안개 |
| `caustic`   | 코스틱   | ambient 0.3, 강화된 코스틱 패턴, 물결 빛          |

- R3F 라이팅 파라미터 프리셋으로 관리
- 전환 시 Framer Motion으로 부드러운 보간 (1초)

**검증:**

```bash
pnpm dev
# 4종 조명 전환 확인
# 전환 애니메이션 확인
```

#### P5-08: 커스터마이징 — 수족관 프레임

**파일:**

- `src/components/ui/AquariumFrame.tsx` (생성)

**구현 상세:**

- HTML/CSS 오버레이로 Canvas 주변 장식 프레임
- 프레임 종류: 없음, 나무, 금속, 크리스탈, 금색, 고대
- CSS `border-image` 또는 SVG overlay
- 프레임은 Canvas 크기에 영향 없음 (외곽 장식만)

**검증:**

```bash
pnpm dev
# 각 프레임 적용 확인
# Canvas 크기 변경 없음 확인
```

---

### Batch 5-4: 도감 v2 완성 (1개, 순차)

#### P5-10: 도감 v2 (105종 완성)

**목적:** 15종×6단계 + 전설5 + 특수10 = 105종 완전한 도감

**파일:**

- `src/lib/codex/codex-v2.ts` (생성)
- `src/lib/codex/species-catalog.ts` (생성)
- `src/app/[locale]/[username]/codex/page.tsx` (업데이트)
- `src/components/ui/CodexGrid.tsx` (생성)
- `src/components/ui/CodexDetail.tsx` (생성)

**구현 상세:**

105종 구성:

- 일반 90종: 15 종류 × 6 단계 (Egg, Fry, Juvenile, Adult, Elder, Fossil)
- 전설 5종: Leviathan, Phoenix Fish, Hydra, Kraken, Narwhal
- 특수 10종: 시즌 한정 (벚꽃새우, 니모, 앵글러피시, 북극고래 × 2 + 이스터에그 6종)

```typescript
// src/lib/codex/species-catalog.ts
const SPECIES_CATALOG: CodexV2Entry[] = [
  // 일반 (90종)
  ...SPECIES_LIST.flatMap((species) =>
    EVOLUTION_STAGES.map((stage) => ({
      id: `${species}_${stage}`,
      species,
      evolutionStage: stage,
      rarity: stage === 'elder' ? 'rare' : stage === 'legendary' ? 'epic' : 'common',
      isSecret: false,
      seasonId: null,
    }))
  ),
  // 전설 (5종)
  { id: 'leviathan', species: 'leviathan', evolutionStage: 'legendary', rarity: 'legendary', ... },
  { id: 'phoenix_fish', species: 'phoenix_fish', ... },
  { id: 'hydra', species: 'hydra', ... },
  { id: 'kraken', species: 'kraken', ... },
  { id: 'narwhal', species: 'narwhal', ... },
  // 특수 (10종)
  { id: 'cherry_shrimp', species: 'cherry_shrimp', seasonId: 'spring_2026', rarity: 'epic', ... },
  // ...
]
```

- 도감 UI: 그리드 레이아웃 (발견/미발견/목격)
- 필터: 종류별, 레어리티별, 시즌별
- 종 상세: 출현 조건, 레어리티, 설명, 최초 발견일
- 완성도 %: 전체 / 일반 / 전설 / 시즌별 분리 표시
- 공유: "내 도감 완성도 N%" 공유 카드

**검증:**

```bash
pnpm dev
# /en/{username}/codex 페이지 확인
# 105종 그리드 렌더링
# 필터 동작
# 완성도 % 계산 정확성
pnpm test -- codex
```

---

## 6. Quality Gate 체크리스트

### 기능

- [ ] 10개 업적 모두 정상 조건 체크 및 해제
- [ ] 업적 해제 토스트 애니메이션 동작
- [ ] 1개 테스트 시즌 배포 및 한정 종 표시
- [ ] Hacktoberfest: 10월 PR 4개 이상 시 주황 물고기 출현 + 도감 등록
- [ ] GitHub Universe: 어드민 플래그 활성 시 은하 물고기 출현
- [ ] 특수 이벤트 종 시즌 종료 후 도감 태그 유지
- [ ] 퀘스트 진행도 추적: 일일/주간/도전 각 1개 이상 동작
- [ ] 일일 퀘스트 UTC 00:00 리셋 확인
- [ ] 6종 배경 테마 시각적 적용
- [ ] 바닥재 3종 전환 (모래/자갈/화산암) + 미해제 잠금 표시
- [ ] 장식품 5개 배치 + 드래그 이동
- [ ] 4종 조명 프리셋 전환
- [ ] 프레임 적용 (Canvas 크기 변화 없음)
- [ ] 도감 v2: 105종 카탈로그 완성, 필터, 상세, 완성도

### 성능

- [ ] 커스터마이징 적용 상태에서 데스크탑 50fps+ 유지
- [ ] 장식품 5개 + 배경 파티클 + 조명 변경 시 성능 저하 없음

### 테스트

- [ ] 업적 조건 경계값 테스트 (10개 × 경계값 2개 = 20 케이스)
- [ ] 퀘스트 리셋 로직 테스트
- [ ] 도감 완성도 계산 테스트
- [ ] Hacktoberfest PR 카운트 경계값 테스트 (3개 → false, 4개 → true)
- [ ] GitHub Universe 플래그 활성/비활성 테스트
- [ ] 바닥재 해제 조건 테스트 (업적 미달 → 잠금)

### 검증 명령어

```bash
pnpm check          # lint + format + typecheck
pnpm test           # unit + integration
pnpm build          # 빌드 성공
```
