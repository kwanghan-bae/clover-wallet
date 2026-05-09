import React from 'react';
import { View, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import CustomMapView from '../../components/ui/CustomMapView';
import { Map as MapIcon, List as ListIcon, MapPin, LocateFixed } from 'lucide-react-native';
import { SpotListItem } from '../../components/ui/SpotListItem';
import { MapCalloutContent } from '../../components/ui/MapCalloutContent';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppText } from '../../components/ui/AppText';
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
    <ScreenContainer>
      {/* Header - tab root, no back */}
      <View className="flex-row justify-between items-center px-5 h-14">
        <AppText variant="title-lg" className="text-text-primary dark:text-dark-text">명당 찾기</AppText>
        <TouchableOpacity
          onPress={toggleViewMode}
          accessibilityLabel={isMapView ? '리스트 보기로 전환' : '지도 보기로 전환'}
          accessibilityRole="button"
          activeOpacity={0.7}
          className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04]"
        >
          {isMapView ? <ListIcon size={18} color="#0F1115" /> : <MapIcon size={18} color="#0F1115" />}
        </TouchableOpacity>
      </View>

      {/* Region Filter - Horizontal Scroll */}
      <View className="bg-surface dark:bg-dark-surface py-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {REGIONS.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-pill ${selectedRegion === r ? 'bg-primary' : 'bg-surface-muted border border-border-hairline'}`}
              accessibilityLabel={`${r} 지역 필터`}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedRegion === r }}
            >
              <AppText variant="caption" className={selectedRegion === r ? 'text-white' : 'text-text-muted'}>{r}</AppText>
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
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-surface items-center justify-center shadow-elev border border-border-hairline"
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
              <View className="items-center justify-center py-20">
                <MapPin size={64} color="#BDBDBD" />
                <AppText variant="body-lg" className="text-text-muted dark:text-dark-text-secondary mt-4">{selectedRegion} 지역의 명당이 없습니다.</AppText>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
};

export default LuckySpotsScreen;
