import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Dices, QrCode, BarChart3, Navigation, MapPin } from 'lucide-react-native';
import { QuickActionItem } from '../ui/QuickActionItem';

export interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

/** @description 홈 화면의 5개 빠른 실행 액션 그리드 컴포넌트입니다. */
const QuickActionsComponent = ({ onNavigate }: QuickActionsProps) => (
  <>
    <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text mt-8 mb-4">
      빠른 실행
    </Text>
    <View className="flex-row justify-between w-full" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <QuickActionItem
        icon={<Dices size={32} color="#9C27B0" />}
        label="번호 추첨"
        bgColor="bg-[#9C27B0]/10"
        onPress={() => onNavigate('/number-generation')}
      />
      <QuickActionItem
        icon={<QrCode size={32} color="#2196F3" />}
        label="QR 스캔"
        bgColor="bg-[#2196F3]/10"
        onPress={() => onNavigate('/scan')}
      />
      <QuickActionItem
        icon={<BarChart3 size={32} color="#FF9800" />}
        label="번호 분석"
        bgColor="bg-[#FF9800]/10"
        onPress={() => onNavigate('/statistics')}
      />
      <QuickActionItem
        icon={<Navigation size={32} color="#00BCD4" />}
        label="여행 플랜"
        bgColor="bg-[#00BCD4]/10"
        onPress={() => onNavigate('/travel')}
      />
      <QuickActionItem
        icon={<MapPin size={32} color="#4CAF50" />}
        label="로또 명당"
        bgColor="bg-[#4CAF50]/10"
        onPress={() => onNavigate('/map')}
      />
    </View>
  </>
);

export const QuickActions = memo(QuickActionsComponent);
