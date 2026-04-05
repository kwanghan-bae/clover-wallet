import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  isDestructive?: boolean;
  badge?: number;
}

/** 
 * @description 마이페이지의 설정 메뉴 리스트에서 개별 메뉴 항목을 렌더링하는 컴포넌트입니다. 
 */
export function MyPageMenuItem({
  icon,
  label,
  onPress,
  isDestructive = false,
  badge,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-5 active:bg-gray-50"
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View className="mr-4">
        {icon}
      </View>
      <Text style={{ fontFamily: 'NotoSansKR_500Medium' }} className={`flex-1 text-base ${isDestructive ? 'text-red-400' : 'text-[#1A1A1A]'}`}>
        {label}
      </Text>
      {badge !== undefined && (
        <View className="bg-[#4CAF50] rounded-full min-w-[20px] h-5 items-center justify-center px-1 mr-2">
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-xs">
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
      <ChevronRight size={18} color="#E0E0E0" />
    </TouchableOpacity>
  );
}

/** 
 * @description 메뉴 항목 사이의 구분선 컴포넌트입니다. 
 */
export function MyPageMenuDivider() {
  return <View className="h-[1px] bg-gray-100 mx-5" />;
}
