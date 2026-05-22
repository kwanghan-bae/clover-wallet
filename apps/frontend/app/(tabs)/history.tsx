import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { QrCode, Plus } from 'lucide-react-native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppText } from '../../components/ui/AppText';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  useHistoryData,
  HistoryRecord,
} from '../../hooks/useHistoryData';
import { getStatusBadge } from '../../constants/lotto-status';
import { useTheme } from '../../hooks/useTheme';

const HistoryScreen = () => {
  const router = useRouter();
  const { records, handleDelete } = useHistoryData();
  const { isDark } = useTheme();

  return (
    <ScreenContainer>
      <View className="flex-row justify-between items-center px-6 h-16">
        <AppText
          variant="title-lg"
          className="text-text-primary dark:text-dark-text font-extrabold tracking-tight"
        >
          내 로또 내역
        </AppText>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-xl items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.03] dark:border-white/[0.03]"
        >
          <QrCode size={19} color={isDark ? '#F3F4F6' : '#1F2937'} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={records}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 96 }}
          renderItem={({ item }: { item: HistoryRecord }) => {
            const badge = item._ticketStatus
              ? getStatusBadge(item._ticketStatus)
              : null;
            return (
              <View>
                {badge && (
                  <View
                    className="self-start mb-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: badge.bg }}
                  >
                    <AppText variant="label" style={{ color: badge.color }}>
                      {badge.label}
                    </AppText>
                  </View>
                )}
                <HistoryItem record={item} onDelete={handleDelete} />
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="px-5">
              <EmptyState
                icon={<Plus size={24} color="#2E7D32" />}
                title="저장된 로또 내역이 없습니다"
                description="번호를 생성하고 저장해보세요"
                cta={{
                  label: '번호 생성하기',
                  onPress: () => router.push('/number-generation'),
                }}
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenContainer>
  );
};

export default HistoryScreen;
