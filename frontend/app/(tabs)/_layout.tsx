import React from 'react';
import { Tabs } from 'expo-router';
import { Home, History, MapPin, Users } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: '#757575',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Lucky Spot',
          tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
