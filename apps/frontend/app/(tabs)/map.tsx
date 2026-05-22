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
import { useTheme } from '../../hooks/useTheme';

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
  const { isDark } = useTheme();

  const hash = '#';
  const iconColor = isDark ? hash + 'E0E0E0' : hash + '0F1115';
  const primaryColor = hash + '4CAF50';
  const emptyIconColor = hash + 'BDBDBD';

  return (
    <ScreenContainer>
      {/* Header - tab root, no back */}
      <View className="flex-row justify-between items-center px-5 h-14">
        <AppText variant="title-lg" className="text-text-primary dark:text-dark-text font-bold">
          명당 찾기
        </AppText>
        <TouchableOpacity
          onPress={toggleViewMode}
          accessibilityLabel={isMapView ? '리스트 보기로 전환' : '지도 보기로 전환'}
          accessibilityRole="button"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04] dark:bg-white/[0.06]"
        >
          {isMapView ? <ListIcon size={18} color={iconColor} /> : <MapIcon size={18} color={iconColor} />}
        </TouchableOpacity>
      </View>

      {/* Region Filter - Horizontal Scroll */}
      <View className="bg-background dark:bg-dark-bg py-3 border-b border-border-hairline dark:border-white/5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {REGIONS.map(r => {
            const isSelected = selectedRegion === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRegion(r)}
                className={`px-4 py-2 rounded-pill border ${
                  isSelected
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-dark-surface border-border-hairline dark:border-white/5'
                }`}
                accessibilityLabel={`${r} 지역 필터`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <AppText
                  variant="caption"
                  className={isSelected ? 'text-white font-medium' : 'text-text-muted dark:text-dark-text-secondary'}
                >
                  {r}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : isMapView ? (
          <View className="flex-1">
            <CustomMapView region={region} onRegionChangeComplete={setRegion} spots={spots}>
              <MapCalloutContent />
            </CustomMapView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={moveToCurrentLocation}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-surface dark:bg-dark-card items-center justify-center shadow-elev border border-border-hairline dark:border-white/10"
              accessibilityLabel="현재 위치로 이동"
              accessibilityRole="button"
            >
              <LocateFixed size={24} color={primaryColor} />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={spots}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 96, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSpotPress(item.id)}
                accessibilityLabel={`${item.name} 판매점 상세 보기`}
                accessibilityRole="button"
              >
                <SpotListItem spot={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <MapPin size={64} color={emptyIconColor} />
                <AppText variant="body-lg" className="text-text-muted dark:text-dark-text-secondary mt-4 font-medium">
                  {selectedRegion} 지역의 명당이 없습니다.
                </AppText>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
};

export default LuckySpotsScreen;

