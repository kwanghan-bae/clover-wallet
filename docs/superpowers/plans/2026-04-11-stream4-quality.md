# Stream 4: Phase 4-2 Quality Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** E2E 테스트 7개+ 플로우 확보, 성능 최적화 (React.memo + 번들 분석), 접근성 WCAG AA 완성

**Architecture:** Maestro E2E 프레임워크로 핵심 사용자 플로우를 자동화. 프론트엔드 성능은 React.memo, 이미지 최적화, 불필요 의존성 제거로 개선. 접근성은 WCAG AA 기준 라벨/역할/대비 보강.

**Tech Stack:** Maestro, React Native, Expo, Lighthouse

**Pre-requisite:** Stream 1 완료. Stream 2-3과 병렬 실행 가능하나, 분리된 컴포넌트가 있으면 그 위에서 작업.

---

## Task 1: Maestro E2E — 스캔 플로우 추가

**Files:**
- Create: `.maestro/scan_flow.yaml`

- [ ] **Step 1: 스캔 플로우 작성**

`.maestro/scan_flow.yaml`:

```yaml
appId: com.clover.wallet
---
- launchApp
- tapOn: "QR 스캔"
- assertVisible: "카메라 접근 권한이 필요합니다"
- tapOn: "권한 허용"
- assertVisible:
    text: "QR 스캔"
    traits: ["selected"]
- tapOn: "번호 촬영"
- assertVisible:
    text: "번호 촬영"
    traits: ["selected"]
- tapOn: "스캔 화면 닫기"
```

- [ ] **Step 2: 로컬 실행 확인**

Run: `maestro test .maestro/scan_flow.yaml`
Expected: PASS (에뮬레이터에서)

- [ ] **Step 3: Commit**

```bash
git add .maestro/scan_flow.yaml
git commit -m "test(e2e): 스캔 플로우 Maestro 테스트 추가"
```

---

## Task 2: Maestro E2E — 마이페이지 플로우

**Files:**
- Create: `.maestro/mypage_flow.yaml`

- [ ] **Step 1: 마이페이지 플로우 작성**

```yaml
appId: com.clover.wallet
---
- launchApp
- tapOn: "마이페이지"
- assertVisible: "마이페이지"
- assertVisible: "테마 설정"
- tapOn: "다크"
- tapOn: "시스템"
- assertVisible: "알림"
- assertVisible: "로그아웃"
- assertVisible: "회원 탈퇴"
```

- [ ] **Step 2: Commit**

```bash
git add .maestro/mypage_flow.yaml
git commit -m "test(e2e): 마이페이지 플로우 Maestro 테스트 추가"
```

---

## Task 3: Maestro E2E — 지도/명당 + 알림 플로우

**Files:**
- Create: `.maestro/map_flow.yaml`
- Create: `.maestro/notification_flow.yaml`

- [ ] **Step 1: 지도 플로우 작성**

```yaml
appId: com.clover.wallet
---
- launchApp
- tapOn: "로또 명당"
- assertVisible: "로또 명당"
- scroll
```

- [ ] **Step 2: 알림 플로우 작성**

```yaml
appId: com.clover.wallet
---
- launchApp
- tapOn: "알림"
- assertVisible: "알림"
```

- [ ] **Step 3: Commit**

```bash
git add .maestro/map_flow.yaml .maestro/notification_flow.yaml
git commit -m "test(e2e): 지도 + 알림 플로우 Maestro 테스트 추가"
```

---

## Task 4: Maestro E2E — 통계 플로우 + 전체 실행

**Files:**
- Create: `.maestro/statistics_flow.yaml`

- [ ] **Step 1: 통계 플로우 작성**

```yaml
appId: com.clover.wallet
---
- launchApp
- tapOn: "번호 분석"
- assertVisible: "통계"
```

- [ ] **Step 2: 전체 E2E 실행**

Run: `maestro test .maestro/`
Expected: 7개+ 플로우 모두 PASS (login, number_generation, post_creation, scan, mypage, map, notification/statistics)

- [ ] **Step 3: Commit**

```bash
git add .maestro/statistics_flow.yaml
git commit -m "test(e2e): 통계 플로우 추가 — E2E 7개 플로우 달성"
```

---

## Task 5: 성능 — React.memo 적용 확대

**Files:**
- Modify: 새로 분리된 컴포넌트들에 React.memo 래핑

- [ ] **Step 1: 리스트 아이템 컴포넌트에 React.memo 적용**

다음 컴포넌트들을 React.memo로 래핑:
- `components/mypage/BadgeSection.tsx`
- `components/home/QuickActions.tsx`
- `components/community/FeedList.tsx` 내 renderItem
- `components/ui/PostCard.tsx` (이미 적용됐을 수 있음 — 확인 후 적용)
- `components/profile/ProfileHeader.tsx`

패턴:

```tsx
export const BadgeSection = React.memo(({ badges }: BadgeSectionProps) => {
  // ... existing implementation
});
BadgeSection.displayName = 'BadgeSection';
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "perf(frontend): React.memo 적용 확대 (분리된 컴포넌트)"
```

---

## Task 6: 성능 — 번들 사이즈 분석 + 최적화

**Files:**
- Potentially modify: `apps/frontend/package.json`

- [ ] **Step 1: 번들 사이즈 측정**

Run: `cd apps/frontend && npx expo export --platform web --no-minify && du -sh dist/`
Expected: 현재 번들 사이즈 기록

- [ ] **Step 2: 불필요 의존성 확인**

`package.json`의 dependencies 중 실제 import되지 않는 패키지 확인:

Run: `cd apps/frontend && for pkg in $(node -e "console.log(Object.keys(require('./package.json').dependencies).join('\n'))"); do grep -rq "$pkg" --include="*.ts" --include="*.tsx" app/ components/ hooks/ utils/ api/ || echo "UNUSED: $pkg"; done`

- [ ] **Step 3: 미사용 패키지 제거 (발견 시)**

- [ ] **Step 4: 번들 사이즈 재측정 + 기록**

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "perf(frontend): 번들 사이즈 최적화 (미사용 의존성 정리)"
```

---

## Task 7: 접근성 — 모든 컴포넌트 접근성 라벨 확인

**Files:**
- Modify: 분리된 모든 새 컴포넌트에 접근성 속성 추가

- [ ] **Step 1: 접근성 속성 누락 검사**

Run: `cd apps/frontend && grep -rl "TouchableOpacity\|Pressable" components/ app/ | xargs grep -L "accessibilityLabel\|accessibilityRole" | head -20`
Expected: 접근성 속성이 누락된 파일 목록

- [ ] **Step 2: 누락된 접근성 라벨 추가**

모든 인터랙티브 요소(TouchableOpacity, Pressable, TextInput)에:
- `accessibilityLabel`: 한국어 설명
- `accessibilityRole`: button, link, radio, tab 등
- `accessibilityState`: selected, disabled 등 (해당 시)

- [ ] **Step 3: 이미지/아이콘에 alt 속성 확인**

아이콘 전용 버튼에 `accessibilityLabel` 확인. 장식적 이미지에 `accessible={false}`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "a11y(frontend): 모든 컴포넌트 접근성 라벨/역할 보강"
```

---

## Task 8: 최종 검증

- [ ] **Step 1: E2E 플로우 카운트 확인**

Run: `ls .maestro/*.yaml | wc -l`
Expected: 7개 이상

- [ ] **Step 2: 접근성 라벨 커버리지 확인**

Run: `cd apps/frontend && grep -rl "TouchableOpacity\|Pressable" components/ app/ | xargs grep -L "accessibilityLabel" | wc -l`
Expected: 0 (누락 없음)

- [ ] **Step 3: 전체 빌드 + 테스트**

Run: `cd apps/frontend && npm test -- --watchAll=false --no-coverage && npx expo export --platform web --no-minify`
Expected: 모두 성공

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "quality: Stream 4 완료 — E2E 7+, React.memo, 접근성 보강"
```
