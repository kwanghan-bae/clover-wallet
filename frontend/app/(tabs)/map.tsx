import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocateFixed, Search } from 'lucide-react-native';
import { LottoSpot, Region } from '../../api/types/spots';

const { width, height } = Dimensions.get('window');

const MOCK_SPOTS: LottoSpot[] = [
  {
    id: 1,
    name: "Lotto King Seoul",
    address: "123 Gangnam-daero, Seoul",
    latitude: 37.4979,
    longitude: 127.0276,
    winCount1st: 15,
    winCount2nd: 42,
  },
  {
    id: 2,
    name: "Fortune Shop",
    address: "456 Jong-ro, Seoul",
    latitude: 37.5704,
    longitude: 126.9922,
    winCount1st: 8,
    winCount2nd: 25,
  }
];

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [spots, setSpots] = useState<LottoSpot[]>(MOCK_SPOTS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const moveToCurrentLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setRegion({
      ...region,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <MapView
        provider={PROVIDER_GOOGLE}
        className="w-full h-full"
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            pinColor="#4CAF50"
          >
            <Callout tooltip>
              <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-lg w-60">
                <Text className="text-lg font-bold text-text-dark mb-1">{spot.name}</Text>
                <Text className="text-text-light text-xs mb-2">{spot.address}</Text>
                <View className="flex-row gap-2">
                  <View className="bg-primary/10 px-2 py-1 rounded">
                    <Text className="text-primary font-bold text-xs">1st: {spot.winCount1st}</Text>
                  </View>
                  <View className="bg-secondary/10 px-2 py-1 rounded">
                    <Text className="text-secondary font-bold text-xs">2nd: {spot.winCount2nd}</Text>
                  </View>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating UI Elements */}
      <View className="absolute top-12 left-4 right-4 flex-row gap-2">
        <View className="flex-1 bg-white h-12 rounded-xl shadow-md flex-row items-center px-4">
          <Search size={20} color="#757575" />
          <Text className="text-text-light ml-2">Search for lucky spots...</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={moveToCurrentLocation}
        className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white items-center justify-center shadow-lg border border-gray-100"
      >
        <LocateFixed size={24} color="#4CAF50" />
      </TouchableOpacity>
    </View>
  );
}