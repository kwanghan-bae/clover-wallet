import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useStatistics } from '../hooks/useStatistics';
import { TrendingUp, Hash, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppBar } from '../components/ui/AppBar';
import { AppText } from '../components/ui/AppText';
import { useTheme } from '../hooks/useTheme';
import { StatFrequencyBar } from '../components/ui/StatFrequencyBar';

export default function StatisticsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { stats, numberFrequency } = useStatistics();
  const formatCurrency = (n: number) => n.toLocaleString('ko-KR') + '원';
  const topNumbers = Object.entries(numberFrequency).sort(([, a], [, b]) => b - a).slice(0, 10);
  const isPositiveRoi = stats?.roi && stats.roi > 0;
  const isNegativeRoi = stats?.roi && stats.roi < 0;
  const roiGlowStyle = {
    shadowColor: isPositiveRoi
      ? (isDark ? '#' + '10B981' : '#' + '34D399')
      : isNegativeRoi
      ? (isDark ? '#' + 'EF4444' : '#' + 'F43F5E')
      : '#' + '000000',
    shadowOpacity: isPositiveRoi || isNegativeRoi ? 0.12 : 0.02,
  };
  const totalGamesColors: [string, string] = isDark
    ? ['#' + '022C22', '#' + '064E3B']
    : ['#' + 'ECFDF5', '#' + 'D1FAE5'];
  const statsCardBgColors: [string, string] = isDark
    ? ['#' + '1E293B', '#' + '0F172A']
    : ['#' + 'FFFFFF', '#' + 'F8FAFC'];
  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar variant="screen" title="번호 분석" onBackPress={() => router.back()} />
      <ScrollView className="flex-1" contentContainerStyle={styles.scrollPadding}>
        <View className="gap-5">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-white/70 dark:bg-[#1E293B]/70 border border-white/40 dark:border-white/10 rounded-2xl p-5 items-center" style={[styles.cardShadow, styles.gamesGlow]}>
              <LinearGradient colors={totalGamesColors} className="p-2.5 rounded-full mb-3">
                <Target size={20} color={isDark ? '#' + '34D399' : '#' + '059669'} />
              </LinearGradient>
              <AppText variant="display" className="text-text-primary dark:text-white text-3xl font-extrabold tracking-tight">
                {stats?.totalGames ?? 0}
              </AppText>
              <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary text-[11px] mt-1.5 font-semibold">
                총 게임수
              </AppText>
            </View>

            <View className="flex-1 bg-white/70 dark:bg-[#1E293B]/70 border border-white/40 dark:border-white/10 rounded-2xl p-5 items-center" style={[styles.cardShadow, roiGlowStyle]}>
              <LinearGradient
                colors={
                  isPositiveRoi 
                    ? (isDark ? ['#' + '064E3B', '#' + '022C22'] : ['#' + 'ECFDF5', '#' + 'D1FAE5'])
                    : isNegativeRoi
                    ? (isDark ? ['#' + '451A03', '#' + '78290F'] : ['#' + 'FFF1F2', '#' + 'FFE4E6'])
                    : (isDark ? ['#' + '334155', '#' + '1E293B'] : ['#' + 'F1F5F9', '#' + 'E2E8F0'])
                }
                className="p-2.5 rounded-full mb-3"
              >
                <TrendingUp 
                  size={20} 
                  color={
                    isPositiveRoi 
                      ? (isDark ? '#' + '34D399' : '#' + '059669') 
                      : isNegativeRoi 
                      ? (isDark ? '#' + 'F87171' : '#' + 'DC2626')
                      : (isDark ? '#' + '94A3B8' : '#' + '64748B')
                  } 
                />
              </LinearGradient>
              <AppText variant="display" className="text-text-primary dark:text-white text-3xl font-extrabold tracking-tight">
                {stats?.roi ? `${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%` : '0%'}
              </AppText>
              <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary text-[11px] mt-1.5 font-semibold">
                수익률
              </AppText>
            </View>
          </View>

          <LinearGradient colors={statsCardBgColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="border border-white/40 dark:border-white/10 rounded-2xl p-5" style={styles.cardShadow}>
            <AppText variant="title-lg" className="text-text-primary dark:text-white mb-4 text-[16px] font-bold tracking-tight">
              투자 대비 당첨 비율
            </AppText>
            <View className="flex-row justify-between">
              <View>
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mb-1 text-[11px] font-semibold">
                  총 당첨금
                </AppText>
                <AppText variant="title" className="text-emerald-500 dark:text-emerald-400 text-lg font-bold">
                  {formatCurrency(stats?.totalWinnings ?? 0)}
                </AppText>
              </View>
              <View className="items-end">
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary mb-1 text-[11px] font-semibold">
                  총 투자금
                </AppText>
                <AppText variant="title" className="text-text-primary dark:text-white text-lg font-bold">
                  {formatCurrency(stats?.totalSpent ?? 0)}
                </AppText>
              </View>
            </View>
          </LinearGradient>

          <View className="bg-white/70 dark:bg-[#1E293B]/70 border border-white/40 dark:border-white/10 rounded-2xl p-5" style={styles.cardShadow}>
            <View className="flex-row items-center gap-2 mb-5">
              <Hash size={18} color={isDark ? '#' + '34D399' : '#' + '059669'} />
              <AppText variant="title-lg" className="text-text-primary dark:text-white text-[16px] font-bold tracking-tight">
                자주 나온 번호 TOP 10
              </AppText>
            </View>
            {topNumbers.length > 0 ? (
              topNumbers.map(([num, count]) => (
                <StatFrequencyBar
                  key={num}
                  num={num}
                  count={count}
                  maxCount={topNumbers[0]?.[1] || 1}
                  isDark={isDark}
                />
              ))
            ) : (
              <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary text-center py-6 font-medium text-[13px]">
                아직 데이터가 없습니다. 번호를 생성해보세요!
              </AppText>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { padding: 24, paddingBottom: 40 },
  cardShadow: { shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, shadowOpacity: 0.03, elevation: 3 },
  gamesGlow: { shadowColor: '#' + '10B981', shadowOpacity: 0.08 },
});

