import { View, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useStatistics } from '../hooks/useStatistics';
import { TrendingUp, Hash, Target } from 'lucide-react-native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppBar } from '../components/ui/AppBar';
import { AppText } from '../components/ui/AppText';

export default function StatisticsScreen() {
  const router = useRouter();
  const { stats, numberFrequency } = useStatistics();

  const formatCurrency = (n: number) => n.toLocaleString('ko-KR') + '원';

  const topNumbers = Object.entries(numberFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar variant="screen" title="번호 분석" onBackPress={() => router.back()} />
      <ScrollView className="flex-1">
        <View className="p-4 gap-4">
          {/* Summary Cards Row */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface dark:bg-dark-surface rounded-card p-4 items-center shadow-card">
              <Target size={24} color="#4CAF50" />
              <AppText variant="display" className="text-text-primary dark:text-dark-text mt-2">
                {stats?.totalGames ?? 0}
              </AppText>
              <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary">
                총 게임
              </AppText>
            </View>
            <View className="flex-1 bg-surface dark:bg-dark-surface rounded-card p-4 items-center shadow-card">
              <TrendingUp size={24} color={stats?.roi && stats.roi > 0 ? '#4CAF50' : '#E53935'} />
              <AppText variant="display" className="text-text-primary dark:text-dark-text mt-2">
                {stats?.roi ? `${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%` : '0%'}
              </AppText>
              <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary">
                수익률
              </AppText>
            </View>
          </View>

          {/* Winnings Card */}
          <View className="bg-surface dark:bg-dark-surface rounded-card p-4 shadow-card">
            <AppText variant="title-lg" className="text-text-primary dark:text-dark-text mb-2">
              당첨 현황
            </AppText>
            <View className="flex-row justify-between">
              <View>
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary">
                  총 당첨금
                </AppText>
                <AppText variant="title" className="text-primary">
                  {formatCurrency(stats?.totalWinnings ?? 0)}
                </AppText>
              </View>
              <View>
                <AppText variant="caption" className="text-text-muted dark:text-dark-text-secondary">
                  총 투자
                </AppText>
                <AppText variant="title" className="text-text-primary dark:text-dark-text">
                  {formatCurrency(stats?.totalSpent ?? 0)}
                </AppText>
              </View>
            </View>
          </View>

          {/* Number Frequency TOP 10 */}
          <View className="bg-surface dark:bg-dark-surface rounded-card p-4 shadow-card">
            <View className="flex-row items-center gap-2 mb-3">
              <Hash size={20} color="#4CAF50" />
              <AppText variant="title-lg" className="text-text-primary dark:text-dark-text">
                자주 나온 번호 TOP 10
              </AppText>
            </View>
            {topNumbers.length > 0 ? (
              topNumbers.map(([num, count]) => (
                <View key={num} className="flex-row items-center mb-2">
                  <View className="w-8 h-8 rounded-pill bg-primary items-center justify-center mr-3">
                    <AppText variant="label" className="text-white">
                      {num}
                    </AppText>
                  </View>
                  <View className="flex-1 h-6 bg-border-hairline dark:bg-dark-card rounded-pill overflow-hidden">
                    <View
                      className="h-full bg-primary rounded-pill"
                      style={{ width: `${Math.min((count / (topNumbers[0]?.[1] || 1)) * 100, 100)}%` }}
                    />
                  </View>
                  <AppText
                    variant="caption"
                    className="text-text-muted dark:text-dark-text-secondary ml-2 w-8 text-right"
                  >
                    {count}회
                  </AppText>
                </View>
              ))
            ) : (
              <AppText
                variant="body"
                className="text-text-muted dark:text-dark-text-secondary text-center py-4"
              >
                아직 데이터가 없습니다. 번호를 생성해보세요!
              </AppText>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
