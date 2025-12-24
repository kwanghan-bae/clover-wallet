import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
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
    <View className="flex-1 bg-primary">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <Text className="text-xl font-bold text-white">마이페이지</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Profile Card */}
          <GlassCard className="flex-row items-center p-6" opacity={0.15}>
            <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center border-2 border-white/50">
              <Text className="text-white text-2xl font-bold">C</Text>
            </View>
            <View className="ml-5 flex-1">
              <Text className="text-white text-xl font-bold">{user.name}</Text>
              <Text className="text-white/70 text-sm mt-1">{user.email}</Text>
            </View>
          </GlassCard>

          {/* Badges Section */}
          <Text className="text-white text-lg font-bold mt-8 mb-4">나의 뱃지</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
            {MOCK_BADGES.map((badge) => (
              <GlassCard key={badge.id} className="w-[100px] items-center p-4 mr-4" opacity={0.15}>
                <View className={`${badge.color} p-3 rounded-full mb-3 shadow-sm`}>
                  {badge.icon}
                </View>
                <Text className="text-white text-xs font-semibold">{badge.label}</Text>
              </GlassCard>
            ))}
          </ScrollView>

          {/* Stats Section */}
          <Text className="text-white text-lg font-bold mt-8 mb-4">당첨 통계</Text>
          <View className="flex-row gap-4">
            <GlassCard className="flex-1 p-5" opacity={0.15}>
              <Text className="text-white/70 text-xs mb-2">총 당첨금</Text>
              <Text className="text-[#4CAF50] text-xl font-black">
                ₩ {stats.totalWinnings.toLocaleString()}
              </Text>
            </GlassCard>
            <GlassCard className="flex-1 p-5" opacity={0.15}>
              <Text className="text-white/70 text-xs mb-2">수익률</Text>
              <Text className={`${stats.roi >= 0 ? 'text-[#4CAF50]' : 'text-red-400'} text-xl font-black`}>
                {stats.roi >= 0 ? '+' : ''}{stats.roi}%
              </Text>
            </GlassCard>
          </View>

          {/* Menu Section */}
          <View className="mt-10 mb-10 overflow-hidden">
            <GlassCard className="p-0" opacity={0.15}>
              <MenuItem icon={<Bell size={20} color="white" />} label="알림 설정" onPress={() => {}} />
              <MenuDivider />
              <MenuItem icon={<ShieldCheck size={20} color="white" />} label="개인정보 처리방침" onPress={() => router.push('/privacy-policy')} />
              <MenuDivider />
              <MenuItem icon={<Info size={20} color="white" />} label="앱 정보" />
              <MenuDivider />
              <MenuItem icon={<LogOut size={20} color="white" />} label="로그아웃" onPress={() => Alert.alert("로그아웃", "정말로 로그아웃 하시겠습니까?")} />
              <MenuDivider />
              <MenuItem 
                icon={<UserX size={20} color="#FF5252" />} 
                label="회원 탈퇴" 
                isDestructive 
                onPress={() => Alert.alert("회원 탈퇴", "모든 데이터가 삭제되며 복구할 수 없습니다.")} 
              />
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
      className="flex-row items-center p-5 active:bg-white/5"
    >
      <View className="mr-4 opacity-70">
        {icon}
      </View>
      <Text className={`flex-1 text-base ${isDestructive ? 'text-red-400' : 'text-white'}`}>
        {label}
      </Text>
      <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
    </TouchableOpacity>
  );
}

function MenuDivider() {
  return <View className="h-[1px] bg-white/10 mx-5" />;
}
