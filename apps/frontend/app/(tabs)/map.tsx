import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import CustomMapView from '../../components/ui/CustomMapView';
import { Map as MapIcon, List as ListIcon, MapPin, LocateFixed } from 'lucide-react-native';
import { SpotListItem } from '../../components/ui/SpotListItem';
import { MapCalloutContent } from '../../components/ui/MapCalloutContent';
import { REGIONS } from '../../constants/regions';
import { useLuckySpots } from '../../hooks/useLuckySpots';

/**
 * @description 전국의 로또 명당(1, 2등 다수 배출 판매점)을 지도와 리스트로 확인할 수 있는 화면입니다.
 */
const LuckySpotsScreen = () => {
  const {
    isMapView,
    selectedRegion,
    region,
    spots,
    isLoading,
    setSelectedRegion,
    setRegion,
    toggleViewMode,
    moveToCurrentLocation,
    handleSpotPress,
  } = useLuckySpots();

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white dark:bg-dark-surface border-b border-gray-100 shadow-sm">
        <Text className="text-xl font-bold text-[#1A1A1A] dark:text-dark-text">명당 찾기</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={toggleViewMode} accessibilityLabel={isMapView ? '리스트 보기로 전환' : '지도 보기로 전환'} accessibilityRole="button" activeOpacity={0.7} className="p-3 -mr-3">
            {isMapView ? <ListIcon size={24} color="#1A1A1A" /> : <MapIcon size={24} color="#1A1A1A" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Region Filter - Horizontal Scroll */}
      <View className="bg-white dark:bg-dark-surface py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {REGIONS.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-full ${selectedRegion === r ? 'bg-primary' : 'bg-gray-100 border border-gray-200'}`}
              accessibilityLabel={`${r} 지역 필터`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRegion === r }}
            >
              <Text className={`text-[13px] font-semibold ${selectedRegion === r ? 'text-white' : 'text-gray-600'}`}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        ) : isMapView ? (
          <View className="flex-1">
            <CustomMapView
              region={region}
              onRegionChangeComplete={setRegion}
              spots={spots}
            >
              <MapCalloutContent />
            </CustomMapView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={moveToCurrentLocation}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg border border-gray-100"
              accessibilityLabel="현재 위치로 이동"
              accessibilityRole="button"
            >
              <LocateFixed size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={spots}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 20, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSpotPress(item.id)} accessibilityLabel={`${item.name} 판매점 상세 보기`} accessibilityRole="button">
                <SpotListItem spot={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={64} color="#BDBDBD" />
                <Text className="text-gray-400 dark:text-dark-text-secondary mt-4 font-semibold">{selectedRegion} 지역의 명당이 없습니다.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default LuckySpotsScreen;