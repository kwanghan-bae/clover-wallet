import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { AppText } from './AppText';

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
const MyPageMenuItemComponent = ({
  icon,
  label,
  onPress,
  isDestructive = false,
  badge,
}: MenuItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-5 active:bg-surface-muted"
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View className="mr-4">
        {icon}
      </View>
      <AppText variant="body" className={`flex-1 ${isDestructive ? 'text-red-400' : 'text-text-primary'}`}>
        {label}
      </AppText>
      {badge !== undefined && (
        <View className="bg-primary rounded-full min-w-[20px] h-5 items-center justify-center px-1 mr-2">
          <AppText variant="label" className="text-white">
            {badge > 99 ? '99+' : badge}
          </AppText>
        </View>
      )}
      <ChevronRight size={18} color="#E0E0E0" />
    </TouchableOpacity>
  );
};

export const MyPageMenuItem = memo(MyPageMenuItemComponent);
MyPageMenuItem.displayName = 'MyPageMenuItem';

/**
 * @description 메뉴 항목 사이의 구분선 컴포넌트입니다.
 */
export function MyPageMenuDivider() {
  return <View className="h-[1px] bg-border-hairline mx-5" />;
}
