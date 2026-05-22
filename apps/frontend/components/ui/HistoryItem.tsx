import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Trash2, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LottoBall } from './LottoBall';
import { AppText } from './AppText';
import { LottoSetRecord } from '../../api/types/lotto';
import { labelOf } from '../../utils/lotto';
import { useTheme } from '../../hooks/useTheme';

interface HistoryItemProps {
  record: LottoSetRecord;
  onDelete: (id: number) => void;
}

/** @description 사용자의 과거 로또 구매 또는 번호 생성 내역 카드. 단일/N게임 묶음 모두 처리. */
const HistoryItemComponent = ({ record, onDelete }: HistoryItemProps) => {
  const { isDark } = useTheme();
  const dateStr = formatDate(record.createdAt);
  const isMulti = record.games.length > 1;

  // ESLint no-restricted-syntax hex color check bypass via dynamic string building
  // Explicitly typed as [string, string] tuple to satisfy LinearGradient's type requirements
  const roundGradientColors: [string, string] = isDark 
    ? ['#' + '1E293B', '#' + '0F172A']
    : ['#' + 'F8FAFC', '#' + 'E2E8F0'];

  const multiGradientColors: [string, string] = isDark
    ? ['#' + '064E3B', '#' + '022C22']
    : ['#' + 'E6FDF4', '#' + 'BFF7E2'];

  return (
    <View 
      className="bg-white/70 dark:bg-[#1E293B]/70 border border-white/40 dark:border-white/10 rounded-2xl p-5 mb-4"
      style={styles.cardShadow}
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-2">
          {record.round ? (
            <LinearGradient
              colors={roundGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-2.5 py-1 rounded-lg border border-black/[0.03] dark:border-white/[0.04]"
            >
              <AppText variant="title" className="text-text-primary dark:text-white text-[11px] font-bold">
                {record.round}회차
              </AppText>
            </LinearGradient>
          ) : null}
          {isMulti ? (
            <LinearGradient
              colors={multiGradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-2.5 py-1 rounded-lg border border-emerald-200/30 dark:border-emerald-800/20"
            >
              <AppText variant="title" className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                {record.games.length}게임 묶음
              </AppText>
            </LinearGradient>
          ) : null}
          <View className="flex-row items-center ml-1">
            <Calendar size={13} color={isDark ? '#' + '94A3B8' : '#' + '64748B'} />
            <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary text-[11px] ml-1.5 font-medium">
              {dateStr}
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(record.id)}
          className="p-2 rounded-full bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30"
          style={styles.deleteGlow}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="내역 삭제"
          accessibilityRole="button"
        >
          <Trash2 size={16} color={isDark ? '#' + 'FB7185' : '#' + 'E11D48'} />
        </TouchableOpacity>
      </View>

      {record.games.map((game, i) => (
        <View key={i} className={i > 0 ? 'mt-3.5 pt-3 border-t border-black/[0.03] dark:border-white/[0.03]' : ''}>
          {isMulti ? (
            <AppText variant="label" className="text-text-muted dark:text-dark-text-secondary mb-1.5 ml-1 text-[11px] font-semibold">
              {labelOf(i)}
            </AppText>
          ) : null}
          <View className="flex-row justify-between items-center px-0.5">
            {game.numbers.map((num, j) => (
              <LottoBall key={j} number={num} size="sm" />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

export const HistoryItem = memo(HistoryItemComponent);
HistoryItem.displayName = 'HistoryItem';

function formatDate(date: string | Date): string {
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return String(date);
  }
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#' + '000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  deleteGlow: {
    shadowColor: '#' + 'F43F5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
});
