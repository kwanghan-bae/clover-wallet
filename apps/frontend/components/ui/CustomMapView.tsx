import React from 'react';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { LottoSpot, Region } from '../../api/types/spots';

interface CustomMapViewProps {
  region: Region;
  onRegionChangeComplete: (region: Region) => void;
  spots: LottoSpot[];
  children?: React.ReactNode;
}

export default function CustomMapView({ region, onRegionChangeComplete, spots, children }: CustomMapViewProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      className="w-full h-full"
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
          pinColor="#4CAF50"
        >
          <Callout tooltip>
            {children ? (
               React.cloneElement(children as React.ReactElement, { spot })
            ) : null}
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
