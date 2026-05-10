import React, { memo } from 'react';
import { View, Alert } from 'react-native';
import {
  Settings,
  Bell,
  ShieldCheck,
  Info,
  LogOut,
  UserX,
} from 'lucide-react-native';
import { MyPageMenuItem, MyPageMenuDivider } from '../ui/MyPageMenuItem';

export interface MenuSectionProps {
  unreadCount: number;
  onNavigateNotifications: () => void;
  onLogout: () => void;
}

/** @description 마이페이지 하단 설정 메뉴 리스트 섹션입니다. */
const MenuSectionComponent = ({
  unreadCount,
  onNavigateNotifications,
  onLogout,
}: MenuSectionProps) => (
  <View className="px-5" testID="menu-section">
    <View className="bg-white rounded-[24px] overflow-hidden shadow-card border border-border-hairline">
      <MyPageMenuItem
        icon={<Bell size={20} color="#1A1A1A" />}
        label="알림"
        onPress={onNavigateNotifications}
        badge={unreadCount > 0 ? unreadCount : undefined}
      />
      <MyPageMenuDivider />
      <MyPageMenuItem icon={<Settings size={20} color="#1A1A1A" />} label="계정 설정" />
      <MyPageMenuDivider />
      <MyPageMenuItem icon={<Bell size={20} color="#1A1A1A" />} label="알림 설정" />
      <MyPageMenuDivider />
      <MyPageMenuItem icon={<ShieldCheck size={20} color="#1A1A1A" />} label="개인정보 처리방침" onPress={() => Alert.alert('개인정보 처리방침', '준비 중입니다.')} />
      <MyPageMenuDivider />
      <MyPageMenuItem icon={<Info size={20} color="#1A1A1A" />} label="앱 정보" />
      <MyPageMenuDivider />
      <MyPageMenuItem
        icon={<LogOut size={20} color="#1A1A1A" />}
        label="로그아웃"
        onPress={() => Alert.alert(
          "로그아웃",
          "정말로 로그아웃 하시겠습니까?",
          [
            { text: "취소", style: "cancel" },
            { text: "로그아웃", style: "destructive", onPress: onLogout },
          ]
        )}
      />
      <MyPageMenuDivider />
      <MyPageMenuItem
        icon={<UserX size={20} color="#FF5252" />}
        label="회원 탈퇴"
        isDestructive
        onPress={() => Alert.alert("회원 탈퇴", "모든 데이터가 삭제되며 복구할 수 없습니다.")}
      />
    </View>
  </View>
);

export const MenuSection = memo(MenuSectionComponent);
