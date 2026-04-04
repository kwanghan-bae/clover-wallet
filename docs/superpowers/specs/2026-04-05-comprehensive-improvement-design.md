# Clover Wallet 종합 개선 설계서

## 개요

Clover Wallet의 실제 App Store/Play Store 출시를 목표로 한 종합 개선 계획.
하이브리드 방식(기반 안정화 → 기능 완성 → 새 기능)으로 진행한다.

### 제약 조건
- 무료 인프라 유지 (Render Free / Supabase Free / 추후 Oracle Cloud Free Tier 고려)
- 플랫폼: 모바일 우선 (iOS + Android), 웹은 테스트 편의를 위해 동시 유지
- 기한 없음 — 퀄리티 중심
- 인증: Supabase Auth (Google OAuth) 유지

---

## Phase 1: 기반 안정화 (Foundation)

목표: 실제 유저가 로그인하고 기본 기능을 사용할 수 있는 상태로 만들기.

### 1-1. 실제 인증 연동

**현재 상태:** `login.tsx`에서 1.5초 딜레이 후 하드코딩 이동. OAuth 미연동.

**구현 내용:**
- 프론트엔드 `login.tsx`의 하드코딩 제거 → Supabase Auth SDK(`@supabase/supabase-js`)로 Google OAuth 실제 연동
- Expo AuthSession 또는 `expo-web-browser`를 통한 OAuth 플로우 구현
- `api/client.ts` beforeRequest 훅에서 MMKV 저장 토큰 자동 주입
- 토큰 만료 시 자동 갱신 (백엔드 `POST /auth/refresh` 호출)
- 로그아웃 시 토큰 정리(MMKV 삭제) + 로그인 화면 이동
- 인증 상태에 따른 라우트 가드 (미인증 시 로그인 화면 리다이렉트)

**영향 범위:**
- `frontend/app/login.tsx`
- `frontend/api/client.ts`
- `frontend/api/auth.ts`
- `frontend/utils/storage.ts`
- `frontend/app/_layout.tsx` (라우트 가드)

### 1-2. Kotlin → Node 미이전 기능 완성

**현재 상태:** 약 75% 이전 완료. 5개 컨트롤러/기능 미이전.

**이전 대상:**

| Kotlin 기능 | Node 구현 방향 |
|-------------|---------------|
| `AdminController` (init history/spots) | `admin.module.ts` — 초기 데이터 세팅 엔드포인트. 프로덕션에서는 1회성이므로 간단한 보호(API key) 적용 |
| `AppInfoController` (version check) | `app.controller.ts`에 `GET /app/version` 추가. 앱 최소 버전 체크용 |
| `LottoInfoController` (next draw, draw result) | `lotto.controller.ts` 확장. 다음 추첨 정보(`GET /lotto/next-draw`), 회차별 결과(`GET /lotto/draw-result/:round`). 뉴스 기능은 Phase 3 이후 별도 검토 |
| `WinningInfoController` (manual crawl/check trigger) | `lotto-spot.controller.ts` 확장. 수동 트리거 엔드포인트 추가 (Cron과 병행, Admin 전용) |
| `NotificationController` (create) | `notification.controller.ts`에 `POST /notifications` 추가 (시스템/관리자 알림 생성용) |

**이전 완료 후:** `backend-kotlin/` 디렉토리 전체 삭제, `render.yaml`에서 Kotlin 관련 설정 제거.

### 1-3. 테스트 인프라 강화

**현재 상태:**
- 백엔드: 모듈별 spec 파일 존재하나 커버리지 불충분
- 프론트엔드: `utils/` 한정 8개 테스트 파일, 컴포넌트/화면 테스트 없음
- CI: GitHub Actions 워크플로우 없음

**구현 내용:**

백엔드:
- 각 서비스별 단위 테스트 보강 (auth, lotto, community, notification, ticket, travel, users)
- E2E 테스트 추가: 인증 플로우, 게임 저장/조회, 커뮤니티 CRUD (supertest)
- 커버리지 목표: 라인 기준 70% 이상

프론트엔드:
- 커스텀 훅 테스트 (`useScan`, `useLuckySpots`, `useSpotDetail`)
- API 레이어 테스트 (client.ts 인터셉터, 각 API 모듈)
- 주요 화면 스냅샷/인터랙션 테스트 (login, home, scan)
- 커버리지 범위: `utils/` → `hooks/`, `api/`, 주요 `components/` 확장

CI/CD:
- GitHub Actions 워크플로우 추가
  - PR 시: lint + test + build (frontend + backend-node)
  - main 머지 시: 자동 배포 트리거 (Render webhook)
- pre-commit 가드 기존 유지

---

## Phase 2: 기존 기능 완성도 (Feature Completion)

목표: 이미 존재하는 기능들을 실제 출시 수준으로 다듬기.

### 2-1. 스캔 기능 고도화

**현재 상태:** OCR 텍스트 인식만 구현. QR 미지원. 백엔드 연동 미완성.

**구현 내용:**
- `expo-camera`의 바코드 스캔 기능으로 QR 코드 인식 추가
- QR → 티켓 URL 추출 → `POST /tickets/scan` 호출 → 자동 당첨 확인
- OCR/QR 모드 전환 UI (탭 또는 자동 감지)
- 스캔 히스토리(`history.tsx`)에서 당첨 상태 뱃지 표시 (WINNING: 초록, LOSING: 회색, STASHED: 노랑)
- 스캔 실패 시 수동 입력 폴백 UI

### 2-2. 커뮤니티 기능 강화

**현재 상태:** 기본 CRUD + 좋아요. 대댓글/삭제 없음.

**구현 내용:**

DB 스키마 변경:
- `Comment` 모델에 `parentId BigInt?` 필드 추가 (self-relation)
- 마이그레이션 생성 및 적용

백엔드:
- 대댓글 조회 로직 (nested 구조 또는 flat + parentId)
- `DELETE /community/posts/:id` 엔드포인트 추가 (소유자 전용)
- `GET /users/:id/posts` — 유저별 게시글 목록

프론트엔드:
- 댓글 UI에 답글 버튼 + 들여쓰기 표시
- 게시글 삭제 (Swipe 또는 메뉴)
- 유저 아바타 클릭 → 유저 프로필/게시글 화면

### 2-3. 명당 & 여행 완성

**현재 상태:** `getRecommendedTravelPlans()`이 빈 배열 반환. 명당 상세 UX 미흡.

**구현 내용:**
- 추천 로직: 유저 위치(expo-location) 기반 가까운 명당 + 해당 명당의 여행 플랜 매칭
- 명당 상세 화면 리디자인: 상단 지도 → 명당 정보 카드 → 당첨 이력 리스트 → 연관 여행 플랜
- 여행 플랜 상세 화면 신규 구현 (`/spot/[id]/travel/[planId]` 또는 모달)

### 2-4. 알림 시스템 실제 연동

**현재 상태:** 백엔드 FCM 서비스 존재. 프론트엔드 연동 미완성. 알림 목록 화면 없음.

**구현 내용:**

프론트엔드:
- 앱 시작 시 FCM 토큰 등록 (`POST /notifications/fcm-token`)
- `expo-notifications` 핸들러 연결 (포그라운드/백그라운드)
- 알림 목록 화면 신규 구현 (마이페이지 또는 별도 탭)
- 읽음/안읽음 상태 표시, 안읽은 알림 뱃지

백엔드:
- 추첨일 알림 Cron 추가 (토요일 오전 — "오늘 추첨일입니다!")
- 당첨 확인 후 FCM 발송 로직 강화 (현재 이벤트 핸들러에 부분 구현)

---

## Phase 3: 새 기능 추가 (New Features)

목표: 차별화 기능으로 앱 가치 향상.

### 3-1. 다크모드

**구현 내용:**
- `tailwind.config.js`에 다크 팔레트 정의 (`dark-background`, `dark-surface`, `dark-text` 등)
- NativeWind `dark:` 클래스 적용 — 모든 화면/컴포넌트
- `useColorScheme()` 훅으로 시스템 설정 감지
- 마이페이지 설정에서 수동 토글 (시스템/라이트/다크)
- 테마 선택 MMKV 저장

**영향 범위:** 모든 화면 및 UI 컴포넌트 (일괄 작업)

### 3-2. 통계 대시보드

**구현 내용:**
- 새 화면 또는 홈 화면 확장 섹션
- 차트 라이브러리: `victory-native` (react-native-svg 기반, 가볍고 커스터마이징 가능)
- 번호 빈도 분석 — 바 차트 (1~45번 각 번호 출현 횟수)
- 개인 ROI 추이 — 라인 차트 (월별 투자/수익)
- 당첨 등수 분포 — 파이 차트
- 데이터 소스: 백엔드 `GET /users/:id/stats` 확장 + 프론트 로컬 기록

### 3-3. 소셜 기능 확장

**DB 스키마:**
- `Follow` 모델 추가: `id, followerId, followingId, createdAt` (composite unique: followerId + followingId)

**백엔드:**
- `POST /users/:id/follow` — 팔로우/언팔로우 토글
- `GET /users/:id/followers`, `GET /users/:id/following`
- `GET /community/posts/feed` — 팔로우한 유저 게시글 피드

**프론트엔드:**
- 유저 프로필에 팔로우 버튼 + 팔로워/팔로잉 카운트
- 커뮤니티 탭에 "전체/팔로잉" 필터
- 번호 생성 결과에서 "커뮤니티에 공유" 버튼 → `create-post`로 이동 (번호 데이터 프리필)

### 3-4. 오프라인 지원

**구현 내용:**
- `@tanstack/react-query-persist-client` + MMKV 어댑터로 쿼리 캐시 영속화
- 오프라인 감지: `@react-native-community/netinfo`
- 오프라인 시 읽기 가능: 명당 목록, 내 기록, 커뮤니티 캐시 (stale 표시)
- 오프라인 시 쓰기: React Query `onlineMutationManager`로 mutation 큐잉
- 네트워크 복구 시 자동 동기화 + 충돌 시 서버 우선 정책
- 오프라인 상태 인디케이터 (상단 배너)

---

## Phase 순서 및 의존성

```
Phase 1-1 (인증) ─┐
Phase 1-2 (이전) ─┼─→ Phase 1-3 (테스트) ─→ Phase 2 (기능 완성) ─→ Phase 3 (새 기능)
                  │
                  └─→ backend-kotlin 삭제
```

- Phase 1-1과 1-2는 병렬 진행 가능
- Phase 1-3(테스트)은 1-1, 1-2 완료 후 진행 (테스트 대상이 확정되어야 함)
- Phase 2의 각 항목(2-1~2-4)은 독립적이므로 병렬 가능
- Phase 3의 각 항목(3-1~3-4)도 독립적이므로 병렬 가능
- Phase 3-3(소셜)은 Phase 2-2(커뮤니티 강화) 이후가 자연스러움

---

## 기술 선택 요약

| 영역 | 선택 | 이유 |
|------|------|------|
| 인증 | Supabase Auth + expo-auth-session | 이미 구축된 인프라, 무료 50K MAU |
| 차트 | victory-native | RN 네이티브 지원, SVG 기반, 가벼움 |
| 오프라인 캐시 | react-query-persist-client + MMKV | 기존 스택과 자연스러운 통합 |
| 네트워크 감지 | @react-native-community/netinfo | RN 표준 라이브러리 |
| CI | GitHub Actions | 무료 tier 충분, GitHub 네이티브 통합 |
| 다크모드 | NativeWind dark: + useColorScheme | 기존 스타일링 시스템 활용 |
