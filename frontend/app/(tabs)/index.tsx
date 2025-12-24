import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Dices, 
  QrCode, 
  BarChart3, 
  MapPin, 
  Navigation, 
  Bell, 
  ChevronRight,
  Clover
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [drawInfo] = useState({
    currentRound: 1103,
    daysLeft: 3,
    hoursLeft: 4,
    minutesLeft: 20
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* AppBar Style Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent">
        <View className="flex-row items-center">
          <Clover size={28} color="#4CAF50" fill="#4CAF50" />
          <Text className="ml-2 text-xl font-extrabold text-[#1A1A1A]">Clover Wallet</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notification')}>
          <Bell size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#4CAF50" />}
      >
        {/* Next Draw Info Card - Hero Section with Real Gradient */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}
        >
          <View className="items-center">
            <View className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
              <Text className="text-white font-bold">제 {drawInfo.currentRound} 회</Text>
            </View>
            
            <Text className="text-white/70 text-base mt-6 font-semibold">당첨 발표까지</Text>
            
            <Text 
              className="text-white text-[42px] font-[900] tracking-tighter mt-2"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.26)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4
              }}
            >
              {drawInfo.daysLeft}일 {drawInfo.hoursLeft}시간 {drawInfo.minutesLeft}분
            </Text>

            <TouchableOpacity 
              onPress={() => router.push('/number-generation')}
              activeOpacity={0.9}
              className="bg-white px-12 py-4 rounded-full mt-8 shadow-xl"
              style={{ elevation: 8 }}
            >
              <Text className="text-[#4CAF50] text-lg font-black">번호 생성하기</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions Section */}
        <Text className="text-lg font-bold text-[#1A1A1A] mt-8 mb-4">빠른 실행</Text>
        <View className="flex-row justify-between">
          <QuickActionItem 
            icon={<Dices size={32} color="#9C27B0" />} 
            label="번호 추첨" 
            bgColor="bg-[#9C27B0]/10" 
            onPress={() => router.push('/number-generation')} 
          />
          <QuickActionItem 
            icon={<QrCode size={32} color="#2196F3" />} 
            label="QR 스캔" 
            bgColor="bg-[#2196F3]/10" 
            onPress={() => router.push('/scan')} 
          />
          <QuickActionItem 
            icon={<BarChart3 size={32} color="#FF9800" />} 
            label="번호 분석" 
            bgColor="bg-[#FF9800]/10" 
            onPress={() => router.push('/statistics')} 
          />
          <QuickActionItem 
            icon={<Navigation size={32} color="#00BCD4" />} 
            label="여행 플랜" 
            bgColor="bg-[#00BCD4]/10" 
            onPress={() => router.push('/travel')} 
          />
          <QuickActionItem 
            icon={<MapPin size={32} color="#4CAF50" />} 
            label="로또 명당" 
            bgColor="bg-[#4CAF50]/10" 
            onPress={() => router.push('/map')} 
          />
        </View>

        {/* Recent History Preview */}
        <Text className="text-lg font-bold text-[#1A1A1A] mt-8 mb-4">최근 당첨 결과</Text>
        <TouchableOpacity onPress={() => router.push('/history')}>
          <GlassCard className="flex-row items-center p-6">
            <View className="bg-gray-100 p-3 rounded-2xl mr-5">
              <View className="opacity-40">
                <Clover size={24} color="#757575" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-[#1A1A1A]">최근 구매 내역</Text>
              <Text className="text-sm text-gray-500 mt-1">아직 구매한 로또가 없습니다.</Text>
            </View>
            <ChevronRight size={20} color="#BDBDBD" />
          </GlassCard>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function QuickActionItem({ 
  icon, 
  label, 
  bgColor, 
  onPress 
}: { 
  icon: React.ReactNode, 
  label: string, 
  bgColor: string, 
  onPress: () => void 
}) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center">
      <View className={`${bgColor} p-4 rounded-[20px]`}>
        {icon}
      </View>
      <Text className="text-[13px] font-semibold text-[#1A1A1A] mt-2">{label}</Text>
    </TouchableOpacity>
  );
}