import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Clover, Bell, ChevronRight, Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { HeroSection } from '../../components/home/HeroSection';
import { QuickActions } from '../../components/home/QuickActions';

/**
 * @description 애플리케이션의 홈 화면 컴포넌트입니다.
 * 다음 회차 당첨 정보, 빠른 실행 메뉴, 최근 당첨 결과 등을 표시합니다.
 */
const HomeScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [drawInfo] = useState({
    currentRound: 1103,
    daysLeft: 3,
    hoursLeft: 4,
    minutesLeft: 20,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      {/* AppBar Style Header */}
      <View className="flex-row justify-between items-center px-5 h-14 bg-transparent" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clover size={24} color="#4CAF50" fill="#4CAF50" />
          <Text
            style={{ fontFamily: 'NotoSansKR_900Black' }}
            className="ml-2 text-xl text-[#1A1A1A] dark:text-dark-text tracking-tight"
          >
            Clover Wallet
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          accessibilityLabel="알림"
          accessibilityRole="button"
        >
          <Bell size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
      >
        <HeroSection drawInfo={drawInfo} onGenerate={() => router.push('/number-generation')} />
        <QuickActions onNavigate={(path) => router.push(path as any)} />

        {/* Recent History Preview */}
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text mt-8 mb-4">
          최근 당첨 결과
        </Text>
        <TouchableOpacity onPress={() => router.push('/history')} activeOpacity={0.8}>
          <View
            className="flex-row items-center p-6 bg-white dark:bg-dark-surface rounded-[24px]"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="bg-gray-100 p-3 rounded-2xl mr-5">
              <Receipt size={24} color="#9E9E9E" />
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-base text-[#1A1A1A] dark:text-dark-text">최근 구매 내역</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">아직 구매한 로또가 없습니다.</Text>
            </View>
            <ChevronRight size={24} color="#9E9E9E" />
          </View>
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
