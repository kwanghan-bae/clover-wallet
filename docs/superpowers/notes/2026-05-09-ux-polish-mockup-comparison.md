# UX Polish Pass — Comparison

Branch: `feat/ux-polish-pass`
Spec: `docs/superpowers/specs/2026-05-09-ux-polish-pass-design.md`
Plan: `docs/superpowers/plans/2026-05-09-ux-polish-pass.md`

## Foundation

### Design tokens (`tailwind.config.js`)
- 6 fontFamily aliases (sans/medium/semibold/bold/extrabold/black)
- 8 fontSize tokens with letterSpacing tuples (display/title-lg/title/body-lg/body/caption/label/eyebrow)
- 7 borderRadius tokens (sm/md/lg/card/card-lg/hero/pill)
- ~24 color tokens (text-primary/secondary/muted/disabled, surface/surface-muted, border-hairline, qa-*)
- 4 boxShadow tokens (card/elev/hero/button)

### Font weights (`_layout.tsx`)
- Added 600 SemiBold + 800 ExtraBold (now 6 total)

### Web body background (`global.css`)
- html/body/#root → surface-muted (#FBFCFD), dark mode → dark-bg (#121212)
- Removes black void on web outside SafeAreaView

## New shared components (Phase B)

| Component | Purpose | Lines |
|---|---|---|
| AppText | Typography variant helper (8 variants) | 41 |
| ScreenContainer | SafeAreaView + page bg + edges (uses safe-area-context) | 26 |
| SectionHead | Section title + optional link with chevron | 37 |
| EmptyState | Icon + title + description + optional CTA | 53 |
| PressableCard | Pressable with scale-down spring | 38 |
| QuickActionCard | Card with gradient icon + label (4 tones) | 48 |
| AppBar (3 variants) | home / screen / modal headers | 27 + 40 + 30 + 30 |
| PostNumbersPreview | BallRow card for create-post prefill | 37 |

## Refreshed shared components (Phase D)

| Component | Change |
|---|---|
| PrimaryButton | rounded-xl → rounded-lg, shadow-md → shadow-button, AppText body-lg |
| HistoryItem | Tokens applied |
| WinningHistoryItem | Tokens applied (kept shadow-sm vs shadow-card — visual parity TODO) |
| PostCard | Tokens applied |
| CommentItem | Tokens applied |
| SpotListItem | Tokens applied |
| MyPageMenuItem | Tokens applied (16→13px size regression accepted) |
| GenerationResultCard | Tokens applied |
| GenerationResultCards | Tokens + shadow-hero |

## Home screen (reference, Phase C)

`apps/frontend/app/(tabs)/index.tsx` (115 → 73 lines)

- AppBar with gradient logo mark + Bell with unread dot
- HeroSection refresh: NEXT DRAW eyebrow + sectioned time + optional QR scan secondary button
- QuickActions: 5 → 4 cards (dropped redundant 명당 지도)
- "최근 구매" section + "전체 보기" link
- EmptyState card for empty purchases

[ ] Before screenshot
[ ] After screenshot

## Carry-forward screens (Phase E)

### 1. number-generation.tsx
- File: `apps/frontend/app/number-generation.tsx`
- Commit: `cfd9366 feat(generation): apply UX polish tokens to number-generation screen`
- Key changes: Tip Section amber → surface, AppBar screen variant, token-driven typography on result cards (via Phase D `ef683e6`)

[ ] Before screenshot
[ ] After screenshot

### 2. (tabs)/history.tsx
- File: `apps/frontend/app/(tabs)/history.tsx`
- Commit: `24ae946 feat(history): apply UX polish tokens + EmptyState`
- Key changes: Custom tab header with AppBar, EmptyState with CTA when no tickets, HistoryItem/WinningHistoryItem token roll-up

[ ] Before screenshot
[ ] After screenshot

### 3. (tabs)/mypage.tsx + sub-components
- Files: `apps/frontend/app/(tabs)/mypage.tsx`, `components/features/mypage/BadgeSection`, `MenuSection`, `ThemeSelector`
- Commit: `26eee97 feat(mypage): apply UX polish tokens`
- Key changes: AppBar screen variant, surface-muted backdrop, MyPageMenuItem refresh (16→13px caveat), section spacing normalized

[ ] Before screenshot
[ ] After screenshot

### 4. (tabs)/community.tsx + FeedList + FeedTabSelector
- Files: `apps/frontend/app/(tabs)/community.tsx`, `components/features/community/FeedList`, `FeedTabSelector`
- Commit: `55c3231 feat(community): apply UX polish tokens`
- Key changes: FAB consolidation, AppBar, tab selector typography, PostCard token roll-up via Phase D

[ ] Before screenshot
[ ] After screenshot

### 5. create-post.tsx (full rewrite)
- File: `apps/frontend/app/create-post.tsx`
- Commit: `c9f8365 feat(create-post): KO header, single submit, BallRow preview, polish` + `edd35e9 feat(ui): add PostNumbersPreview component for create-post`
- Key changes: KO header text, single submit button (replaces dual save/post), BallRow preview via PostNumbersPreview, full polish to surface tokens
- Maestro test updated: `.maestro/create-post.yaml` (header text + testIDs)

[ ] Before screenshot
[ ] After screenshot

### 6. (tabs)/map.tsx + MapCalloutContent
- Files: `apps/frontend/app/(tabs)/map.tsx`, `components/features/map/MapCalloutContent`
- Commit: `79591ec feat(map): apply UX polish tokens`
- Key changes: FAB shadow-elev, callout typography, surface tokens for sheet

[ ] Before screenshot
[ ] After screenshot

### 7. scan.tsx + ScanOverlay + ScanResultView
- Files: `apps/frontend/app/scan.tsx`, `components/features/scan/ScanOverlay`, `ScanResultView`
- Commit: `1892cb8 feat(scan): apply UX polish tokens`
- Key changes: Token typography, overlay surfaces, result view layout
- Caveat: AppBar dark icon vs black bg — low contrast, deferred

[ ] Before screenshot
[ ] After screenshot

### 8. statistics.tsx
- File: `apps/frontend/app/statistics.tsx`
- Commit: `318d279 feat(statistics): apply UX polish tokens`
- Key changes: AppText display variant for big numbers, surface card grouping, AppBar screen variant

[ ] Before screenshot
[ ] After screenshot

### 9. notifications.tsx
- File: `apps/frontend/app/notifications.tsx`
- Commit: `a8fdda1 feat(notifications): apply UX polish tokens + EmptyState`
- Key changes: EmptyState when list is empty, AppBar screen variant, token roll-up

[ ] Before screenshot
[ ] After screenshot

### 10. login.tsx
- File: `apps/frontend/app/login.tsx`
- Commits: `dbfc703 feat(login): apply UX polish tokens` + `e0c9304 fix(login): migrate SafeAreaView to react-native-safe-area-context`
- Key changes: Brand-preserving polish (logo + gradient kept), token typography for copy, SafeAreaView migration to safe-area-context for consistency with rest of app

[ ] Before screenshot
[ ] After screenshot

## Motion & feedback (Phase F)

- Haptic medium impact on: number generation, save, post submit
- PressableCard scale 0.98 spring
- PrimaryButton scale 0.96 spring (preserved)

## Lint advisory

`no-restricted-syntax` warns on inline hex literals in *.ts/*.tsx (excluding config files). 139 existing acceptable callsites flagged (lucide icon colors, RN platform props, gradient stops).

## Known issues (deferred)

- Camera screen AppBar dark icon vs black bg — low contrast (Phase E7 caveat)
- WinningHistoryItem shadow-sm vs sibling HistoryItem shadow-card
- CommentItem variant + size-class override pattern (visual identical)
- 16→13px size regression on MyPageMenuItem labels and similar surfaces
- background (#F5F7FA) token now orphaned (replaced by surface-muted post-Phase E)

## Test impact

- 297 tests before → 321 tests after (+24 from new components)
- Updated tests:
  - HomeScreen.test (text changes)
  - QuickActions.test (5→4)
  - .maestro/create-post.yaml (헤더 텍스트 alignment + testIDs)
- All tests passing

## Commits

```
66df5e1 chore(lint): warn on inline hex literals (use tokens)
6edb21b feat(motion): add haptic feedback to primary actions
e0c9304 fix(login): migrate SafeAreaView to react-native-safe-area-context
dbfc703 feat(login): apply UX polish tokens
a8fdda1 feat(notifications): apply UX polish tokens + EmptyState
318d279 feat(statistics): apply UX polish tokens
1892cb8 feat(scan): apply UX polish tokens
79591ec feat(map): apply UX polish tokens
c9f8365 feat(create-post): KO header, single submit, BallRow preview, polish
55c3231 feat(community): apply UX polish tokens
26eee97 feat(mypage): apply UX polish tokens
24ae946 feat(history): apply UX polish tokens + EmptyState
cfd9366 feat(generation): apply UX polish tokens to number-generation screen
edd35e9 feat(ui): add PostNumbersPreview component for create-post
ef683e6 refactor(generation): apply tokens to result cards
eadccc9 refactor(ui): apply tokens to MyPageMenuItem
39c4233 refactor(ui): apply tokens to SpotListItem
286ac2a refactor(ui): apply tokens to CommentItem
3245011 refactor(ui): apply tokens to PostCard
9c628c6 refactor(ui): apply tokens to WinningHistoryItem
b90f2f5 refactor(ui): apply tokens to HistoryItem
51ce265 refactor(ui): apply tokens to PrimaryButton (radius/shadow/typo)
bda1456 feat(home): apply AppBar/ScreenContainer/EmptyState (reference screen)
d0adfa6 feat(home): replace QuickActions with QuickActionCard 4-grid
575ed29 feat(home): refresh HeroSection with token-based design
5ae05ed feat(ui): add AppBar with home/screen/modal variants
04caef8 feat(ui): add QuickActionCard component
4f094de feat(ui): add PressableCard with scale-down feedback
5f2b16c feat(ui): add EmptyState component
03b28d9 feat(ui): add SectionHead component
7e53725 fix(query-storage): map MMKV delete to remove on native
2b5bf88 feat(ui): add ScreenContainer with SafeAreaProvider migration
c885bd5 test(ui): add AppText style-merge precedence test + plan refinement
b45448a docs(plan): correct _layout.tsx label in file structure (no body bg)
dd4e725 feat(ui): add AppText component with typography variants
afa59e1 fix(web): set body background to surface-muted to remove black void
8d63f08 docs(plan): fold _layout.tsx persister extraction into B2
2a2a2f9 feat(ui): load NotoSansKR 600 / 800 weights
e1fc391 feat(ui): extend tailwind tokens (color/type/spacing/radius/shadow)
```

40 commits total (`git log --oneline main..feat/ux-polish-pass`).
