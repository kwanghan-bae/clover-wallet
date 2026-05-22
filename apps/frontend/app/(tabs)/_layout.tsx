import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, ReceiptText, MapPin, Users, User, QrCode } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

const hash = '#';
const COLORS = {
  emeraldStart: hash + '34D399',
  emeraldEnd: hash + '059669',
  glow: hash + '10B981',
};

const TabLayout = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.emeraldStart,
        tabBarInactiveTintColor: isDark ? hash + '888888' : hash + '999999',
        tabBarLabelStyle: { fontSize: 11, fontFamily: 'NotoSansKR_700Bold', marginBottom: 5 },
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
          height: 65,
          paddingTop: 5,
          elevation: 0,
        },
        tabBarBackground: () => <BlurView intensity={isDark ? 35 : 65} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />,
      }}>
        <Tabs.Screen name="index" options={{ title: '홈', tabBarIcon: ({ color }) => <Home size={22} color={color} />, tabBarAccessibilityLabel: '홈 탭' }} />
        <Tabs.Screen name="history" options={{ title: '내 로또', tabBarIcon: ({ color }) => <ReceiptText size={22} color={color} />, tabBarAccessibilityLabel: '내 로또 기록 탭' }} />
        <Tabs.Screen name="scan_dummy" options={{ title: '', tabBarButton: () => <View style={{ width: 70 }} /> }} />
        <Tabs.Screen name="community" options={{ title: '커뮤니티', tabBarIcon: ({ color }) => <Users size={22} color={color} />, tabBarAccessibilityLabel: '커뮤니티 탭', tabBarButtonTestID: 'tab-community' }} />
        <Tabs.Screen name="map" options={{ title: '명당', tabBarIcon: ({ color }) => <MapPin size={22} color={color} />, tabBarAccessibilityLabel: '명당 지도 탭', tabBarButtonTestID: 'tab-map' }} />
        <Tabs.Screen name="mypage" options={{ title: '마이', tabBarIcon: ({ color }) => <User size={22} color={color} />, tabBarAccessibilityLabel: '마이페이지 탭', tabBarButtonTestID: 'tab-mypage' }} />
      </Tabs>

      <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, alignItems: 'center', justifyContent: 'center', zIndex: 99 }}>
        <TouchableOpacity onPress={() => router.push('/scan')} activeOpacity={0.85} accessibilityLabel="QR 스캔" accessibilityRole="button" testID="tab-scan" style={{ marginBottom: 35 }}>
          <LinearGradient
            colors={[COLORS.emeraldStart, COLORS.emeraldEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: COLORS.glow,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 10,
              elevation: 8,
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.4)',
            }}
          >
            <QrCode size={26} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default TabLayout;



