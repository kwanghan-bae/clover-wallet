import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useStatistics } from '../hooks/useStatistics';
import { TrendingUp, Hash, Target } from 'lucide-react-native';

export default function StatisticsScreen() {
  const { stats, numberFrequency } = useStatistics();

  const formatCurrency = (n: number) => n.toLocaleString('ko-KR') + '원';

  const topNumbers = Object.entries(numberFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-bg">
      <Stack.Screen options={{ title: '번호 분석', headerShown: true }} />
      <View className="p-4 gap-4">
        {/* Summary Cards Row */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-4 items-center">
            <Target size={24} color="#4CAF50" />
            <Text className="text-2xl font-bold text-text-dark dark:text-dark-text mt-2">
              {stats?.totalGames ?? 0}
            </Text>
            <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 게임</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-dark-surface rounded-2xl p-4 items-center">
            <TrendingUp size={24} color={stats?.roi && stats.roi > 0 ? '#4CAF50' : '#E53935'} />
            <Text className="text-2xl font-bold text-text-dark dark:text-dark-text mt-2">
              {stats?.roi ? `${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(1)}%` : '0%'}
            </Text>
            <Text className="text-xs text-text-grey dark:text-dark-text-secondary">수익률</Text>
          </View>
        </View>

        {/* Winnings Card */}
        <View className="bg-white dark:bg-dark-surface rounded-2xl p-4">
          <Text className="text-base font-bold text-text-dark dark:text-dark-text mb-2">당첨 현황</Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 당첨금</Text>
              <Text className="text-lg font-bold text-primary">{formatCurrency(stats?.totalWinnings ?? 0)}</Text>
            </View>
            <View>
              <Text className="text-xs text-text-grey dark:text-dark-text-secondary">총 투자</Text>
              <Text className="text-lg font-bold text-text-dark dark:text-dark-text">{formatCurrency(stats?.totalSpent ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Number Frequency TOP 10 */}
        <View className="bg-white dark:bg-dark-surface rounded-2xl p-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Hash size={20} color="#4CAF50" />
            <Text className="text-base font-bold text-text-dark dark:text-dark-text">자주 나온 번호 TOP 10</Text>
          </View>
          {topNumbers.length > 0 ? (
            topNumbers.map(([num, count]) => (
              <View key={num} className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-primary items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{num}</Text>
                </View>
                <View className="flex-1 h-6 bg-gray-100 dark:bg-dark-card rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min((count / (topNumbers[0]?.[1] || 1)) * 100, 100)}%` }}
                  />
                </View>
                <Text className="text-sm text-text-grey dark:text-dark-text-secondary ml-2 w-8 text-right">{count}회</Text>
              </View>
            ))
          ) : (
            <Text className="text-text-grey dark:text-dark-text-secondary text-center py-4">
              아직 데이터가 없습니다. 번호를 생성해보세요!
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
