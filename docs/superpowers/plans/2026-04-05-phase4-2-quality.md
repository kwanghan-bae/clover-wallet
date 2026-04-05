# Phase 4-2: 테스트 & 품질 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** E2E 테스트, 성능 최적화, 접근성 개선으로 출시 품질 확보

**Architecture:** Maestro YAML 기반 E2E 플로우, React.memo로 리스트 리렌더 방지, accessibilityLabel/Role로 스크린리더 지원. 3개 영역 독립 진행 가능.

**Tech Stack:** Maestro, source-map-explorer, React.memo, accessibilityLabel, WCAG AA

---

## File Structure

### C-1: E2E 테스트
| File | Action | Responsibility |
|------|--------|---------------|
| `.maestro/login-to-home.yaml` | Create | 로그인 → 홈 플로우 |
| `.maestro/generate-numbers.yaml` | Create | 번호 생성 → 저장 플로우 |
| `.maestro/create-post.yaml` | Create | 게시글 작성 → 목록 반영 플로우 |
| `.maestro/config.yaml` | Create | Maestro 전역 설정 |

### C-2: 성능 최적화
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/components/ui/PostCard.tsx` | Modify | React.memo 래핑 |
| `frontend/components/ui/HistoryItem.tsx` | Modify | React.memo 래핑 |
| `frontend/components/ui/SpotListItem.tsx` | Modify | React.memo 래핑 |
| `frontend/assets/images/google-logo.png` | Create | Google 로고 로컬 에셋 |
| `frontend/app/login.tsx` | Modify | 외부 URL → 로컬 이미지 |

### C-3: 접근성
| File | Action | Responsibility |
|------|--------|---------------|
| `frontend/app/(tabs)/_layout.tsx` | Modify | 탭 접근성 라벨 |
| `frontend/app/(tabs)/index.tsx` | Modify | 버튼 접근성 라벨 |
| `frontend/app/(tabs)/community.tsx` | Modify | 인터랙티브 요소 접근성 |
| `frontend/app/(tabs)/mypage.tsx` | Modify | 메뉴 접근성 라벨 |
| `frontend/app/scan.tsx` | Modify | 카메라/버튼 접근성 |
| `frontend/tailwind.config.js` | Modify | 텍스트용 primary 색상 대비 |

---

## Task 1: Maestro 설치 및 설정

**Files:**
- Create: `.maestro/config.yaml`

- [ ] **Step 1: Install Maestro CLI**

```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Verify: `maestro --version`

- [ ] **Step 2: Create Maestro config**

```yaml
# .maestro/config.yaml
appId: com.clover.wallet
name: Clover Wallet E2E Tests
```

- [ ] **Step 3: Commit**

```bash
git add .maestro/config.yaml
git commit -m "chore: Maestro E2E 테스트 프레임워크 설정"
```

---

## Task 2: E2E — 로그인 → 홈 플로우

**Files:**
- Create: `.maestro/login-to-home.yaml`

- [ ] **Step 1: Create login flow**

```yaml
# .maestro/login-to-home.yaml
appId: com.clover.wallet
name: Login to Home
---
- launchApp
- assertVisible: "Google 계정으로 계속하기"
- tapOn: "Google 계정으로 계속하기"
- assertVisible:
    text: "다음 추첨까지"
    timeout: 10000
- assertVisible: "번호 생성"
- assertVisible: "QR 스캔"
```

- [ ] **Step 2: Commit**

```bash
git add .maestro/login-to-home.yaml
git commit -m "test(e2e): 로그인 → 홈 화면 Maestro 플로우 추가"
```

---

## Task 3: E2E — 번호 생성 → 저장 플로우

**Files:**
- Create: `.maestro/generate-numbers.yaml`

- [ ] **Step 1: Create number generation flow**

```yaml
# .maestro/generate-numbers.yaml
appId: com.clover.wallet
name: Generate and Save Numbers
---
- launchApp
- tapOn: "Google 계정으로 계속하기"
- assertVisible:
    text: "다음 추첨까지"
    timeout: 10000
- tapOn: "번호 생성"
- assertVisible: "생성 방법 선택"
- tapOn: "꿈 해몽"
- assertVisible:
    text: "꿈 내용"
    timeout: 5000
- inputText: "용꿈"
- tapOn: "생성하기"
- assertVisible:
    text: "저장"
    timeout: 5000
- tapOn: "저장"
```

- [ ] **Step 2: Commit**

```bash
git add .maestro/generate-numbers.yaml
git commit -m "test(e2e): 번호 생성 → 저장 Maestro 플로우 추가"
```

---

## Task 4: E2E — 게시글 작성 플로우

**Files:**
- Create: `.maestro/create-post.yaml`

- [ ] **Step 1: Create community post flow**

```yaml
# .maestro/create-post.yaml
appId: com.clover.wallet
name: Create Community Post
---
- launchApp
- tapOn: "Google 계정으로 계속하기"
- assertVisible:
    text: "다음 추첨까지"
    timeout: 10000
- tapOn:
    id: "tab-community"
- assertVisible: "커뮤니티"
- tapOn:
    id: "fab-create-post"
- assertVisible: "게시글 작성"
- tapOn:
    id: "input-title"
- inputText: "E2E 테스트 게시글"
- tapOn:
    id: "input-content"
- inputText: "이것은 자동화 테스트로 작성된 게시글입니다."
- tapOn: "게시하기"
- assertVisible:
    text: "E2E 테스트 게시글"
    timeout: 5000
```

- [ ] **Step 2: Commit**

```bash
git add .maestro/create-post.yaml
git commit -m "test(e2e): 게시글 작성 Maestro 플로우 추가"
```

---

## Task 5: 리스트 아이템 React.memo 최적화

**Files:**
- Modify: `frontend/components/ui/PostCard.tsx`
- Modify: `frontend/components/ui/HistoryItem.tsx`
- Modify: `frontend/components/ui/SpotListItem.tsx`

- [ ] **Step 1: Read all three files**

- [ ] **Step 2: Wrap PostCard with React.memo**

```typescript
// frontend/components/ui/PostCard.tsx
// Change export:
// FROM: export const PostCard = ({ post, onLike, onShare }: PostCardProps) => {
// TO:
import { memo } from 'react';

const PostCardComponent = ({ post, onLike, onShare }: PostCardProps) => {
  // ... existing implementation
};

export const PostCard = memo(PostCardComponent);
```

- [ ] **Step 3: Wrap HistoryItem with React.memo**

```typescript
// frontend/components/ui/HistoryItem.tsx
import { memo } from 'react';

const HistoryItemComponent = ({ item, onDelete }: HistoryItemProps) => {
  // ... existing implementation
};

export const HistoryItem = memo(HistoryItemComponent);
```

- [ ] **Step 4: Wrap SpotListItem with React.memo**

```typescript
// frontend/components/ui/SpotListItem.tsx
import { memo } from 'react';

const SpotListItemComponent = ({ spot, onPress }: SpotListItemProps) => {
  // ... existing implementation
};

export const SpotListItem = memo(SpotListItemComponent);
```

- [ ] **Step 5: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/components/ui/PostCard.tsx frontend/components/ui/HistoryItem.tsx frontend/components/ui/SpotListItem.tsx
git commit -m "perf(frontend): 리스트 아이템 React.memo 래핑 (PostCard, HistoryItem, SpotListItem)"
```

---

## Task 6: Google 로고 로컬화

**Files:**
- Create: `frontend/assets/images/google-logo.png`
- Modify: `frontend/app/login.tsx`

- [ ] **Step 1: Download Google logo locally**

```bash
cd frontend && mkdir -p assets/images
curl -o assets/images/google-logo.png "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/240px-Google_%22G%22_logo.svg.png"
```

If curl fails (SVG conversion issue), create a simple alternative:
```bash
# Use a placeholder or find a PNG version
curl -L -o assets/images/google-logo.png "https://developers.google.com/identity/images/g-logo.png"
```

- [ ] **Step 2: Read login.tsx and replace external URL**

```typescript
// REPLACE:
// source={{ uri: 'https://upload.wikimedia.org/...' }}
// WITH:
// source={require('../assets/images/google-logo.png')}
```

- [ ] **Step 3: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/assets/images/google-logo.png frontend/app/login.tsx
git commit -m "perf(frontend): Google 로고 로컬 에셋으로 교체 (오프라인 대응)"
```

---

## Task 7: 접근성 — 탭 바 + 홈 화면

**Files:**
- Modify: `frontend/app/(tabs)/_layout.tsx`
- Modify: `frontend/app/(tabs)/index.tsx`

- [ ] **Step 1: Read both files**

- [ ] **Step 2: Add accessibility labels to tab bar**

```typescript
// frontend/app/(tabs)/_layout.tsx
// For each Tabs.Screen, add accessibilityLabel to options:
<Tabs.Screen
  name="index"
  options={{
    title: '홈',
    tabBarAccessibilityLabel: '홈 탭',
    // ... existing options
  }}
/>
<Tabs.Screen
  name="history"
  options={{
    title: '내 로또',
    tabBarAccessibilityLabel: '내 로또 기록 탭',
    // ...
  }}
/>
// Repeat for community ('커뮤니티 탭'), map ('명당 지도 탭'), mypage ('마이페이지 탭')
```

- [ ] **Step 3: Add accessibility labels to home screen interactive elements**

```typescript
// frontend/app/(tabs)/index.tsx
// Notification bell:
<TouchableOpacity accessibilityLabel="알림" accessibilityRole="button">

// Quick action items — add to each:
accessibilityLabel="번호 생성하기"
accessibilityRole="button"

// For QuickActionItem component, pass accessibilityLabel prop:
<QuickActionItem label="번호 생성" accessibilityLabel="번호 생성 바로가기" ... />
<QuickActionItem label="QR 스캔" accessibilityLabel="QR 코드 스캔 바로가기" ... />
<QuickActionItem label="번호 분석" accessibilityLabel="번호 분석 통계 바로가기" ... />
<QuickActionItem label="여행" accessibilityLabel="명당 여행 바로가기" ... />
<QuickActionItem label="명당" accessibilityLabel="명당 지도 바로가기" ... />
```

- [ ] **Step 4: Add testID for E2E**

Also add `testID` props to key elements used by Maestro flows:
```typescript
// Tab bar items: testID="tab-community", testID="tab-map", etc.
// Home buttons: testID="btn-generate", testID="btn-scan"
```

- [ ] **Step 5: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/app/\(tabs\)/_layout.tsx frontend/app/\(tabs\)/index.tsx
git commit -m "a11y(frontend): 탭 바 및 홈 화면 접근성 라벨 추가"
```

---

## Task 8: 접근성 — 커뮤니티, 마이페이지, 스캔

**Files:**
- Modify: `frontend/app/(tabs)/community.tsx`
- Modify: `frontend/app/(tabs)/mypage.tsx`
- Modify: `frontend/app/scan.tsx`

- [ ] **Step 1: Read all three files**

- [ ] **Step 2: Community screen accessibility**

```typescript
// frontend/app/(tabs)/community.tsx
// Segment control buttons:
<Pressable accessibilityLabel="전체 게시글 보기" accessibilityRole="tab" accessibilityState={{ selected: feedType === 'all' }}>
<Pressable accessibilityLabel="팔로잉 게시글 보기" accessibilityRole="tab" accessibilityState={{ selected: feedType === 'following' }}>

// FAB:
<Pressable accessibilityLabel="새 게시글 작성" accessibilityRole="button" testID="fab-create-post">

// Search button (if exists):
accessibilityLabel="게시글 검색" accessibilityRole="button"
```

- [ ] **Step 3: MyPage screen accessibility**

```typescript
// frontend/app/(tabs)/mypage.tsx
// Theme toggle buttons:
<Pressable accessibilityLabel="시스템 테마 사용" accessibilityRole="radio" accessibilityState={{ selected: themePreference === 'system' }}>
<Pressable accessibilityLabel="라이트 모드" accessibilityRole="radio" accessibilityState={{ selected: themePreference === 'light' }}>
<Pressable accessibilityLabel="다크 모드" accessibilityRole="radio" accessibilityState={{ selected: themePreference === 'dark' }}>

// Menu items: each MyPageMenuItem should have accessibilityRole="button"
// Logout: accessibilityLabel="로그아웃"
// Delete account: accessibilityLabel="계정 탈퇴"
```

- [ ] **Step 4: Scan screen accessibility**

```typescript
// frontend/app/scan.tsx
// Mode toggle:
<Pressable accessibilityLabel="QR 코드 스캔 모드" accessibilityRole="tab" accessibilityState={{ selected: scanMode === 'qr' }}>
<Pressable accessibilityLabel="번호 촬영 모드" accessibilityRole="tab" accessibilityState={{ selected: scanMode === 'ocr' }}>

// Capture button:
<Pressable accessibilityLabel="사진 촬영" accessibilityRole="button">

// Close button:
<Pressable accessibilityLabel="스캔 화면 닫기" accessibilityRole="button">
```

- [ ] **Step 5: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/app/\(tabs\)/community.tsx frontend/app/\(tabs\)/mypage.tsx frontend/app/scan.tsx
git commit -m "a11y(frontend): 커뮤니티, 마이페이지, 스캔 화면 접근성 라벨 추가"
```

---

## Task 9: 색상 대비 개선

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Read tailwind.config.js**

- [ ] **Step 2: Add accessible text color**

Current `primary: '#4CAF50'` has 3.5:1 contrast on white (WCAG AA 미달). Add a separate text-safe variant:

```javascript
// frontend/tailwind.config.js — extend colors:
'primary-text': '#2E7D32', // 5.3:1 on white — WCAG AA pass
```

This keeps the existing `primary` (#4CAF50) for backgrounds/buttons where white text is used (which passes), and adds `primary-text` for green text on light backgrounds.

- [ ] **Step 3: Apply primary-text to key text elements**

Update files where green text appears on white/light backgrounds:
- Statistics screen numbers
- Badge labels
- Link-style text

This is a targeted change — only replace `text-primary` with `text-primary-text` where the text sits on a white/light background.

- [ ] **Step 4: Run lint and tests**

```bash
cd frontend && npm run lint && npm test -- --watchAll=false
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "a11y(frontend): WCAG AA 색상 대비 개선 (primary-text #2E7D32 추가)"
```

---

## Summary

| Task | Description | Area | Dependencies |
|------|-------------|------|-------------|
| 1 | Maestro 설치 및 설정 | C-1 (E2E) | None |
| 2 | E2E: 로그인 → 홈 | C-1 (E2E) | Task 1 |
| 3 | E2E: 번호 생성 → 저장 | C-1 (E2E) | Task 1 |
| 4 | E2E: 게시글 작성 | C-1 (E2E) | Task 1 |
| 5 | React.memo 리스트 최적화 | C-2 (성능) | None |
| 6 | Google 로고 로컬화 | C-2 (성능) | None |
| 7 | 접근성: 탭 바 + 홈 | C-3 (접근성) | None |
| 8 | 접근성: 커뮤니티/마이페이지/스캔 | C-3 (접근성) | None |
| 9 | 색상 대비 개선 | C-3 (접근성) | None |

**병렬 실행:** C-1(1→2,3,4) ∥ C-2(5,6) ∥ C-3(7,8,9) — 거의 전부 독립
