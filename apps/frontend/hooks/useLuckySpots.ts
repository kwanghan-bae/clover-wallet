import { useState } from 'react';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Region } from '../api/types/spots';
import { spotsApi } from '../api/spots';

/**
 * @description 명당 찾기 화면에서 지도/리스트 뷰 전환, 지역 필터링, 위치 추적 등의 로직을 관리하는 커스텀 훅입니다.
 */
export function useLuckySpots() {
  const router = useRouter();
  const [isMapView, setIsMapView] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [region, setRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const { data: spots = [], isLoading } = useQuery({
    queryKey: ['spots'],
    queryFn: () => spotsApi.getSpots(0, 500),
  });

  const filteredSpots = selectedRegion === '전체'
    ? spots
    : spots.filter(spot => spot.address.includes(selectedRegion));

  const toggleViewMode = () => setIsMapView(!isMapView);

  const moveToCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let location = await Location.getCurrentPositionAsync({});
      setRegion(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));
    }
  };

  const handleSpotPress = (spotId: number) => {
    router.push(`/spot/${spotId}`);
  };

  return {
    isMapView,
    selectedRegion,
    region,
    spots: filteredSpots,
    isLoading,
    setSelectedRegion,
    setRegion,
    toggleViewMode,
    moveToCurrentLocation,
    handleSpotPress,
  };
}
