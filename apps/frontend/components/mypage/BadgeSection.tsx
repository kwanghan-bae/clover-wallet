import React, { memo } from 'react';
import { View, Text } from 'react-native';
import {
  Trophy,
  Flame,
  CheckCircle2,
  Star,
} from 'lucide-react-native';

/** @description badge key -> icon/color mapping */
const BADGE_CONFIG: Record<string, { label: string; icon: React.ReactElement; color: string }> = {
  first_win: { label: '첫 당첨', icon: <Trophy size={20} color="#FFC107" />, color: 'bg-amber-50' },
  passion: { label: '열정', icon: <Flame size={20} color="#FF5252" />, color: 'bg-red-50' },
  verified: { label: '인증됨', icon: <CheckCircle2 size={20} color="#2196F3" />, color: 'bg-blue-50' },
  vip: { label: 'VIP', icon: <Star size={20} color="#9C27B0" />, color: 'bg-purple-50' },
};

export interface BadgeSectionProps {
  /** 쉼표로 구분된 뱃지 키 문자열 (예: "first_win,passion") */
  badgeKeys: string;
}

/** @description 사용자의 뱃지 목록을 그리드로 표시하는 섹션 컴포넌트입니다. */
const BadgeSectionComponent = ({ badgeKeys }: BadgeSectionProps) => {
  const badges = badgeKeys
    ? badgeKeys.split(',').map(key => key.trim()).filter(Boolean)
    : [];

  if (badges.length === 0) return null;

  return (
    <View className="px-5 mb-8" testID="badge-section">
      <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] mb-4">
        내 뱃지
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {badges.map(key => {
          const config = BADGE_CONFIG[key];
          if (!config) return null;
          return (
            <View key={key} className="items-center" testID={`badge-${key}`}>
              <View className={`${config.color} w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                {config.icon}
              </View>
              <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-xs text-[#757575]">
                {config.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const BadgeSection = memo(BadgeSectionComponent);
