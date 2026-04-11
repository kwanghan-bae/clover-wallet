import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface QuickActionItemProps {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * @description 홈 화면의 하단 퀵 액션 섹션에서 개별 메뉴 아이템을 렌더링하는 컴포넌트입니다.
 */
export function QuickActionItem({ icon, label, bgColor, onPress, accessibilityLabel }: QuickActionItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      <View className={`${bgColor} p-4 rounded-[20px] mb-2`}>
        {icon}
      </View>
      <Text style={{ fontFamily: 'NotoSansKR_600SemiBold' }} className="text-[13px] text-[#1A1A1A]">{label}</Text>
    </TouchableOpacity>
  );
}
