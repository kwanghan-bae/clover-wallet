import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from 'react-native';
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
  { id: '1', label: '첫 당첨', icon: <Trophy size={20} color="#FFC107" />, color: 'bg-amber-50' },
  { id: '2', label: '열정', icon: <Flame size={20} color="#FF5252" />, color: 'bg-red-50' },
  { id: '3', label: '인증됨', icon: <CheckCircle2 size={20} color="#2196F3" />, color: 'bg-blue-50' },
  { id: '4', label: 'VIP', icon: <Star size={20} color="#9C27B0" />, color: 'bg-purple-50' },
];

export default function MyPageScreen() {
  const router = useRouter();

  const user = {
    name: '클로버님',
    email: 'clover@example.com'
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
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
                <Text className="text-[#4CAF50] text-xl font-bold">C</Text>
              </View>
              <View>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A]">{user.name}</Text>
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-sm">{user.email}</Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4">
              <View className="items-center flex-1">
                <Text className="text-[#BDBDBD] text-xs mb-1">총 당첨금</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A]">1,250,000원</Text>
              </View>
              <View className="w-[1px] bg-gray-200" />
              <View className="items-center flex-1">
                <Text className="text-[#BDBDBD] text-xs mb-1">수익률</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50]">+15.4%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View className="px-5 mb-8">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">내 뱃지</Text>
          <View className="flex-row justify-between">
            {MOCK_BADGES.map(badge => (
              <View key={badge.id} className="items-center">
                <View className={`${badge.color} w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                  {badge.icon}
                </View>
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-xs text-[#757575]">{badge.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu List */}
        <View className="px-5">
          <View className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-50">
            <MenuItem icon={<Settings size={20} color="#1A1A1A" />} label="계정 설정" />
            <MenuDivider />
            <MenuItem icon={<Bell size={20} color="#1A1A1A" />} label="알림 설정" />
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
      <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className={`flex-1 text-base ${isDestructive ? 'text-red-400' : 'text-[#1A1A1A]'}`}>
        {label}
      </Text>
      <ChevronRight size={18} color="#E0E0E0" />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View className="h-[1px] bg-gray-100 mx-5" />;
}