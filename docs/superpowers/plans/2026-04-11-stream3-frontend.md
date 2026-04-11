# Stream 3: Frontend Modernization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프론트엔드의 150줄 초과 파일을 컴포넌트 추출로 분리하고, TDD로 테스트 커버리지 80%+를 달성하며, @clover/shared 타입을 적용

**Architecture:** 화면 파일(app/)은 레이아웃 + 조합만 담당하고, 실제 UI는 components/ 하위의 feature 폴더로 분리. API 타입을 @clover/shared로 전환.

**Tech Stack:** React Native, Expo SDK 54, Jest 30, @testing-library/react-native, TypeScript

**Pre-requisite:** Stream 1 (Infrastructure) 완료 상태에서 시작. `apps/frontend/` 경로 기준.

---

## Task 1: mypage.tsx 분리 — BadgeSection + ThemeSelector + MenuSection 추출

**Files:**
- Create: `apps/frontend/components/mypage/BadgeSection.tsx`
- Create: `apps/frontend/components/mypage/ThemeSelector.tsx`
- Create: `apps/frontend/components/mypage/MenuSection.tsx`
- Create: `apps/frontend/__tests__/components/mypage/BadgeSection.test.tsx`
- Create: `apps/frontend/__tests__/components/mypage/ThemeSelector.test.tsx`
- Create: `apps/frontend/__tests__/components/mypage/MenuSection.test.tsx`
- Modify: `apps/frontend/app/(tabs)/mypage.tsx`

- [ ] **Step 1: BadgeSection 테스트 작성 (Red)**

`apps/frontend/__tests__/components/mypage/BadgeSection.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { BadgeSection } from '../../../components/mypage/BadgeSection';

describe('BadgeSection', () => {
  it('should render nothing when badges is empty', () => {
    const { toJSON } = render(<BadgeSection badges={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('should render badge items for known badges', () => {
    render(<BadgeSection badges={['first_win', 'passion']} />);
    expect(screen.getByText('첫 당첨')).toBeTruthy();
    expect(screen.getByText('열정')).toBeTruthy();
  });

  it('should skip unknown badge keys', () => {
    const { toJSON } = render(<BadgeSection badges={['unknown_badge']} />);
    expect(toJSON()).toBeNull();
  });
});
```

- [ ] **Step 2: BadgeSection 구현**

`apps/frontend/components/mypage/BadgeSection.tsx`:

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Trophy, Flame, CheckCircle2, Star } from 'lucide-react-native';

const BADGE_CONFIG: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
  first_win: { label: '첫 당첨', icon: <Trophy size={20} color="#FFC107" />, color: 'bg-amber-50' },
  passion: { label: '열정', icon: <Flame size={20} color="#FF5252" />, color: 'bg-red-50' },
  verified: { label: '인증됨', icon: <CheckCircle2 size={20} color="#2196F3" />, color: 'bg-blue-50' },
  vip: { label: 'VIP', icon: <Star size={20} color="#9C27B0" />, color: 'bg-purple-50' },
};

interface BadgeSectionProps {
  badges: string[];
}

export const BadgeSection = ({ badges }: BadgeSectionProps) => {
  const validBadges = badges.filter((key) => BADGE_CONFIG[key]);
  if (validBadges.length === 0) return null;

  return (
    <View className="px-5 mb-8">
      <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">
        내 뱃지
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {validBadges.map((key) => {
          const config = BADGE_CONFIG[key];
          return (
            <View key={key} className="items-center">
              <View className={`${config.color} w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                {config.icon}
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-xs text-[#757575]">
                {config.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
```

- [ ] **Step 3: ThemeSelector 테스트 + 구현**

`apps/frontend/__tests__/components/mypage/ThemeSelector.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeSelector } from '../../../components/mypage/ThemeSelector';

describe('ThemeSelector', () => {
  it('should highlight selected theme', () => {
    render(<ThemeSelector current="dark" onChange={jest.fn()} />);
    const darkBtn = screen.getByLabelText('다크');
    expect(darkBtn.props.accessibilityState.selected).toBe(true);
  });

  it('should call onChange when pressing a theme', () => {
    const onChange = jest.fn();
    render(<ThemeSelector current="system" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('라이트'));
    expect(onChange).toHaveBeenCalledWith('light');
  });
});
```

`apps/frontend/components/mypage/ThemeSelector.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Smartphone, Sun, Moon } from 'lucide-react-native';
import type { ThemePreference } from '../../hooks/useTheme';

interface ThemeSelectorProps {
  current: ThemePreference;
  onChange: (pref: ThemePreference) => void;
}

const THEMES: { key: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { key: 'system', label: '시스템', Icon: Smartphone },
  { key: 'light', label: '라이트', Icon: Sun },
  { key: 'dark', label: '다크', Icon: Moon },
];

export const ThemeSelector = ({ current, onChange }: ThemeSelectorProps) => (
  <View className="px-5 mb-6">
    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text mb-4">
      테마 설정
    </Text>
    <View
      className="bg-white dark:bg-dark-card rounded-[24px] p-4"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 }}
    >
      <View className="flex-row justify-between">
        {THEMES.map(({ key, label, Icon }) => (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl mx-1 ${current === key ? 'bg-primary' : 'bg-gray-100 dark:bg-dark-surface'}`}
            style={{ gap: 6 }}
            accessibilityRole="radio"
            accessibilityLabel={label}
            accessibilityState={{ selected: current === key }}
          >
            <Icon size={18} color={current === key ? '#fff' : '#757575'} />
            <Text
              style={{ fontFamily: 'NotoSansKR_500Medium' }}
              className={`text-sm ${current === key ? 'text-white' : 'text-[#757575] dark:text-dark-text-secondary'}`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </View>
);
```

- [ ] **Step 4: MenuSection 테스트 + 구현**

`apps/frontend/__tests__/components/mypage/MenuSection.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MenuSection } from '../../../components/mypage/MenuSection';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('MenuSection', () => {
  it('should render all menu items', () => {
    render(<MenuSection unreadCount={3} onLogout={jest.fn()} />);
    expect(screen.getByText('알림')).toBeTruthy();
    expect(screen.getByText('로그아웃')).toBeTruthy();
    expect(screen.getByText('회원 탈퇴')).toBeTruthy();
  });
});
```

`apps/frontend/components/mypage/MenuSection.tsx`:

```tsx
import React from 'react';
import { View, Alert } from 'react-native';
import { Settings, Bell, ShieldCheck, Info, LogOut, UserX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MyPageMenuItem, MyPageMenuDivider } from '../ui/MyPageMenuItem';

interface MenuSectionProps {
  unreadCount: number;
  onLogout: () => void;
}

export const MenuSection = ({ unreadCount, onLogout }: MenuSectionProps) => {
  const router = useRouter();

  return (
    <View className="px-5">
      <View className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-50">
        <MyPageMenuItem
          icon={<Bell size={20} color="#1A1A1A" />}
          label="알림"
          onPress={() => router.push('/notifications')}
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <MyPageMenuDivider />
        <MyPageMenuItem icon={<Settings size={20} color="#1A1A1A" />} label="계정 설정" />
        <MyPageMenuDivider />
        <MyPageMenuItem icon={<Bell size={20} color="#1A1A1A" />} label="알림 설정" />
        <MyPageMenuDivider />
        <MyPageMenuItem icon={<ShieldCheck size={20} color="#1A1A1A" />} label="개인정보 처리방침" onPress={() => router.push('/privacy-policy')} />
        <MyPageMenuDivider />
        <MyPageMenuItem icon={<Info size={20} color="#1A1A1A" />} label="앱 정보" />
        <MyPageMenuDivider />
        <MyPageMenuItem
          icon={<LogOut size={20} color="#1A1A1A" />}
          label="로그아웃"
          onPress={() =>
            Alert.alert('로그아웃', '정말로 로그아웃 하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              { text: '로그아웃', style: 'destructive', onPress: onLogout },
            ])
          }
        />
        <MyPageMenuDivider />
        <MyPageMenuItem
          icon={<UserX size={20} color="#FF5252" />}
          label="회원 탈퇴"
          isDestructive
          onPress={() => Alert.alert('회원 탈퇴', '모든 데이터가 삭제되며 복구할 수 없습니다.')}
        />
      </View>
    </View>
  );
};
```

- [ ] **Step 5: mypage.tsx를 조합 레이아웃으로 축소**

`apps/frontend/app/(tabs)/mypage.tsx`를 추출된 컴포넌트를 import하는 레이아웃으로 변경. 프로필 헤더 + BadgeSection + ThemeSelector + MenuSection 조합만 남김. 150줄 이하 달성.

- [ ] **Step 6: 테스트 실행**

Run: `cd apps/frontend && npm test -- --watchAll=false --no-coverage`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(frontend): mypage 3분할 (BadgeSection + ThemeSelector + MenuSection)"
```

---

## Task 2: index.tsx (홈) 분리 — HeroSection + QuickActions 추출

**Files:**
- Create: `apps/frontend/components/home/HeroSection.tsx`
- Create: `apps/frontend/components/home/QuickActions.tsx`
- Create: `apps/frontend/__tests__/components/home/HeroSection.test.tsx`
- Create: `apps/frontend/__tests__/components/home/QuickActions.test.tsx`
- Modify: `apps/frontend/app/(tabs)/index.tsx`

- [ ] **Step 1: HeroSection 테스트 + 구현**

HeroSection은 회차 정보와 카운트다운을 표시하는 그래디언트 영역. Props: `drawInfo`, `onGenerate`.

테스트: 회차 번호 표시 확인, 버튼 press 콜백 확인.

구현: 기존 index.tsx의 LinearGradient 블록 (58~134행) 추출.

- [ ] **Step 2: QuickActions 테스트 + 구현**

QuickActions는 5개 빠른 실행 버튼 그리드. Props: `onNavigate`.

테스트: 5개 버튼 렌더링 확인.

구현: 기존 index.tsx의 Quick Actions 블록 (136~171행) 추출.

- [ ] **Step 3: index.tsx를 조합 레이아웃으로 축소**

헤더 + HeroSection + QuickActions + 최근 당첨 결과 섹션. 150줄 이하.

- [ ] **Step 4: 테스트 실행 + Commit**

```bash
git add -A
git commit -m "refactor(frontend): 홈화면 분리 (HeroSection + QuickActions)"
```

---

## Task 3: scan.tsx 분리 — ScanOverlay + ScanResult 추출

**Files:**
- Create: `apps/frontend/components/scan/ScanOverlay.tsx`
- Create: `apps/frontend/components/scan/ScanResultView.tsx`
- Create: `apps/frontend/__tests__/components/scan/ScanOverlay.test.tsx`
- Create: `apps/frontend/__tests__/components/scan/ScanResultView.test.tsx`
- Modify: `apps/frontend/app/scan.tsx`

- [ ] **Step 1: ScanOverlay 테스트 + 구현**

ScanOverlay: 카메라 위 반투명 오버레이 + 코너 마커 + 안내 텍스트. Props: `scanMode`.

구현: 기존 scan.tsx의 overlay 영역 (57~78행) + styles (176~224행) 추출.

- [ ] **Step 2: ScanResultView 테스트 + 구현**

ScanResultView: 인식 결과 표시 카드 (번호, 회차, 확인/다시촬영 버튼). Props: `scanResult`, `onReset`, `onConfirm`.

구현: 기존 scan.tsx의 결과 영역 (138~163행) 추출.

- [ ] **Step 3: scan.tsx를 조합 레이아웃으로 축소. 150줄 이하.**

- [ ] **Step 4: 테스트 실행 + Commit**

```bash
git add -A
git commit -m "refactor(frontend): 스캔화면 분리 (ScanOverlay + ScanResultView)"
```

---

## Task 4: number-generation.tsx 분리

**Files:**
- Create: `apps/frontend/components/generation/MethodSelector.tsx`
- Create: `apps/frontend/components/generation/GenerationResult.tsx`
- Modify: `apps/frontend/app/number-generation.tsx`

- [ ] **Step 1: MethodSelector + GenerationResult 테스트 + 구현**

MethodSelector: 번호 생성 방법 선택 카드 그리드.
GenerationResult: 생성된 번호 표시 + 저장/공유 버튼.

- [ ] **Step 2: number-generation.tsx를 조합 레이아웃으로 축소. 150줄 이하.**

- [ ] **Step 3: 테스트 실행 + Commit**

```bash
git add -A
git commit -m "refactor(frontend): 번호생성 화면 분리 (MethodSelector + GenerationResult)"
```

---

## Task 5: community.tsx + PostCard.tsx 분리

**Files:**
- Create: `apps/frontend/components/community/FeedList.tsx`
- Create: `apps/frontend/components/community/FeedTabSelector.tsx`
- Create: `apps/frontend/components/ui/PostCardMenu.tsx`
- Modify: `apps/frontend/app/(tabs)/community.tsx`
- Modify: `apps/frontend/components/ui/PostCard.tsx`

- [ ] **Step 1: FeedTabSelector + FeedList 테스트 + 구현**

FeedTabSelector: 전체/팔로잉 탭 토글.
FeedList: FlashList 기반 게시글 목록 (PostCard 렌더링).

- [ ] **Step 2: PostCardMenu 추출**

PostCard에서 삭제 확인, 더보기 메뉴 로직을 PostCardMenu로 분리. PostCard가 150줄 이하.

- [ ] **Step 3: community.tsx를 조합 레이아웃으로 축소. 150줄 이하.**

- [ ] **Step 4: 테스트 실행 + Commit**

```bash
git add -A
git commit -m "refactor(frontend): 커뮤니티 화면 분리 (FeedTabSelector + FeedList + PostCardMenu)"
```

---

## Task 6: user/[id].tsx 분리

**Files:**
- Create: `apps/frontend/components/profile/ProfileHeader.tsx`
- Create: `apps/frontend/components/profile/ProfileStats.tsx`
- Modify: `apps/frontend/app/user/[id].tsx`

- [ ] **Step 1: ProfileHeader + ProfileStats 테스트 + 구현**

ProfileHeader: 아바타, 닉네임, 이메일, 팔로우 버튼.
ProfileStats: 팔로워/팔로잉 카운트.

- [ ] **Step 2: user/[id].tsx를 조합 레이아웃으로 축소. 150줄 이하.**

- [ ] **Step 3: 테스트 실행 + Commit**

```bash
git add -A
git commit -m "refactor(frontend): 유저 프로필 화면 분리 (ProfileHeader + ProfileStats)"
```

---

## Task 7: API 타입을 @clover/shared로 전환

**Files:**
- Modify: `apps/frontend/api/types/community.ts`
- Modify: `apps/frontend/api/types/lotto.ts`
- Modify: `apps/frontend/api/types/spots.ts`
- Modify: `apps/frontend/api/types/user.ts`
- Modify: `apps/frontend/api/community.ts` (및 기타 api/*.ts)

- [ ] **Step 1: api/types/* 에서 @clover/shared re-export로 전환**

각 타입 파일을 @clover/shared에서 re-export하도록 변경. 프론트 전용 타입만 로컬에 유지.

예시 `apps/frontend/api/types/community.ts`:

```typescript
export type { Post, Comment, CreatePostRequest } from '@clover/shared';
```

- [ ] **Step 2: 타입 체크 실행**

Run: `cd apps/frontend && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(frontend): API 타입을 @clover/shared로 전환"
```

---

## Task 8: 프론트엔드 테스트 커버리지 80%+ 달성

**Files:**
- jest.config.js 수정
- 누락된 테스트 추가

- [ ] **Step 1: 현재 커버리지 측정**

Run: `cd apps/frontend && npm test -- --watchAll=false --coverage`
Expected: 커버리지 리포트. 80% 미달 영역 확인.

- [ ] **Step 2: collectCoverageFrom 확장**

`apps/frontend/jest.config.js`의 `collectCoverageFrom`에 components 추가:

```javascript
collectCoverageFrom: [
  'utils/**/*.ts',
  'hooks/**/*.ts',
  'api/**/*.ts',
  'components/**/*.tsx',
],
```

- [ ] **Step 3: 미달 영역 테스트 보강**

80% 미달인 hooks, api, utils, components에 대해 테스트 추가.
특히: 새로 생성된 모든 feature 컴포넌트에 렌더링 테스트 확인.

- [ ] **Step 4: 커버리지 임계값 설정**

`apps/frontend/jest.config.js`에 추가:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

- [ ] **Step 5: 커버리지 확인**

Run: `cd apps/frontend && npm test -- --watchAll=false --coverage`
Expected: PASS (80%+)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test(frontend): 커버리지 80%+ 달성 + 임계값 CI 강제"
```

---

## Task 9: 최종 검증 — 모든 파일 150줄 이하

- [ ] **Step 1: 줄수 검사**

Run: `find apps/frontend -name "*.tsx" -not -path "*node_modules*" -not -name "*.test.*" | xargs wc -l | sort -rn | head -20`
Expected: 모든 파일 150줄 이하

- [ ] **Step 2: 전체 빌드 확인**

Run: `cd apps/frontend && npx expo export --platform web --no-minify`
Expected: 빌드 성공

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git commit -m "refactor(frontend): Stream 3 완료 — 모든 파일 ≤150줄, 커버리지 80%+"
```
