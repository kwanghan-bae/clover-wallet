import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { LottoRecord } from '../../api/types/lotto';
import { loadItem, StorageKeys, removeFromItemArray } from '../../utils/storage';
import { Inbox, QrCode, Plus } from 'lucide-react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<LottoRecord[]>([]);

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

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-transparent">
        <Text className="text-xl font-extrabold text-[#1A1A1A]">내 로또 내역</Text>
        <TouchableOpacity onPress={() => router.push('/scan')}>
          <QrCode size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <HistoryItem record={item} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-32">
              <View className="bg-gray-100 p-8 rounded-full mb-6">
                <Inbox size={60} color="#BDBDBD" />
              </View>
              <Text className="text-lg font-bold text-[#1A1A1A]">저장된 로또 내역이 없습니다</Text>
              <Text className="text-gray-500 mt-2 text-center">번호를 생성하고 저장해보세요!</Text>
              
              <TouchableOpacity 
                onPress={() => router.push('/number-generation')}
                className="bg-primary px-8 py-4 rounded-full mt-10 shadow-lg flex-row items-center"
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">번호 생성하기</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}