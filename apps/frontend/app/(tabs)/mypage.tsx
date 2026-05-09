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
  const roiColor = stats?.roi != null && stats.roi < 0 ? '#FF5252' : '#4CAF50';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View className="px-5 pt-8 pb-6">
          <AppText variant="title-lg" className="text-text-primary mb-6">마이페이지</AppText>
          <View className="bg-white rounded-[24px] p-6 shadow-card">
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mr-4">
                <AppText variant="title" className="text-primary-text">{avatarLetter}</AppText>
              </View>
              <View>
                <AppText variant="title-lg" className="text-text-primary">{displayName}</AppText>
                <AppText variant="body" className="text-text-muted">{displayEmail}</AppText>
              </View>
            </View>
            <View className="flex-row justify-between bg-surface-muted rounded-2xl p-4">
              <View className="items-center flex-1">
                <AppText variant="caption" className="text-text-muted mb-1">총 당첨금</AppText>
                <AppText variant="title" className="text-text-primary">{winningsDisplay}</AppText>
              </View>
              <View className="w-[1px] bg-border-hairline" />
              <View className="items-center flex-1">
                <AppText variant="caption" className="text-text-muted mb-1">수익률</AppText>
                <AppText variant="title" style={{ color: roiColor }}>{roiDisplay}</AppText>
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
