# Design Tokens

Git Aquarium 디자인 시스템의 모든 디자인 토큰을 정의합니다.

---

## 1. 색상 팔레트

### 1.1 핵심 색상 (PRD 5.1)

| 토큰         | 값                      | 용도                            |
| ------------ | ----------------------- | ------------------------------- |
| `background` | `#031528`               | 심해 네이비, 씬 배경            |
| `primary`    | `#4FC3F7`               | 바다 시안, 주요 액션/하이라이트 |
| `accent`     | `#FFD54F`               | 별빛 골드, 강조/legendary       |
| `danger`     | `#FF6B6B`               | 산호 레드, 에러/경고            |
| `surface`    | `rgba(5, 15, 35, 0.85)` | 유리 패널, HUD/모달 배경        |

```css
/* CSS 변수 */
--color-background: #031528;
--color-primary: #4fc3f7;
--color-accent: #ffd54f;
--color-danger: #ff6b6b;
--color-surface: rgba(5, 15, 35, 0.85);
```

```typescript
// tailwind.config.ts
colors: {
  background: '#031528',
  primary: '#4FC3F7',
  accent: '#FFD54F',
  danger: '#FF6B6B',
  surface: 'rgba(5, 15, 35, 0.85)',
}
```

### 1.2 Ocean 팔레트 (10단계)

| 스케일      | HEX       | 용도                 |
| ----------- | --------- | -------------------- |
| `ocean-50`  | `#e6f4f9` | 최고 밝은 하이라이트 |
| `ocean-100` | `#cce9f3` | 연한 강조            |
| `ocean-200` | `#99d3e7` | 보조 텍스트          |
| `ocean-300` | `#66bddb` | 비활성 요소          |
| `ocean-400` | `#33a7cf` | 중간 강도            |
| `ocean-500` | `#0091c3` | 기본 ocean 색상      |
| `ocean-600` | `#00749c` | 호버 상태            |
| `ocean-700` | `#005775` | 액티브 상태          |
| `ocean-800` | `#003a4e` | 어두운 배경          |
| `ocean-900` | `#0a1628` | 매우 어두운 배경     |
| `ocean-950` | `#050b14` | 최저 깊이            |

```typescript
// tailwind.config.ts
ocean: {
  50: '#e6f4f9',
  100: '#cce9f3',
  200: '#99d3e7',
  300: '#66bddb',
  400: '#33a7cf',
  500: '#0091c3',
  600: '#00749c',
  700: '#005775',
  800: '#003a4e',
  900: '#0a1628',
  950: '#050b14',
},
```

### 1.3 종별 색상 (15종)

| 종           | 언어         | HEX       | 비고          |
| ------------ | ------------ | --------- | ------------- |
| `angelfish`  | JavaScript   | `#F7DF1E` | JS 노란색     |
| `manta`      | TypeScript   | `#3178C6` | TS 파란색     |
| `turtle`     | Python       | `#3776AB` | Python 파란색 |
| `pufferfish` | Rust         | `#DEA584` | Rust 베이지   |
| `dolphin`    | Go           | `#00ADD8` | Go 하늘색     |
| `squid`      | Java         | `#B07219` | Java 갈색     |
| `shark`      | C/C++/C#     | `#555555` | C 계열 회색   |
| `seahorse`   | Solidity     | `#627EEA` | Ethereum 보라 |
| `goldfish`   | Ruby         | `#CC342D` | Ruby 빨간색   |
| `flyingfish` | Swift        | `#FA7343` | Swift 오렌지  |
| `jellyfish`  | Kotlin       | `#7F52FF` | Kotlin 보라   |
| `coral`      | HTML/CSS     | `#E34F26` | HTML 오렌지   |
| `shell`      | Shell        | `#89E051` | Shell 초록    |
| `seaweed`    | Markdown     | `#083FA1` | 문서 파란색   |
| `plankton`   | 기타/Unknown | `#AAAAAA` | 기본 회색     |

### 1.4 상태 색상

| 상태     | 토큰               | 값        | 의미          |
| -------- | ------------------ | --------- | ------------- |
| 살아있음 | `status-alive`     | `#4FC3F7` | 활성 레포     |
| 화석     | `status-fossil`    | `#78909C` | 180일+ 비활성 |
| 레전더리 | `status-legendary` | `#FFD54F` | 스타 1000+    |
| 에러     | `status-error`     | `#FF6B6B` | 에러 상태     |

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

| 용도      | 폰트           | CSS 변수                | Tailwind 클래스 |
| --------- | -------------- | ----------------------- | --------------- |
| 제목/헤딩 | Orbitron       | `--font-orbitron`       | `font-heading`  |
| 본문/코드 | JetBrains Mono | `--font-jetbrains-mono` | `font-mono`     |

```typescript
// next/font/google 로드
import { Orbitron, JetBrains_Mono } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})
```

```typescript
// tailwind.config.ts
fontFamily: {
  heading: ['var(--font-orbitron)', 'sans-serif'],
  mono: ['var(--font-jetbrains-mono)', 'monospace'],
},
```

### 2.2 폰트 크기

| 토큰        | 값                | 사용 예         |
| ----------- | ----------------- | --------------- |
| `text-xs`   | `0.75rem` (12px)  | 메타 정보, 배지 |
| `text-sm`   | `0.875rem` (14px) | 보조 텍스트     |
| `text-base` | `1rem` (16px)     | 기본 본문       |
| `text-lg`   | `1.125rem` (18px) | 강조 본문       |
| `text-xl`   | `1.25rem` (20px)  | 소제목          |
| `text-2xl`  | `1.5rem` (24px)   | 제목            |
| `text-3xl`  | `1.875rem` (30px) | 페이지 제목     |
| `text-4xl`  | `2.25rem` (36px)  | 히어로 제목     |

### 2.3 폰트 두께

| 토큰            | 값  | 용도      |
| --------------- | --- | --------- |
| `font-normal`   | 400 | 기본 본문 |
| `font-medium`   | 500 | 강조 본문 |
| `font-semibold` | 600 | 소제목    |
| `font-bold`     | 700 | 제목      |

### 2.4 행간 (Line Height)

| 토큰              | 값    | 용도               |
| ----------------- | ----- | ------------------ |
| `leading-none`    | 1     | 버튼, 배지         |
| `leading-tight`   | 1.25  | 제목               |
| `leading-normal`  | 1.5   | 본문               |
| `leading-relaxed` | 1.625 | 가독성 높은 텍스트 |

---

## 3. 스페이싱

4px 기반 8pt 그리드 시스템을 사용합니다.

| 토큰       | px   | rem     | 용도           |
| ---------- | ---- | ------- | -------------- |
| `space-0`  | 0px  | 0       | 없음           |
| `space-1`  | 4px  | 0.25rem | 최소 간격      |
| `space-2`  | 8px  | 0.5rem  | 아이콘 간격    |
| `space-3`  | 12px | 0.75rem | 컴팩트 패딩    |
| `space-4`  | 16px | 1rem    | 기본 패딩      |
| `space-6`  | 24px | 1.5rem  | 섹션 내부      |
| `space-8`  | 32px | 2rem    | 카드 패딩      |
| `space-12` | 48px | 3rem    | 섹션 간격      |
| `space-16` | 64px | 4rem    | 대형 섹션      |
| `space-20` | 80px | 5rem    | 페이지 여백    |
| `space-24` | 96px | 6rem    | 최대 섹션 간격 |

---

## 4. 브레이크포인트

| 이름  | 최소 너비 | 대상 디바이스             |
| ----- | --------- | ------------------------- |
| `sm`  | 640px     | 모바일 가로               |
| `md`  | 768px     | 태블릿 세로               |
| `lg`  | 1024px    | 태블릿 가로 / 소형 노트북 |
| `xl`  | 1280px    | 노트북                    |
| `2xl` | 1536px    | 데스크탑                  |

```typescript
// tailwind.config.ts (Tailwind 기본값 사용)
screens: {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
},
```

**3D 성능 기준:**

- `< md` (모바일): 30fps 목표, 간단한 셰이더, 파티클 감소
- `>= md` (데스크탑): 60fps 목표, 풀 품질

---

## 5. 그림자 (Box Shadow)

| 토큰                 | 값                                | 용도                  |
| -------------------- | --------------------------------- | --------------------- |
| `shadow-sm`          | `0 1px 2px rgba(0,0,0,0.5)`       | 카드 미묘한 elevation |
| `shadow-md`          | `0 4px 6px rgba(0,0,0,0.5)`       | 드롭다운, 팝오버      |
| `shadow-lg`          | `0 10px 15px rgba(0,0,0,0.5)`     | 모달                  |
| `shadow-glow`        | `0 0 20px rgba(79,195,247,0.4)`   | Primary 발광 효과     |
| `shadow-glow-accent` | `0 0 20px rgba(255,213,79,0.4)`   | Accent 발광 효과      |
| `shadow-inner`       | `inset 0 2px 4px rgba(0,0,0,0.5)` | 입력 필드             |

```typescript
// tailwind.config.ts
boxShadow: {
  'glow': '0 0 20px rgba(79, 195, 247, 0.4)',
  'glow-accent': '0 0 20px rgba(255, 213, 79, 0.4)',
},
```

---

## 6. 테두리 반지름 (Border Radius)

| 토큰           | 값     | 용도              |
| -------------- | ------ | ----------------- |
| `rounded-none` | 0      | 각진 요소         |
| `rounded-sm`   | 2px    | 배지, 칩          |
| `rounded`      | 4px    | 버튼, 입력 필드   |
| `rounded-md`   | 6px    | 카드              |
| `rounded-lg`   | 8px    | 모달, 패널        |
| `rounded-xl`   | 12px   | HUD 컨테이너      |
| `rounded-2xl`  | 16px   | 대형 카드         |
| `rounded-full` | 9999px | 아바타, 뱃지 원형 |

---

## 7. 트랜지션 타이밍

| 토큰            | 값     | 용도               |
| --------------- | ------ | ------------------ |
| `duration-75`   | 75ms   | 즉각 피드백 (호버) |
| `duration-150`  | 150ms  | 버튼, 링크         |
| `duration-200`  | 200ms  | 토글, 체크박스     |
| `duration-300`  | 300ms  | 패널 열기/닫기     |
| `duration-500`  | 500ms  | 페이지 전환        |
| `duration-700`  | 700ms  | 복잡한 애니메이션  |
| `duration-1000` | 1000ms | 씬 전환            |

**이징 함수:**

| 토큰          | 값                                   | 용도          |
| ------------- | ------------------------------------ | ------------- |
| `ease-linear` | `linear`                             | 프로그레스 바 |
| `ease-in`     | `cubic-bezier(0.4,0,1,1)`            | 나가는 요소   |
| `ease-out`    | `cubic-bezier(0,0,0.2,1)`            | 들어오는 요소 |
| `ease-in-out` | `cubic-bezier(0.4,0,0.2,1)`          | 일반 트랜지션 |
| `ease-bounce` | `cubic-bezier(0.68,-0.55,0.27,1.55)` | 피쉬 등장     |

---

## 8. Z-Index 레이어

| 토큰        | 값  | 용도         |
| ----------- | --- | ------------ |
| `z-base`    | 0   | 씬 기본      |
| `z-raised`  | 10  | 호버 요소    |
| `z-hud`     | 100 | HUD 오버레이 |
| `z-modal`   | 200 | 모달         |
| `z-tooltip` | 300 | 툴팁         |
| `z-toast`   | 400 | 알림         |

---

## 9. 불투명도 (Opacity)

| 토큰          | 값   | 용도            |
| ------------- | ---- | --------------- |
| `opacity-0`   | 0    | 완전 투명       |
| `opacity-25`  | 0.25 | 비활성 오버레이 |
| `opacity-50`  | 0.5  | 비활성 요소     |
| `opacity-75`  | 0.75 | 보조 요소       |
| `opacity-85`  | 0.85 | surface 패널    |
| `opacity-100` | 1    | 완전 불투명     |

---

## 10. 애니메이션 (Keyframes)

```css
/* fish-swim: 물고기 유영 */
@keyframes fish-swim {
  0%,
  100% {
    transform: translateX(0) rotate(0deg);
  }
  25% {
    transform: translateX(5px) rotate(2deg);
  }
  75% {
    transform: translateX(-5px) rotate(-2deg);
  }
}

/* float: 부유 효과 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* pulse-glow: 발광 펄스 */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(79, 195, 247, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(79, 195, 247, 0.7);
  }
}

/* bubble: 기포 상승 */
@keyframes bubble {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100px) scale(1.2);
    opacity: 0;
  }
}
```

```typescript
// tailwind.config.ts
animation: {
  'fish-swim': 'fish-swim 3s ease-in-out infinite',
  'float': 'float 4s ease-in-out infinite',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  'bubble': 'bubble 3s ease-out infinite',
},
```

---

## 11. 글래스모피즘 스타일

HUD 패널에 사용되는 유리 효과:

```css
.glass-panel {
  background: rgba(5, 15, 35, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(79, 195, 247, 0.2);
  border-radius: 8px;
}
```

```typescript
// tailwind.config.ts
backdropBlur: {
  'glass': '12px',
},
```
