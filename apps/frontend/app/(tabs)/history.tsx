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
      <View className="flex-row justify-between items-center px-5 h-14">
        <AppText
          variant="title-lg"
          className="text-text-primary dark:text-dark-text"
        >
          내 로또 내역
        </AppText>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          activeOpacity={0.7}
          className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04]"
        >
          <QrCode size={18} color={isDark ? '#E0E0E0' : '#0F1115'} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={records}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 96 }}
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
