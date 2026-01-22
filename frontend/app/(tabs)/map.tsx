import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import CustomMapView from '../../components/ui/CustomMapView';
import * as Location from 'expo-location';
import { Map as MapIcon, List as ListIcon, MapPin, ChevronRight, LocateFixed } from 'lucide-react-native';
import { LottoSpot, Region } from '../../api/types/spots';
import { spotsApi } from '../../api/spots';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

export default function LuckySpotsScreen() {
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

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-100 shadow-sm">
        <Text className="text-xl font-bold text-[#1A1A1A]">명당 찾기</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => setIsMapView(!isMapView)}>
            {isMapView ? <ListIcon size={24} color="#1A1A1A" /> : <MapIcon size={24} color="#1A1A1A" />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Region Filter - Horizontal Scroll */}
      <View className="bg-white py-3">
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
              spots={filteredSpots}
            >
              <MapCalloutContent />
            </CustomMapView>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={moveToCurrentLocation}
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg border border-gray-100"
            >
              <LocateFixed size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredSpots}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ padding: 20, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSpotPress(item.id)}>
                <SpotListItem spot={item} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center justify-center py-20" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={64} color="#BDBDBD" />
                <Text className="text-gray-400 mt-4 font-semibold">{selectedRegion} 지역의 명당이 없습니다.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function SpotListItem({ spot }: { spot: LottoSpot }) {
  return (
    <View
      className="bg-white rounded-[24px] p-5 mb-1 flex-row items-center"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View className="bg-[#4CAF50]/10 p-4 rounded-[18px] mr-4">
        <MapPin size={24} color="#4CAF50" />
      </View>
      <View className="flex-1">
        <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[17px] text-[#1A1A1A]">{spot.name}</Text>
        <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] text-[13px] mt-1" numberOfLines={1}>
          {spot.address}
        </Text>
        <View className="flex-row gap-2 mt-3">
          <View className="bg-[#FFC107]/10 px-2.5 py-1.5 rounded-lg border border-[#FFC107]/30">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#FFC107] text-[11px]">1등 {spot.firstPlaceWins}회</Text>
          </View>
          <View className="bg-[#BDBDBD]/10 px-2.5 py-1.5 rounded-lg border border-[#BDBDBD]/30">
            <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#757575] text-[11px]">2등 {spot.secondPlaceWins}회</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#E0E0E0" />
    </View>
  );
}

function MapCalloutContent({ spot }: { spot?: LottoSpot }) {
  if (!spot) return null;
  return (
    <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg w-60">
      <Text className="text-lg font-bold text-text-dark mb-1">{spot.name}</Text>
      <Text className="text-text-light text-[11px] mb-2">{spot.address}</Text>
      <View className="flex-row gap-2">
        <View className="bg-primary/10 px-2 py-1 rounded">
          <Text className="text-primary font-bold text-[11px]">1등: {spot.firstPlaceWins}</Text>
        </View>
        <View className="bg-secondary/10 px-2 py-1 rounded">
          <Text className="text-secondary font-bold text-[11px]">2등: {spot.secondPlaceWins}</Text>
        </View>
      </View>
    </View>
  );
}