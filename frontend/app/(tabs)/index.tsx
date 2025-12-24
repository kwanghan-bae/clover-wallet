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
import { LuckyHeroIllustration } from '../../components/ui/LuckyHeroIllustration';

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
      <View className="flex-row justify-between items-center px-5 h-14 bg-transparent">
        <View className="flex-row items-center">
          <Clover size={24} color="#4CAF50" fill="#4CAF50" />
          <Text
            style={{ fontFamily: 'NotoSansKR_900Black' }}
            className="ml-2 text-xl text-[#1A1A1A] tracking-tight"
          >
            Clover Wallet
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notification')}>
          <Bell size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#4CAF50" />}
      >
        {/* Next Draw Info Card - Premium Restoration */}
        <LinearGradient
          colors={['#4CAF50', '#388E3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            paddingHorizontal: 24,
            paddingVertical: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 10,
            overflow: 'hidden'
          }}
        >
          <LuckyHeroIllustration />

          <View className="items-start">
            <View
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              className="px-4 py-1.5 rounded-full border"
            >
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-xs">
                제 {drawInfo.currentRound} 회
              </Text>
            </View>

            <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="text-white/80 text-base mt-6">
              당첨 발표까지
            </Text>

            <Text
              style={{
                fontFamily: 'NotoSansKR_900Black',
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4
              }}
              className="text-white text-[40px] tracking-tighter mt-1"
            >
              {drawInfo.daysLeft}일 {drawInfo.hoursLeft}시간 {drawInfo.minutesLeft}분
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/number-generation')}
              activeOpacity={0.9}
              className="bg-white px-10 py-3.5 rounded-full mt-8 shadow-lg"
            >
              <Text style={{ fontFamily: 'NotoSansKR_900Black' }} className="text-[#4CAF50] text-base">
                번호 생성하기
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions - Exact Flutter Spacing */}
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mt-10 mb-5">
          빠른 실행
        </Text>
        <View className="flex-row justify-between">
          <QuickActionItem
            icon={<Dices size={30} color="#9C27B0" />}
            label="번호 추첨"
            bgColor="bg-[#9C27B0]/8"
            onPress={() => router.push('/number-generation')}
          />
          <QuickActionItem
            icon={<QrCode size={30} color="#2196F3" />}
            label="QR 스캔"
            bgColor="bg-[#2196F3]/8"
            onPress={() => router.push('/scan')}
          />
          <QuickActionItem
            icon={<BarChart3 size={30} color="#FF9800" />}
            label="번호 분석"
            bgColor="bg-[#FF9800]/8"
            onPress={() => router.push('/statistics')}
          />
          <QuickActionItem
            icon={<Navigation size={30} color="#00BCD4" />}
            label="여행 플랜"
            bgColor="bg-[#00BCD4]/8"
            onPress={() => router.push('/travel')}
          />
          <QuickActionItem
            icon={<MapPin size={30} color="#4CAF50" />}
            label="로또 명당"
            bgColor="bg-[#4CAF50]/8"
            onPress={() => router.push('/map')}
          />
        </View>

        {/* Recent History Preview */}
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mt-10 mb-5">
          최근 당첨 결과
        </Text>
        <TouchableOpacity onPress={() => router.push('/history')} activeOpacity={0.8}>
          <GlassCard className="flex-row items-center p-6">
            <View className="bg-gray-100/50 p-3.5 rounded-2xl mr-5">
              <Clover size={24} color="#BDBDBD" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-base text-[#1A1A1A]">최근 구매 내역</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-sm text-gray-400 mt-1">아직 구매한 로또가 없습니다.</Text>
            </View>
            <ChevronRight size={20} color="#E0E0E0" />
          </GlassCard>
        </TouchableOpacity>

        {/* Bottom Spacing for FAB */}
        <View className="h-24" />
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
    <TouchableOpacity onPress={onPress} className="items-center" activeOpacity={0.7}>
      <View
        className={`${bgColor} w-14 h-14 rounded-[20px] items-center justify-center`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className="text-[12px] text-[#424242] mt-2.5">{label}</Text>
    </TouchableOpacity>
  );
}