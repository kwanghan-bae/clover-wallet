import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';

interface StatFrequencyBarProps {
  num: string;
  count: number;
  maxCount: number;
  isDark: boolean;
}

export const StatFrequencyBar = ({ num, count, maxCount, isDark }: StatFrequencyBarProps) => {
  const barColors: [string, string] = isDark
    ? ['#' + '059669', '#' + '10B981']
    : ['#' + '34D399', '#' + '10B981'];

  return (
    <View className="flex-row items-center mb-3.5">
      <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3 border border-slate-200/30 dark:border-slate-700/30 shadow-sm">
        <AppText variant="label" className="text-slate-800 dark:text-slate-200 font-bold text-[12px]">
          {num}
        </AppText>
      </View>
      <View className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
        <LinearGradient
          colors={barColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-full rounded-full"
          style={{ width: `${Math.min((count / (maxCount || 1)) * 100, 100)}%` }}
        />
      </View>
      <AppText
        variant="caption"
        className="text-text-muted dark:text-dark-text-secondary ml-3.5 w-10 text-right font-semibold text-[11px]"
      >
        {count}회
      </AppText>
    </View>
  );
};
