import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Trophy,
  Bell,
  ShieldCheck,
  Info,
  LogOut,
  UserX,
  ChevronRight,
  Star,
  Flame,
  CheckCircle2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MOCK_BADGES = [
  { id: '1', label: '첫 당첨', icon: <Trophy size={24} color="#FFC107" />, color: 'bg-amber-100' },
  { id: '2', label: '열정', icon: <Flame size={24} color="#FF5252" />, color: 'bg-red-100' },
  { id: '3', label: '인증됨', icon: <CheckCircle2 size={24} color="#2196F3" />, color: 'bg-blue-100' },
  { id: '4', label: 'VIP', icon: <Star size={24} color="#9C27B0" />, color: 'bg-purple-100' },
];

export default function MyPageScreen() {
  const router = useRouter();
  const user = {
    name: '클로버님',
    email: 'clover@example.com'
  };

  const stats = {
    totalWinnings: 1250000,
    roi: 15.4
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Profile Section with Gradient Background */}
      <LinearGradient
        colors={['#4CAF50', '#388E3C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
      >
        <View className="px-5 py-8">
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border-2 border-white/50">
              <Text className="text-white text-2xl font-bold">C</Text>
            </View>
            <View className="ml-5 flex-1">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-xl">{user.name}</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-white/80 text-sm mt-1">{user.email}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Badges Section */}
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mt-6 mb-4">나의 뱃지</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
          {MOCK_BADGES.map((badge) => (
            <View
              key={badge.id}
              className="w-[100px] items-center p-4 mr-4 bg-white rounded-3xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3
              }}
            >
              <View className={`${badge.color} p - 3 rounded - full mb - 3`}>
                {badge.icon}
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="text-[#1A1A1A] text-xs">{badge.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Stats Section */}
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mt-8 mb-4">당첨 통계</Text>
        <View className="flex-row gap-4">
          <View
            className="flex-1 p-5 bg-white rounded-3xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3
            }}
          >
            <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#757575] text-xs mb-2">총 당첨금</Text>
            <Text style={{ fontFamily: 'NotoSansKR_900Black' }} className="text-[#4CAF50] text-xl">
              ₩ {stats.totalWinnings.toLocaleString()}
            </Text>
          </View>
          <View
            className="flex-1 p-5 bg-white rounded-3xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3
            }}
          >
            <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#757575] text-xs mb-2">수익률</Text>
            <Text style={{ fontFamily: 'NotoSansKR_900Black' }} className={`${stats.roi >= 0 ? 'text-[#4CAF50]' : 'text-red-400'} text - xl`}>
              {stats.roi >= 0 ? '+' : ''}{stats.roi}%
            </Text>
          </View>
        </View>

        {/* Menu Section */}
        <View className="mt-10 mb-10">
          <View
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 3
            }}
          >
            <MenuItem icon={<Bell size={20} color="#1A1A1A" />} label="알림 설정" onPress={() => { }} />
            <MenuDivider />
            <MenuItem icon={<ShieldCheck size={20} color="#1A1A1A" />} label="개인정보 처리방침" onPress={() => router.push('/privacy-policy')} />
            <MenuDivider />
            <MenuItem icon={<Info size={20} color="#1A1A1A" />} label="앱 정보" />
            <MenuDivider />
            <MenuItem icon={<LogOut size={20} color="#1A1A1A" />} label="로그아웃" onPress={() => Alert.alert("로그아웃", "정말로 로그아웃 하시겠습니까?")} />
            <MenuDivider />
            <MenuItem
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
}

function MenuItem({
  icon,
  label,
  onPress,
  isDestructive = false
}: {
  icon: React.ReactNode,
  label: string,
  onPress?: () => void,
  isDestructive?: boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-5 active:bg-gray-50"
    >
      <View className="mr-4">
        {icon}
      </View>
      <Text className={`flex - 1 text - base ${isDestructive ? 'text-red-400' : 'text-[#1A1A1A]'} `} style={{ fontFamily: 'NotoSansKR_500Medium' }}>
        {label}
      </Text>
      <ChevronRight size={18} color="#E0E0E0" />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View className="h-[1px] bg-gray-100 mx-5" />;
}
