import React from 'react';
import { View, Text } from 'react-native';
import { LottoSpot, Region } from '../../api/types/spots';

interface CustomMapViewProps {
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  spots: LottoSpot[];
  children?: React.ReactNode;
}

export default function CustomMapView({ region, spots }: CustomMapViewProps) {
  return (
    <View className="flex-1 bg-gray-100 items-center justify-center">
      <Text className="text-gray-500 font-bold mb-4">Maps are currently available on Mobile App.</Text>
      <View className="w-full px-4">
        {spots.map((spot) => (
          <View key={spot.id} className="bg-white p-4 rounded-xl mb-2 border border-gray-200">
            <Text className="font-bold">{spot.name}</Text>
            <Text className="text-xs text-gray-500">{spot.address}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
