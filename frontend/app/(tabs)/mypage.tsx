import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users';
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
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Header */}
        <View className="px-5 pt-8 pb-6">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-2xl text-[#1A1A1A] mb-6">마이페이지</Text>
          <View
            className="bg-white rounded-[24px] p-6"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2 }}
          >
            <View className="flex-row items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-[#4CAF50]/10 items-center justify-center mr-4">
                <Text className="text-[#4CAF50] text-xl font-bold">{avatarLetter}</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A]">{displayName}</Text>
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-sm">{displayEmail}</Text>
              </View>
            </View>
            <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4">
              <View className="items-center flex-1">
                <Text className="text-[#BDBDBD] text-xs mb-1">총 당첨금</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A]">{winningsDisplay}</Text>
              </View>
              <View className="w-[1px] bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-[#BDBDBD] text-xs mb-1">수익률</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold', color: roiColor }}>{roiDisplay}</Text>
              </View>
            </View>
          </View>
        </View>

        <BadgeSection badgeKeys={profile?.badges ?? ''} />
        <ThemeSelector themePreference={themePreference} onSelect={setThemePreference} />
        <MenuSection
          unreadCount={unreadCount}
          onNavigateNotifications={() => router.push('/notifications')}
          onNavigatePrivacy={() => router.push('/privacy-policy')}
          onLogout={logout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen;
