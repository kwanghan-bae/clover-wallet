import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { LottoRecord } from '../../api/types/lotto';
import { ticketsApi, LottoTicket } from '../../api/tickets';
import { loadItem, StorageKeys, removeFromItemArray } from '../../utils/storage';
import { QrCode, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'WINNING': return { label: '당첨', color: '#4CAF50', bg: '#E8F5E9' };
    case 'LOSING': return { label: '미당첨', color: '#757575', bg: '#F5F5F5' };
    default: return { label: '확인중', color: '#FFC107', bg: '#FFF8E1' };
  }
};

/**
 * @description 사용자가 생성하거나 스캔하여 저장한 로또 번호 내역을 확인할 수 있는 화면입니다.
 */
const HistoryScreen = () => {
  const router = useRouter();
  const [history, setHistory] = useState<LottoRecord[]>([]);

  const { data: ticketData } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(0, 100),
  });

  const loadHistory = useCallback(() => {
    const data = loadItem<LottoRecord[]>(StorageKeys.SAVED_NUMBERS) || [];
    setHistory(data);
  }, []);

  // 화면 진입 시마다 데이터 다시 불러오기
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleDelete = (id: string) => {
    removeFromItemArray<LottoRecord>(StorageKeys.SAVED_NUMBERS, (item) => item.id === id);
    loadHistory();
  };

  // 백엔드 티켓을 LottoRecord 형태로 변환
  const backendRecords: LottoRecord[] = (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
    (ticket.games ?? []).map((game) => ({
      id: game.id,
      status: game.status as LottoRecord['status'],
      numbers: [game.number1, game.number2, game.number3, game.number4, game.number5, game.number6],
      createdAt: ticket.createdAt,
      round: ticket.ordinal,
      prizeAmount: game.prizeAmount,
      _ticketStatus: ticket.status,
    }))
  );

  // 로컬 기록과 백엔드 기록 합산 (백엔드를 먼저 표시, 중복 제거)
  const combinedHistory = useMemo(() => {
    const backendSet = new Set(
      backendRecords.map((r) => `${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`),
    );
    const uniqueLocal = history.filter(
      (r) => !backendSet.has(`${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`),
    );
    return [...backendRecords, ...uniqueLocal];
  }, [backendRecords, history]);

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent dark:bg-dark-bg">
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A] dark:text-dark-text">내 로또 내역</Text>
        <TouchableOpacity onPress={() => router.push('/scan')} accessibilityLabel="QR 스캔" accessibilityRole="button">
          <QrCode size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={combinedHistory}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const ticketStatus = (item as LottoRecord & { _ticketStatus?: string })._ticketStatus;
            const badge = ticketStatus ? getStatusBadge(ticketStatus) : null;
            return (
              <View>
                {badge && (
                  <View
                    className="self-start mb-1 px-3 py-1 rounded-full"
                    style={{ backgroundColor: badge.bg }}
                  >
                    <Text
                      style={{ fontFamily: 'NotoSansKR_700Bold', color: badge.color, fontSize: 12 }}
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
            <View className="items-center justify-center py-32" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View className="w-24 h-24 bg-[#BDBDBD]/10 rounded-full items-center justify-center mb-8">
                <Plus size={48} color="rgba(189, 189, 189, 0.4)" />
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text">저장된 로또 내역이 없습니다</Text>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] dark:text-dark-text-secondary mt-2 text-center">번호를 생성하고 저장해보세요!</Text>

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
                    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-base ml-2">번호 생성하기</Text>
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