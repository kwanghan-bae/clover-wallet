# UX Polish Pass — 디자인 시스템 정리 + 화면 폴리시

작성일: 2026-05-09
상태: 디자인 (구현 전)
관련 화면: ~10 / 컴포넌트: ~15

## 목표

현재 디자인 톤(클로버 그린, 그라디언트 히어로, 카드)을 유지하면서 흩어진 디자인 결정을 토큰화하고, 모든 화면을 동일한 완성도 기준으로 마감한다. "출시 가능한 fintech 앱" 수준의 디테일을 목표로 한다.

## 스코프

**대상 화면 (10)**: 홈 / 번호 생성 / 히스토리 / 마이페이지 / 커뮤니티 / 글 작성 / 지도 / 스캔 / 통계 / 알림 / 로그인 (총 11. 커뮤니티+글 작성을 한 묶음으로 보면 10)

**비대상 (out of scope)**:

- 정보 구조(IA) 변경 — 탭 구성, 라우팅 그대로
- 신규 기능 추가 (백엔드 동기화, 알림 설정 stub 등은 별도)
- 다크 모드 전면 재설계 (토큰 정리 시 자동 개선되는 만큼만)
- 모션 라이브러리 신규 도입 — 기존 reanimated/Animated 사용
- i18n 시스템화 — 영문 잔존 문자열은 한국어로만 교체 (인프라 미도입)

**합의된 콘텐츠 변경 (토큰 적용만으로 안 되는 것)**:

- create-post: BallRow 시각화, 한국어 헤더, 단일 submit, 페이지 배경 통일
- Quick Actions: 5 → 4 (`명당 지도` 제거. 잔존: 번호 추첨 / QR 스캔 / 번호 분석 / 로또 명당)

## 전략

**Vertical slice — 홈 먼저, 그 다음 fan-out**

1. 토큰 정의 (`tailwind.config.js` 확장 + 헬퍼)
2. 공통 컴포넌트 6종 신규/리프레쉬 (홈에 필요한 것)
3. 홈 적용 — 토큰·컴포넌트 검증
4. 나머지 7개 화면 — 동일 토큰·컴포넌트로 fan-out
5. 빈/로딩/에러 상태 통일
6. 모션·터치 피드백 점검

**단일 feature branch, 단일 PR**. 중간 머지 금지 — 통일성 보장.

## 디자인 토큰

`tailwind.config.js` `theme.extend`에 추가. 기존 토큰 유지·보강.

### Color (추가/보강)

```
// 기존 유지: primary #4CAF50, primary-dark #388E3C, primary-light #C8E6C9,
//            primary-text #2E7D32, secondary #FFC107, accent #2196F3,
//            error #E53935, background #F5F7FA, dark-bg / dark-surface / dark-card

// 신규
surface:        '#FFFFFF',
surface-muted:  '#FBFCFD',           // 페이지 배경 (현 #F5F7FA보다 톤다운)
border-hairline:'rgba(15,17,21,0.04)',
text-primary:   '#0F1115',           // 현 #1A1A1A 대체 (대비 ↑)
text-secondary: '#2A2E36',
text-muted:     '#6E7480',           // 현 #757575 / #9E9E9E / #BDBDBD 산재 대체
text-disabled:  '#A8AEB8',

// Quick Actions 카니발 컬러 → 채도 다운, 대비 ↑
qa-purple: '#6A1B9A',  // 현 #9C27B0
qa-blue:   '#1565C0',  // 현 #2196F3
qa-orange: '#E65100',  // 현 #FF9800
qa-green:  '#2E7D32',  // 현 #4CAF50
```

### Typography Scale

`fontSize` 토큰. 단위 px (RN). 행간(leading)·자간(tracking)은 컴포넌트 helper에서.

| Token | Size | Weight | Tracking | 사용처 |
|---|---|---|---|---|
| display | 30 | 800 | -1.2 | Hero 시간, 큰 숫자 |
| title-lg | 20 | 800 | -0.4 | 화면 타이틀 |
| title | 16 | 800 | -0.2 | 섹션 타이틀, 카드 타이틀 |
| body-lg | 15 | 600 | -0.1 | 강조 본문, 버튼 |
| body | 13 | 500 | 0 | 일반 본문 |
| caption | 12 | 600 | 0 | 보조 정보 |
| label | 11 | 700 | 0 | 카드 라벨 (QuickAction, 작은 라벨) |
| eyebrow | 10 | 700 | 1.4 | 카테고리/상단 라벨 (uppercase) |

폰트 weight 매핑: 500 → `NotoSansKR_500Medium`, 600 → `NotoSansKR_600SemiBold`, 700 → `NotoSansKR_700Bold`, 800 → `NotoSansKR_800ExtraBold`. **Black 900은 Hero 단일 강조에만 허용** (남발 금지).

### Spacing (4-base)

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 48`. 화면 padding 기본 20. 카드 내부 padding 18~22. 섹션 간 32.

### Radius

`sm: 8 / md: 12 / lg: 16 / card: 18 / card-lg: 22 / hero: 28 / pill: 999`. 8 미만, 28 초과 금지.

### Shadow

| Token | 정의 | 용도 |
|---|---|---|
| shadow-hairline | inset 0 0 0 1px var(border-hairline) | 카드 outline (그림자 대안) |
| shadow-card | 0 1px 2px rgba(15,17,21,0.04), 0 4px 12px -8px rgba(15,17,21,0.08) | 일반 카드 |
| shadow-elev | 0 4px 16px -8px rgba(15,17,21,0.12) | 떠 있는 카드 (FAB 등) |
| shadow-hero | 0 12px 28px -8px rgba(46,125,50,0.45), 0 2px 6px rgba(15,17,21,0.06) | Hero (브랜드 컬러 그림자) |
| shadow-button | 0 4px 12px -4px rgba(15,17,21,0.2) | 강조 버튼 |

기존 `shadowColor #000 / shadowOpacity 0.05~0.25 / elevation 2~5` 인라인 산재 → 위 4종으로 축약.

## 공통 컴포넌트 (신규/리프레쉬)

기존 ui/ 디렉토리에 추가/수정. CLAUDE.md 150줄 제약 준수 — 임계 시 sub-component로 분리.

### 신규 컴포넌트

1. **AppBar** (`components/ui/AppBar.tsx`)
   - props: `{ title?: string; leading?: ReactNode; trailing?: ReactNode; variant?: 'home' | 'screen' | 'modal' }`
   - home variant: 그라디언트 로고 마크 + 텍스트, 알림 뱃지 (unread > 0 시 dot)
   - screen variant: ChevronLeft (back) + 가운데 타이틀
   - modal variant: X (close) + 가운데 타이틀
   - prop `borderOnScroll?: boolean` — true 시 스크롤 오프셋 > 0이면 하단 hairline border 페이드인. 홈 / 마이페이지 / 히스토리에 적용

2. **SectionHead** (`components/ui/SectionHead.tsx`)
   - props: `{ title: string; linkText?: string; onLinkPress?: () => void }`
   - 화면 안 모든 "최근 …", "빠른 실행" 등 라벨 통일

3. **EmptyState** (`components/ui/EmptyState.tsx`)
   - props: `{ icon: ReactNode; title: string; description?: string; cta?: { label: string; onPress: () => void } }`
   - 중앙 정렬, 아이콘 그라디언트 박스, 인라인 CTA 버튼 (옵션)
   - 사용처: 히스토리 / 최근 구매 / 커뮤니티 / 알림

4. **QuickActionCard** (`components/ui/QuickActionCard.tsx`)
   - 기존 `QuickActionItem` 대체. 카드형 (elevation + 그라디언트 ic 배경).
   - props: `{ icon: ReactNode; label: string; tone: 'green'|'blue'|'orange'|'purple'; onPress: () => void }`

5. **AppText** (`components/ui/AppText.tsx`)
   - 타이포 토큰 적용 헬퍼. `<AppText variant="title">…</AppText>`
   - 변형: display / title-lg / title / body-lg / body / caption / eyebrow
   - 인라인 `fontFamily: 'NotoSansKR_…'` 선언 전부 제거 목표

6. **ScreenContainer** (`components/ui/ScreenContainer.tsx`)
   - SafeAreaView + 페이지 배경 + 기본 padding 통일.
   - 동시에 `react-native-safe-area-context`로 마이그레이션 (기존 RN SafeAreaView deprecated 경고 해소)

### 리프레쉬

7. **HeroSection**: 토큰 적용 (shadow-hero, type scale, eyebrow + pill 분리, 시간 sectioned `30 일 14 시간 27 분`)
8. **PrimaryButton**: weight 900 → 800, radius `xl(12)` → `lg(16)`, shadow-button 적용
9. **HistoryItem / WinningHistoryItem**: 카드 토큰 적용 (radius card-lg, shadow-card)
10. **PostCard / CommentItem**: 카드 토큰 적용
11. **SpotListItem**: 카드 토큰 적용
12. **GenerationResultCard / Cards**: 카드 토큰 적용 + 섹션 헤드 분리
13. **MyPageMenuItem**: 카드 토큰 적용

## 홈 (참조 화면) 적용

`app/(tabs)/index.tsx` 기준. 변경 사항:

- AppBar(home) 사용 — 그라디언트 마크 (`primary → primary-dark`), 알림 뱃지 dot
- HeroSection 리프레쉬 — eyebrow `NEXT DRAW`, 시간 sectioned, 보조 액션 (QR 스캔 ic 버튼) 추가
- "빠른 실행" → SectionHead + QuickActionCard 4개 그리드
- "최근 당첨 결과" → SectionHead(linkText="전체 보기") + EmptyState (ticket 0건 시) / 컴팩트 카드 리스트 (있을 시)
- 인라인 hex 컬러 / fontFamily 선언 모두 토큰화
- 스크롤 시 AppBar에 hairline border 등장

검증 기준: `current-vs-polished.html` mockup 일치 (mockup은 `.superpowers/brainstorm/…/content/`에 보존).

## Carry-forward — 화면별 폴리시 체크리스트

각 화면은 **공통 적용** + **개별 이슈** 둘 다 통과해야 완료.

### 공통 (모든 화면)

- [ ] ScreenContainer 사용 (SafeAreaView 마이그레이션 동반)
- [ ] AppBar(screen) 또는 AppBar(modal) 사용
- [ ] AppText로 타이포 통일 (인라인 fontFamily 제거)
- [ ] 토큰 컬러만 사용 (인라인 hex 0건)
- [ ] 카드/버튼 shadow 토큰 사용
- [ ] EmptyState 사용 (해당 시)

### 번호 생성 (`number-generation.tsx`)

- "Tip Section"(amber bg) 톤이 이질적 → `bg-surface-muted` + `border-hairline`로 통합, 아이콘 톤다운
- GameCountToggle: pill 토큰 적용
- MethodSelector: 카드 elevation 통일
- 결과 카드 cascade 모션 유지

### 히스토리 (`(tabs)/history.tsx`)

- ListEmptyComponent 인라인 → EmptyState 컴포넌트
- `_ticketStatus` 뱃지 인라인 hex → 토큰 (status별 컬러 매핑은 `constants/lotto-status` 그대로)
- 헤더 "내 로또 내역" → AppBar(home) 변형 (back 없는 탭 헤더)

### 마이페이지 (`(tabs)/mypage.tsx`)

- 프로필 카드: avatar 그라디언트 + shadow-card
- 통계 inline divider `1px bg-gray-200` → border-hairline
- BadgeSection / ThemeSelector / MenuSection: 카드 토큰 통일
- "마이페이지" 타이틀 padding/style → AppBar 패턴 따라가기

### 커뮤니티 (`(tabs)/community.tsx`) + 글 작성 (`create-post.tsx`)

- create-post 헤더 "Create Post" → "글 작성" (i18n 시스템 미도입)
- 상단 "Post" 텍스트 액션 + 하단 "Post Story" 버튼 중복 → **하단 단일 버튼만**, 라벨 "게시하기"
- 닫기 X → AppBar(modal) 사용
- 본문 textarea 페이지 배경 검정 보이드 (web) → ScreenContainer + `app/_layout.tsx`에서 web body bg를 `surface-muted`로 설정 (네이티브는 SafeAreaView 배경이라 자동 해소)
- prefillContent 로또 번호 텍스트 → BallRow 카드 미리보기 컴포넌트 (텍스트는 readonly preview, 본문은 사용자가 자유 입력)
- 피드 PostCard: 카드 토큰 + lotto 번호 등장 시 BallRow inline 렌더 (별도 small variant)

### 지도 (`(tabs)/map.tsx`)

- CustomMapView 콜아웃: MapCalloutContent 카드 토큰
- 검색/필터 FAB (있을 시): shadow-elev 적용
- (지도 자체 스타일은 out of scope — 마커 / 콜아웃만)

### 스캔 (`scan.tsx`)

- ScanOverlay: 가이드 프레임 컬러를 primary 톤으로 통일
- ScanResultView: 카드 토큰, BallRow 강조

### 통계 (`statistics.tsx`)

- 차트/숫자 강조: display / title-lg 토큰
- 통계 카드: shadow-card 통일

### 알림 (`notifications.tsx`)

- 비어있을 시 EmptyState
- 항목 카드 토큰

### 로그인 (`login.tsx`)

- 그라디언트 배경 + GlassCard 유지 (브랜드 인상)
- weight 900 tracking-widest 톤다운 → display 토큰
- "Google 계정으로 계속하기" 버튼 그림자 → shadow-button

## 빈/로딩/에러 상태 패턴

- **빈**: EmptyState 컴포넌트 (icon 그라디언트 박스 + 한 줄 카피 + 보조 1줄 + 옵션 CTA)
- **로딩**: 화면 단위 → ActivityIndicator 단독 → primary 컬러 + 카드형 스켈레톤 (목록은 스켈레톤 우선)
- **에러**: 데이터 fetch 실패 시 EmptyState 사용 (icon=warning, title="불러오기 실패", cta="다시 불러오기"). Alert.alert는 사용자 입력 검증·확인 다이얼로그에만 한정. toast 인프라는 본 spec 비대상

## 모션 & 터치 피드백

- TouchableOpacity activeOpacity 산재 (0.7 / 0.8 / 0.9) → **0.7 단일**
- PrimaryButton scale 0.96 → 유지
- 카드 누름: `Pressable` + scale 0.98 도입 (ui/PressableCard 헬퍼)
- 화면 전환: expo-router 기본 fade/slide 유지 (커스텀 X)
- 햅틱: 1차 액션(번호 생성, 게시, 저장)에 `impactMedium`. 도입은 본 spec 범위.

## 구현 노트

### 파일 라인 제약

CLAUDE.md 150줄 제약. 다음은 임계 가능성 있음 — 분리 전제로 설계:

- AppBar — variant별 sub-component (`AppBarHome`, `AppBarScreen`, `AppBarModal`) 분리
- HeroSection — illustration / actions 별도 sub-component
- 홈 화면 자체(`index.tsx`) — 현재 115줄 → 토큰화 후 100줄 내 유지

### Tailwind 토큰 위치

`tailwind.config.js`의 `theme.extend.colors` / `fontSize` / `borderRadius` / `boxShadow` / `spacing`에 모두 통합. 별도 `tokens.ts` 만들지 말 것.

### 마이그레이션 동반

`react-native-safe-area-context`로 SafeAreaView 일괄 교체 — ScreenContainer 도입과 동시 진행.

## 검증

- **테스트**: 기존 297 frontend tests 모두 통과 유지. 컴포넌트 리네임/시그니처 변경 시 테스트도 동반 수정.
- **수동 smoke**: dev:local 띄워 8개 화면 + 라이트/다크 + 빈/내용 있는 상태 모두 한 번씩 클릭. 체크리스트는 PR 본문에.
- **시각 회귀**: 별도 도구 미도입. 대신 `mockup-comparison.md` 짧게 작성 (전/후 스크린샷 한 화면 1쌍씩).
- **빌드**: `npx expo export --platform web` 통과 확인 (Render 배포 prebuilt).

## 산출물

1. `tailwind.config.js` 확장
2. `components/ui/` 신규 6 + 리프레쉬 7
3. 8개 화면 적용
4. 인라인 hex / fontFamily 선언 0건 (lint rule 추가 검토)
5. PR 본문에 전/후 스크린샷 + 체크리스트
