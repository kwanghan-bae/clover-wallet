import React, { memo } from 'react';
import { View } from 'react-native';
import { Dices, QrCode, BarChart3, MapPin } from 'lucide-react-native';
import { QuickActionCard } from '../ui/QuickActionCard';
import { SectionHead } from '../ui/SectionHead';

export interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

const QuickActionsComponent = ({ onNavigate }: QuickActionsProps) => (
  <>
    <SectionHead title="빠른 실행" />
    <View className="flex-row gap-2">
      <QuickActionCard
        icon={<Dices size={20} color="#6A1B9A" />}
        label="번호 추첨"
        tone="purple"
        onPress={() => onNavigate('/number-generation')}
      />
      <QuickActionCard
        icon={<QrCode size={20} color="#1565C0" />}
        label="QR 스캔"
        tone="blue"
        onPress={() => onNavigate('/scan')}
      />
      <QuickActionCard
        icon={<BarChart3 size={20} color="#E65100" />}
        label="번호 분석"
        tone="orange"
        onPress={() => onNavigate('/statistics')}
      />
      <QuickActionCard
        icon={<MapPin size={20} color="#2E7D32" />}
        label="로또 명당"
        tone="green"
        onPress={() => onNavigate('/(tabs)/map')}
      />
    </View>
  </>
);

export const QuickActions = memo(QuickActionsComponent);
