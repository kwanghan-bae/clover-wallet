import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { HistoryItem } from '../../components/ui/HistoryItem';
import { LottoRecord } from '../../api/types/lotto';
import { loadItem, StorageKeys, removeFromItemArray } from '../../utils/storage';

export default function HistoryScreen() {
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryItem record={item} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-text-light text-lg">No history found.</Text>
              <Text className="text-text-light/60 mt-2">Try generating numbers first!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}