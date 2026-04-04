import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Trophy } from 'lucide-react-native';
import { WinningHistory } from '../../api/types/spots';
import { TravelPlan } from '../../api/travel';
import GlassCard from '../../components/ui/GlassCard';
import { WinningHistoryItem } from '../../components/ui/WinningHistoryItem';
import { useSpotDetail } from '../../hooks/useSpotDetail';

/**
 * @description 특정 로또 판매점의 상세 정보와 과거 당첨 이력을 확인할 수 있는 화면입니다.
 */
const SpotDetailScreen = () => {
  const router = useRouter();
  const { history, isLoading, spotInfo, getWinCount, travelPlans } = useSpotDetail();

  /** @description 특정 등수의 당첨 횟수를 렌더링합니다. */
  const renderWinCount = (rank: number) => getWinCount(rank);

  if (isLoading) {
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
                  {renderWinCount(1)}회
                </Text>
              </View>
              <View className="w-[1] h-10 bg-gray-100" />
              <View className="items-center">
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs mb-1">2등 배출</Text>
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#4CAF50] text-xl">
                  {renderWinCount(2)}회
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
              <WinningHistoryItem key={`${item.round}-${index}`} item={item} />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
              <Trophy size={48} color="#E0E0E0" />
              <Text className="text-gray-400 mt-4">당첨 내역이 없습니다.</Text>
            </View>
          )}
        </View>

        {/* Travel Plan Section */}
        {travelPlans && travelPlans.length > 0 && (
          <View className="px-5 mt-8">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">🗺️ 주변 여행 코스</Text>
            {travelPlans.map((plan: TravelPlan) => (
              <View
                key={plan.id}
                className="bg-white rounded-2xl p-5 mb-3 border border-gray-100"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] text-base flex-1 mr-2" numberOfLines={1}>
                    {plan.title}
                  </Text>
                  <View className="bg-[#E8F5E9] px-3 py-1 rounded-full">
                    <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#4CAF50] text-xs">
                      {plan.theme}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#757575] text-sm mb-3" numberOfLines={2}>
                  {plan.description}
                </Text>
                <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-xs">
                  예상 소요 시간: {plan.estimatedHours}시간
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SpotDetailScreen;


