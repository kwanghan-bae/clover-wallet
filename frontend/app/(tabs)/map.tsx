import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, FlatList } from 'react-native';
import CustomMapView from '../../components/ui/CustomMapView';
import * as Location from 'expo-location';
import { Map as MapIcon, List as ListIcon, MapPin, ChevronRight, LocateFixed } from 'lucide-react-native';
import { LottoSpot, Region } from '../../api/types/spots';

const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', 
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

const MOCK_SPOTS: LottoSpot[] = [
  {
    id: 1,
    name: "로또킹 강남점",
    address: "서울특별시 강남구 테헤란로 123",
    latitude: 37.4979,
    longitude: 127.0276,
    winCount1st: 15,
    winCount2nd: 42,
  },
  {
    id: 2,
    name: "행운복권방",
    address: "서울특별시 종로구 종로 456",
    latitude: 37.5704,
    longitude: 126.9922,
    winCount1st: 8,
    winCount2nd: 25,
  },
  {
    id: 3,
    name: "대박기원점",
    address: "경기도 수원시 팔달구 789",
    latitude: 37.2636,
    longitude: 127.0286,
    winCount1st: 12,
    winCount2nd: 30,
  }
];

export default function LuckySpotsScreen() {
  const [isMapView, setIsMapView] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [region, setRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [spots] = useState<LottoSpot[]>(MOCK_SPOTS);

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
        {isMapView ? (
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
            renderItem={({ item }) => <SpotListItem spot={item} />}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
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
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex-row items-center">
      <View className="bg-primary/10 p-3 rounded-xl mr-4">
        <MapPin size={24} color="#4CAF50" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-[#1A1A1A]">{spot.name}</Text>
        <Text className="text-gray-500 text-[13px] mt-1" numberOfLines={1}>{spot.address}</Text>
        <View className="flex-row gap-2 mt-2">
          <View className="bg-secondary/10 px-2 py-1 rounded-md border border-secondary/30">
            <Text className="text-secondary text-[11px] font-bold">1등 {spot.winCount1st}회</Text>
          </View>
          <View className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
            <Text className="text-blue-600 text-[11px] font-bold">2등 {spot.winCount2nd}회</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={20} color="#BDBDBD" />
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
          <Text className="text-primary font-bold text-[11px]">1등: {spot.winCount1st}</Text>
        </View>
        <View className="bg-secondary/10 px-2 py-1 rounded">
          <Text className="text-secondary font-bold text-[11px]">2등: {spot.winCount2nd}</Text>
        </View>
      </View>
    </View>
  );
}