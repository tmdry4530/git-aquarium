# 🐠 Git Aquarium — Product Requirements Document

> **Your GitHub repos, alive and swimming.**
> GitHub 활동 데이터를 살아있는 3D 수족관 생태계로 변환하는 인터랙티브 웹 경험.

---

## 1. Product Overview

### 1.1 한 줄 요약

GitHub 유저네임을 입력하면, 레포지토리가 물고기로, 커밋이 생명력으로, 커뮤니티가 생태계로 변환되는 실시간 3D 수족관.

### 1.2 왜 만드는가

Git City가 "건물의 스카이라인"이라면 Git Aquarium은 "살아있는 바다"다. 정적 시각화를 넘어서 **시간에 따라 진화하고, 관계가 보이고, 감정이 느껴지는** 개발자 프로필 경험을 만든다.

| 비교 항목 | Git City | Git Aquarium |
|---|---|---|
| 표현 방식 | 정적 건물 | 살아있는 생명체 |
| 시간 반영 | 스냅샷 (높이) | 진화 (알→치어→성어→화석) |
| 관계 표현 | 독립된 건물 | 떼지어, 공생, 포식 |
| 감정 유도 | "와 크다" | "귀엽다, 키우고 싶다" |
| 공유 형태 | 스크린샷 | 움직이는 영상 클립 |
| 재방문 동기 | 없음 | 도감 수집, 성장 확인 |

### 1.3 타겟 유저

- **Primary**: GitHub 활동이 있는 개발자 (연 50+ 커밋)
- **Secondary**: 오픈소스 커뮤니티 매니저, 팀 리드
- **Tertiary**: 개발 입문자 (동기부여 도구로 활용)

### 1.4 성공 지표

| 지표 | Phase 1 목표 | Phase 3 목표 | 최종 목표 |
|---|---|---|---|
| GitHub Stars | 500 | 3,000 | 10,000+ |
| MAU | 5,000 | 50,000 | 500,000+ |
| 평균 세션 시간 | 2분 | 5분 | 8분+ |
| 공유율 (방문→공유) | 5% | 15% | 25%+ |
| 재방문율 (7일) | 10% | 30% | 45%+ |

---

## 2. Core Concepts

### 2.1 매핑 철학

모든 GitHub 데이터는 해양 생태계의 요소로 1:1 매핑된다. 매핑은 직관적이어야 하며, 설명 없이도 "아, 이게 그거구나"라고 느낄 수 있어야 한다.

#### 레포지토리 → 물고기

| GitHub 데이터 | 수족관 표현 | 매핑 로직 |
|---|---|---|
| 레포 1개 | 물고기 1마리 | 1:1 |
| 주 사용 언어 | 물고기 종류 & 색상 | 언어별 고유 종 디자인 |
| 스타 수 | 물고기 크기 | log2(stars+1) 스케일 |
| 포크 수 | 같은 종 치어 떼 | 포크 수만큼 작은 물고기 군집 |
| 커밋 빈도 | 수영 속도 & 활력 | 최근 30일 커밋 빈도 기반 |
| 마지막 커밋 시점 | 생사 상태 | 6개월+ → 해저 화석화 |
| 이슈 수 (open) | 물고기 상처/반점 | 열린 이슈 많을수록 상처 표시 |
| README 유무 | 발광 여부 | README 있으면 은은한 바이오루미네센스 |
| 라이선스 유무 | 보호막/아우라 | 라이선스 있으면 보호 쉴드 이펙트 |

#### 언어별 물고기 종류

| 언어 | 종류 | 비주얼 컨셉 | 근거 |
|---|---|---|---|
| JavaScript | 열대어 (엔젤피시) | 화려하고 빠름, 노란색 계열 | 가장 화려하고 대중적 |
| TypeScript | 만타레이 | 우아하고 구조적, 파란색 | JS의 진화형, 체계적 |
| Python | 거북이 | 느리지만 꾸준, 녹색/파랑 | 안정적이고 범용적 |
| Rust | 복어 | 단단하고 방어적, 주황색 | 안전성 중시 |
| Go | 돌고래 | 빠르고 효율적, 시안 | 고성능, 심플 |
| Java | 대왕오징어 | 크고 복잡, 갈색 | 엔터프라이즈급 |
| C/C++ | 상어 | 무시무시하고 강력 | 로우레벨 파워 |
| Solidity | 해마 | 독특하고 희귀 | 블록체인 특수성 |
| Ruby | 금붕어 | 예쁘고 친근, 빨간색 | 커뮤니티 친화적 |
| Swift | 날치 | 날렵하고 빠름 | Apple 생태계의 세련됨 |
| Kotlin | 해파리 | 우아하고 모던, 보라색 | 모던하고 유연 |
| HTML/CSS | 산호 | 정적이지만 아름다움 | 구조/장식적 역할 |
| Shell | 조개 | 작지만 핵심적 | 도구적 역할 |
| Markdown | 해초 | 배경을 채우는 존재 | 문서/보조 역할 |
| 기타/Unknown | 플랑크톤 | 작고 빛나는 점 | 분류 불가 |

#### 유저 프로필 → 수족관 환경

| GitHub 데이터 | 수족관 환경 | 매핑 로직 |
|---|---|---|
| 총 커밋 수 | 수족관 크기 | 커밋 많을수록 넓고 깊은 바다 |
| 계정 나이 | 바다 깊이 (시대) | 오래될수록 심해 층 추가 |
| 팔로워 수 | 수면 밝기 & 산호 밀도 | 팔로워 많을수록 풍성한 생태계 |
| 컨트리뷰션 그래프 | 해저 지형 | 연간 커밋 히트맵 → 산호초 높낮이 |
| 가장 활발한 시간대 | 낮/밤 사이클 | 커밋 피크 시간 = 수족관 낮 |
| 연속 기여일 (streak) | 해류 강도 | 스트릭 길수록 강한 해류 |

#### 소셜 관계 → 생태계 상호작용

| GitHub 관계 | 수족관 표현 |
|---|---|
| 같은 레포 컨트리뷰터 | 물고기 떼지어 |
| PR 리뷰어 관계 | 청소 물고기 (공생) |
| 포크 관계 | 부모-자식 물고기 |
| 스타를 준 유저 | 물고기 주변 빛나는 플랑크톤 |
| 같은 org 소속 | 같은 산호초 영역에 서식 |
| 상호 팔로우 | 함께 헤엄치는 짝 |

### 2.2 진화 시스템

물고기는 시간과 활동에 따라 진화한다. 이것이 Git City와의 본질적 차별점.

```
[Egg] → [Fry] → [Juvenile] → [Adult] → [Elder]  →  [Legendary]
 생성      1주     1개월       6개월     1년+         특수조건
                                                    
                                          ↘ [Fossil] 
                                          6개월+ 비활성
```

| 단계 | 조건 | 비주얼 |
|---|---|---|
| Egg (알) | 레포 생성 직후, 커밋 0~2개 | 작은 알이 해저에서 흔들림 |
| Fry (치어) | 커밋 3~10개 | 작고 반투명한 물고기 |
| Juvenile (유어) | 커밋 11~50개 | 색상이 선명해지고 패턴 등장 |
| Adult (성어) | 커밋 51~200개 | 완전한 형태, 종별 특징 뚜렷 |
| Elder (장로) | 커밋 200+개 & 1년 이상 | 크고 위엄있음, 특수 이펙트 |
| Legendary (전설) | 스타 1000+ 또는 특수 조건 | 신화적 외형, 고유 발광 |
| Fossil (화석) | 6개월+ 커밋 없음 | 회색, 바닥에 가라앉음 |

#### 전설급 물고기 조건

| 이름 | 조건 | 외형 |
|---|---|---|
| Leviathan | 단일 레포 스타 10,000+ | 거대한 용 형태의 심해어 |
| Phoenix Fish | 1년+ 방치 후 다시 활성화 | 불꽃 이펙트 물고기 |
| Hydra | 포크 1,000+ | 머리가 여러 개인 물고기 |
| Kraken | 이슈 500+ & 모두 클로즈 | 문어 형태 |
| Narwhal | 연속 365일 커밋 | 뿔 달린 물고기 (유니콘 피시) |

### 2.3 도감 시스템 (Codex)

포켓몬 도감처럼 수집 욕구를 자극하는 핵심 리텐션 메커니즘.

- 총 도감 항목: 종류(15) × 진화단계(6) + 전설급(5) + 특수(10) = **105종**
- 내 수족관에 출현한 종은 도감에 컬러로 등록
- 다른 유저 수족관 방문 시 거기서 본 종도 "목격" 으로 등록 (회색)
- 도감 완성도 % 표시 → 공유 욕구 자극
- 시즌별 한정 종 추가 (핼러윈 해골물고기, 크리스마스 산타물고기 등)

---

## 3. Feature Specification

### Phase 1: MVP — "수족관 생성" (4주)

> 목표: "GitHub 유저네임을 넣으면 3D 수족관이 나온다"를 완벽하게.

#### P1-F01: 랜딩 페이지

- 유저네임 입력 필드 + "DIVE" 버튼
- 최근 생성된 인기 수족관 캐러셀 (social proof)
- "tmdry4530의 수족관 보기" 같은 URL 직접 접근 지원
- 로딩 중: 수면 아래로 잠수하는 트랜지션 애니메이션

#### P1-F02: 3D 수족관 렌더링

- Three.js (React Three Fiber) 기반 WebGL 씬
- 물고기 생성: 레포별 1마리, 언어별 색상, 스타 기반 크기
- 물고기 행동: 자율 수영, 꼬리 흔들기, 방향 전환, 수직 보빙
- 죽은 레포: 회색 화석 물고기, 해저에 가라앉음
- 환경: 해저 지형, 바위, 해초, 기포, 플랑크톤 파티클
- 코스틱 라이팅 (수면 빛 반사 효과)
- 포그 (안개) 로 깊이감 표현

#### P1-F03: 인터랙션

- 마우스 호버 → 물고기 하이라이트 + 레포 정보 툴팁
- 물고기 클릭 → 상세 패널 (레포 이름, 설명, 스타, 포크, 언어, 마지막 커밋 등)
- 상세 패널에서 GitHub 레포로 이동 버튼
- 마우스 이동 → 카메라 시차 효과
- 스크롤/핀치 → 줌 인/아웃
- 드래그 → 카메라 패닝

#### P1-F04: 통계 오버레이

- 좌측 상단 HUD: 유저네임, 살아있는 물고기 수, 화석 수, 총 스타
- 언어별 물고기 수 분포 (작은 태그)
- 가장 큰 물고기 (Most Starred Repo) 하이라이트

#### P1-F05: 공유

- URL 기반 공유: `gitaquarium.com/{username}`
- OG 메타 태그: 수족관 스크린샷 자동 생성 (og:image)
- "Share My Aquarium" 버튼 → 클립보드 복사 + Twitter/X 텍스트 생성
- 수족관의 5초 루프 GIF/WebM 다운로드 (클라이언트사이드 녹화)

#### P1-F06: 반응형 & 성능

- 데스크탑 & 모바일 대응
- 모바일: 터치 인터랙션, 성능 최적화 (물고기 수 제한, LOD 적용)
- 물고기 40마리 이상일 때 Instanced Mesh 사용
- 타겟 프레임레이트: 데스크탑 60fps, 모바일 30fps
- 레포 100개 이하 → 클라이언트 직접 fetch, 이상 → 서버 캐싱

### Phase 2: 생태계 — "살아있는 바다" (6주)

> 목표: 물고기 간 관계와 환경 상호작용으로 "생태계"를 완성.

#### P2-F01: 물고기 종별 모델링

- 언어별 15종 고유 3D 모델 (Low-poly 스타일)
- 각 종별 고유 수영 패턴 (상어는 직선, 해파리는 부유, 거북이는 느릿)
- 진화 단계별 외형 변화 (알 → 치어 → 성어)
- 스킨톤/테마 커스터마이징 (다크, 산호, 심해, 열대)

#### P2-F02: 떼지어 행동 (Flocking)

- Boids 알고리즘 기반 군집 행동
- 같은 언어 물고기끼리 자연스러운 떼 형성
- 큰 물고기(많은 스타) 주변에 작은 물고기 몰림
- 화석 물고기 근처는 다른 물고기가 기피 (데드존)
- 갑자기 방향 전환하는 "놀람" 반응 (클릭 시)

#### P2-F03: 생태계 상호작용

- 공생: PR 리뷰 관계가 있는 물고기는 청소물고기처럼 따라다님
- 포크: 포크된 레포는 원본 물고기 근처에 작은 떼로 출현
- 산호초: HTML/CSS/Markdown 레포는 물고기가 아닌 산호/해초로 표현
- 먹이사슬: 큰 물고기가 작은 물고기 근처 지나가면 작은 물고기가 흩어짐

#### P2-F04: 환경 디테일

- 시간대별 조명 변화 (유저의 커밋 패턴 기반 낮/밤 사이클)
- 날씨 시스템: 최근 커밋 많으면 맑음, 적으면 탁함
- 컨트리뷰션 그래프 → 해저 산호초 지형 매핑
- 수면 표현: 물결, 빛 굴절, 코스틱 패턴
- 심해 층 (계정 5년 이상): 어두운 심해에 발광 생물

#### P2-F05: 사운드 디자인

- 수중 앰비언스 사운드 (Tone.js 또는 Howler.js)
- 물고기 지나갈 때 미세한 물소리
- 기포 올라가는 소리
- 큰 물고기 근처에서 깊은 진동음
- 배경음악: 절차적 생성 앰비언트 (BPM = 커밋 빈도 비례)
- 음소거/볼륨 컨트롤

#### P2-F06: 도감 (Codex) v1

- 내 수족관에 출현한 종 자동 등록
- 종별 상세 정보 (조건, 레어도, 설명)
- 도감 완성도 퍼센트
- "이 종은 Python 레포 + 스타 100+ 에서 출현합니다" 같은 힌트

### Phase 3: 소셜 — "바다를 공유하다" (6주)

> 목표: 혼자 보는 수족관에서 함께 즐기는 바다로.

#### P3-F01: 수족관 비교 모드

- 2명의 수족관을 나란히 배치 (Split View)
- 물고기 수, 다양성, 총 스타, 활성도 비교 HUD
- VS 화면: "chamdom's ocean vs torvalds' ocean"
- 비교 결과 공유 카드 생성

#### P3-F02: 합체 수족관 (Merge Ocean)

- 2~5명의 수족관을 합쳐서 하나의 거대한 바다 생성
- 팀/Org 단위로 합체 → "우리 팀 바다" 경험
- 합체 시 물고기 간 상호작용 발생 (공생, 떼지어 등)
- 합체 수족관 고유 URL: `gitaquarium.com/merge/user1+user2+user3`

#### P3-F03: 수족관 방문

- 다른 유저의 수족관에 "방문" 가능
- 방문 시 내 대표 물고기 1마리가 손님으로 등장
- 방문 기록 (게스트북): "chamdom이 3/13에 방문했습니다"
- 방문 시 상대 수족관의 희귀 종을 도감에 "목격"으로 등록

#### P3-F04: 쿠도스 & 리액션

- 물고기에 먹이 주기 (쿠도스) → 물고기가 먹이를 먹는 애니메이션
- 먹이 종류: ⭐ (스타와 동일), 🐛 (버그 리포트 장려), 💡 (아이디어 제안)
- 받은 쿠도스 수 물고기 프로필에 표시
- 일일 쿠도스 제한 (스팸 방지)

#### P3-F05: 리더보드

- 글로벌 리더보드: 수족관 다양성 점수, 물고기 총 크기, 전설급 보유 수
- 주간 "신규 수족관" 피처 (새로 만든 인기 수족관 소개)
- 언어별 리더보드 (Python 수족관 TOP 10 등)
- 도감 완성도 리더보드

#### P3-F06: 공유 고도화

- 움직이는 공유 카드 (Lottie/WebM 10초 클립)
- 스토리 형식 세로 카드 (Instagram/TikTok용)
- 가로 카드 (Twitter/LinkedIn용)
- GitHub README 임베드 위젯: `![aquarium](gitaquarium.com/badge/username)`
- 임베드 iframe 제공
- "My Aquarium" GitHub Action (매주 자동으로 README 업데이트)

### Phase 4: 실시간 — "바다가 숨 쉰다" (6주)

> 목표: 정적 스냅샷에서 실시간으로 반응하는 살아있는 바다로.

#### P4-F01: GitHub Webhook 연동

- GitHub OAuth 로그인 후 Webhook 자동 등록
- 이벤트별 실시간 반응:

| GitHub 이벤트 | 수족관 반응 |
|---|---|
| Push (커밋) | 해당 물고기가 먹이를 먹음 (성장 이펙트) |
| Star received | 물고기 주변에 별빛 파티클 폭발 |
| Fork | 작은 치어가 알에서 태어남 |
| Issue opened | 수면에 파문 + 이슈 아이콘 부유 |
| Issue closed | 파문 사라짐 + 치유 이펙트 |
| PR merged | 두 물고기가 함께 헤엄치는 모션 |
| PR rejected | 물고기가 잠시 방향 바꿔 도망 |
| New repo created | 알이 해저에서 생성됨 |
| Repo deleted | 물고기가 빛으로 소멸 |
| Release published | 물고기가 레벨업 이펙트 (빛 기둥) |

#### P4-F02: 알림 피드

- 수족관 내 이벤트 타임라인 (좌측 하단)
- "🐟 prediction-bot이 먹이를 먹었습니다 (3 commits)"
- "🥚 새로운 알이 생겼습니다: new-project"
- "⭐ git-aquarium에 별빛이 내렸습니다 (+5 stars)"
- 실시간 토스트 알림

#### P4-F03: 라이브 모드

- 수족관을 스트리밍 대시보드처럼 띄워놓을 수 있는 모드
- 풀스크린, 시계 표시, 최소 UI
- 코딩 중 세컨드 모니터에 띄워두는 용도
- OBS 캡처 소스로 활용 가능 (스트리머용)

#### P4-F04: 시간 여행

- 슬라이더로 과거 시점의 수족관 상태 재현
- "2024년 1월의 내 수족관" → 그 시점 레포 상태 기반 렌더링
- 타임랩스: 계정 생성부터 현재까지 수족관 진화 영상 자동 생성
- 연말 리뷰: "2025년 내 수족관 리캡" (Spotify Wrapped 스타일)

### Phase 5: 게이미피케이션 — "바다를 키우다" (8주)

> 목표: 단순 시각화를 넘어, 코딩 동기부여 & 리텐션 도구로.

#### P5-F01: 업적 시스템

| 업적 이름 | 조건 | 보상 |
|---|---|---|
| First Splash | 첫 수족관 생성 | 기본 배경 테마 |
| Diverse Ocean | 5개 이상 언어의 물고기 보유 | "다양성" 배지 |
| Fossil Hunter | 화석 물고기 10마리 이상 | 고대 해저 테마 |
| Star Collector | 총 스타 100개 이상 | 별빛 파티클 강화 |
| Commit Streak | 30일 연속 커밋 | 해류 이펙트 |
| Deep Diver | 수족관 50회 이상 방문 | 심해 테마 잠금해제 |
| Social Butterfly | 10명 이상 수족관 방문 | 무지개 산호초 |
| Legendary Tamer | 전설급 물고기 1마리 이상 | 금색 수족관 프레임 |
| Codex Master | 도감 80% 이상 완성 | 전용 칭호 |
| Ocean King | 모든 업적 달성 | 왕관 물고기 스킨 |

#### P5-F02: 시즌 이벤트

- 분기별 한정 테마 & 물고기 종
  - Q1 (봄): 벚꽃 테마, 벚꽃새우 한정종
  - Q2 (여름): 열대 테마, 니모 한정종
  - Q3 (가을): 심해 테마, 앵글러피시 한정종
  - Q4 (겨울): 북극 테마, 북극고래 한정종
- Hacktoberfest 연동: 10월에 PR 4개 이상 → 특별 물고기
- GitHub Universe 기간: 컨퍼런스 한정 물고기

#### P5-F03: 퀘스트

- 일일 퀘스트: "오늘 커밋 3개 하면 먹이 보너스"
- 주간 퀘스트: "이번 주 새 레포 1개 만들면 알 장식 획득"
- 도전 퀘스트: "TypeScript 레포 만들어서 만타레이 출현시키기"
- 퀘스트 완료 시 수족관 꾸미기 아이템 보상

#### P5-F04: 수족관 커스터마이징

- 배경 테마: 열대, 심해, 산호초, 난파선, 수중동굴, 해저화산
- 장식품: 보물상자, 다이버 피규어, 해적선, 성(castle)
- 바닥재: 모래, 자갈, 화산암
- 조명: 일반, 네온, 문라이트, 코스틱
- 프레임: 수족관 테두리 디자인
- 획득 방법: 업적 보상, 시즌 이벤트, 쿠도스 마일리지

### Phase 6: 플랫폼 확장 (8주)

> 목표: GitHub 너머로.

#### P6-F01: 멀티 플랫폼 데이터 소스

- GitLab 지원
- Bitbucket 지원
- 여러 플랫폼 통합 수족관 (GitHub + GitLab 합산)

#### P6-F02: Organization 수족관

- GitHub Organization 단위 대형 수족관
- 멤버별 영역이 나뉜 거대한 바다
- Org 내 가장 활발한 레포 = 가장 큰 물고기
- 팀 간 인터랙션 시각화 (팀 A ↔ 팀 B 간 PR 흐름)
- 채용 페이지에 Org 수족관 임베드

#### P6-F03: API & 위젯

- Public API: `GET /api/v1/aquarium/{username}` → 수족관 데이터 JSON
- 임베드 위젯: 블로그, 노션, 포트폴리오 사이트에 삽입
- GitHub Profile README 위젯 (SVG 뱃지 또는 애니메이션 GIF)
- Notion 임베드 블록
- 슬랙 봇: `/aquarium chamdom` → 수족관 미리보기 전송

#### P6-F04: 모바일 앱

- React Native 또는 PWA
- 위젯: 홈 화면에 미니 수족관 (iOS/Android)
- 푸시 알림: "새 물고기 탄생!", "전설급 물고기 출현!"
- Apple Watch / WearOS: 미니 수족관 워치 페이스

#### P6-F05: 수익화

| 모델 | 내용 | 가격대 |
|---|---|---|
| Freemium 기본 | 수족관 생성, 공유, 도감 | 무료 |
| Pro 구독 | 실시간 Webhook, 시간여행, 고급 테마, 커스터마이징 전체 잠금해제 | $4.99/월 |
| Team | Org 수족관, 비교 모드 무제한, API 접근 | $9.99/월/팀 |
| 장식품 숍 | 개별 수족관 장식품 구매 | $0.99~$4.99 |
| 시즌 패스 | 분기별 한정 종 + 테마 전체 잠금해제 | $2.99/분기 |

---

## 4. Technical Architecture

### 4.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                       Client                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐    │
│  │ Next.js  │ │ R3F /    │ │  State Management    │    │
│  │ App      │ │ Three.js │ │  (Zustand)           │    │
│  │ Router   │ │ Scene    │ │                      │    │
│  └────┬─────┘ └────┬─────┘ └──────────┬───────────┘    │
│       │             │                  │                │
│  ┌────┴─────────────┴──────────────────┴───────────┐    │
│  │              Aquarium Engine                     │    │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────────────┐ │    │
│  │  │ Fish    │ │ Environ │ │ Interaction       │ │    │
│  │  │ System  │ │ System  │ │ System            │ │    │
│  │  │ (Boids) │ │ (Water, │ │ (Raycast, Cam,    │ │    │
│  │  │         │ │  Light) │ │  Tooltip)         │ │    │
│  │  └─────────┘ └─────────┘ └───────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────┴──────────────────────────────┐
│                       Server                            │
│  ┌──────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ API Layer    │ │ Webhook       │ │ OG Image      │  │
│  │ (Hono /     │ │ Handler       │ │ Generator     │  │
│  │  Next API)   │ │ (GitHub WH)  │ │ (Satori)      │  │
│  └──────┬───────┘ └───────┬───────┘ └───────┬───────┘  │
│         │                 │                  │          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐  │
│  │                   Data Layer                      │  │
│  │  ┌───────────┐ ┌───────────┐ ┌─────────────────┐ │  │
│  │  │ Supabase  │ │ Redis     │ │ GitHub API      │ │  │
│  │  │ (User,    │ │ (Cache,   │ │ (REST +         │ │  │
│  │  │  Codex,   │ │  Rate     │ │  GraphQL)       │ │  │
│  │  │  Social)  │ │  Limit)   │ │                 │ │  │
│  │  └───────────┘ └───────────┘ └─────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 기술 스택

| 레이어 | 기술 | 선택 이유 |
|---|---|---|
| **프레임워크** | Next.js 15 (App Router) | SSR/SSG, API Routes, OG 이미지 |
| **3D 엔진** | React Three Fiber + Three.js | React 생태계 통합, 선언적 3D |
| **상태관리** | Zustand | 경량, R3F와 궁합 좋음 |
| **스타일링** | Tailwind CSS + CSS Modules | UI는 Tailwind, 3D 오버레이는 인라인 |
| **사운드** | Tone.js | 절차적 오디오 생성 |
| **DB** | Supabase (PostgreSQL) | Auth, DB, Realtime, Storage 올인원 |
| **캐시** | Upstash Redis | 서버리스 Redis, GitHub API 캐싱 |
| **배포** | Vercel | Next.js 네이티브, Edge Functions |
| **OG 이미지** | Satori + @vercel/og | 동적 OG 이미지 생성 |
| **애니메이션** | Framer Motion + GSAP | UI 전환 + 3D 카메라 애니메이션 |
| **모니터링** | Vercel Analytics + Sentry | 성능 & 에러 트래킹 |
| **영상 녹화** | MediaRecorder API + CCapture | 클라이언트 사이드 GIF/WebM 생성 |

### 4.3 GitHub API 사용 계획

| 엔드포인트 | 용도 | Rate Limit 관리 |
|---|---|---|
| `GET /users/{user}/repos` | 레포 목록 | Redis 1시간 캐시 |
| `GET /repos/{owner}/{repo}` | 레포 상세 | Redis 1시간 캐시 |
| `GET /repos/{owner}/{repo}/stats/commit_activity` | 커밋 활동 | Redis 6시간 캐시 |
| `GET /repos/{owner}/{repo}/contributors` | 기여자 | Redis 6시간 캐시 |
| `GET /users/{user}/events` | 최근 이벤트 | Redis 5분 캐시 |
| GraphQL API | 컨트리뷰션 그래프, 소셜 데이터 | Redis 1시간 캐시 |

비인증 요청: 60회/시간 → OAuth 앱 등록으로 5,000회/시간 확보. 유저 로그인 시 개인 토큰으로 추가 확보.

### 4.4 성능 최적화

| 기법 | 적용 대상 | 효과 |
|---|---|---|
| Instanced Mesh | 물고기 40+ | 드로우콜 90% 감소 |
| LOD (Level of Detail) | 원거리 물고기 | 폴리곤 수 70% 감소 |
| Object Pooling | 기포, 파티클 | GC 방지 |
| Frustum Culling | 화면 밖 오브젝트 | 불필요 렌더링 제거 |
| Web Worker | Boids 계산 | 메인 스레드 부하 분산 |
| GPU 파티클 | 플랑크톤, 별빛 | CPU 부하 제거 |
| Texture Atlas | 물고기 스킨 | 텍스처 바인딩 최소화 |
| Adaptive Quality | 디바이스 성능 감지 | FPS < 30 시 자동 품질 하향 |

### 4.5 데이터베이스 스키마 (Supabase)

```sql
-- 유저 프로필
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id BIGINT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  theme TEXT DEFAULT 'default',
  customizations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수족관 스냅샷 (캐시 + 시간여행용)
CREATE TABLE aquarium_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  snapshot_date DATE NOT NULL,
  fish_data JSONB NOT NULL,          -- 물고기 상태 배열
  environment_data JSONB NOT NULL,   -- 환경 상태
  stats JSONB NOT NULL,              -- 통계 요약
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, snapshot_date)
);

-- 도감
CREATE TABLE codex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  species_id TEXT NOT NULL,          -- 예: "typescript_adult"
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  source_type TEXT NOT NULL,         -- 'own' | 'visited'
  source_username TEXT,              -- 방문으로 발견 시
  UNIQUE (user_id, species_id)
);

-- 방문 기록
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID REFERENCES users(id),
  host_id UUID REFERENCES users(id),
  visited_at TIMESTAMPTZ DEFAULT NOW()
);

-- 쿠도스
CREATE TABLE kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  repo_name TEXT NOT NULL,
  kudo_type TEXT NOT NULL,           -- 'star' | 'bug' | 'idea'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 업적
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- Webhook 이벤트 로그
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Design Specification

### 5.1 비주얼 아이덴티티

- **무드**: 사이버펑크 심해 + 픽셀/로우폴리 아트
- **컬러 팔레트**:
  - Background: `#031528` (심해 네이비)
  - Primary: `#4FC3F7` (바다 시안)
  - Accent: `#FFD54F` (별빛 골드)
  - Danger: `#FF6B6B` (산호 레드)
  - Surface: `rgba(5, 15, 35, 0.85)` (유리 패널)
- **타이포그래피**:
  - 제목: Orbitron (우주/사이버 느낌)
  - 본문/코드: JetBrains Mono
- **물고기 스타일**: Low-poly + 약간의 이미시브 (발광) + 반투명

### 5.2 UI 레이아웃

```
┌─────────────────────────────────────────────────────┐
│ [Stats HUD]                              [Back] [⚙] │
│  username's aquarium                                │
│  🐟 24 alive · 💀 6 fossils                         │
│  ★ 342 stars                                        │
│                                                     │
│                   ~~~~ 수면 ~~~~                     │
│                                                     │
│            🐠      🐟                               │
│       🐡          🐠    🐟                           │
│                        🐡                           │
│    🐟     🦈                   🐠                    │
│              🐢                                     │
│                                                     │
│   ⚱️ 🦴    🌿  🪨  🌿       🪨  🦴                    │
│ ════════ 해저 ═══════════════════════════            │
│                                                     │
│ [Event Feed]              [📸 Share] [📖 Codex]     │
└─────────────────────────────────────────────────────┘
```

### 5.3 반응형 브레이크포인트

| 브레이크포인트 | 변경 사항 |
|---|---|
| Desktop (1024px+) | 풀 3D, 모든 물고기, 사이드 패널 |
| Tablet (768~1023px) | 3D 유지, 물고기 30마리 제한, 오버레이 축소 |
| Mobile (< 768px) | 3D 유지 (성능 최적화), 물고기 20마리, 바텀시트 |

---

## 6. SEO & Growth Strategy

### 6.1 URL 구조

```
gitaquarium.com/                    → 랜딩
gitaquarium.com/{username}          → 개인 수족관
gitaquarium.com/{username}/codex    → 도감
gitaquarium.com/compare/{u1}/{u2}   → 비교
gitaquarium.com/merge/{u1}+{u2}     → 합체
gitaquarium.com/leaderboard         → 리더보드
gitaquarium.com/explore             → 탐험 (인기 수족관)
```

### 6.2 바이럴 루프

```
유저 생성 → "와 신기하다" → 공유 (Twitter, 카톡, 슬랙)
                                    ↓
                           친구가 클릭 → 내 수족관도 만듦
                                    ↓
                           비교 모드 → 또 공유
                                    ↓
                           도감/업적 → 리텐션 → 재공유
```

### 6.3 론칭 전략

| 단계 | 채널 | 기대 효과 |
|---|---|---|
| Day 0 | Product Hunt 런칭 | 초기 트래픽 + 피드백 |
| Day 0 | Hacker News "Show HN" | 개발자 커뮤니티 노출 |
| Day 1~3 | Twitter/X 쓰레드 + 데모 영상 | 바이럴 시작 |
| Day 1~3 | Reddit r/webdev, r/programming | 기술 커뮤니티 |
| Week 1 | DEV.to "I built this" 포스트 | SEO + 레퍼런스 |
| Week 1 | Korean communities (블밸, 개발자 카톡방) | 국내 유저 확보 |
| Week 2~4 | YouTube / TikTok 숏폼 "코딩 2년차의 수족관 vs 10년차" | 콘텐츠 바이럴 |
| Monthly | 시즌 이벤트 발표 | 리텐션 + 재유입 |

---

## 7. Development Roadmap

### Phase 1: MVP (4주)

```
Week 1: 프로젝트 세팅 + 3D 씬 기본
  - Next.js + R3F + Tailwind 보일러플레이트
  - GitHub API 연동 + Redis 캐싱
  - 기본 물고기 생성 (구체 기반)
  - 해저 환경 (바닥, 바위, 해초)

Week 2: 물고기 시스템 완성
  - 언어별 색상 + 스타 기반 크기
  - 수영 행동 (자율 이동, 꼬리 흔들기)
  - 진화 단계 기본 (alive vs fossil)
  - 기포 + 파티클 + 코스틱 라이팅

Week 3: 인터랙션 + UI
  - 마우스 호버 툴팁
  - 클릭 상세 패널
  - 카메라 컨트롤 (시차, 줌, 패닝)
  - 통계 HUD
  - 반응형 대응

Week 4: 공유 + 배포
  - OG 이미지 생성 (Satori)
  - URL 기반 공유 (/{username})
  - GIF/WebM 녹화 다운로드
  - Vercel 배포 + 도메인 연결
  - 성능 최적화 + 버그 픽스
  - README 작성 + Product Hunt 준비
```

### Phase 2: 생태계 (6주)

```
Week 5~6: 물고기 종별 모델
  - 15종 로우폴리 3D 모델 제작
  - 종별 수영 패턴 구현
  - 진화 단계별 외형 변화

Week 7~8: 군집 + 상호작용
  - Boids 알고리즘 (Web Worker)
  - 떼지어 + 기피 + 포식 행동
  - PR/Fork 관계 시각화

Week 9~10: 환경 + 사운드
  - 시간대별 조명 + 날씨
  - 컨트리뷰션 그래프 지형
  - Tone.js 앰비언스
  - 도감 v1
```

### Phase 3: 소셜 (6주)

```
Week 11~12: 비교 + 합체
Week 13~14: 방문 + 쿠도스 + 리더보드
Week 15~16: 공유 고도화 + README 위젯
```

### Phase 4: 실시간 (6주)

```
Week 17~18: GitHub OAuth + Webhook
Week 19~20: 실시간 이벤트 반응
Week 21~22: 라이브 모드 + 시간여행
```

### Phase 5: 게이미피케이션 (8주)

```
Week 23~26: 업적 + 시즌 이벤트 + 퀘스트
Week 27~30: 커스터마이징 시스템 + 숍
```

### Phase 6: 플랫폼 확장 (8주)

```
Week 31~34: Org 수족관 + API + 위젯
Week 35~38: 모바일 앱 + 수익화
```

**총 예상 기간: ~38주 (약 9개월)**
MVP는 4주 내 배포 가능.

---

## 8. Risk & Mitigation

| 리스크 | 확률 | 영향 | 대응 |
|---|---|---|---|
| GitHub API Rate Limit | 높음 | 높음 | Redis 캐싱, OAuth 앱, GraphQL 사용 |
| 3D 성능 (저사양 디바이스) | 중간 | 높음 | Adaptive Quality, LOD, 2D 폴백 |
| 물고기 40+ 시 프레임 드롭 | 중간 | 중간 | Instanced Mesh, Web Worker |
| 유사 프로젝트 등장 | 중간 | 중간 | 빠른 Phase 2~3 진입으로 해자 확보 |
| GitHub API 정책 변경 | 낮음 | 높음 | GraphQL API 우선 사용, 다중 소스 |
| 바이럴 실패 | 중간 | 높음 | 인플루언서 시딩, 커뮤니티 사전 구축 |

---

## 9. Competitive Analysis

### 9.1 직접 경쟁 프로젝트

| 프로젝트 | 형태 | 스타 | 장점 | 약점 | 우리와의 차이 |
|---|---|---|---|---|---|
| **Git City** (srizzon) | 3D 픽셀아트 도시 | ~2k | 커스터마이징, 소셜 기능, Stripe 결제 | 정적 건물, 관계 표현 없음, AGPL | 생명체 vs 건물. 진화/관계 시스템 없음 |
| **GitHub City** (honzaap) | 3D 도시 (컨트리뷰션 기반) | ~4k | 심플, 빠름, 컨트리뷰션 그래프 직접 매핑 | 레포 개별 표현 없음, 인터랙션 부재 | 레포 단위 시각화 vs 컨트리뷰션 총량 |
| **GitHub Skyline** (공식, 지금 중단) | 3D 스카이라인 | N/A | GitHub 공식, STL 3D 프린트 지원 | 서비스 종료됨, CLI만 남음 | 웹 서비스 활성 vs CLI only |
| **GitHub Unwrapped** | Spotify Wrapped 스타일 | ~3k | 연말 바이럴 효과 | 연 1회 이벤트, 실시간 아님 | 상시 라이브 vs 연간 스냅샷 |
| **Gource** | 소프트웨어 버전 관리 시각화 | ~12k | 커밋 히스토리 애니메이션 | 로컬 설치 필요, 웹 아님 | 웹 기반 즉시 접근 vs 로컬 도구 |
| **repo-visualizer** (GitHub Next) | 코드베이스 구조 원형 | ~3k | GitHub 공식, SVG 생성 | 정적 이미지, 재미 요소 없음 | 감성/재미 vs 분석 도구 |
| **CodeFlower** | 트리 구조 인터랙티브 | ~600 | D3.js 기반, 가벼움 | 단일 레포만, 프로필 단위 아님 | 프로필 전체 생태계 vs 단일 레포 |

### 9.2 간접 경쟁 & 영감 소스

| 프로젝트 | 카테고리 | 우리가 배울 점 |
|---|---|---|
| Spotify Wrapped | 연말 리캡 | 공유 카드 디자인, 바이럴 루프 구조 |
| Tamagotchi / 다마고치 | 가상 펫 | "키우는 재미"의 핵심 메커니즘 |
| noclip.website | 게임 맵 브라우저 | 3D 공간 자유 탐험 UX |
| Pokémon 도감 | 수집형 시스템 | 도감 완성 욕구, 레어도 시스템 |
| city-roads (anvaka) | 도시 도로 시각화 | 미니멀한 데이터→아트 변환 |
| Steam 연말 리캡 | 게이머 프로필 | 데이터 기반 개인화 스토리텔링 |

### 9.3 경쟁 우위 (Moat) 전략

Git Aquarium만의 해자는 다음 3가지:

1. **생명체 메타포**: 건물/차트/그래프가 아닌 "살아있는 것"이라는 감정적 연결. 사람은 본능적으로 움직이는 생명체에 관심을 가짐
2. **관계 시각화**: 단독 프로필이 아닌 개발자 간 관계(PR, Fork, Co-author)를 생태계 상호작용으로 표현하는 유일한 프로젝트
3. **게이미피케이션 레이어**: 도감 + 업적 + 시즌 이벤트로 리텐션. 다른 프로젝트는 한 번 보고 끝이지만, Git Aquarium은 "도감 채우러" 다시 옴

---

## 10. Legal & Compliance

### 10.1 GitHub API Terms of Service

GitHub API 사용 시 반드시 준수해야 할 사항:

| 항목 | 요구사항 | 우리의 대응 |
|---|---|---|
| Rate Limit 준수 | 과도한 요청 시 계정 정지 가능 | Redis 캐싱, Exponential Backoff, 비인증 60req/h → OAuth 5,000req/h |
| 데이터 용도 제한 | 스팸, 리크루팅 목적 사용 금지 | 순수 시각화 목적만, 이메일 등 PII 수집하지 않음 |
| API 토큰 공유 금지 | Rate Limit 우회 목적 토큰 공유 불가 | 서버사이드에서만 토큰 사용, 클라이언트 노출 없음 |
| 사용자 동의 | OAuth 시 최소 권한 요청 | `read:user`, `repo` (public only) scope만 요청 |
| 데이터 삭제 | 유저 요청 시 데이터 삭제 의무 | 계정 삭제 기능 제공, 30일 내 완전 삭제 |

### 10.2 GitHub 상표 가이드라인

- "GitHub"라는 단어 사용 시 GitHub의 로고 가이드라인(https://github.com/logos) 준수
- 프로젝트 이름에 "GitHub"를 포함하지 않음 → "Git Aquarium"으로 명명 (Git은 별도 소프트웨어 이름)
- GitHub 로고를 앱 내에서 사용할 경우 가이드라인에 따른 크기, 여백, 색상 준수
- "GitHub와 제휴/공식 제품"이라는 인상을 주지 않음. Footer에 "Not affiliated with GitHub, Inc." 명시
- GitHub Octocat 사용 금지 (별도 허가 없는 한)

### 10.3 "Git" 상표 리스크

- "Git"은 Software Freedom Conservancy의 상표
- "Git Aquarium"이라는 이름은 Git 소프트웨어와 혼동을 줄 가능성 낮음 (시각화 도구이지 VCS가 아님)
- 안전장치: 서비스 설명에 "Git Aquarium visualizes GitHub data"로 GitHub 데이터 시각화 도구임을 명확히
- 만약 상표 이슈 발생 시 대안 이름: "DevOcean", "CodeReef", "RepoSea"

### 10.4 개인정보 보호 (GDPR / PIPA)

| 수집 데이터 | 유형 | 법적 근거 | 보존 기간 |
|---|---|---|---|
| GitHub 유저네임 | 공개 데이터 | 정당한 이익 (Legitimate Interest) | 서비스 이용 중 |
| GitHub 레포 목록 | 공개 데이터 | 정당한 이익 | Redis 캐시 1~6시간 |
| OAuth 토큰 | 인증 데이터 | 동의 (Consent) | 세션 종료 시 삭제 |
| 이메일 (OAuth 시) | PII | 동의 | 계정 삭제 시 삭제 |
| 쿠키/세션 | 기술적 데이터 | 정당한 이익 | 세션 종료 시 |
| 방문 기록, 쿠도스 | 서비스 데이터 | 동의 | 계정 삭제 시 삭제 |

필수 문서:
- Privacy Policy (영문/한국어)
- Terms of Service
- Cookie Policy
- GDPR 데이터 주체 권리 안내 (열람, 수정, 삭제, 이동, 반대)
- 한국 PIPA(개인정보보호법) 준수: 개인정보 처리방침 고지

### 10.5 라이선스 전략

| 옵션 | 장점 | 단점 | 적합도 |
|---|---|---|---|
| MIT | 최대 채택, 기여자 유입 용이 | 누구나 복제 가능 | ⭐⭐⭐ |
| Apache 2.0 | 특허 보호, 기업 친화 | MIT보다 복잡 | ⭐⭐ |
| AGPL 3.0 | SaaS 복제 방지, Git City도 사용 | 기업 기여자 기피, 포크 제한 | ⭐⭐ |
| BSL (Business Source License) | 소스 공개 + 상업적 사용 제한 | 진정한 오픈소스가 아님 | ⭐ |

**권장**: 코어 엔진은 **MIT**, 프리미엄 기능 (실시간, 커스터마이징 숍)은 클로즈드 소스. 오픈코어 모델.

### 10.6 저작권 & 에셋

- 3D 물고기 모델: 자체 제작 또는 CC0/CC-BY 라이선스 모델만 사용
- Sketchfab/Poly Pizza 등에서 가져올 경우 라이선스 명시
- 사운드: Freesound.org CC0 또는 자체 Tone.js 절차적 생성
- 폰트: Orbitron (OFL), JetBrains Mono (OFL) — 둘 다 오픈 폰트 라이선스
- 아이콘: Lucide React (ISC License)

---

## 11. Accessibility & Fallback

### 11.1 접근성 (a11y) 요구사항

| WCAG 기준 | 적용 | 구현 방법 |
|---|---|---|
| 1.1 텍스트 대체 | 3D 씬에 대한 텍스트 요약 | aria-label로 "24마리 물고기, 6마리 화석" 등 |
| 1.4.1 색상만으로 구분 금지 | 색맹 유저 대응 | 물고기에 패턴/아이콘 추가, 색맹 모드 토글 |
| 1.4.3 명암비 | UI 오버레이 텍스트 | 최소 4.5:1 대비율, 반투명 배경 위 텍스트 주의 |
| 2.1 키보드 접근 | 마우스 없이 조작 | Tab으로 물고기 순회, Enter로 상세 열기, 방향키로 카메라 |
| 2.3.1 깜빡임 | 발광 이펙트 | 초당 3회 이하 깜빡임, 모션 감소 설정 시 비활성화 |
| 2.5 입력 방식 | 터치, 마우스, 키보드 | 모든 인터랙션 다중 입력 지원 |

### 11.2 모션 감소 (Reduced Motion)

```css
@media (prefers-reduced-motion: reduce) {
  /* 물고기 수영 → 정적 배치 */
  /* 기포 애니메이션 → 정적 점 */
  /* 카메라 시차 → 고정 */
  /* 코스틱 라이팅 → 정적 조명 */
}
```

- `prefers-reduced-motion` 미디어 쿼리 감지
- OS 수준 설정 자동 반영
- 수동 토글도 제공 (설정 패널)

### 11.3 색맹 모드

| 유형 | 영향 | 대응 |
|---|---|---|
| 적녹색맹 (Protanopia/Deuteranopia) | 빨강↔초록 구분 불가 | 물고기에 언어별 도형 패턴 추가 (줄무늬, 점, 격자 등) |
| 청황색맹 (Tritanopia) | 파랑↔노랑 구분 불가 | 하이콘트라스트 모드 제공 |
| 단색형 색맹 (Achromatopsia) | 모든 색상 구분 불가 | 명암 + 패턴 + 크기 + 아이콘으로 구분 |

### 11.4 WebGL Fallback

WebGL 미지원 환경 (일부 모바일 브라우저, 구형 디바이스):

1. **감지**: `WebGLRenderingContext` 존재 여부 체크
2. **2D Canvas 폴백**: Canvas 2D로 단순화된 수족관 렌더링 (위에서 본 시점, 2D 물고기)
3. **Static 폴백**: Satori 기반 서버사이드 렌더링된 SVG 이미지
4. **텍스트 폴백**: 물고기 목록 + 통계 테이블 (최후의 수단)

폴백 감지 플로우:
```
WebGL2 지원? → 풀 3D (Phase 1 기본)
  ↓ No
WebGL1 지원? → 3D (기능 축소: 파티클 제거, LOD 하향)
  ↓ No
Canvas 2D? → 2D 수족관 뷰
  ↓ No
→ 정적 SVG + 텍스트 리스트
```

### 11.5 스크린리더 지원

- 3D 씬 컨테이너: `role="img"`, `aria-label="(username)의 Git Aquarium: 물고기 24마리, 화석 6마리, 총 스타 342개"`
- 물고기 호버/클릭 시 툴팁: `role="tooltip"`, `aria-live="polite"`
- 통계 HUD: 시맨틱 HTML (`<dl>`, `<dt>`, `<dd>`)
- 이벤트 피드: `aria-live="polite"` 로 실시간 알림 전달

---

## 12. Data Pipeline & API Details

### 12.1 GitHub REST API 상세

#### Pagination 처리

GitHub API는 기본 30개, 최대 100개/페이지. 레포 100개 초과 유저 처리:

```
GET /users/{user}/repos?per_page=100&page=1
GET /users/{user}/repos?per_page=100&page=2
...
Link 헤더의 rel="next" 없을 때까지 반복
```

최대 페이지 제한: 10페이지 (1,000개 레포). 이 이상은 GraphQL로 전환.

#### Conditional Requests

304 Not Modified 활용으로 Rate Limit 절약:

```
GET /users/{user}/repos
If-None-Match: "etag_value_from_previous_request"
→ 304 Not Modified (변경 없음, Rate Limit 소모 안 함)
→ 200 OK (변경 있음, 새 데이터)
```

모든 캐시된 응답에 ETag 저장, 다음 요청 시 전송.

### 12.2 GitHub GraphQL API

REST보다 효율적인 데이터 페칭. 한 번의 요청으로 여러 데이터 수집:

```graphql
query UserAquariumData($username: String!) {
  user(login: $username) {
    # 기본 프로필
    login
    avatarUrl
    createdAt
    followers { totalCount }
    following { totalCount }
    
    # 컨트리뷰션 그래프 (해저 지형 매핑용)
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            weekday
          }
        }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
    }
    
    # 레포지토리 (물고기 데이터)
    repositories(
      first: 100
      orderBy: { field: UPDATED_AT, direction: DESC }
      ownerAffiliations: OWNER
      isFork: false
    ) {
      totalCount
      nodes {
        name
        description
        url
        createdAt
        updatedAt
        pushedAt
        stargazerCount
        forkCount
        primaryLanguage { name color }
        languages(first: 5) {
          nodes { name color }
        }
        licenseInfo { spdxId }
        hasWikiEnabled
        hasIssuesEnabled
        issues(states: OPEN) { totalCount }
        pullRequests(states: MERGED) { totalCount }
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 1) {
                totalCount
                nodes { committedDate }
              }
            }
          }
        }
        repositoryTopics(first: 5) {
          nodes { topic { name } }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    
    # 소셜 관계 (Phase 2+ 에서 사용)
    organizations(first: 10) {
      nodes { login avatarUrl }
    }
  }
}
```

### 12.3 데이터 변환 파이프라인

```
GitHub API Response
       │
       ▼
┌─────────────────────┐
│  Raw Data Fetcher   │ ← REST/GraphQL, Pagination, Error Handling
│  (Server-side)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Cache Layer        │ ← Redis: 키 = `aquarium:{username}`, TTL = 1h
│  (Upstash Redis)    │   ETag 저장: `etag:{username}`, TTL = 24h
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Data Transformer   │ ← Repo → Fish 매핑 로직
│  (Server-side)      │   언어→종, 스타→크기, 커밋→활력, 시간→진화단계
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Aquarium Schema    │ ← JSON: { fish[], environment, stats }
│  (API Response)     │   클라이언트로 전달
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3D Scene Builder   │ ← Three.js 오브젝트 생성
│  (Client-side)      │   위치 배정, 행동 초기화
└─────────────────────┘
```

### 12.4 Aquarium JSON Schema

API 응답 형태:

```json
{
  "username": "chamdom",
  "generated_at": "2026-03-13T12:00:00Z",
  "cache_hit": true,
  "profile": {
    "avatar_url": "https://...",
    "created_at": "2022-01-15",
    "followers": 42,
    "account_age_days": 1518
  },
  "environment": {
    "tank_size": "large",
    "depth_layers": 3,
    "brightness": 0.7,
    "terrain_data": [[0,1,3,2], [...]],
    "current_strength": 0.5,
    "time_of_day": "afternoon"
  },
  "fish": [
    {
      "id": "prediction-bot",
      "name": "prediction-bot",
      "species": "angelfish",
      "language": "TypeScript",
      "color": "#3178c6",
      "size": 0.8,
      "evolution_stage": "adult",
      "is_dead": false,
      "stars": 12,
      "forks": 3,
      "open_issues": 2,
      "total_commits": 156,
      "last_commit": "2026-03-10",
      "has_readme": true,
      "has_license": true,
      "topics": ["trading", "polymarket"],
      "behavior": {
        "speed": 0.6,
        "school_id": "typescript_group",
        "swim_pattern": "standard"
      }
    }
  ],
  "stats": {
    "total_fish": 24,
    "alive": 18,
    "fossils": 6,
    "total_stars": 342,
    "language_distribution": {
      "TypeScript": 8,
      "Python": 5,
      "JavaScript": 4,
      "Solidity": 1
    },
    "rarest_species": "seahorse",
    "biggest_fish": "prediction-bot"
  }
}
```

### 12.5 Rate Limit 관리 전략

| 상황 | 전략 |
|---|---|
| 비인증 요청 (60/h) | MVP 단계, 캐시 TTL 2시간으로 넉넉히 |
| OAuth App (5,000/h) | Phase 2+, 서버에 GitHub OAuth App 토큰 |
| User Token (5,000/h) | 로그인 유저는 개인 토큰으로 자기 데이터 조회 |
| Rate Limit 도달 시 | `X-RateLimit-Remaining` 헤더 모니터링, 100 이하 시 캐시 only 모드 |
| Burst 방지 | 동시 요청 최대 10개, 큐잉 시스템 |
| Retry 전략 | 429 응답 시 `Retry-After` 헤더 기반 재시도 |
| Secondary Rate Limit | 동시 요청 제한: 사용자당 직렬 처리 |

---

## 13. Testing & QA Strategy

### 13.1 테스트 피라미드

```
            ╱╲
           ╱  ╲         E2E Tests (Playwright)
          ╱ 5% ╲        브라우저에서 전체 플로우 테스트
         ╱──────╲
        ╱        ╲      Integration Tests (Vitest)
       ╱   15%    ╲     API + Cache + DB 연동 테스트
      ╱────────────╲
     ╱              ╲   Unit Tests (Vitest)
    ╱     80%        ╲  물고기 생성, 매핑 로직, 진화 판정 등
   ╱──────────────────╲
```

### 13.2 테스트 영역별 상세

#### Unit Tests (Vitest)

| 대상 | 테스트 항목 |
|---|---|
| `repoToFish()` | 언어→종 매핑, 스타→크기 스케일, 진화 단계 판정 |
| `isDead()` | 6개월 기준 경계값 (179일=alive, 180일=dead, 181일=dead) |
| `getFishSize()` | 스타 0→0.3, 스타 1→0.45, 스타 1000→1.8 (cap) |
| `buildEnvironment()` | 컨트리뷰션 데이터 → 지형 매핑 |
| `evolutionStage()` | 커밋 수 + 기간 → 올바른 단계 반환 |
| `schoolAssignment()` | 같은 언어 물고기 떼 그룹핑 |
| `cacheKeyGeneration()` | 유저네임 → 일관된 캐시 키 |
| `paginationHandler()` | Link 헤더 파싱, 다음 페이지 URL 추출 |
| `rateLimitChecker()` | 헤더 기반 남은 요청 수 계산 |

#### Integration Tests

| 대상 | 테스트 항목 |
|---|---|
| API Route | `/api/aquarium/{username}` → 올바른 JSON 응답 |
| GitHub API Mock | Nock/MSW로 GitHub 응답 Mock, 에러 케이스 |
| Redis Cache | 캐시 Hit/Miss, TTL 만료, ETag 처리 |
| Supabase | 유저 생성, 도감 업데이트, 업적 잠금해제 |
| OG Image | Satori 렌더링 출력 검증 |

#### E2E Tests (Playwright)

| 시나리오 | 검증 항목 |
|---|---|
| 유저네임 입력 → 수족관 로딩 | 3D 씬 렌더링, 물고기 존재, 에러 없음 |
| 물고기 호버 → 툴팁 | 툴팁 표시, 올바른 레포 정보 |
| 공유 버튼 클릭 | 클립보드에 URL 복사 |
| 존재하지 않는 유저 | 에러 메시지 표시, 크래시 없음 |
| 모바일 뷰포트 | 터치 인터랙션, 반응형 레이아웃 |
| 모션 감소 설정 | 애니메이션 비활성화 확인 |
| WebGL 비활성 | 폴백 모드 작동 확인 |

### 13.3 비주얼 리그레션 테스트

3D 프로젝트 특성상 비주얼 변경 감지가 중요:

- **도구**: Playwright `toHaveScreenshot()` + Percy/Chromatic
- **기준 스냅샷**: 고정 시드(seed) 데이터로 일관된 3D 씬 생성
- **비교 영역**: 랜딩 페이지, 수족관 씬 (카메라 고정), 툴팁, HUD, 모바일 뷰
- **허용 차이**: 픽셀 차이 0.5% 이내 (GPU 렌더링 차이 허용)
- **CI 연동**: PR마다 자동 스크린샷 비교, 차이 발생 시 리뷰 요청

### 13.4 성능 테스트

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| FPS (데스크탑) | 60fps 안정 | `requestAnimationFrame` 타이밍 + Chrome DevTools |
| FPS (모바일) | 30fps 이상 | 실 디바이스 테스트 (iPhone 12+, Galaxy S21+) |
| LCP (Largest Contentful Paint) | < 2.5초 | Lighthouse, WebPageTest |
| TTI (Time to Interactive) | < 3.5초 | Lighthouse |
| 3D 씬 로드 | < 2초 (캐시 히트) | 커스텀 메트릭 |
| 메모리 사용량 | < 200MB | Chrome Task Manager |
| 물고기 100마리 시 FPS | 30fps 이상 | 스트레스 테스트 |

### 13.5 크로스 브라우저 & 디바이스

| 브라우저 | 최소 버전 | WebGL | 비고 |
|---|---|---|---|
| Chrome | 90+ | WebGL2 | 주 타겟 |
| Firefox | 90+ | WebGL2 | |
| Safari | 15+ | WebGL2 | iOS 포함 |
| Edge | 90+ | WebGL2 | Chromium 기반 |
| Samsung Internet | 15+ | WebGL2 | 안드로이드 |

GPU 호환성:
- Integrated GPU (Intel UHD 620+): LOD 중간, 파티클 50% 감소
- Mobile GPU (Adreno 640+, Mali-G77+): LOD 낮음, 물고기 20개 제한
- Dedicated GPU (GTX 1060+): 풀 품질

---

## 14. Security

### 14.1 인증 & 인가

비로그인 유저 (Phase 1): 공개 데이터만 조회, GitHub API 비인증 (60 req/h), 수족관 생성/공유만 가능.

로그인 유저 (Phase 3+): GitHub OAuth (PKCE Flow), Scope: `read:user`, `repo` (public only), 개인 Rate Limit (5,000 req/h), 도감/업적/커스터마이징 접근, Webhook 연동 (Phase 4).

### 14.2 OAuth 보안

- PKCE (Proof Key for Code Exchange) 필수 사용
- State 파라미터로 CSRF 방지
- Access Token은 서버사이드에서만 저장 (httpOnly 쿠키 또는 Supabase Auth)
- Refresh Token 사용하지 않음 (필요 시 재인증)
- Token은 DB에 암호화 저장 (AES-256)

### 14.3 API 보안

| 위협 | 대응 |
|---|---|
| DDoS | Vercel Edge, Cloudflare 프록시, Rate Limiting (100 req/min/IP) |
| API 남용 | API 키 (Phase 6), 요청 제한, CAPTCHA (의심스러운 트래픽) |
| 인젝션 | 유저네임 입력 검증 (`^[a-zA-Z0-9-]{1,39}$`), SQL 파라미터 바인딩 |
| XSS | React의 기본 이스케이핑, CSP 헤더, `dangerouslySetInnerHTML` 사용 금지 |
| CORS | 허용된 오리진만 (`gitaquarium.com`, `localhost`) |

### 14.4 데이터 보안

- 전송 중: TLS 1.3 (HTTPS only, HSTS 적용)
- 저장 시: Supabase 기본 암호화, 민감 데이터 (OAuth 토큰) AES-256 추가 암호화
- 백업: Supabase 일일 자동 백업, Point-in-time Recovery
- 로그: 개인 식별 정보 마스킹 (유저네임 해시 처리)

### 14.5 의존성 보안

- `npm audit` CI 파이프라인에 통합
- Dependabot/Renovate 자동 PR
- Snyk 또는 Socket.dev로 공급망 공격 감지
- Three.js 등 핵심 의존성 버전 고정 (lockfile)

---

## 15. Community & Contributor Strategy

### 15.1 오픈소스 거버넌스

| 문서 | 내용 |
|---|---|
| `README.md` | 프로젝트 소개, 데모 GIF, 빠른 시작, 기술 스택 |
| `CONTRIBUTING.md` | 기여 가이드: 이슈 생성 → PR 프로세스 → 코드 리뷰 기준 |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 기반 행동 강령 |
| `ARCHITECTURE.md` | 코드 구조, 디렉토리 레이아웃, 핵심 모듈 설명 |
| `LICENSE` | MIT (코어) |
| `.github/ISSUE_TEMPLATE/` | 버그 리포트, 기능 요청, 물고기 종 제안 템플릿 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 체크리스트 |

### 15.2 물고기 종 커뮤니티 공모

Git Aquarium의 킬러 커뮤니티 전략: **사람들이 직접 새 물고기 종을 디자인하고 PR로 추가**.

프로세스:
1. `fish-species/` 디렉토리에 종 정의 파일 (JSON + 3D 모델 + 메타데이터)
2. 이슈 템플릿: "New Fish Species Proposal" — 종 이름, 출현 조건, 비주얼 컨셉
3. 커뮤니티 투표: Discussion에서 👍 30개 이상 → 공식 채택
4. 기여자가 3D 모델 제작 또는 디자인 시안 제출
5. 코어팀 리뷰 → 머지 → 크레딧 표시

기대 효과:
- 컨트리뷰터가 곧 유저 (자기가 만든 물고기 보러 옴)
- 커뮤니티 소속감 (내가 만든 물고기가 전 세계 수족관에!)
- GitHub 스타 유인 (컨트리뷰터가 자발적으로 홍보)

### 15.3 기여 난이도별 이슈 태깅

| 라벨 | 대상 | 예시 |
|---|---|---|
| `good-first-issue` | 오픈소스 입문자 | 오타 수정, 색상 추가, 문서 번역 |
| `help-wanted` | 중급 기여자 | 새 물고기 수영 패턴, 성능 최적화 |
| `fish-design` | 3D 아티스트 | 새 물고기 종 모델링 |
| `sound-design` | 오디오 기여자 | 수중 앰비언스 샘플 추가 |
| `translation` | 다국어 기여자 | i18n 번역 파일 |
| `core` | 핵심 컨트리뷰터 | 아키텍처 변경, 신규 시스템 |

### 15.4 커뮤니티 채널

| 채널 | 용도 | 시점 |
|---|---|---|
| GitHub Discussions | 기능 제안, Q&A, 물고기 투표 | Phase 1 런칭 시 |
| Discord 서버 | 실시간 소통, 수족관 자랑, 개발 토론 | Phase 2 |
| Twitter/X @gitaquarium | 업데이트 발표, 커뮤니티 수족관 RT | Phase 1 |
| DEV.to / 블로그 | 기술 포스트, 릴리즈 노트 | Phase 1 |

---

## 16. Easter Eggs & Hidden Features

바이럴과 커뮤니티 문화 형성을 위한 숨겨진 요소들.

### 16.1 유저네임 기반 이스터에그

| 유저네임 | 이스터에그 | 설명 |
|---|---|---|
| `torvalds` | Leviathan Boss | 화면 전체를 차지하는 거대한 심해 보스어 등장 |
| `mojombo` | Golden Octocat Fish | GitHub 창립자 전용 황금 옥토캣 물고기 |
| `gaearon` | React Blue Whale | React 메인테이너 전용 파란 고래 |
| `sindresorhus` | Infinity Fish | 레포 1,500+에 대한 경의, 무한 반복 수영 |
| `antirez` | Redis Lobster | Redis 창시자, 빨간 바닷가재 |

### 16.2 레포 이름 기반 이스터에그

| 레포 이름 패턴 | 이스터에그 |
|---|---|
| `awesome-*` | 물고기가 왕관을 씀 |
| `todo` / `todolist` | 물고기가 체크리스트를 물고 다님 |
| `dotfiles` | 투명에 가까운 유령 물고기 |
| `.github` | 작은 옥토캣 산호 |
| `hello-world` | 알에서 막 깨어나는 아기 물고기 |
| `*-bot` | 로봇 물고기 (기계 외형) |

### 16.3 날짜 기반 이스터에그

| 날짜 | 이벤트 |
|---|---|
| 4월 1일 (만우절) | 모든 물고기가 거꾸로 헤엄침 |
| 10월 31일 (핼러윈) | 수족관이 어두워지고 해골 물고기 출현 |
| 12월 25일 (크리스마스) | 산타 모자 쓴 물고기, 눈 내리는 수면 |
| 유저 GitHub 가입일 | 물고기들이 원형으로 축하 대형 |
| Hacktoberfest (10월) | 주황색 파티클 효과 |

### 16.4 Konami 코드

수족관 화면에서 `↑↑↓↓←→←→BA` 입력 시:
- 모든 물고기가 8비트 픽셀아트로 변환
- 레트로 BGM 재생
- 30초간 유지 후 원래 상태로

### 16.5 시크릿 종

도감에 표시되지만 조건이 "???"로 숨겨진 물고기들:

| 종 이름 | 실제 조건 (비공개) | 힌트 |
|---|---|---|
| Ghost Fish | 레포가 1개이고 커밋 0 | "존재하지만 보이지 않는..." |
| Zombie Fish | 화석에서 다시 커밋 시작 | "죽음을 넘어 돌아온..." |
| Pirate Fish | 라이선스 없는 레포 10개+ | "법 없이 바다를 누비는..." |
| Scholar Fish | README가 5,000자 이상 레포 보유 | "지식의 바다를 헤엄치는..." |
| Chameleon Fish | 5개 이상 언어 사용 레포 | "어디든 적응하는..." |

---

## 17. Internationalization (i18n)

### 17.1 지원 언어 로드맵

| Phase | 언어 | 이유 |
|---|---|---|
| Phase 1 (MVP) | English (default) | 글로벌 런칭 기본 |
| Phase 1 | 한국어 | 메인 개발자 & 초기 커뮤니티 |
| Phase 2 | 일본어, 중국어 (간체) | 아시아 개발자 시장 |
| Phase 3 | 스페인어, 포르투갈어 | 라틴아메리카 개발자 커뮤니티 |
| Phase 4+ | 커뮤니티 기여 번역 | Crowdin/Weblate 연동 |

### 17.2 i18n 아키텍처

- **라이브러리**: `next-intl` (Next.js App Router 네이티브 지원)
- **URL 구조**: `gitaquarium.com/ko/{username}`, `gitaquarium.com/en/{username}`
- **감지 순서**: URL 경로 > 쿠키 > `Accept-Language` 헤더 > 기본값 (en)
- **번역 범위**: UI 텍스트만 번역. 물고기 이름, 도감 설명, 업적 텍스트 포함. GitHub 데이터 (레포명, 설명)는 원본 유지

### 17.3 다국어 고려사항

- 텍스트 길이 변동: 독일어는 영어 대비 30% 길어짐 → UI 유연한 레이아웃
- RTL 언어 (아랍어, 히브리어): Phase 4+ 에서 고려, CSS `direction: rtl`
- 날짜/숫자 포맷: `Intl.DateTimeFormat`, `Intl.NumberFormat` 사용
- 물고기 종 이름: 각 언어별 창의적 이름 (영어 Angelfish → 한국어 천사어)

---

## 18. Analytics & Monitoring

### 18.1 프로덕트 애널리틱스

| 도구 | 용도 | 비고 |
|---|---|---|
| Vercel Analytics | 웹 성능 (Core Web Vitals) | LCP, FID, CLS |
| PostHog (Self-host) / Plausible | 유저 행동 (프라이버시 친화) | 수족관 생성, 물고기 클릭, 공유, 도감 열기 |
| Custom Events | 핵심 퍼널 | 랜딩→입력→생성→공유 전환율 |

핵심 트래킹 이벤트:

| 이벤트 | 프로퍼티 | 목적 |
|---|---|---|
| `aquarium_created` | username, fish_count, load_time | 생성 성공률 |
| `fish_clicked` | repo_name, species, evolution_stage | 인기 물고기/레포 |
| `share_initiated` | method (url/twitter/gif) | 공유 채널 효과 |
| `share_completed` | method, success | 실제 공유 완료율 |
| `codex_opened` | completion_percent | 도감 참여율 |
| `comparison_created` | user1, user2 | 비교 기능 사용률 |
| `session_duration` | seconds, fish_hovered_count | 체류 시간 |
| `fallback_triggered` | type (2d/static/text) | 폴백 발생률 |
| `error_occurred` | error_type, context | 에러 발생률 |

### 18.2 인프라 모니터링

| 도구 | 대상 | 알림 조건 |
|---|---|---|
| Sentry | 클라이언트/서버 에러 | 에러율 > 1%, 새로운 에러 타입 |
| Vercel Logs | API 응답 시간, 상태 코드 | P95 > 3초, 5xx > 0.5% |
| Upstash Redis Metrics | 캐시 히트율, 메모리 | 히트율 < 80%, 메모리 > 80% |
| UptimeRobot / BetterStack | 서비스 가용성 | 다운타임 감지 → Slack/Discord 알림 |
| GitHub API | Rate Limit 잔여 | 잔여 < 500 → 경고, < 100 → 캐시 only 모드 |

---

## 19. Disaster Recovery & Incident Response

### 19.1 장애 대응 플로우

```
감지 (모니터링 알림)
     │
     ▼
평가 (Severity 판단)
     │
     ├── SEV1 (서비스 완전 다운) → 즉시 대응, 15분 내 상태 페이지 업데이트
     ├── SEV2 (주요 기능 장애) → 1시간 내 대응
     └── SEV3 (경미한 이슈) → 다음 근무일 대응
     │
     ▼
대응 (원인 파악 + 핫픽스)
     │
     ▼
복구 (서비스 정상화 확인)
     │
     ▼
포스트모템 (원인 분석, 재발 방지)
```

### 19.2 장애 시나리오별 대응

| 시나리오 | 영향 | 대응 |
|---|---|---|
| GitHub API 다운 | 새 수족관 생성 불가 | Redis 캐시에서 기존 데이터 제공, "GitHub API 일시 중단" 배너 |
| Vercel 다운 | 전체 서비스 불가 | 상태 페이지(BetterStack)에 공지, GitHub Discussions에 안내 |
| Redis 다운 | 응답 느려짐, Rate Limit 초과 위험 | 인메모리 폴백 (LRU Cache), GitHub API 직접 요청 (속도 제한) |
| Supabase 다운 | 로그인, 도감, 업적 불가 | 비로그인 모드로 폴백, 수족관 생성은 정상 작동 |
| DDoS 공격 | 서비스 느려짐/불가 | Vercel Edge + Cloudflare 자동 방어, 필요시 수동 IP 차단 |
| 데이터 유출 | 유저 OAuth 토큰 노출 | 전체 토큰 즉시 Revoke, 영향 유저 알림, GitHub에 보고 |

### 19.3 백업 전략

| 대상 | 방법 | 주기 | 보존 |
|---|---|---|---|
| Supabase DB | 자동 일일 백업 + PITR | 매일 | 30일 |
| Redis 캐시 | 백업 불필요 (재생성 가능) | - | - |
| 환경변수/시크릿 | Vercel + 1Password | 변경 시 | 영구 |
| 코드 | GitHub (기본) | 커밋마다 | 영구 |

---

## 20. Content Moderation

### 20.1 악용 시나리오 & 대응

| 시나리오 | 대응 |
|---|---|
| 공격적 레포명을 가진 유저의 수족관 | 물고기 이름에 욕설 필터 적용 (서버사이드) |
| 특정 유저에게 쿠도스 폭탄 | 일일 쿠도스 제한 (10회/일), 동일 유저에게 3회/일 |
| 리더보드 조작 (가짜 레포 대량 생성) | 스타 0 & 커밋 0 레포 필터링, 계정 나이 가중치 |
| 봇 수족관 대량 생성 | reCAPTCHA v3 (의심 점수 기반), 분당 생성 제한 |
| 불쾌한 프로필 이미지 (GitHub 아바타) | GitHub 아바타 직접 표시 → GitHub의 정책에 위임 |

### 20.2 신고 시스템

- 물고기/수족관에 "Report" 버튼
- 신고 유형: 부적절한 콘텐츠, 스팸, 괴롭힘
- 신고 접수 → 큐에 추가 → 24시간 내 검토
- 조치: 경고, 수족관 비공개 전환, 계정 정지

---

## 21. CI/CD Pipeline

### 21.1 파이프라인 구조

```
Push / PR to main
       │
       ▼
┌──────────────────┐
│  Lint & Format   │  ESLint + Prettier (30초)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Type Check      │  tsc --noEmit (20초)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Unit Tests      │  Vitest 병렬 (1분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Integration     │  Vitest + MSW (2분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Build           │  next build (2분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Visual Snapshot │  Playwright Screenshots (3분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  E2E Tests       │  Playwright Chromium + Firefox (5분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Preview Deploy  │  Vercel Preview (PR별, 1분)
└────────┬─────────┘
    Merge to main
         ▼
┌──────────────────┐
│  Production      │  Vercel Production Deploy (1분)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Smoke Test      │  프로덕션 헬스체크 (30초)
└──────────────────┘
```

### 21.2 GitHub Actions 워크플로우

| 워크플로우 | 트리거 | 내용 |
|---|---|---|
| `ci.yml` | Push, PR | 린트 → 타입체크 → 테스트 → 빌드 |
| `visual-regression.yml` | PR | 스크린샷 비교, 차이 코멘트 |
| `e2e.yml` | PR to main | Playwright E2E |
| `dependency-review.yml` | PR | 새 의존성 보안 검토 |
| `release.yml` | Tag push | 릴리즈 노트 자동 생성, Changelog 업데이트 |
| `stale.yml` | Cron (주간) | 비활성 이슈/PR 정리 |

---

## 22. Project Directory Structure

```
git-aquarium/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml
│   │   ├── feature_request.yml
│   │   └── fish_species_proposal.yml
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── visual-regression.yml
│   │   ├── e2e.yml
│   │   └── release.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── public/
│   ├── models/                     # 3D 물고기 모델 (.glb)
│   │   ├── angelfish.glb
│   │   ├── manta.glb
│   │   ├── turtle.glb
│   │   └── ...
│   ├── sounds/                     # 수중 사운드
│   └── og/                         # 정적 OG 이미지 폴백
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/
│   │   │   ├── [username]/
│   │   │   │   ├── page.tsx        # 수족관 페이지
│   │   │   │   └── codex/
│   │   │   │       └── page.tsx    # 도감 페이지
│   │   │   ├── compare/
│   │   │   │   └── [u1]/[u2]/
│   │   │   │       └── page.tsx    # 비교 페이지
│   │   │   ├── explore/
│   │   │   │   └── page.tsx        # 탐험 페이지
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx            # 랜딩
│   │   ├── api/
│   │   │   ├── aquarium/
│   │   │   │   └── [username]/
│   │   │   │       └── route.ts    # 수족관 데이터 API
│   │   │   ├── og/
│   │   │   │   └── [username]/
│   │   │   │       └── route.tsx   # OG 이미지 생성
│   │   │   └── webhook/
│   │   │       └── github/
│   │   │           └── route.ts    # Webhook 수신
│   │   └── layout.tsx
│   │
│   ├── engine/                     # 수족관 3D 엔진
│   │   ├── scene/
│   │   │   ├── AquariumScene.tsx   # 메인 R3F 씬
│   │   │   ├── Environment.tsx     # 환경 (바닥, 빛, 물)
│   │   │   ├── Camera.tsx          # 카메라 컨트롤
│   │   │   └── PostProcessing.tsx  # 후처리 이펙트
│   │   ├── fish/
│   │   │   ├── Fish.tsx            # 물고기 컴포넌트
│   │   │   ├── FishBehavior.ts     # 수영 로직
│   │   │   ├── Boids.ts            # 군집 알고리즘
│   │   │   ├── Evolution.ts        # 진화 단계 판정
│   │   │   └── species/            # 종별 설정
│   │   │       ├── angelfish.ts
│   │   │       ├── manta.ts
│   │   │       ├── shark.ts
│   │   │       └── index.ts
│   │   ├── environment/
│   │   │   ├── Bubbles.tsx
│   │   │   ├── Seaweed.tsx
│   │   │   ├── Particles.tsx
│   │   │   ├── Terrain.tsx
│   │   │   └── Caustics.tsx
│   │   ├── interaction/
│   │   │   ├── Raycaster.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── FishDetail.tsx
│   │   └── sound/
│   │       ├── SoundManager.ts
│   │       └── ambience.ts
│   │
│   ├── lib/                        # 공통 라이브러리
│   │   ├── github/
│   │   │   ├── api.ts              # GitHub API 클라이언트
│   │   │   ├── graphql.ts          # GraphQL 쿼리
│   │   │   ├── transform.ts        # Repo → Fish 변환
│   │   │   └── types.ts            # GitHub 타입 정의
│   │   ├── cache/
│   │   │   └── redis.ts            # Upstash Redis 클라이언트
│   │   ├── db/
│   │   │   └── supabase.ts         # Supabase 클라이언트
│   │   └── utils/
│   │       ├── colors.ts           # 언어별 색상 매핑
│   │       └── constants.ts
│   │
│   ├── components/                 # UI 컴포넌트
│   │   ├── Landing.tsx
│   │   ├── StatsHUD.tsx
│   │   ├── ShareButton.tsx
│   │   ├── Codex.tsx
│   │   └── Leaderboard.tsx
│   │
│   ├── stores/                     # Zustand 스토어
│   │   ├── aquariumStore.ts
│   │   └── uiStore.ts
│   │
│   └── messages/                   # i18n
│       ├── en/
│       └── ko/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── visual/
│       └── snapshots/
│
├── fish-species/                   # 커뮤니티 물고기 종 정의
│   ├── README.md
│   ├── schema.json
│   └── community/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 23. Open Questions

- [ ] 도메인: `gitaquarium.com` vs `gitaquarium.dev` vs `devocean.dev`
- [ ] 물고기 3D 모델: 자체 제작(Blender) vs Poly Pizza CC0 모델 활용 vs 절차적 생성 (code only)
- [ ] 수익화 타이밍: Phase 3 이후 vs Phase 5에서 한꺼번에
- [ ] GitHub 외 플랫폼 (GitLab 등) 지원 우선순위
- [ ] 한국어/영어 이중 언어 지원 시점 (MVP부터 vs Phase 2)
- [ ] 라이선스: MIT (코어) + 클로즈드 (프리미엄) 오픈코어 모델 확정
- [ ] "Git" 상표 리스크: 법률 자문 필요 여부 (대안 이름: DevOcean, CodeReef)
- [ ] 물고기 모델 폴리곤 수 상한: 500폴리곤 vs 1000폴리곤 (성능↔디테일 트레이드오프)
- [ ] PostHog self-host vs Plausible Cloud vs Vercel Analytics 단독
- [ ] Phase 4 Webhook: GitHub App으로 등록 vs OAuth App으로 처리
- [ ] 시즌 이벤트 첫 시작 시점 (충분한 유저 확보 후 vs 런칭 직후 분위기 조성)
- [ ] 커뮤니티 물고기 공모 퀄리티 컨트롤 (최소 기준 정의)
- [ ] 3D 프린트 지원 여부 (GitHub Skyline처럼 STL 다운로드)
- [ ] AR 모드: 모바일에서 수족관을 현실 공간에 띄우기 (Phase 6+)

---

## Appendix A: Glossary

| 용어 | 정의 |
|---|---|
| Fish | GitHub 레포지토리를 표현하는 3D 생물 오브젝트 |
| Fossil | 6개월 이상 커밋이 없는 비활성 레포를 표현하는 화석 물고기 |
| Species | 프로그래밍 언어에 따라 결정되는 물고기 종류 |
| Evolution Stage | 커밋 수와 기간에 따른 물고기 성장 단계 (Egg→Fry→Juvenile→Adult→Elder→Legendary) |
| Tank / Aquarium | 한 유저의 전체 수족관 환경 |
| Codex | 발견한 물고기 종을 기록하는 도감 시스템 |
| School | 같은 언어/관계의 물고기가 형성하는 떼 |
| Kudos | 다른 유저의 물고기에게 보내는 응원/먹이 |
| Caustics | 수면 빛 반사로 인한 해저 빛 무늬 효과 |
| Boids | Craig Reynolds의 군집 행동 시뮬레이션 알고리즘 |
| LOD | Level of Detail, 거리에 따른 3D 모델 품질 조절 |
| OG Image | Open Graph Image, SNS 공유 시 미리보기 이미지 |
| PITR | Point-in-Time Recovery, 특정 시점으로 DB 복원 |

## Appendix B: Reference Links

| 항목 | URL |
|---|---|
| GitHub REST API Docs | https://docs.github.com/en/rest |
| GitHub GraphQL API | https://docs.github.com/en/graphql |
| GitHub Logo Guidelines | https://github.com/logos |
| GitHub API ToS | https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#h-api-terms |
| Three.js Docs | https://threejs.org/docs/ |
| React Three Fiber | https://docs.pmnd.rs/react-three-fiber |
| Boids Algorithm | https://www.red3d.com/cwr/boids/ |
| Git City (경쟁) | https://github.com/srizzon/git-city |
| GitHub City (경쟁) | https://github.com/honzaap/GithubCity |
| WCAG 2.1 Guidelines | https://www.w3.org/TR/WCAG21/ |
| GDPR 가이드 | https://gdpr.eu/ |
| 개인정보보호법 | https://www.law.go.kr |

---

*Last updated: 2026-03-13*
*Author: chamdom*
*Status: Phase 1 — In Development*
*Version: 2.0*
