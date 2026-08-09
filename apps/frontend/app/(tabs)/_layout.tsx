import React from "react";
import { Tabs, useRouter } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import {
  Home,
  ReceiptText,
  MapPin,
  Users,
  User,
  QrCode,
} from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

/**
 * @description 하단 탭 바를 포함한 메인 레이아웃 컴포넌트입니다.
 * 홈, 내 로또, 스캔(중앙 버튼), 커뮤니티, 명당, 마이페이지 탭을 관리합니다.
 */
const TabLayout = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#4CAF50",
          tabBarInactiveTintColor: isDark ? "#888888" : "#9E9E9E",
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: "NotoSansKR_700Bold",
            marginBottom: 5,
          },
          tabBarStyle: {
            backgroundColor: isDark ? "#121212" : "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#333333" : "#E0E0E0",
            height: 65,
            paddingTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "홈",
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            tabBarAccessibilityLabel: "홈 탭",
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "내 로또",
            tabBarIcon: ({ color }) => <ReceiptText size={24} color={color} />,
            tabBarAccessibilityLabel: "내 로또 기록 탭",
          }}
        />

        {/* Placeholder for center button space */}
        <Tabs.Screen
          name="scan_dummy"
          options={{
            title: "",
            tabBarButton: () => <View style={{ width: 70 }} />,
          }}
        />

        <Tabs.Screen
          name="community"
          options={{
            title: "커뮤니티",
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
            tabBarAccessibilityLabel: "커뮤니티 탭",
            tabBarButtonTestID: "tab-community",
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "명당",
            tabBarIcon: ({ color }) => <MapPin size={24} color={color} />,
            tabBarAccessibilityLabel: "명당 지도 탭",
            tabBarButtonTestID: "tab-map",
          }}
        />
        <Tabs.Screen
          name="mypage"
          options={{
            title: "마이",
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            tabBarAccessibilityLabel: "마이페이지 탭",
            tabBarButtonTestID: "tab-mypage",
          }}
        />
      </Tabs>

      {/* Actual Floating Center Button */}
      <View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 h-[90px] items-center justify-center z-[99]"
      >
        <TouchableOpacity
          onPress={() => router.push("/scan")}
          activeOpacity={0.9}
          accessibilityLabel="QR 스캔"
          accessibilityRole="button"
          testID="tab-scan"
          className="w-[60px] h-[60px] rounded-full justify-center items-center mb-[35px] shadow-lg shadow-black/30"
          style={{
            backgroundColor: "#FFC107", // Flutter's secondaryColor (Gold) - keeping inline to avoid extending theme just for this specific brand color unless necessary
            elevation: 8,
          }}
        >
          <QrCode size={30} color="white" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default TabLayout;
