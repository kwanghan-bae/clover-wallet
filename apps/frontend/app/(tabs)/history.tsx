import React from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { QrCode, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import {
  useHistoryData,
  HistoryRecord,
} from '../../hooks/useHistoryData';
import { getStatusBadge } from '../../constants/lotto-status';

const HistoryScreen = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const { records, handleDelete } = useHistoryData();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent dark:bg-dark-bg">
        <Text
          style={{ fontFamily: 'NotoSansKR_700Bold' }}
          className="text-xl text-[#1A1A1A] dark:text-dark-text"
        >
          내 로또 내역
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          activeOpacity={0.7}
          className="p-3 -mr-3"
        >
          <QrCode size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={records}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 20 }}
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
                    <Text
                      style={{
                        fontFamily: 'NotoSansKR_700Bold',
                        color: badge.color,
                        fontSize: 12,
                      }}
                    >
                      {badge.label}
                    </Text>
                  </View>
                )}
                <HistoryItem record={item} onDelete={handleDelete} />
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              className="items-center justify-center py-32"
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <View className="w-24 h-24 bg-[#BDBDBD]/10 rounded-full items-center justify-center mb-8">
                <Plus size={48} color="rgba(189, 189, 189, 0.4)" />
              </View>
              <Text
                style={{ fontFamily: 'NotoSansKR_700Bold' }}
                className="text-lg text-[#1A1A1A] dark:text-dark-text"
              >
                저장된 로또 내역이 없습니다
              </Text>
              <Text
                style={{ fontFamily: 'NotoSansKR_400Regular' }}
                className="text-[#BDBDBD] dark:text-dark-text-secondary mt-2 text-center"
              >
                번호를 생성하고 저장해보세요!
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/number-generation')}
                activeOpacity={0.8}
                className="mt-10"
                accessibilityLabel="번호 생성하기"
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#4CAF50', '#388E3C']}
                  className="px-8 py-3.5 rounded-full shadow-lg"
                >
                  <View className="flex-row items-center">
                    <Plus size={20} color="white" />
                    <Text
                      style={{ fontFamily: 'NotoSansKR_700Bold' }}
                      className="text-white text-base ml-2"
                    >
                      번호 생성하기
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;