import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Home, ReceiptText, MapPin, Users, User, QrCode } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#757575',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'NotoSansKR_700Bold',
          marginBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 65,
          paddingTop: 5,
        }
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '홈',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: '내 로또',
            tabBarIcon: ({ color }) => <ReceiptText size={24} color={color} />,
          }}
        />

        {/* Placeholder for center button space */}
        <Tabs.Screen
          name="scan_dummy"
          options={{
            title: '',
            tabBarButton: () => <View style={{ width: 70 }} />,
          }}
        />

        <Tabs.Screen
          name="community"
          options={{
            title: '커뮤니티',
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: '명당',
            tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            title: '마이',
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
      </Tabs>

      {/* Actual Floating Center Button */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          activeOpacity={0.9}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#FFC107', // Flutter's secondaryColor (Gold)
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            marginBottom: 35,
          }}
        >
          <QrCode size={30} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
}
