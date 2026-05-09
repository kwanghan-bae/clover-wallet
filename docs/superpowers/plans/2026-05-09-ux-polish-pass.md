# UX Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tokenize the design system and apply unified polish across 10 screens via a vertical-slice strategy starting from the home screen.

**Architecture:** Single feature branch (`feat/ux-polish-pass`), no intermediate merges. Phase A establishes tokens in `tailwind.config.js` + font loading. Phase B adds 6 new shared components. Phase C applies them to the home screen as reference. Phase D refreshes 7 existing components. Phase E fans out to remaining 9 screens. Phase F finalizes localization, manual smoke, and PR prep.

**Tech Stack:** Expo SDK 54, React Native 0.81, NativeWind 4 (Tailwind), `@expo-google-fonts/noto-sans-kr`, `react-native-safe-area-context`, `expo-haptics`, `expo-linear-gradient`, Jest + `@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-05-09-ux-polish-pass-design.md`

---

## File Structure

### New files

```
apps/frontend/components/ui/
  AppText.tsx                      # Typography variant helper
  ScreenContainer.tsx              # SafeAreaView + page bg + padding
  SectionHead.tsx                  # Section title + optional link
  EmptyState.tsx                   # Centered empty/error layout
  PressableCard.tsx                # Pressable with scale-down feedback
  QuickActionCard.tsx              # Replacement for QuickActionItem
  AppBar/
    index.tsx                      # AppBar dispatcher (variant prop)
    AppBarHome.tsx                 # Home variant
    AppBarScreen.tsx               # Stack screen variant (back)
    AppBarModal.tsx                # Modal variant (X close)
  PostNumbersPreview.tsx           # BallRow card for create-post prefill
```

### Modified files

```
apps/frontend/tailwind.config.js                # +tokens
apps/frontend/app/_layout.tsx                   # +font weights, web body bg
apps/frontend/global.css                        # +web body bg
apps/frontend/components/home/HeroSection.tsx   # refresh
apps/frontend/components/home/QuickActions.tsx  # use QuickActionCard, 5→4
apps/frontend/components/ui/PrimaryButton.tsx   # token application
apps/frontend/components/ui/HistoryItem.tsx     # token application
apps/frontend/components/ui/WinningHistoryItem.tsx
apps/frontend/components/ui/PostCard.tsx
apps/frontend/components/ui/CommentItem.tsx
apps/frontend/components/ui/SpotListItem.tsx
apps/frontend/components/ui/MyPageMenuItem.tsx
apps/frontend/components/generation/GenerationResultCard.tsx
apps/frontend/components/generation/GenerationResultCards.tsx
apps/frontend/app/(tabs)/index.tsx              # home screen (reference)
apps/frontend/app/(tabs)/history.tsx
apps/frontend/app/(tabs)/community.tsx
apps/frontend/app/(tabs)/map.tsx
apps/frontend/app/(tabs)/mypage.tsx
apps/frontend/app/number-generation.tsx
apps/frontend/app/scan.tsx
apps/frontend/app/statistics.tsx
apps/frontend/app/notifications.tsx
apps/frontend/app/create-post.tsx
apps/frontend/app/login.tsx
```

### Tests

Each new component gets a behavior test in `apps/frontend/__tests__/components/ui/`. Existing tests must continue passing — refresh tasks update tests only when the component's render output (text/role/label) actually changes.

### Test commands

- All frontend: `cd apps/frontend && npm test`
- Single file: `cd apps/frontend && npm test -- --testPathPattern=AppText`
- Lint: `cd apps/frontend && npm run lint`
- Typecheck: `cd /Users/joel/Desktop/git/clover-wallet && npm run typecheck`

---

## Phase A — Foundation (tokens, fonts, web body)

### Task A1: Branch + extend tailwind tokens

**Files:**
- Modify: `apps/frontend/tailwind.config.js`

- [ ] **Step 1: Create feature branch**

```bash
cd /Users/joel/Desktop/git/clover-wallet
git checkout -b feat/ux-polish-pass
```

- [ ] **Step 2: Replace tailwind.config.js**

Replace the entire file content with:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["NotoSansKR_400Regular"],
        medium: ["NotoSansKR_500Medium"],
        semibold: ["NotoSansKR_600SemiBold"],
        bold: ["NotoSansKR_700Bold"],
        extrabold: ["NotoSansKR_800ExtraBold"],
        black: ["NotoSansKR_900Black"],
      },
      fontSize: {
        eyebrow: ['10px', { letterSpacing: '1.4px' }],
        label: ['11px', { letterSpacing: '0px' }],
        caption: ['12px', { letterSpacing: '0px' }],
        body: ['13px', { letterSpacing: '0px' }],
        'body-lg': ['15px', { letterSpacing: '-0.1px' }],
        title: ['16px', { letterSpacing: '-0.2px' }],
        'title-lg': ['20px', { letterSpacing: '-0.4px' }],
        display: ['30px', { letterSpacing: '-1.2px' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        card: '18px',
        'card-lg': '22px',
        hero: '28px',
        pill: '999px',
      },
      colors: {
        primary: "#4CAF50",
        "primary-dark": "#388E3C",
        "primary-light": "#C8E6C9",
        "primary-text": "#2E7D32",
        secondary: "#FFC107",
        accent: "#2196F3",
        background: "#F5F7FA",
        surface: "#FFFFFF",
        "surface-muted": "#FBFCFD",
        "border-hairline": "rgba(15,17,21,0.04)",
        "text-primary": "#0F1115",
        "text-secondary": "#2A2E36",
        "text-muted": "#6E7480",
        "text-disabled": "#A8AEB8",
        "text-dark": "#1A1A1A",
        "text-grey": "#757575",
        error: "#E53935",
        "qa-purple": "#6A1B9A",
        "qa-blue": "#1565C0",
        "qa-orange": "#E65100",
        "qa-green": "#2E7D32",
        "dark-bg": "#121212",
        "dark-surface": "#1E1E1E",
        "dark-card": "#2C2C2C",
        "dark-text": "#E0E0E0",
        "dark-text-secondary": "#A0A0A0",
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,17,21,0.04), 0 4px 12px -8px rgba(15,17,21,0.08)',
        elev: '0 4px 16px -8px rgba(15,17,21,0.12)',
        hero: '0 12px 28px -8px rgba(46,125,50,0.45), 0 2px 6px rgba(15,17,21,0.06)',
        button: '0 4px 12px -4px rgba(15,17,21,0.2)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Verify build still works**

Run: `cd apps/frontend && npx expo export --platform web --clear`
Expected: succeeds (existing classes still resolve, new tokens additive)

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/tailwind.config.js
git commit -m "feat(ui): extend tailwind tokens (color/type/spacing/radius/shadow)"
```

### Task A2: Load 600 + 800 font weights

**Files:**
- Modify: `apps/frontend/app/_layout.tsx`

- [ ] **Step 1: Update font imports**

In `apps/frontend/app/_layout.tsx`, find the existing `useFonts` import block:

```ts
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  NotoSansKR_900Black
} from '@expo-google-fonts/noto-sans-kr';
```

Replace with:

```ts
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
  NotoSansKR_800ExtraBold,
  NotoSansKR_900Black
} from '@expo-google-fonts/noto-sans-kr';
```

Then find the `useFonts({...})` call and add `NotoSansKR_600SemiBold` and `NotoSansKR_800ExtraBold` to its argument object alongside the existing entries.

- [ ] **Step 2: Verify the package exports the new weights**

Run: `node -e "const f = require('@expo-google-fonts/noto-sans-kr'); console.log('SemiBold:', !!f.NotoSansKR_600SemiBold, 'ExtraBold:', !!f.NotoSansKR_800ExtraBold)"`
Expected: `SemiBold: true ExtraBold: true`

If either is `false`, stop — the package version (`^0.4.2` per package.json) is missing the weight. Update the package: `cd apps/frontend && npm install @expo-google-fonts/noto-sans-kr@latest` and re-run.

- [ ] **Step 3: Run tests**

Run: `cd apps/frontend && npm test`
Expected: all 297 tests still pass

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/app/_layout.tsx apps/frontend/package.json apps/frontend/package-lock.json
git commit -m "feat(ui): load NotoSansKR 600 / 800 weights"
```

### Task A3: Web body background

**Files:**
- Modify: `apps/frontend/global.css`

- [ ] **Step 1: Update global.css**

Replace `apps/frontend/global.css` content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  background-color: #FBFCFD;
  min-height: 100%;
}

@media (prefers-color-scheme: dark) {
  html, body, #root {
    background-color: #121212;
  }
}
```

- [ ] **Step 2: Verify web build still works**

Run: `cd apps/frontend && npx expo export --platform web --clear`
Expected: succeeds; `dist/index.html` body has the background color

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/global.css
git commit -m "fix(web): set body background to surface-muted to remove black void"
```

---

## Phase B — New shared components

### Task B1: AppText

**Files:**
- Create: `apps/frontend/components/ui/AppText.tsx`
- Create: `apps/frontend/__tests__/components/ui/AppText.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `apps/frontend/__tests__/components/ui/AppText.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { AppText } from '../../../components/ui/AppText';

describe('AppText', () => {
  it('renders body variant by default', () => {
    const { getByText } = render(<AppText>안녕</AppText>);
    const node = getByText('안녕');
    expect(node.props.style).toEqual(
      expect.objectContaining({ fontFamily: 'NotoSansKR_500Medium' })
    );
  });

  it('renders display variant with extrabold weight and -1.2 tracking', () => {
    const { getByText } = render(<AppText variant="display">42</AppText>);
    const node = getByText('42');
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'NotoSansKR_800ExtraBold',
        fontSize: 30,
        letterSpacing: -1.2,
      })
    );
  });

  it('passes through custom className', () => {
    const { getByText } = render(<AppText variant="title" className="text-primary">제목</AppText>);
    expect(getByText('제목').props.className).toContain('text-primary');
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=AppText`
Expected: FAIL — `Cannot find module '../../../components/ui/AppText'`

- [ ] **Step 3: Implement AppText**

Create `apps/frontend/components/ui/AppText.tsx`:

```tsx
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';

export type AppTextVariant =
  | 'display'
  | 'title-lg'
  | 'title'
  | 'body-lg'
  | 'body'
  | 'caption'
  | 'label'
  | 'eyebrow';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  className?: string;
}

const VARIANTS: Record<AppTextVariant, TextStyle> = {
  display:    { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 30, letterSpacing: -1.2 },
  'title-lg': { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 20, letterSpacing: -0.4 },
  title:      { fontFamily: 'NotoSansKR_800ExtraBold', fontSize: 16, letterSpacing: -0.2 },
  'body-lg':  { fontFamily: 'NotoSansKR_600SemiBold', fontSize: 15, letterSpacing: -0.1 },
  body:       { fontFamily: 'NotoSansKR_500Medium', fontSize: 13, letterSpacing: 0 },
  caption:    { fontFamily: 'NotoSansKR_600SemiBold', fontSize: 12, letterSpacing: 0 },
  label:      { fontFamily: 'NotoSansKR_700Bold', fontSize: 11, letterSpacing: 0 },
  eyebrow:    { fontFamily: 'NotoSansKR_700Bold', fontSize: 10, letterSpacing: 1.4 },
};

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  style,
  ...rest
}) => {
  const variantStyle = VARIANTS[variant];
  const merged: StyleProp<TextStyle> = [variantStyle, style];
  return <Text {...rest} style={merged} />;
};

AppText.displayName = 'AppText';
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `cd apps/frontend && npm test -- --testPathPattern=AppText`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/ui/AppText.tsx apps/frontend/__tests__/components/ui/AppText.test.tsx
git commit -m "feat(ui): add AppText component with typography variants"
```

### Task B2: ScreenContainer (with safe-area-context migration)

**Files:**
- Create: `apps/frontend/components/ui/ScreenContainer.tsx`
- Create: `apps/frontend/__tests__/components/ui/ScreenContainer.test.tsx`
- Modify: `apps/frontend/app/_layout.tsx` (wrap with `SafeAreaProvider`)

- [ ] **Step 1: Verify safe-area-context is installed**

Run: `cd apps/frontend && node -e "require('react-native-safe-area-context')"`
Expected: no error. If error, run `npm install react-native-safe-area-context`.

- [ ] **Step 2: Write failing test**

Create `apps/frontend/__tests__/components/ui/ScreenContainer.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';

const wrap = (ui: React.ReactNode) => (
  <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 320, height: 640 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
    {ui}
  </SafeAreaProvider>
);

describe('ScreenContainer', () => {
  it('renders children', () => {
    const { getByText } = render(wrap(<ScreenContainer><Text>본문</Text></ScreenContainer>));
    expect(getByText('본문')).toBeTruthy();
  });

  it('applies surface-muted background by default', () => {
    const { UNSAFE_getByType } = render(wrap(<ScreenContainer><Text>x</Text></ScreenContainer>));
    const View = require('react-native-safe-area-context').SafeAreaView;
    expect(UNSAFE_getByType(View).props.className).toContain('bg-surface-muted');
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=ScreenContainer`
Expected: FAIL

- [ ] **Step 4: Implement ScreenContainer**

Create `apps/frontend/components/ui/ScreenContainer.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { cn } from '../../utils/cn';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
  scroll?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className,
  edges = ['top', 'left', 'right'],
}) => (
  <SafeAreaView
    edges={edges}
    className={cn('flex-1 bg-surface-muted dark:bg-dark-bg', className)}
  >
    <View className="flex-1">{children}</View>
  </SafeAreaView>
);

ScreenContainer.displayName = 'ScreenContainer';
```

- [ ] **Step 5: Add SafeAreaProvider to _layout.tsx**

In `apps/frontend/app/_layout.tsx`, add the import:

```ts
import { SafeAreaProvider } from 'react-native-safe-area-context';
```

Then wrap the existing root component output with `<SafeAreaProvider>...</SafeAreaProvider>` (between `<GlobalErrorBoundary>` and `<AuthProvider>`, or at whichever level matches the existing tree — find the outermost provider wrapping `<Stack />`).

- [ ] **Step 6: Run test + smoke**

Run: `cd apps/frontend && npm test -- --testPathPattern=ScreenContainer`
Expected: PASS

Run full suite: `cd apps/frontend && npm test`
Expected: all pass

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/components/ui/ScreenContainer.tsx apps/frontend/__tests__/components/ui/ScreenContainer.test.tsx apps/frontend/app/_layout.tsx
git commit -m "feat(ui): add ScreenContainer with SafeAreaProvider migration"
```

### Task B3: SectionHead

**Files:**
- Create: `apps/frontend/components/ui/SectionHead.tsx`
- Create: `apps/frontend/__tests__/components/ui/SectionHead.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/SectionHead.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SectionHead } from '../../../components/ui/SectionHead';

describe('SectionHead', () => {
  it('renders the title', () => {
    const { getByText } = render(<SectionHead title="빠른 실행" />);
    expect(getByText('빠른 실행')).toBeTruthy();
  });

  it('renders link when provided and fires onLinkPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SectionHead title="최근 구매" linkText="전체 보기" onLinkPress={onPress} />
    );
    fireEvent.press(getByText('전체 보기'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits link area when linkText is missing', () => {
    const { queryByText } = render(<SectionHead title="제목" />);
    expect(queryByText('전체 보기')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=SectionHead`
Expected: FAIL

- [ ] **Step 3: Implement SectionHead**

Create `apps/frontend/components/ui/SectionHead.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';

interface SectionHeadProps {
  title: string;
  linkText?: string;
  onLinkPress?: () => void;
  className?: string;
}

export const SectionHead: React.FC<SectionHeadProps> = ({
  title,
  linkText,
  onLinkPress,
  className,
}) => (
  <View className={`flex-row justify-between items-baseline mt-8 mb-3 ${className ?? ''}`}>
    <AppText variant="title" className="text-text-primary dark:text-dark-text">
      {title}
    </AppText>
    {linkText ? (
      <TouchableOpacity
        onPress={onLinkPress}
        accessibilityRole="button"
        accessibilityLabel={linkText}
        activeOpacity={0.7}
      >
        <AppText variant="caption" className="text-primary-text">
          {linkText} ›
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

SectionHead.displayName = 'SectionHead';
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `cd apps/frontend && npm test -- --testPathPattern=SectionHead`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/ui/SectionHead.tsx apps/frontend/__tests__/components/ui/SectionHead.test.tsx
git commit -m "feat(ui): add SectionHead component"
```

### Task B4: EmptyState

**Files:**
- Create: `apps/frontend/components/ui/EmptyState.tsx`
- Create: `apps/frontend/__tests__/components/ui/EmptyState.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/EmptyState.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    const { getByText } = render(
      <EmptyState
        icon={<Text>🎫</Text>}
        title="아직 구매한 로또가 없어요"
        description="번호를 생성하거나 영수증을 스캔해보세요"
      />
    );
    expect(getByText('아직 구매한 로또가 없어요')).toBeTruthy();
    expect(getByText('번호를 생성하거나 영수증을 스캔해보세요')).toBeTruthy();
    expect(getByText('🎫')).toBeTruthy();
  });

  it('renders CTA button when provided and fires onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EmptyState
        icon={<Text>🎫</Text>}
        title="비어있음"
        cta={{ label: '번호 생성하기', onPress }}
      />
    );
    fireEvent.press(getByText('번호 생성하기'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omits CTA when not provided', () => {
    const { queryByText } = render(
      <EmptyState icon={<Text>x</Text>} title="비어있음" />
    );
    expect(queryByText('번호 생성하기')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=EmptyState`
Expected: FAIL

- [ ] **Step 3: Implement EmptyState**

Create `apps/frontend/components/ui/EmptyState.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';

interface EmptyStateCta {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  cta?: EmptyStateCta;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  cta,
  className,
}) => (
  <View className={`items-center justify-center px-6 py-10 ${className ?? ''}`}>
    <View className="w-14 h-14 rounded-card items-center justify-center mb-3 bg-primary/10">
      {icon}
    </View>
    <AppText variant="title" className="text-text-primary dark:text-dark-text text-center">
      {title}
    </AppText>
    {description ? (
      <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mt-1 text-center">
        {description}
      </AppText>
    ) : null}
    {cta ? (
      <TouchableOpacity
        onPress={cta.onPress}
        accessibilityRole="button"
        accessibilityLabel={cta.label}
        activeOpacity={0.7}
        className="mt-3 bg-primary/10 px-4 py-2 rounded-md"
      >
        <AppText variant="caption" className="text-primary-text">
          {cta.label}
        </AppText>
      </TouchableOpacity>
    ) : null}
  </View>
);

EmptyState.displayName = 'EmptyState';
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `cd apps/frontend && npm test -- --testPathPattern=EmptyState`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/ui/EmptyState.tsx apps/frontend/__tests__/components/ui/EmptyState.test.tsx
git commit -m "feat(ui): add EmptyState component"
```

### Task B5: PressableCard

**Files:**
- Create: `apps/frontend/components/ui/PressableCard.tsx`
- Create: `apps/frontend/__tests__/components/ui/PressableCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/PressableCard.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { PressableCard } from '../../../components/ui/PressableCard';

describe('PressableCard', () => {
  it('renders children', () => {
    const { getByText } = render(
      <PressableCard onPress={jest.fn()}><Text>안</Text></PressableCard>
    );
    expect(getByText('안')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <PressableCard onPress={onPress} accessibilityLabel="카드"><Text>x</Text></PressableCard>
    );
    fireEvent.press(getByLabelText('카드'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=PressableCard`
Expected: FAIL

- [ ] **Step 3: Implement PressableCard**

Create `apps/frontend/components/ui/PressableCard.tsx`:

```tsx
import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { cn } from '../../utils/cn';

interface PressableCardProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  className,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => { scale.value = withSpring(0.98); onPressIn?.(e); }}
      onPressOut={(e) => { scale.value = withSpring(1); onPressOut?.(e); }}
      style={animatedStyle}
      className={cn('rounded-card-lg bg-surface shadow-card dark:bg-dark-card', className)}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
    >
      {children}
    </AnimatedPressable>
  );
};

PressableCard.displayName = 'PressableCard';
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `cd apps/frontend && npm test -- --testPathPattern=PressableCard`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/ui/PressableCard.tsx apps/frontend/__tests__/components/ui/PressableCard.test.tsx
git commit -m "feat(ui): add PressableCard with scale-down feedback"
```

### Task B6: QuickActionCard

**Files:**
- Create: `apps/frontend/components/ui/QuickActionCard.tsx`
- Create: `apps/frontend/__tests__/components/ui/QuickActionCard.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/QuickActionCard.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionCard } from '../../../components/ui/QuickActionCard';

describe('QuickActionCard', () => {
  it('renders icon + label', () => {
    const { getByText } = render(
      <QuickActionCard icon={<Text>🎲</Text>} label="번호 추첨" tone="green" onPress={jest.fn()} />
    );
    expect(getByText('🎲')).toBeTruthy();
    expect(getByText('번호 추첨')).toBeTruthy();
  });

  it('fires onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <QuickActionCard icon={<Text>🎲</Text>} label="번호 추첨" tone="green" onPress={onPress} />
    );
    fireEvent.press(getByLabelText('번호 추첨'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=QuickActionCard`
Expected: FAIL

- [ ] **Step 3: Implement QuickActionCard**

Create `apps/frontend/components/ui/QuickActionCard.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableCard } from './PressableCard';
import { AppText } from './AppText';

type Tone = 'green' | 'blue' | 'orange' | 'purple';

interface QuickActionCardProps {
  icon: React.ReactNode;
  label: string;
  tone: Tone;
  onPress: () => void;
}

const TONE_GRADIENTS: Record<Tone, [string, string]> = {
  green:  ['rgba(76,175,80,0.16)',  'rgba(76,175,80,0.04)'],
  blue:   ['rgba(33,150,243,0.16)', 'rgba(33,150,243,0.04)'],
  orange: ['rgba(255,152,0,0.16)',  'rgba(255,152,0,0.04)'],
  purple: ['rgba(156,39,176,0.16)', 'rgba(156,39,176,0.04)'],
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  label,
  tone,
  onPress,
}) => (
  <PressableCard
    onPress={onPress}
    accessibilityLabel={label}
    className="flex-1 items-center py-3.5 px-2"
  >
    <LinearGradient
      colors={TONE_GRADIENTS[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
    >
      {icon}
    </LinearGradient>
    <AppText variant="label" className="text-text-primary dark:text-dark-text text-center">
      {label}
    </AppText>
  </PressableCard>
);

QuickActionCard.displayName = 'QuickActionCard';
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `cd apps/frontend && npm test -- --testPathPattern=QuickActionCard`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/ui/QuickActionCard.tsx apps/frontend/__tests__/components/ui/QuickActionCard.test.tsx
git commit -m "feat(ui): add QuickActionCard component"
```

### Task B7: AppBar (3 variants)

**Files:**
- Create: `apps/frontend/components/ui/AppBar/index.tsx`
- Create: `apps/frontend/components/ui/AppBar/AppBarHome.tsx`
- Create: `apps/frontend/components/ui/AppBar/AppBarScreen.tsx`
- Create: `apps/frontend/components/ui/AppBar/AppBarModal.tsx`
- Create: `apps/frontend/__tests__/components/ui/AppBar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/AppBar.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppBar } from '../../../components/ui/AppBar';

describe('AppBar', () => {
  it('home variant renders Clover Wallet brand', () => {
    const { getByText } = render(<AppBar variant="home" hasUnread={false} onBellPress={jest.fn()} />);
    expect(getByText('Clover Wallet')).toBeTruthy();
  });

  it('home variant fires onBellPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<AppBar variant="home" hasUnread onBellPress={onPress} />);
    fireEvent.press(getByLabelText('알림'));
    expect(onPress).toHaveBeenCalled();
  });

  it('screen variant renders title and back button', () => {
    const onBack = jest.fn();
    const { getByText, getByLabelText } = render(
      <AppBar variant="screen" title="번호 생성" onBackPress={onBack} />
    );
    expect(getByText('번호 생성')).toBeTruthy();
    fireEvent.press(getByLabelText('뒤로 가기'));
    expect(onBack).toHaveBeenCalled();
  });

  it('modal variant renders title and close button', () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <AppBar variant="modal" title="글 작성" onClosePress={onClose} />
    );
    expect(getByText('글 작성')).toBeTruthy();
    fireEvent.press(getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=AppBar`
Expected: FAIL

- [ ] **Step 3: Implement AppBarHome**

Create `apps/frontend/components/ui/AppBar/AppBarHome.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Clover } from 'lucide-react-native';
import { AppText } from '../AppText';

export interface AppBarHomeProps {
  hasUnread?: boolean;
  onBellPress: () => void;
}

export const AppBarHome: React.FC<AppBarHomeProps> = ({ hasUnread = false, onBellPress }) => (
  <View className="flex-row justify-between items-center px-5 h-14 bg-transparent">
    <View className="flex-row items-center">
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}
      >
        <Clover size={16} color="white" fill="white" />
      </LinearGradient>
      <AppText variant="title-lg" className="ml-2 text-text-primary dark:text-dark-text">
        Clover Wallet
      </AppText>
    </View>
    <TouchableOpacity
      onPress={onBellPress}
      accessibilityLabel="알림"
      accessibilityRole="button"
      activeOpacity={0.7}
      className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04]"
    >
      <Bell size={18} color="#0F1115" />
      {hasUnread ? (
        <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error border-2 border-surface-muted" />
      ) : null}
    </TouchableOpacity>
  </View>
);
```

- [ ] **Step 4: Implement AppBarScreen**

Create `apps/frontend/components/ui/AppBar/AppBarScreen.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from '../AppText';

export interface AppBarScreenProps {
  title: string;
  onBackPress: () => void;
  trailing?: React.ReactNode;
}

export const AppBarScreen: React.FC<AppBarScreenProps> = ({ title, onBackPress, trailing }) => (
  <View className="flex-row items-center px-2 h-14 bg-transparent">
    <TouchableOpacity
      onPress={onBackPress}
      accessibilityLabel="뒤로 가기"
      accessibilityRole="button"
      activeOpacity={0.7}
      className="w-10 h-10 items-center justify-center"
    >
      <ChevronLeft size={24} color="#0F1115" />
    </TouchableOpacity>
    <View className="flex-1 items-center">
      <AppText variant="title" className="text-text-primary dark:text-dark-text">
        {title}
      </AppText>
    </View>
    <View className="w-10 h-10 items-center justify-center">{trailing ?? null}</View>
  </View>
);
```

- [ ] **Step 5: Implement AppBarModal**

Create `apps/frontend/components/ui/AppBar/AppBarModal.tsx`:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { AppText } from '../AppText';

export interface AppBarModalProps {
  title: string;
  onClosePress: () => void;
  trailing?: React.ReactNode;
}

export const AppBarModal: React.FC<AppBarModalProps> = ({ title, onClosePress, trailing }) => (
  <View className="flex-row items-center px-2 h-14 bg-transparent">
    <TouchableOpacity
      onPress={onClosePress}
      accessibilityLabel="닫기"
      accessibilityRole="button"
      activeOpacity={0.7}
      className="w-10 h-10 items-center justify-center"
    >
      <X size={22} color="#0F1115" />
    </TouchableOpacity>
    <View className="flex-1 items-center">
      <AppText variant="title" className="text-text-primary dark:text-dark-text">
        {title}
      </AppText>
    </View>
    <View className="w-10 h-10 items-center justify-center">{trailing ?? null}</View>
  </View>
);
```

- [ ] **Step 6: Implement AppBar dispatcher**

Create `apps/frontend/components/ui/AppBar/index.tsx`:

```tsx
import React from 'react';
import { AppBarHome, AppBarHomeProps } from './AppBarHome';
import { AppBarScreen, AppBarScreenProps } from './AppBarScreen';
import { AppBarModal, AppBarModalProps } from './AppBarModal';

export type AppBarProps =
  | ({ variant: 'home' } & AppBarHomeProps)
  | ({ variant: 'screen' } & AppBarScreenProps)
  | ({ variant: 'modal' } & AppBarModalProps);

export const AppBar: React.FC<AppBarProps> = (props) => {
  if (props.variant === 'home') {
    const { variant: _v, ...rest } = props;
    return <AppBarHome {...rest} />;
  }
  if (props.variant === 'screen') {
    const { variant: _v, ...rest } = props;
    return <AppBarScreen {...rest} />;
  }
  const { variant: _v, ...rest } = props;
  return <AppBarModal {...rest} />;
};

AppBar.displayName = 'AppBar';
```

- [ ] **Step 7: Run tests + commit**

Run: `cd apps/frontend && npm test -- --testPathPattern=AppBar`
Expected: PASS (4 tests)

```bash
git add apps/frontend/components/ui/AppBar apps/frontend/__tests__/components/ui/AppBar.test.tsx
git commit -m "feat(ui): add AppBar with home/screen/modal variants"
```

---

## Phase C — Home reference application

### Task C1: Refresh HeroSection

**Files:**
- Modify: `apps/frontend/components/home/HeroSection.tsx`
- Create: `apps/frontend/components/home/HeroTime.tsx`

- [ ] **Step 1: Extract HeroTime sub-component**

Create `apps/frontend/components/home/HeroTime.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { AppText } from '../ui/AppText';

interface HeroTimeProps {
  days: number;
  hours: number;
  minutes: number;
}

const Segment = ({ value, unit }: { value: number; unit: string }) => (
  <View className="flex-row items-baseline">
    <AppText variant="display" className="text-white">{value}</AppText>
    <AppText variant="body-lg" className="text-white/80 ml-1 mr-2">{unit}</AppText>
  </View>
);

export const HeroTime: React.FC<HeroTimeProps> = ({ days, hours, minutes }) => (
  <View className="flex-row items-baseline mt-1">
    <Segment value={days} unit="일" />
    <Segment value={hours} unit="시간" />
    <Segment value={minutes} unit="분" />
  </View>
);
```

- [ ] **Step 2: Replace HeroSection**

Replace `apps/frontend/components/home/HeroSection.tsx` content with:

```tsx
import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode } from 'lucide-react-native';
import { AppText } from '../ui/AppText';
import { LuckyHeroIllustration } from '../ui/LuckyHeroIllustration';
import { HeroTime } from './HeroTime';

export interface DrawInfo {
  currentRound: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
}

export interface HeroSectionProps {
  drawInfo: DrawInfo;
  onGenerate: () => void;
  onScan?: () => void;
}

const HeroSectionComponent = ({ drawInfo, onGenerate, onScan }: HeroSectionProps) => (
  <LinearGradient
    colors={['#4CAF50', '#388E3C', '#2E7D32']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      borderRadius: 28,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 26,
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.45,
      shadowRadius: 28,
      elevation: 8,
      width: '100%',
      overflow: 'hidden',
    }}
  >
    <LuckyHeroIllustration />
    <View className="flex-row justify-between items-center" style={{ zIndex: 1 }}>
      <AppText variant="eyebrow" className="text-white/75 uppercase">NEXT DRAW</AppText>
      <View className="px-2.5 py-1 rounded-pill bg-white/15 border border-white/25">
        <AppText variant="label" className="text-white">제 {drawInfo.currentRound} 회</AppText>
      </View>
    </View>
    <AppText variant="caption" className="text-white/85 mt-7" style={{ zIndex: 1 }}>당첨 발표까지</AppText>
    <HeroTime days={drawInfo.daysLeft} hours={drawInfo.hoursLeft} minutes={drawInfo.minutesLeft} />
    <View className="flex-row gap-2 mt-5" style={{ zIndex: 1 }}>
      <TouchableOpacity
        onPress={onGenerate}
        activeOpacity={0.7}
        accessibilityLabel="번호 생성하기"
        accessibilityRole="button"
        testID="btn-generate"
        className="flex-1 bg-white py-3.5 rounded-lg items-center"
        style={{ shadowColor: '#0F1115', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 }}
      >
        <AppText variant="body-lg" className="text-primary-text">번호 생성하기</AppText>
      </TouchableOpacity>
      {onScan ? (
        <TouchableOpacity
          onPress={onScan}
          activeOpacity={0.7}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          className="w-12 rounded-lg items-center justify-center bg-white/18 border border-white/25"
        >
          <QrCode size={18} color="white" />
        </TouchableOpacity>
      ) : null}
    </View>
  </LinearGradient>
);

export const HeroSection = memo(HeroSectionComponent);
```

- [ ] **Step 3: Update HeroSection test if needed**

Run: `cd apps/frontend && npm test -- --testPathPattern=HeroSection`
If existing test fails on text node match (e.g. expects "3일 14시간" as one string), update assertion to look for `'3'`, `'일'`, etc. separately. If no existing test, skip.

- [ ] **Step 4: Run typecheck + tests**

```
cd /Users/joel/Desktop/git/clover-wallet && npm run typecheck
cd apps/frontend && npm test
```
Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/components/home/HeroSection.tsx apps/frontend/components/home/HeroTime.tsx
git commit -m "feat(home): refresh HeroSection with token-based design"
```

### Task C2: Refresh QuickActions (5 → 4)

**Files:**
- Modify: `apps/frontend/components/home/QuickActions.tsx`

- [ ] **Step 1: Replace QuickActions**

Replace `apps/frontend/components/home/QuickActions.tsx` content with:

```tsx
import React, { memo } from 'react';
import { View } from 'react-native';
import { Dices, QrCode, BarChart3, MapPin } from 'lucide-react-native';
import { QuickActionCard } from '../ui/QuickActionCard';
import { SectionHead } from '../ui/SectionHead';

export interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

const QuickActionsComponent = ({ onNavigate }: QuickActionsProps) => (
  <>
    <SectionHead title="빠른 실행" />
    <View className="flex-row gap-2">
      <QuickActionCard
        icon={<Dices size={20} color="#6A1B9A" />}
        label="번호 추첨"
        tone="purple"
        onPress={() => onNavigate('/number-generation')}
      />
      <QuickActionCard
        icon={<QrCode size={20} color="#1565C0" />}
        label="QR 스캔"
        tone="blue"
        onPress={() => onNavigate('/scan')}
      />
      <QuickActionCard
        icon={<BarChart3 size={20} color="#E65100" />}
        label="번호 분석"
        tone="orange"
        onPress={() => onNavigate('/statistics')}
      />
      <QuickActionCard
        icon={<MapPin size={20} color="#2E7D32" />}
        label="로또 명당"
        tone="green"
        onPress={() => onNavigate('/(tabs)/map')}
      />
    </View>
  </>
);

export const QuickActions = memo(QuickActionsComponent);
```

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npm test -- --testPathPattern=QuickActions`
Expected: existing tests for QuickActions may fail (5 → 4). Update test to expect 4 cards. If no existing test, skip.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/components/home/QuickActions.tsx
git commit -m "feat(home): replace QuickActions with QuickActionCard 4-grid"
```

### Task C3: Apply AppBar + ScreenContainer + EmptyState to home

**Files:**
- Modify: `apps/frontend/app/(tabs)/index.tsx`

- [ ] **Step 1: Replace home screen**

Replace `apps/frontend/app/(tabs)/index.tsx` content with:

```tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HeroSection } from '../../components/home/HeroSection';
import { QuickActions } from '../../components/home/QuickActions';
import { AppBar } from '../../components/ui/AppBar';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHead } from '../../components/ui/SectionHead';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { apiClient } from '../../api/client';

const HomeScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const { data: drawInfo } = useQuery({
    queryKey: ['nextDraw'],
    queryFn: () => apiClient.get('lotto/next-draw').json<{
      currentRound: number;
      nextDrawDate: string;
      daysLeft: number;
      hoursLeft: number;
      minutesLeft: number;
      estimatedJackpot: string;
    }>(),
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['nextDraw'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScreenContainer>
      <AppBar variant="home" hasUnread={unreadCount > 0} onBellPress={() => router.push('/notifications')} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
      >
        <HeroSection
          drawInfo={{
            currentRound: drawInfo?.currentRound ?? 0,
            daysLeft: drawInfo?.daysLeft ?? 0,
            hoursLeft: drawInfo?.hoursLeft ?? 0,
            minutesLeft: drawInfo?.minutesLeft ?? 0,
          }}
          onGenerate={() => router.push('/number-generation')}
          onScan={() => router.push('/scan')}
        />
        <QuickActions onNavigate={(path) => router.push(path as any)} />
        <SectionHead title="최근 구매" linkText="전체 보기" onLinkPress={() => router.push('/(tabs)/history')} />
        <View className="bg-surface dark:bg-dark-card rounded-card-lg shadow-card border border-border-hairline px-5 py-6">
          <EmptyState
            icon={<Receipt size={24} color="#2E7D32" />}
            title="아직 구매한 로또가 없어요"
            description="번호를 생성하거나 영수증을 스캔하면 여기에 모아 볼 수 있어요"
            cta={{ label: '번호 생성하기', onPress: () => router.push('/number-generation') }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default HomeScreen;
```

- [ ] **Step 2: Run tests + typecheck**

```
cd /Users/joel/Desktop/git/clover-wallet && npm run typecheck
cd apps/frontend && npm test
```
Expected: all pass

- [ ] **Step 3: Manual smoke (web only quick check)**

Run: `cd apps/frontend && npx expo export --platform web --clear`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/app/\(tabs\)/index.tsx
git commit -m "feat(home): apply AppBar/ScreenContainer/EmptyState (reference screen)"
```

---

## Phase D — Refresh existing shared components

### Task D1: PrimaryButton (token application)

**Files:**
- Modify: `apps/frontend/components/ui/PrimaryButton.tsx`

- [ ] **Step 1: Replace PrimaryButton**

Replace `apps/frontend/components/ui/PrimaryButton.tsx` content with:

```tsx
import React from 'react';
import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { AppText } from './AppText';
import { cn } from '../../utils/cn';

interface PrimaryButtonProps extends PressableProps {
  label: string;
  isLoading?: boolean;
  className?: string;
  textClassName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PrimaryButton = ({
  label,
  isLoading = false,
  className,
  textClassName,
  disabled,
  ...props
}: PrimaryButtonProps) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={isLoading || disabled}
      className={cn('rounded-lg overflow-hidden shadow-button', className)}
      style={animatedStyle}
      accessible
      accessibilityLabel={isLoading ? `${label} 처리 중` : label}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(isLoading || disabled), busy: isLoading }}
      {...props}
    >
      <LinearGradient
        colors={disabled ? ['#E0E0E0', '#BDBDBD'] : ['#4CAF50', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="py-4 px-6 items-center justify-center flex-row"
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <AppText variant="body-lg" className={cn('text-white', textClassName)}>
            {label}
          </AppText>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};
```

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npm test -- --testPathPattern=PrimaryButton`
Expected: PASS. If a test asserts the className had `rounded-xl`, update it to `rounded-lg`.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/components/ui/PrimaryButton.tsx
git commit -m "refactor(ui): apply tokens to PrimaryButton (radius/shadow/typo)"
```

### Task D2: Refresh card-style components (HistoryItem, WinningHistoryItem, PostCard, CommentItem, SpotListItem, MyPageMenuItem)

**Files:**
- Modify (one at a time, separate commits): `apps/frontend/components/ui/HistoryItem.tsx`, `WinningHistoryItem.tsx`, `PostCard.tsx`, `CommentItem.tsx`, `SpotListItem.tsx`, `MyPageMenuItem.tsx`

- [ ] **Step 1: For each file in the list above, perform this transformation**

Open the file and apply these find-and-replace operations:

**A. Replace inline `fontFamily: 'NotoSansKR_…'` Text usages with `<AppText variant="…">`**

Add import at top:
```ts
import { AppText } from './AppText';
```

For each `<Text style={{ fontFamily: 'NotoSansKR_700Bold' }} ...>` → `<AppText variant="title" ...>` (drop the inline style fontFamily; map weights: 400→body, 500→body, 700→title, 900→display).

Drop the inline `fontFamily` portion and keep other style props.

**B. Replace inline shadow style block with `shadow-card` className**

Find any block like:
```tsx
shadowColor: '#000',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.05,
shadowRadius: 10,
elevation: 2,
```
Remove it. Add `shadow-card` to the wrapping `className`.

**C. Replace inline hex colors in className/style with token classes**

| Inline | Token class |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-[#F5F7FA]` | `bg-surface-muted` |
| `text-[#1A1A1A]` | `text-text-primary` |
| `text-[#757575]` / `text-[#9E9E9E]` / `text-[#BDBDBD]` | `text-text-muted` |
| `text-[#4CAF50]` | `text-primary` |
| `border-gray-100` | `border-border-hairline` |
| `rounded-[24px]` / `rounded-3xl` | `rounded-card-lg` |
| `rounded-[20px]` / `rounded-2xl` | `rounded-card` |
| `rounded-[16px]` / `rounded-xl` | `rounded-lg` |

**D. Run the file's existing test**

For each file `<Name>.tsx`, run: `cd apps/frontend && npm test -- --testPathPattern=<Name>`. Expected: PASS. If a test breaks because text was assertion-checked via style match, update the assertion to use `getByText` only (the variant style is fine because the text content is unchanged).

**E. Commit per file**

After each file passes:

```bash
git add apps/frontend/components/ui/<Name>.tsx apps/frontend/__tests__/components/ui/<Name>.test.tsx
git commit -m "refactor(ui): apply tokens to <Name>"
```

- [ ] **Step 2: Verify suite**

Run: `cd apps/frontend && npm test`
Expected: all pass

### Task D3: Refresh GenerationResultCard / GenerationResultCards

**Files:**
- Modify: `apps/frontend/components/generation/GenerationResultCard.tsx`
- Modify: `apps/frontend/components/generation/GenerationResultCards.tsx`

- [ ] **Step 1: Apply the same A/B/C transformation from Task D2** to both files (`fontFamily` → AppText, inline shadow → `shadow-card`, inline hex → token classes).

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npm test -- --testPathPattern=GenerationResult`
Expected: all pass (or update test text-style assertions if they break).

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/components/generation/GenerationResultCard.tsx apps/frontend/components/generation/GenerationResultCards.tsx
git commit -m "refactor(generation): apply tokens to result cards"
```

### Task D4: PostNumbersPreview component (for create-post BallRow visualization)

**Files:**
- Create: `apps/frontend/components/ui/PostNumbersPreview.tsx`
- Create: `apps/frontend/__tests__/components/ui/PostNumbersPreview.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/frontend/__tests__/components/ui/PostNumbersPreview.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { PostNumbersPreview } from '../../../components/ui/PostNumbersPreview';

describe('PostNumbersPreview', () => {
  it('renders all ball numbers across multiple games', () => {
    const games = [
      { numbers: [1, 2, 3, 4, 5, 6] },
      { numbers: [7, 8, 9, 10, 11, 12] },
    ];
    const { getByText } = render(<PostNumbersPreview games={games} method="사주팔자" />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
    expect(getByText('사주팔자 방식으로 생성')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd apps/frontend && npm test -- --testPathPattern=PostNumbersPreview`
Expected: FAIL

- [ ] **Step 3: Implement**

Create `apps/frontend/components/ui/PostNumbersPreview.tsx`:

```tsx
import React from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';
import { BallRow } from './BallRow';

interface PostNumbersPreviewProps {
  games: { numbers: number[] }[];
  method?: string;
}

export const PostNumbersPreview: React.FC<PostNumbersPreviewProps> = ({ games, method }) => (
  <View className="bg-surface dark:bg-dark-card rounded-card-lg p-4 border border-border-hairline shadow-card mb-4">
    <AppText variant="caption" className="text-text-muted mb-3">
      추천 번호 ({games.length}게임)
    </AppText>
    <View className="gap-2">
      {games.map((g, i) => (
        <View key={i} className="flex-row items-center">
          {games.length > 1 ? (
            <AppText variant="label" className="text-text-muted w-6">{String.fromCharCode(65 + i)}</AppText>
          ) : null}
          <View className="flex-1">
            <BallRow numbers={g.numbers} />
          </View>
        </View>
      ))}
    </View>
    {method ? (
      <AppText variant="caption" className="text-text-muted mt-3">
        {method} 방식으로 생성
      </AppText>
    ) : null}
  </View>
);

PostNumbersPreview.displayName = 'PostNumbersPreview';
```

- [ ] **Step 4: Run test + commit**

Run: `cd apps/frontend && npm test -- --testPathPattern=PostNumbersPreview`
Expected: PASS

```bash
git add apps/frontend/components/ui/PostNumbersPreview.tsx apps/frontend/__tests__/components/ui/PostNumbersPreview.test.tsx
git commit -m "feat(ui): add PostNumbersPreview component for create-post"
```

---

## Phase E — Carry-forward to remaining 9 screens

For every screen task in this phase, the engineer must:

1. Replace `<SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">` with `<ScreenContainer>`
2. Replace inline header rows with `<AppBar variant="..." />`
3. Replace `<Text style={{ fontFamily: 'NotoSansKR_…' }}>` with `<AppText variant="…">`
4. Replace inline hex/className mappings per the Task D2 table
5. Replace inline shadow blocks with `shadow-card` / `shadow-elev` / `shadow-button`
6. Run tests for the file: `cd apps/frontend && npm test -- --testPathPattern=<screen-name>`
7. Update tests if text-style assertions break
8. Commit per screen

### Task E1: Number generation screen

**Files:**
- Modify: `apps/frontend/app/number-generation.tsx`

- [ ] **Step 1: Apply all 8 steps from the Phase E header**

Specific to this file:
- Replace `Stack.Screen` `headerLeft` ChevronLeft with `<AppBar variant="screen" title="행운의 번호 추첨" onBackPress={() => router.back()} />` (drop `Stack.Screen options` for header — render AppBar inside `ScreenContainer` instead, and set `Stack.Screen options={{ headerShown: false }}`)
- Replace the "Tip Section" amber styling: `bg-amber-50 dark:bg-dark-card rounded-2xl p-4 border border-amber-100` → `bg-surface dark:bg-dark-card rounded-card p-4 border border-border-hairline`
- Wrap the `<Sparkles>` icon color from `#D84315` → `#E65100` (qa-orange token)

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test -- --testPathPattern=number-generation
git add apps/frontend/app/number-generation.tsx
git commit -m "feat(generation): apply UX polish tokens to number-generation screen"
```

### Task E2: History screen

**Files:**
- Modify: `apps/frontend/app/(tabs)/history.tsx`

- [ ] **Step 1: Apply all 8 steps from the Phase E header**

Specific to this file:
- Replace `<View className="flex-row justify-between items-center px-5 py-4 ...">` header with `<AppBar variant="home" hasUnread={false} onBellPress={() => router.push('/scan')} />`. Wait — this header has a QR scan icon, not bell. Use a more appropriate variant: render `<AppBar variant="home" />`-like layout custom, OR add a `trailing` prop pattern. Quick fix: render the title row inline using `<View className="flex-row justify-between items-center px-5 h-14">` containing `<AppText variant="title-lg">내 로또 내역</AppText>` and a `TouchableOpacity` with `<QrCode>`.
- Replace the `ListEmptyComponent` block with:

```tsx
ListEmptyComponent={
  <View className="px-5">
    <EmptyState
      icon={<Plus size={24} color="#2E7D32" />}
      title="저장된 로또 내역이 없습니다"
      description="번호를 생성하고 저장해보세요"
      cta={{ label: '번호 생성하기', onPress: () => router.push('/number-generation') }}
    />
  </View>
}
```

- Add the EmptyState import at the top.
- Remove the unused `LinearGradient` import if no other usage remains.

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test -- --testPathPattern=history
git add apps/frontend/app/\(tabs\)/history.tsx
git commit -m "feat(history): apply UX polish tokens + EmptyState"
```

### Task E3: MyPage screen

**Files:**
- Modify: `apps/frontend/app/(tabs)/mypage.tsx`
- Modify (if needed): `apps/frontend/components/mypage/BadgeSection.tsx`, `MenuSection.tsx`, `ThemeSelector.tsx`

- [ ] **Step 1: Apply all 8 steps from the Phase E header to mypage.tsx**

Specific:
- Profile card: keep avatar gradient. Replace inline shadow block with `shadow-card`.
- Stats divider `1px bg-gray-200` → `bg-border-hairline`.
- Title "마이페이지" — keep inline as `<AppText variant="title-lg">` inside `ScreenContainer` (no AppBar — this is a tab root with custom title above scrollable content).

- [ ] **Step 2: Apply Phase E header steps to BadgeSection, MenuSection, ThemeSelector** (the 3 sub-components)

For each, apply Task D2's A/B/C transformation. Run tests after each.

- [ ] **Step 3: Run + commit**

```
cd apps/frontend && npm test -- --testPathPattern=mypage
git add apps/frontend/app/\(tabs\)/mypage.tsx apps/frontend/components/mypage/
git commit -m "feat(mypage): apply UX polish tokens"
```

### Task E4: Community screen

**Files:**
- Modify: `apps/frontend/app/(tabs)/community.tsx`

- [ ] **Step 1: Apply all 8 steps from the Phase E header**

Read the current file first to identify the header area + feed list. Replace SafeAreaView with ScreenContainer. Add an EmptyState for empty feed (if applicable — check existing logic).

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test -- --testPathPattern=community
git add apps/frontend/app/\(tabs\)/community.tsx
git commit -m "feat(community): apply UX polish tokens"
```

### Task E5: Create-post screen (rewrite — combines content + structure changes)

**Files:**
- Modify: `apps/frontend/app/create-post.tsx`

- [ ] **Step 1: Replace create-post.tsx content**

Replace `apps/frontend/app/create-post.tsx` with:

```tsx
import React, { useState, useMemo } from 'react';
import { ScrollView, Alert, View } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppBar } from '../components/ui/AppBar';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Input } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PostNumbersPreview } from '../components/ui/PostNumbersPreview';
import { communityApi } from '../api/community';
import { Logger } from '../utils/logger';

interface PrefillNumbers {
  games: { numbers: number[] }[];
  method?: string;
}

const parsePrefill = (raw?: string): PrefillNumbers | null => {
  if (!raw) return null;
  // expected format: "추천 번호 (Ngame):\n<game lines>\n\n<method> 방식으로 생성했습니다!"
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const gameLines = lines.filter(l => /^[A-Z]?:?\s*\d/.test(l) || /^\d/.test(l));
  const methodLine = lines.find(l => l.includes('방식으로'));
  const games = gameLines.map(line => {
    const numStr = line.replace(/^[A-Z]:\s*/, '');
    const numbers = numStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return { numbers };
  }).filter(g => g.numbers.length === 6);
  if (games.length === 0) return null;
  const method = methodLine?.replace('방식으로 생성했습니다!', '').trim();
  return { games, method };
};

const CreatePostScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { prefillTitle, prefillContent } = useLocalSearchParams<{ prefillTitle?: string; prefillContent?: string }>();
  const [title, setTitle] = useState(prefillTitle ?? '');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const prefillNumbers = useMemo(() => parsePrefill(prefillContent), [prefillContent]);

  const handleSubmit = async () => {
    if (!title.trim() || (!content.trim() && !prefillNumbers)) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const finalContent = prefillNumbers
        ? `${prefillContent}${content.trim() ? `\n\n${content.trim()}` : ''}`
        : content.trim();
      await communityApi.createPost(title.trim(), finalContent);
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      router.back();
    } catch (error) {
      Alert.alert('오류', '게시물 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      Logger.error('CreatePost', '게시물 등록 중 오류가 발생했습니다.', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar variant="modal" title="글 작성" onClosePress={() => router.back()} />
      <ScrollView className="flex-1 px-5 pt-3" keyboardShouldPersistTaps="handled">
        <Input
          placeholder="제목"
          value={title}
          onChangeText={setTitle}
          className="border-0 border-b border-border-hairline px-0 text-title-lg font-extrabold mb-4"
        />
        {prefillNumbers ? (
          <PostNumbersPreview games={prefillNumbers.games} method={prefillNumbers.method} />
        ) : null}
        <Input
          placeholder="내 이야기를 써보세요"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="border-0 px-0 h-40"
        />
      </ScrollView>
      <View className="px-5 pb-5 pt-3 border-t border-border-hairline">
        <PrimaryButton label="게시하기" onPress={handleSubmit} isLoading={isLoading} />
      </View>
    </ScreenContainer>
  );
};

export default CreatePostScreen;
```

- [ ] **Step 2: Run typecheck + tests**

```
cd /Users/joel/Desktop/git/clover-wallet && npm run typecheck
cd apps/frontend && npm test
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/app/create-post.tsx
git commit -m "feat(create-post): KO header, single submit, BallRow preview, polish"
```

### Task E6: Map screen

**Files:**
- Modify: `apps/frontend/app/(tabs)/map.tsx`
- Modify: `apps/frontend/components/ui/MapCalloutContent.tsx`
- Modify: `apps/frontend/components/ui/CustomMapView.tsx` / `.web.tsx` (only callout-related styling)

- [ ] **Step 1: Read current file and identify the header + FAB + callout structure**

- [ ] **Step 2: Apply Phase E header steps to the map screen wrapper**

Replace SafeAreaView with ScreenContainer. Replace inline header (if any) with AppBar variant. Apply token mappings.

- [ ] **Step 3: Apply Task D2's A/B/C transformation to MapCalloutContent**

- [ ] **Step 4: Run + commit**

```
cd apps/frontend && npm test
git add apps/frontend/app/\(tabs\)/map.tsx apps/frontend/components/ui/MapCalloutContent.tsx apps/frontend/components/ui/CustomMapView.tsx apps/frontend/components/ui/CustomMapView.web.tsx
git commit -m "feat(map): apply UX polish tokens"
```

### Task E7: Scan screen

**Files:**
- Modify: `apps/frontend/app/scan.tsx`
- Modify: `apps/frontend/components/scan/ScanOverlay.tsx`
- Modify: `apps/frontend/components/scan/ScanResultView.tsx`

- [ ] **Step 1: Apply Phase E header steps to scan.tsx**

Use `AppBar variant="screen" title="QR 스캔"` if there's a screen header.

- [ ] **Step 2: Apply Task D2's A/B/C transformation to ScanOverlay and ScanResultView**

In ScanOverlay, replace any guide-frame inline color with `border-primary`.

- [ ] **Step 3: Run + commit**

```
cd apps/frontend && npm test
git add apps/frontend/app/scan.tsx apps/frontend/components/scan/
git commit -m "feat(scan): apply UX polish tokens"
```

### Task E8: Statistics screen

**Files:**
- Modify: `apps/frontend/app/statistics.tsx`

- [ ] **Step 1: Apply Phase E header steps**

Use `AppBar variant="screen" title="번호 분석"`. Replace charts/numeric emphasis text with `<AppText variant="display">` for big numbers and `<AppText variant="title-lg">` for section titles.

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test
git add apps/frontend/app/statistics.tsx
git commit -m "feat(statistics): apply UX polish tokens"
```

### Task E9: Notifications screen

**Files:**
- Modify: `apps/frontend/app/notifications.tsx`

- [ ] **Step 1: Apply Phase E header steps**

Use `AppBar variant="screen" title="알림"`. Add EmptyState for empty notification list.

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test
git add apps/frontend/app/notifications.tsx
git commit -m "feat(notifications): apply UX polish tokens + EmptyState"
```

### Task E10: Login screen

**Files:**
- Modify: `apps/frontend/app/login.tsx`

- [ ] **Step 1: Replace login.tsx**

Replace inline `<Text className="text-white text-3xl font-black tracking-widest">Clover Wallet</Text>` with `<AppText variant="display" className="text-white">Clover Wallet</AppText>`.

Replace inline `<Text className="text-white/90 text-sm mt-2 mb-12">행운을 관리하는 스마트한 습관</Text>` with `<AppText variant="caption" className="text-white/90 mt-2 mb-12">행운을 관리하는 스마트한 습관</AppText>`.

Replace inline button `<Text className="text-[#1A1A1A] dark:text-dark-text text-base font-bold">Google 계정으로 계속하기</Text>` with `<AppText variant="body-lg" className="text-text-primary dark:text-dark-text">Google 계정으로 계속하기</AppText>`.

Add `shadow-button` to the Google button className.

- [ ] **Step 2: Run + commit**

```
cd apps/frontend && npm test
git add apps/frontend/app/login.tsx
git commit -m "feat(login): apply UX polish tokens"
```

---

## Phase F — Final polish

### Task F1: Add expo-haptics + 1차 액션 트리거

**Files:**
- Modify: `apps/frontend/package.json` (verify `expo-haptics` listed; if not, install)
- Modify: `apps/frontend/app/number-generation.tsx`, `apps/frontend/app/create-post.tsx`, and the result-card save flow

- [ ] **Step 1: Verify expo-haptics installed**

Run: `cd apps/frontend && node -e "require('expo-haptics')"`
If error: `cd apps/frontend && npx expo install expo-haptics`

- [ ] **Step 2: Add haptic to number generation primary CTA**

In `apps/frontend/app/number-generation.tsx`, at top:
```ts
import * as Haptics from 'expo-haptics';
```

In `runGenerate`:
```ts
const runGenerate = (methodId: string, count: GameCount, param?: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ...existing logic
};
```

In `handleSave`:
```ts
const handleSave = () => {
  if (generatedGames.length === 0) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  // ...existing logic
};
```

- [ ] **Step 3: Add haptic to create-post submit**

In `apps/frontend/app/create-post.tsx`'s `handleSubmit`:
```ts
import * as Haptics from 'expo-haptics';
// ...inside handleSubmit, before await communityApi.createPost(...):
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

- [ ] **Step 4: Wrap web with no-op**

`expo-haptics` is web-no-op already, but verify:
Run: `cd apps/frontend && npx expo export --platform web --clear`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/app/number-generation.tsx apps/frontend/app/create-post.tsx apps/frontend/package.json apps/frontend/package-lock.json
git commit -m "feat(motion): add haptic feedback to primary actions"
```

### Task F2: Lint rule for inline hex (advisory)

**Files:**
- Modify: `apps/frontend/.eslintrc.js` (or wherever ESLint config lives)

- [ ] **Step 1: Find lint config**

Run: `ls /Users/joel/Desktop/git/clover-wallet/apps/frontend/.eslintrc* /Users/joel/Desktop/git/clover-wallet/apps/frontend/eslint.config.*`

- [ ] **Step 2: Add advisory rule**

Add a `no-restricted-syntax` rule that flags `Literal[value=/^#[0-9A-Fa-f]{3,8}$/]` outside `tailwind.config.js`. Example for flat config:

```js
{
  files: ['**/*.{ts,tsx}'],
  ignores: ['tailwind.config.js'],
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector: "Literal[value=/^#[0-9A-Fa-f]{3,8}$/]",
        message: 'Use a Tailwind token instead of an inline hex color.',
      },
    ],
  },
}
```

If the project still uses `.eslintrc.js`, adapt the syntax accordingly. The rule is `warn`, not `error`, so existing tests don't break the lint job.

- [ ] **Step 3: Run lint**

Run: `cd apps/frontend && npm run lint`
Expected: warnings only (no new errors). Address any remaining inline hex callouts in the codebase.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/.eslintrc.js apps/frontend/eslint.config.* 2>/dev/null
git commit -m "chore(lint): warn on inline hex literals (use tokens)"
```

### Task F3: Manual smoke + mockup snapshot doc

**Files:**
- Create: `docs/superpowers/notes/2026-05-09-ux-polish-mockup-comparison.md`

- [ ] **Step 1: Run dev:local and walk every screen**

```bash
cd /Users/joel/Desktop/git/clover-wallet
npm run dev:local
```

For each of the 10 screens (홈 / 번호 생성 / 히스토리 / 마이페이지 / 커뮤니티 / 글 작성 / 지도 / 스캔 / 통계 / 알림 / 로그인):
- Verify rendering on web (the dev:local output)
- Verify light mode + dark mode (toggle from mypage)
- Verify empty state (when applicable: history with no records, notifications empty)
- Verify primary CTA fires haptic on native (skip on web)

- [ ] **Step 2: Capture before/after screenshots**

Take 1 screenshot of the polished version for each of the 10 screens. Save to `docs/superpowers/notes/screenshots/2026-05-09/`.

- [ ] **Step 3: Write comparison doc**

Create `docs/superpowers/notes/2026-05-09-ux-polish-mockup-comparison.md` with one line per screen + screenshot reference + brief delta note (3 lines max per screen).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/notes/
git commit -m "docs(ux-polish): manual smoke + mockup comparison snapshots"
```

### Task F4: Final verification + PR prep

- [ ] **Step 1: Run the full pipeline**

```bash
cd /Users/joel/Desktop/git/clover-wallet
npm run typecheck
cd apps/frontend && npm test && npm run lint && npx expo export --platform web --clear
```
Expected: typecheck passes, all 297+ tests pass, lint emits warnings only, web export succeeds.

- [ ] **Step 2: Push branch**

```bash
cd /Users/joel/Desktop/git/clover-wallet
git push -u origin feat/ux-polish-pass
```

- [ ] **Step 3: Open PR (DO NOT MERGE without manual review)**

```bash
gh pr create --title "feat: UX polish pass — design tokens + 10 screens" --body "$(cat <<'EOF'
## Summary
- Tokenized color/typography/spacing/radius/shadow in `tailwind.config.js`
- Added 6 new shared components: AppText, ScreenContainer, SectionHead, EmptyState, PressableCard, QuickActionCard, AppBar (3 variants)
- Refreshed 7 existing components: PrimaryButton, HistoryItem, WinningHistoryItem, PostCard, CommentItem, SpotListItem, MyPageMenuItem, GenerationResultCard(s)
- Applied tokens to 10 screens
- Migrated to `react-native-safe-area-context`
- Added haptic feedback to primary CTAs

## Test plan
- [ ] All frontend tests pass
- [ ] Web export succeeds
- [ ] Manual smoke on 10 screens (light + dark + empty states)
- [ ] No regressions on 297 existing tests
- [ ] Visual comparison in `docs/superpowers/notes/2026-05-09-ux-polish-mockup-comparison.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review Notes

This plan covers every spec section:

- **Tokens** → A1, A2, A3
- **6 new components** → B1–B7
- **Home reference** → C1–C3
- **7 component refreshes** → D1–D4 (D2 batches 6 similar components per CLAUDE.md A/B/C transform)
- **Carry-forward 9 screens** → E1–E10
- **Empty/loading/error patterns** → embedded in E2 (history), E9 (notifications), C3 (home)
- **Motion + haptics** → F1
- **Lint rule** → F2
- **Manual smoke + verification** → F3–F4

Type-naming consistency:
- `AppText` variants: display / title-lg / title / body-lg / body / caption / label / eyebrow — used consistently across all tasks
- `AppBar` variants: home / screen / modal — used consistently
- `EmptyState` cta shape: `{ label: string; onPress: () => void }` — consistent everywhere
- `QuickActionCard` tone: green / blue / orange / purple — matches token colors
