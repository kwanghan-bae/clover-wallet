import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Trophy, Calendar } from 'lucide-react-native';
import { spotsApi } from '../../api/spots';
import { WinningHistory } from '../../api/types/spots';
import GlassCard from '../../components/ui/GlassCard';
import { useQuery } from '@tanstack/react-query';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // In a real app, we might fetch the spot detail separately if needed, 
  // but for now we'll assume we might need to fetch all spots or have it passed.
  // Let's fetch the history first.
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['spotHistory', id],
    queryFn: () => spotsApi.getSpotHistory(Number(id)),
    enabled: !!id,
  });

  // We also need the spot info. Let's find it from the spots list for now or fetch if needed.
  // For MVP, let's just use the history to show the name and address from the first item if available.
  const spotInfo = history && history.length > 0 ? {
    name: history[0].storeName,
    address: history[0].address,
  } : null;

  if (isHistoryLoading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Custom Header */}
      <View className="px-5 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-xl text-[#1A1A1A] ml-2">판매점 상세</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Spot Info Card */}
        <View className="px-5 pt-6">
          <GlassCard className="p-6">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-2xl text-[#1A1A1A] mb-2">
                  {spotInfo?.name || "정보 없음"}
                </Text>
                <View className="flex-row items-center mb-4">
                  <MapPin size={16} color="#4CAF50" />
                  <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#757575] text-sm ml-1 flex-1">
                    {spotInfo?.address || "주소 정보가 없습니다."}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-around border-t border-gray-100 pt-5 mt-2">
              <View className="items-center">
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs mb-1">1등 배출</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#FFC107] text-xl">
                  {history?.filter((h: WinningHistory) => h.rank === 1).length || 0}회
                </Text>
              </View>
              <View className="w-[1] h-10 bg-gray-100" />
              <View className="items-center">
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs mb-1">2등 배출</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-xl">
                  {history?.filter((h: WinningHistory) => h.rank === 2).length || 0}회
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Winning History Section */}
        <View className="px-5 mt-8">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">당첨 내역</Text>
          
          {history && history.length > 0 ? (
            history.map((item: WinningHistory, index: number) => (
              <HistoryItem key={`${item.round}-${index}`} item={item} />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
              <Trophy size={48} color="#E0E0E0" />
              <Text className="text-gray-400 mt-4">당첨 내역이 없습니다.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryItem({ item }: { item: WinningHistory }) {
  const is1st = item.rank === 1;
  
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 flex-row items-center border border-gray-50 shadow-sm">
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${is1st ? 'bg-[#FFC107]/10' : 'bg-[#4CAF50]/10'}`}>
        <Trophy size={20} color={is1st ? '#FFC107' : '#4CAF50'} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-base text-[#1A1A1A]">
            {item.round}회 당첨
          </Text>
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className={`text-sm ${is1st ? 'text-[#FFC107]' : 'text-[#4CAF50]'}`}>
            {item.rank}등
          </Text>
        </View>
        <View className="flex-row items-center">
          <Calendar size={12} color="#BDBDBD" />
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs ml-1">
            {item.method || "자동"}
          </Text>
        </View>
      </View>
    </View>
  );
}
