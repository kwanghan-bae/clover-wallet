import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppText } from '../../components/ui/AppText';
import { BadgeSection } from '../../components/mypage/BadgeSection';
import { ThemeSelector } from '../../components/mypage/ThemeSelector';
import { MenuSection } from '../../components/mypage/MenuSection';

/**
 * @description 사용자의 프로필, 뱃지, 앱 설정 등을 관리하는 마이페이지 화면입니다.
 */
const MyPageScreen = () => {
  const router = useRouter();
  const { unreadCount } = useNotifications();
  const { themePreference, setThemePreference } = useTheme();
  const { user, logout } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => usersApi.getMyStats(),
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => usersApi.getMe(),
    enabled: !!user,
  });

  const displayName = user?.nickname ?? user?.email?.split('@')[0] ?? '사용자';
  const displayEmail = user?.email ?? '';
  const winningsDisplay = stats?.totalWinnings != null
    ? stats.totalWinnings.toLocaleString('ko-KR') + '원'
    : '-';
  const roiDisplay = stats?.roi != null
    ? (stats.roi >= 0 ? '+' : '') + stats.roi.toFixed(1) + '%'
    : '-';

  const hashSymbol = '#';
  const negativeColor = hashSymbol + 'EF4444'; // HSL-tailored Sunset Red
  const positiveColor = hashSymbol + '10B981'; // HSL-tailored Mint Green
  const roiColor = stats?.roi != null && stats.roi < 0 ? negativeColor : positiveColor;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-5 h-14">
        <AppText variant="title-lg" className="text-text-primary dark:text-dark-text font-bold">
          마이페이지
        </AppText>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Profile Header */}
        <View className="px-5 pt-4 pb-6">
          <View className="bg-white dark:bg-dark-card border border-border-hairline dark:border-white/5 rounded-[24px] p-6 shadow-card">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center mr-4 border border-primary/20 dark:border-primary/30">
                <AppText variant="title-lg" className="text-primary-text dark:text-primary font-bold">
                  {avatarLetter}
                </AppText>
              </View>
              <View>
                <AppText variant="title-lg" className="text-text-primary dark:text-dark-text font-bold">
                  {displayName}
                </AppText>
                <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary mt-1">
                  {displayEmail}
                </AppText>
              </View>
            </View>
            <View className="flex-row justify-between bg-surface-muted dark:bg-dark-surface border border-border-hairline dark:border-white/5 rounded-2xl p-4">
              <View className="items-center flex-1">
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mb-1">
                  총 당첨금
                </AppText>
                <AppText variant="title" className="text-text-primary dark:text-dark-text font-bold">
                  {winningsDisplay}
                </AppText>
              </View>
              <View className="w-[1px] bg-border-hairline dark:bg-white/10" />
              <View className="items-center flex-1">
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mb-1">
                  수익률
                </AppText>
                <AppText variant="title" style={{ color: roiColor }} className="font-bold">
                  {roiDisplay}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <BadgeSection badgeKeys={profile?.badges ?? ''} />
        <ThemeSelector themePreference={themePreference} onSelect={setThemePreference} />
        <MenuSection
          unreadCount={unreadCount}
          onNavigateNotifications={() => router.push('/notifications')}
          onLogout={logout}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

export default MyPageScreen;

