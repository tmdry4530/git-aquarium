# Phase 4: 실시간 — "바다가 숨 쉰다" (6주)

## 1. 개요

**목표:** 정적 스냅샷에서 실시간으로 반응하는 살아있는 바다로 전환
**기간:** 6주
**태스크 수:** 9개 | **실행 배치:** 4개
**전제조건:** Phase 3 완료, GitHub OAuth 설정, Supabase Realtime 활성화

---

## 2. 환경 사전조건

```bash
# Phase 3에서 이미 설정된 항목
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# Phase 4에서 추가 필요
GITHUB_WEBHOOK_SECRET=...            # Webhook 서명 검증용 시크릿
```

- Supabase Realtime 기능 활성화 (프로젝트 설정)
- GitHub OAuth App에 Webhook URL 등록 가능 상태

---

## 3. TypeScript 인터페이스

```typescript
// src/types/webhook.ts

// GitHub Webhook 이벤트 타입
type WebhookEventType =
  | 'push'
  | 'star'
  | 'fork'
  | 'issues_opened'
  | 'issues_closed'
  | 'pull_request_merged'
  | 'pull_request_rejected'
  | 'create_repo'
  | 'delete_repo'
  | 'release'

interface WebhookPayload {
  event: WebhookEventType
  repository: {
    name: string
    full_name: string
    language: string | null
  }
  sender: {
    login: string
    avatar_url: string
  }
  timestamp: string
  details: Record<string, unknown>
}

// 수족관 이벤트로 변환된 형태
type AquariumEventType =
  | 'feed' // Push → 먹이
  | 'starlight' // Star → 별빛 파티클
  | 'birth' // Fork → 알 탄생
  | 'ripple' // Issue opened → 수면 파문
  | 'heal' // Issue closed → 치유
  | 'swim_together' // PR merged → 함께 수영
  | 'flee' // PR rejected → 도망
  | 'egg_spawn' // New repo → 알 생성
  | 'dissolve' // Repo deleted → 빛으로 소멸
  | 'level_up' // Release → 레벨업 빛 기둥

interface AquariumEvent {
  id: string
  type: AquariumEventType
  fishId: string | null // 관련 물고기 ID (없을 수 있음)
  repoName: string
  username: string
  message: string // 피드에 표시할 메시지
  timestamp: string
  metadata: Record<string, unknown>
}

// 이벤트 애니메이션 설정
interface EventAnimation {
  type: AquariumEventType
  duration: number // ms
  particleCount: number
  color: string // hex
  intensity: number // 0-1
  sound: string | null // 사운드 키
}

// 이벤트 피드 아이템
interface EventFeedItem {
  id: string
  icon: string // emoji
  message: string
  timestamp: string
  isNew: boolean
}

// 라이브 모드 설정
interface LiveModeConfig {
  showClock: boolean
  showEventFeed: boolean
  showMinimalHUD: boolean
  autoHideUI: boolean // 10초 비활동 시 UI 숨김
  autoHideDelay: number // ms
  obsMode: boolean // OBS 캡처용 투명 배경 + 최소 UI
  chromaKeyColor: string | null // 크로마키 배경색 (null = 투명)
}

// 연말 리캡 (Spotify Wrapped 스타일)
interface YearRecapData {
  year: number
  username: string
  newFishCount: number // 올해 새로 태어난 물고기 수
  topGrownFish: {
    // 가장 성장한 물고기 (커밋 증가량)
    fishId: string
    repoName: string
    commitGrowth: number
  }
  totalKudos: number // 올해 받은 총 쿠도스
  languageDistribution: Record<string, number> // 언어별 비중 %
  peakActivityMonth: number // 1-12
  achievementsUnlocked: string[] // 올해 해제한 업적 ID 목록
  mostActiveRepo: string
}

interface RecapCard {
  id: string
  title: string
  content: YearRecapData
  shareImageUrl: string | null // 생성된 공유 이미지 URL
}

// 시간 여행
interface TimelineSnapshot {
  id: string
  username: string
  timestamp: string
  fishCount: number
  topLanguages: string[]
  totalStars: number
  data: AquariumData // Phase 1의 AquariumData 재사용
}

interface TimeTravelState {
  isActive: boolean
  currentDate: string // ISO date
  snapshots: TimelineSnapshot[]
  playbackSpeed: number // 1x, 2x, 4x
  isPlaying: boolean
}
```

---

## 4. Webhook 이벤트→수족관 매핑 테이블

| GitHub 이벤트           | 수족관 이벤트   | 시각 효과                                              | 사운드      |
| ----------------------- | --------------- | ------------------------------------------------------ | ----------- |
| `push` (커밋)           | `feed`          | 물고기가 먹이 먹음, 크기 미세 증가 이펙트, 초록 파티클 | 먹는 소리   |
| `star` received         | `starlight`     | 물고기 주변 별빛 파티클 폭발 (금색, 2초)               | 반짝임      |
| `fork`                  | `birth`         | 작은 치어가 알에서 부화 애니메이션                     | 거품 소리   |
| `issues` opened         | `ripple`        | 수면에 파문 + 이슈 아이콘(🔴) 부유                     | 물방울      |
| `issues` closed         | `heal`          | 파문 사라짐 + 초록 치유 파티클                         | 힐링 톤     |
| `pull_request` merged   | `swim_together` | 두 물고기가 3초간 함께 헤엄                            | 화음        |
| `pull_request` rejected | `flee`          | 물고기가 잠시 빠르게 방향 전환                         | 물살 소리   |
| `create` (repo)         | `egg_spawn`     | 알이 해저에서 빛과 함께 생성                           | 생성 효과음 |
| `delete` (repo)         | `dissolve`      | 물고기가 빛 파티클로 분해되어 소멸                     | 페이드      |
| `release` published     | `level_up`      | 물고기 위로 빛 기둥 + 레벨업 이펙트                    | 팡파레      |

---

## 5. 실행 배치

### Batch 4-1: Webhook 수신기 (1개, 순차)

#### P4-01: GitHub Webhook 수신기

**목적:** GitHub Webhook 이벤트를 수신하고 서명을 검증하는 API 라우트

**파일:**

- `src/app/api/webhook/github/route.ts` (생성)
- `src/lib/webhook/verify.ts` (생성)
- `src/lib/webhook/types.ts` (생성)

**구현 상세:**

```typescript
// src/lib/webhook/verify.ts
import { createHmac } from 'crypto'

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const hmac = createHmac('sha256', secret)
  const digest = `sha256=${hmac.update(payload).digest('hex')}`
  return timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}
```

- POST `/api/webhook/github` 엔드포인트
- `X-Hub-Signature-256` 헤더로 서명 검증
- `X-GitHub-Event` 헤더로 이벤트 타입 파싱
- `X-GitHub-Delivery` 헤더로 멱등성 체크 (중복 이벤트 무시)
- 처리된 delivery ID를 Redis에 24시간 TTL로 저장
- Zod로 페이로드 유효성 검증
- 에러 응답: 401(서명 불일치), 400(잘못된 페이로드), 200(성공)

**검증:**

```bash
# Webhook 엔드포인트 테스트 (로컬)
curl -X POST http://localhost:3000/api/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=..." \
  -H "X-GitHub-Event: push" \
  -H "X-GitHub-Delivery: test-id-123" \
  -d '{"ref":"refs/heads/main","commits":[...]}'

# 서명 검증 실패 테스트
curl -X POST http://localhost:3000/api/webhook/github \
  -H "X-Hub-Signature-256: sha256=invalid" \
  -d '{}' # 401 응답 확인

pnpm test -- webhook
```

---

### Batch 4-2: 이벤트 매핑 + Realtime (2개, 순차→병렬)

#### P4-02: Webhook→수족관 이벤트 매핑

**목적:** GitHub Webhook 페이로드를 수족관 이벤트로 변환

**파일:**

- `src/lib/webhook/event-mapper.ts` (생성)
- `src/lib/webhook/constants.ts` (생성)
- `tests/unit/event-mapper.test.ts` (생성)

**구현 상세:**

```typescript
// src/lib/webhook/event-mapper.ts
function mapWebhookToAquariumEvent(
  eventType: string,
  payload: WebhookPayload
): AquariumEvent | null {
  switch (eventType) {
    case 'push':
      return {
        type: 'feed',
        fishId: findFishByRepo(payload.repository.full_name),
        repoName: payload.repository.name,
        message: `🐟 ${payload.repository.name}이 먹이를 먹었습니다 (${payload.details.commits_count} commits)`,
        // ...
      }
    case 'watch': // star event
      return { type: 'starlight', ... }
    case 'fork':
      return { type: 'birth', ... }
    // ... 10개 이벤트 타입
  }
}
```

- 10가지 GitHub 이벤트 → AquariumEvent 변환
- 매핑 불가능한 이벤트는 `null` 반환 (무시)
- 이벤트를 Supabase `aquarium_events` 테이블에 저장
- 이벤트 메시지 i18n 지원 (EN/KO)

**테스트 케이스:**

- 각 10개 이벤트 타입별 정상 매핑
- 알 수 없는 이벤트 타입 → null
- 잘못된 페이로드 → null
- 메시지 형식 검증

**검증:**

```bash
pnpm test -- event-mapper
```

#### P4-08: Supabase Realtime 구독

**목적:** 이벤트를 연결된 클라이언트에 실시간 브로드캐스트

**파일:**

- `src/lib/realtime/channel.ts` (생성)
- `src/lib/realtime/hooks.ts` (생성) — `useAquariumEvents` 훅
- `src/stores/event-store.ts` (생성)

**구현 상세:**

```typescript
// src/lib/realtime/hooks.ts
'use client'

function useAquariumEvents(username: string) {
  const addEvent = useEventStore((s) => s.addEvent)

  useEffect(() => {
    const channel = supabase
      .channel(`aquarium:${username}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'aquarium_events',
          filter: `username=eq.${username}`,
        },
        (payload) => {
          addEvent(payload.new as AquariumEvent)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [username, addEvent])
}
```

- `aquarium_events` 테이블 INSERT 감지
- Zustand `eventStore`에 실시간 이벤트 추가
- 연결 해제/재연결 핸들링
- 최대 50개 이벤트 버퍼 (오래된 것 자동 제거)

**Supabase 테이블:**

```sql
CREATE TABLE aquarium_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  type TEXT NOT NULL,
  fish_id TEXT,
  repo_name TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_events_username ON aquarium_events(username);
CREATE INDEX idx_events_created ON aquarium_events(created_at DESC);

-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE aquarium_events;

-- 30일 이후 자동 삭제 (cron)
-- pg_cron: DELETE FROM aquarium_events WHERE created_at < now() - interval '30 days'
```

**검증:**

```bash
# Supabase 로컬에서 Realtime 테스트
pnpm test -- realtime
```

---

### Batch 4-3: 애니메이션 + UI (3개, 병렬)

#### P4-03: 실시간 이벤트 애니메이션

**목적:** 각 수족관 이벤트 타입별 3D 시각 효과

**파일:**

- `src/engine/effects/EventAnimations.tsx` (생성)
- `src/engine/effects/StarburstEffect.tsx` (생성)
- `src/engine/effects/BirthEffect.tsx` (생성)
- `src/engine/effects/HealEffect.tsx` (생성)
- `src/engine/effects/LevelUpEffect.tsx` (생성)
- `src/engine/effects/DissolveEffect.tsx` (생성)
- `src/engine/effects/RippleEffect.tsx` (생성)

**구현 상세:**

각 이펙트는 독립 R3F 컴포넌트:

```typescript
// src/engine/effects/StarburstEffect.tsx
interface StarburstEffectProps {
  position: [number, number, number]
  onComplete: () => void
}

function StarburstEffect({ position, onComplete }: StarburstEffectProps) {
  const ref = useRef<THREE.Points>(null)
  const [elapsed, setElapsed] = useState(0)

  useFrame((_, delta) => {
    setElapsed((prev) => prev + delta)
    if (elapsed > 2) { onComplete(); return }
    // 파티클 확산 + 페이드 아웃
    // 금색 (0xFFD700) 파티클 50개
    // 구형으로 확산, opacity 감소
  })

  return <points ref={ref}>...</points>
}
```

| 이펙트        | 파티클 수 | 지속 시간 | 색상                      |
| ------------- | --------- | --------- | ------------------------- |
| feed          | 10        | 1s        | #4CAF50 (초록)            |
| starlight     | 50        | 2s        | #FFD700 (금)              |
| birth         | 20        | 3s        | #E0F7FA (하늘)            |
| ripple        | -         | 2s        | #F44336 (빨강)            |
| heal          | 15        | 1.5s      | #81C784 (연초록)          |
| swim_together | -         | 3s        | #42A5F5 (파랑)            |
| flee          | -         | 0.5s      | - (모션만)                |
| egg_spawn     | 30        | 2s        | #FFF9C4 (연노랑)          |
| dissolve      | 100       | 3s        | #FFFFFF (흰)              |
| level_up      | 200       | 4s        | #FFD700→#FF6F00 (금→주황) |

- `EventAnimations.tsx`는 eventStore 구독 → 이벤트 발생 시 해당 이펙트 마운트
- `onComplete` 콜백으로 이펙트 언마운트
- 동시 최대 5개 이펙트 (큐잉)

**검증:**

```bash
# 3D 이펙트는 시각적 확인 필요
pnpm dev
# 브라우저에서 이벤트 수동 트리거:
# eventStore.getState().addEvent({ type: 'starlight', ... })
```

#### P4-04: 이벤트 피드 타임라인

**목적:** 수족관 내 이벤트 타임라인 UI (좌측 하단)

**파일:**

- `src/components/ui/EventFeed.tsx` (생성)
- `src/components/ui/EventToast.tsx` (생성)

**구현 상세:**

```typescript
// src/components/ui/EventFeed.tsx
interface EventFeedProps {
  events: EventFeedItem[]
  maxVisible: number // 기본 5개
}

function EventFeed({ events, maxVisible = 5 }: EventFeedProps) {
  // 좌측 하단 고정 위치
  // 최신 이벤트가 위에, 스크롤 가능
  // 새 이벤트 도착 시 slide-in 애니메이션 (Framer Motion)
  // 각 아이템: 아이콘 + 메시지 + 상대 시간 ("3분 전")
  // 접기/펼치기 토글
}
```

- `EventToast`: 새 이벤트 도착 시 우측 상단 토스트 (3초 후 자동 사라짐)
- Framer Motion `AnimatePresence`로 진입/퇴장 애니메이션
- 이벤트 타입별 아이콘: 🐟(feed), ⭐(star), 🥚(birth), 🔴(issue), 💚(heal), 🤝(merge), 💨(flee), 🆕(create), 💫(dissolve), 🎉(release)
- 반응형: 모바일에서는 토스트만, 데스크탑에서 피드+토스트

**검증:**

```bash
pnpm dev
# EventFeed 렌더링 확인
# 토스트 애니메이션 확인
```

#### P4-05: 라이브 모드 (풀스크린 대시보드)

**목적:** 수족관을 스트리밍/모니터링용 풀스크린 대시보드로 표시

**파일:**

- `src/app/[locale]/[username]/live/page.tsx` (생성)
- `src/components/ui/LiveModeOverlay.tsx` (생성)

**구현 상세:**

```typescript
// src/app/[locale]/[username]/live/page.tsx
// Server Component: 데이터 fetch → 클라이언트 전달
export default async function LivePage({
  params,
}: {
  params: { locale: string; username: string }
}) {
  const data = await fetchAquariumData(params.username)
  return <LiveModeClient data={data} username={params.username} />
}
```

- 풀스크린 API (`document.requestFullscreen()`)
- 최소 UI: 시계 (우측 상단), 이벤트 피드 (좌측 하단, 축소)
- 10초 비활동 시 모든 UI 페이드 아웃 (마우스 이동 시 다시 표시)
- ESC로 풀스크린 해제
- 키보드 단축키: F = 풀스크린 토글, H = UI 토글, M = 음소거 토글

**OBS 캡처 호환 (PRD P4-F03):**

- `?obs=true` 쿼리 파라미터 감지 시 OBS 모드 활성
  - Canvas 배경 투명 (`<canvas style="background: transparent" />`)
  - 모든 UI 요소(시계, 이벤트 피드, 툴바) 숨김
  - `<html>` 배경 제거 (`background: transparent`)
- `?chroma=green` 파라미터: 크로마키 배경색 적용 (`#00FF00`)
- `?chroma=blue` 파라미터: 파란 크로마키 배경 (`#0000FF`)
- OBS Window Capture 설정 가이드: `docs/obs-setup.md` 생성
  - Browser Source URL 예시: `https://gitaquarium.com/{username}/live?obs=true`
  - 권장 해상도: 1920×1080, FPS: 60
  - Chroma Key 필터 설정 방법 명시

**검증:**

```bash
pnpm dev
# /en/{username}/live 접근
# F11 or F키로 풀스크린 확인
# UI 자동 숨김 확인
```

---

### Batch 4-4: 시간 여행 (2개, 순차)

#### P4-06: 시간 여행 슬라이더

**목적:** 과거 시점의 수족관 상태를 슬라이더로 탐색

**파일:**

- `src/app/[locale]/[username]/history/page.tsx` (생성)
- `src/components/ui/TimeSlider.tsx` (생성)
- `src/lib/timeline/snapshot.ts` (생성)
- `src/lib/timeline/types.ts` (생성)

**구현 상세:**

```typescript
// src/lib/timeline/snapshot.ts

// 스냅샷 저장 (Supabase)
async function saveSnapshot(
  username: string,
  data: AquariumData,
): Promise<void> {
  await supabase.from('aquarium_snapshots').insert({
    username,
    snapshot_date: new Date().toISOString().split('T')[0],
    fish_count: data.fish.length,
    top_languages: getTopLanguages(data.fish),
    total_stars: data.fish.reduce((sum, f) => sum + f.stars, 0),
    data: data,
  })
}

// 스냅샷 조회 (날짜 범위)
async function getSnapshots(
  username: string,
  startDate: string,
  endDate: string,
): Promise<TimelineSnapshot[]> {
  const { data } = await supabase
    .from('aquarium_snapshots')
    .select('*')
    .eq('username', username)
    .gte('snapshot_date', startDate)
    .lte('snapshot_date', endDate)
    .order('snapshot_date', { ascending: true })
  return data ?? []
}
```

**Supabase 테이블:**

```sql
CREATE TABLE aquarium_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  snapshot_date DATE NOT NULL,
  fish_count INTEGER NOT NULL,
  top_languages TEXT[] DEFAULT '{}',
  total_stars INTEGER DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(username, snapshot_date)
);

CREATE INDEX idx_snapshots_user_date ON aquarium_snapshots(username, snapshot_date);
```

- 슬라이더 UI: 하단 바에 날짜 범위 (계정 생성일~현재)
- 날짜 선택 시 해당 스냅샷 데이터로 수족관 재렌더링
- 스냅샷이 없는 날짜: 가장 가까운 이전 스냅샷 사용
- 재생 버튼: 자동 재생 (1x, 2x, 4x 속도 조절)
- 일일 cron으로 활성 유저 스냅샷 자동 저장

**검증:**

```bash
pnpm dev
# /en/{username}/history 접근
# 슬라이더 드래그 → 수족관 변화 확인
# 재생 버튼 → 자동 진행 확인
pnpm test -- timeline
```

#### P4-07: 타임랩스 영상 생성

**목적:** 스냅샷 시퀀스에서 수족관 진화 타임랩스 영상 자동 생성

**파일:**

- `src/lib/timeline/timelapse.ts` (생성)
- `src/components/ui/TimelapseGenerator.tsx` (생성)

**구현 상세:**

```typescript
// src/lib/timeline/timelapse.ts
interface TimelapseConfig {
  username: string
  startDate: string
  endDate: string
  fps: number // 기본 30
  frameDuration: number // 각 스냅샷 표시 시간 (ms), 기본 500
  resolution: {
    width: number // 기본 1920
    height: number // 기본 1080
  }
}

async function generateTimelapse(
  config: TimelapseConfig,
  onProgress: (percent: number) => void,
): Promise<Blob> {
  const snapshots = await getSnapshots(
    config.username,
    config.startDate,
    config.endDate,
  )

  // MediaRecorder API로 Canvas 캡처
  const stream = canvas.captureStream(config.fps)
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
  })

  // 각 스냅샷을 순차 렌더링하며 녹화
  for (const [i, snapshot] of snapshots.entries()) {
    await renderSnapshot(snapshot)
    await wait(config.frameDuration)
    onProgress((i / snapshots.length) * 100)
  }

  recorder.stop()
  return new Blob(chunks, { type: 'video/webm' })
}
```

- 클라이언트 사이드 렌더링 + 녹화 (서버 부하 없음)
- 진행률 표시 (프로그레스 바)
- 완료 후 WebM 다운로드
- 연말 리캡 모드: "2025년 내 수족관" 프리셋 (1월 1일~12월 31일)
- 최대 스냅샷 수: 365개 (1년 = 약 6분 영상 @ 500ms/프레임)

**검증:**

```bash
pnpm dev
# /en/{username}/history → "Generate Timelapse" 버튼
# WebM 다운로드 확인
# 영상 재생 확인
```

#### P4-09: 연말 리캡 (Spotify Wrapped 스타일) — PRD P4-F04

**목적:** 연간 수족관 변화를 스와이프 카드 형식으로 요약, 공유 가능한 이미지 생성

**파일:**

- `src/app/[locale]/[username]/recap/[year]/page.tsx` (생성)
- `src/lib/timeline/recap.ts` (생성)
- `src/components/ui/RecapCard.tsx` (생성)
- `src/components/ui/RecapCarousel.tsx` (생성)
- `src/app/api/recap/[username]/[year]/route.ts` (생성)

**구현 상세:**

```typescript
// src/lib/timeline/recap.ts

async function buildYearRecap(
  username: string,
  year: number,
): Promise<YearRecapData> {
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const snapshots = await getSnapshots(username, startDate, endDate)
  const firstSnapshot = snapshots[0]
  const lastSnapshot = snapshots[snapshots.length - 1]

  // 올해 새로 태어난 물고기: 첫 스냅샷에 없는 물고기 중 마지막에 있는 것
  const newFishCount = lastSnapshot.fishCount - (firstSnapshot?.fishCount ?? 0)

  // 가장 성장한 물고기 (커밋 증가량 기준)
  const topGrownFish = findTopGrownFish(snapshots)

  // 월별 활동량 집계
  const monthlyActivity = aggregateMonthlyActivity(snapshots)
  const peakActivityMonth =
    monthlyActivity.indexOf(Math.max(...monthlyActivity)) + 1

  return {
    year,
    username,
    newFishCount,
    topGrownFish,
    totalKudos: await getYearKudos(username, year),
    languageDistribution: computeLanguageDistribution(lastSnapshot),
    peakActivityMonth,
    achievementsUnlocked: await getYearAchievements(username, year),
    mostActiveRepo: findMostActiveRepo(snapshots),
  }
}
```

카드 구성 (스와이프):
| 카드 순서 | 제목 | 내용 |
|-----------|------|------|
| 1 | "올해의 수족관" | 물고기 총 마리 수 + 연간 성장 |
| 2 | "가장 성장한 물고기" | 레포 이름 + 커밋 증가량 |
| 3 | "다양성의 바다" | 언어별 파이 차트 |
| 4 | "가장 바빴던 달" | 월별 활동 막대 차트 |
| 5 | "올해의 쿠도스" | 총 쿠도스 + 전달 준 사람 상위 3 |
| 6 | "달성한 업적" | 올해 해제한 업적 아이콘 나열 |
| 7 | "나의 2025 수족관" | 공유 카드 (전체 요약) |

```typescript
// src/components/ui/RecapCarousel.tsx
// Framer Motion drag gesture로 좌우 스와이프
function RecapCarousel({ cards }: { cards: RecapCardData[] }) {
  const [current, setCurrent] = useState(0)

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x < -50) setCurrent((c) => Math.min(c + 1, cards.length - 1))
        if (info.offset.x > 50) setCurrent((c) => Math.max(c - 1, 0))
      }}
    >
      <AnimatePresence mode="wait">
        <RecapCard key={current} data={cards[current]} />
      </AnimatePresence>
    </motion.div>
  )
}
```

공유 이미지 생성:

- `GET /api/recap/{username}/{year}/share` → OG 이미지 (Vercel OG 기반)
- 마지막 카드에 "공유하기" 버튼 → Web Share API 또는 클립보드 복사
- 이미지: 1200×630px, 브랜드 배경 + 핵심 통계 3개

자동 생성 조건:

- 12월 1일부터 해당 연도 리캡 페이지 활성화
- 이전 년도 리캡도 `/recap/2024` 경로로 조회 가능
- 스냅샷 데이터가 없는 년도는 "데이터 없음" 안내

**검증:**

```bash
pnpm dev
# /en/{username}/recap/2025 접근
# 7개 카드 스와이프 확인
# 마지막 카드 공유 버튼 동작 확인
# /api/recap/{username}/2025/share → OG 이미지 확인
```

---

## 6. Quality Gate 체크리스트

### 기능

- [ ] Webhook 10개 이벤트 타입 모두 수신 및 매핑
- [ ] 실시간 애니메이션 이벤트별 동작 확인 (10종)
- [ ] 라이브 모드: 풀스크린, 시계, 최소 UI, 자동 숨김
- [ ] 라이브 모드 OBS: `?obs=true` 시 투명 배경 + UI 숨김 확인
- [ ] 라이브 모드 OBS: `?chroma=green` 시 크로마키 배경 적용 확인
- [ ] 시간 여행: 슬라이더로 과거 스냅샷 렌더링
- [ ] 타임랩스: WebM 영상 생성 및 다운로드
- [ ] 연말 리캡: 7개 카드 스와이프, 공유 이미지 생성

### 보안

- [ ] Webhook 서명 검증 (SHA-256) 동작
- [ ] 잘못된 서명 → 401 응답
- [ ] 멱등 처리: 동일 delivery ID 중복 무시

### 성능

- [ ] 이벤트 애니메이션 동시 5개까지 60fps 유지
- [ ] Realtime 연결 안정 (30분+ 유지)
- [ ] 타임랩스 생성 시 UI 블로킹 없음 (Web Worker 또는 requestIdleCallback)

### 테스트

- [ ] Webhook 서명 검증 유닛 테스트
- [ ] 이벤트 매핑 10종 유닛 테스트
- [ ] 멱등성 테스트 (중복 이벤트)
- [ ] 잘못된 페이로드 테스트

### 검증 명령어

```bash
pnpm check          # lint + format + typecheck
pnpm test           # unit + integration
pnpm build          # 빌드 성공
```

---

## 7. 에이전트 프롬프트 템플릿

### Batch 4-1 프롬프트 (P4-01)

```
## Task
GitHub Webhook 수신 API 라우트를 구현하세요.

## Context
- Read AGENTS.md for project conventions
- Read docs/github-api-spec.md for GitHub API details
- Read src/lib/cache/redis.ts for Redis usage patterns

## Requirements
1. POST /api/webhook/github 엔드포인트
2. X-Hub-Signature-256 헤더로 SHA-256 서명 검증
3. X-GitHub-Delivery 헤더로 멱등성 보장 (Redis에 24h TTL 저장)
4. 10개 이벤트 타입 파싱: push, watch, fork, issues, pull_request, create, delete, release
5. Zod로 페이로드 검증
6. 에러 응답: 401(서명), 400(페이로드), 200(성공)

## Files
- src/app/api/webhook/github/route.ts
- src/lib/webhook/verify.ts
- src/lib/webhook/types.ts

## Acceptance Criteria
- [ ] 서명 검증 성공/실패 테스트 통과
- [ ] 멱등성: 동일 ID 재전송 시 무시
- [ ] 10개 이벤트 타입 정상 파싱
```

### Batch 4-3 프롬프트 (P4-03)

```
## Task
실시간 이벤트 애니메이션 시스템을 구현하세요.

## Context
- Read AGENTS.md for R3F conventions
- Read docs/3d-scene-architecture.md for performance budget
- Read src/engine/effects/ for existing effect patterns (if any)

## Requirements
1. 10개 이벤트 타입별 독립 R3F 이펙트 컴포넌트
2. 각 이펙트: 파티클 시스템, 지속 시간, 색상 (이 문서의 매핑 테이블 참조)
3. EventAnimations.tsx: eventStore 구독 → 이벤트 발생 시 이펙트 마운트
4. 동시 최대 5개 이펙트 (큐잉)
5. onComplete 콜백으로 이펙트 언마운트
6. useFrame 사용, requestAnimationFrame 금지

## Files
- src/engine/effects/EventAnimations.tsx
- src/engine/effects/StarburstEffect.tsx (외 6개)

## Acceptance Criteria
- [ ] 10종 이펙트 시각적 동작 확인
- [ ] 동시 5개 이펙트 시 60fps 유지
- [ ] 이펙트 완료 후 자동 언마운트 (메모리 누수 없음)
```
