import React, { useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HeroSection } from '../../components/home/HeroSection';
import { QuickActions } from '../../components/home/QuickActions';
import { AppBar } from '../../components/ui/AppBar';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { SectionHead } from '../../components/ui/SectionHead';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotifications } from '../../hooks/useNotifications';
import { apiClient } from '../../api/client';

const HomeScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { unreadCount } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const { data: drawInfo } = useQuery({
    queryKey: ['nextDraw'],
    queryFn: () => apiClient.get('lotto/next-draw').json<{
      currentRound: number;
      nextDrawDate: string;
      daysLeft: number;
      hoursLeft: number;
      minutesLeft: number;
      estimatedJackpot: string;
    }>(),
    staleTime: 5 * 60 * 1000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['nextDraw'] });
    setRefreshing(false);
  }, [queryClient]);

  return (
    <ScreenContainer>
      <AppBar variant="home" hasUnread={unreadCount > 0} onBellPress={() => router.push('/notifications')} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
      >
        <HeroSection
          drawInfo={{
            currentRound: drawInfo?.currentRound ?? 0,
            daysLeft: drawInfo?.daysLeft ?? 0,
            hoursLeft: drawInfo?.hoursLeft ?? 0,
            minutesLeft: drawInfo?.minutesLeft ?? 0,
          }}
          onGenerate={() => router.push('/number-generation')}
          onScan={() => router.push('/scan')}
        />
        <QuickActions onNavigate={(path) => router.push(path as any)} />
        <SectionHead title="최근 구매" linkText="전체 보기" onLinkPress={() => router.push('/(tabs)/history')} />
        <View className="bg-surface dark:bg-dark-card rounded-card-lg shadow-card border border-border-hairline px-5 py-6">
          <EmptyState
            icon={<Receipt size={24} color="#2E7D32" />}
            title="아직 구매한 로또가 없어요"
            description="번호를 생성하거나 영수증을 스캔하면 여기에 모아 볼 수 있어요"
            cta={{ label: '번호 생성하기', onPress: () => router.push('/number-generation') }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default HomeScreen;
