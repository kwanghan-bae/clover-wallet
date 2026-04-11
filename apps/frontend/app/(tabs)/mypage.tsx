import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity
} from 'react-native';
import {
  Settings,
  Trophy,
  Bell,
  ShieldCheck,
  Info,
  LogOut,
  UserX,
  Star,
  Flame,
  CheckCircle2,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MyPageMenuItem, MyPageMenuDivider } from '../../components/ui/MyPageMenuItem';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme, ThemePreference } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { usersApi } from '../../api/users';

/** @description 뱃지 키에 따른 아이콘/색상 매핑 */
const BADGE_CONFIG: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
  first_win: { label: '첫 당첨', icon: <Trophy size={20} color="#FFC107" />, color: 'bg-amber-50' },
  passion: { label: '열정', icon: <Flame size={20} color="#FF5252" />, color: 'bg-red-50' },
  verified: { label: '인증됨', icon: <CheckCircle2 size={20} color="#2196F3" />, color: 'bg-blue-50' },
  vip: { label: 'VIP', icon: <Star size={20} color="#9C27B0" />, color: 'bg-purple-50' },
};

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

  const badges = profile?.badges
    ? profile.badges.split(',').map(key => key.trim()).filter(Boolean)
    : [];

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="px-5 pt-8 pb-6">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-2xl text-[#1A1A1A] mb-6">마이페이지</Text>
          <View
            className="bg-white rounded-[24px] p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2
            }}
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

        {/* Badges */}
        {badges.length > 0 && (
          <View className="px-5 mb-8">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">내 뱃지</Text>
            <View className="flex-row flex-wrap gap-4">
              {badges.map(key => {
                const config = BADGE_CONFIG[key];
                if (!config) return null;
                return (
                  <View key={key} className="items-center">
                    <View className={`${config.color} w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                      {config.icon}
                    </View>
                    <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-xs text-[#757575]">{config.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Theme Settings */}
        <View className="px-5 mb-6">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text mb-4">테마 설정</Text>
          <View
            className="bg-white dark:bg-dark-card rounded-[24px] p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2
            }}
          >
            <View className="flex-row justify-between">
              {([
                { key: 'system' as ThemePreference, label: '시스템', icon: <Smartphone size={18} color={themePreference === 'system' ? '#fff' : '#757575'} /> },
                { key: 'light' as ThemePreference, label: '라이트', icon: <Sun size={18} color={themePreference === 'light' ? '#fff' : '#757575'} /> },
                { key: 'dark' as ThemePreference, label: '다크', icon: <Moon size={18} color={themePreference === 'dark' ? '#fff' : '#757575'} /> },
              ]).map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setThemePreference(key)}
                  className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl mx-1 ${themePreference === key ? 'bg-primary' : 'bg-gray-100 dark:bg-dark-surface'}`}
                  style={{ gap: 6 }}
                  accessibilityRole="radio"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: themePreference === key }}
                >
                  {icon}
                  <Text
                    style={{ fontFamily: 'NotoSansKR_500Medium' }}
                    className={`text-sm ${themePreference === key ? 'text-white' : 'text-[#757575] dark:text-dark-text-secondary'}`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Menu List */}
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
              onPress={() => Alert.alert(
                "로그아웃",
                "정말로 로그아웃 하시겠습니까?",
                [
                  { text: "취소", style: "cancel" },
                  { text: "로그아웃", style: "destructive", onPress: logout },
                ]
              )}
            />
            <MyPageMenuDivider />
            <MyPageMenuItem
              icon={<UserX size={20} color="#FF5252" />}
              label="회원 탈퇴"
              isDestructive
              onPress={() => Alert.alert("회원 탈퇴", "모든 데이터가 삭제되며 복구할 수 없습니다.")}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyPageScreen;