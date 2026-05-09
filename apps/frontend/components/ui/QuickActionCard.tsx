import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableCard } from './PressableCard';
import { AppText } from './AppText';

type Tone = 'green' | 'blue' | 'orange' | 'purple';

interface QuickActionCardProps {
  icon: React.ReactNode;
  label: string;
  tone: Tone;
  onPress: () => void;
}

const TONE_GRADIENTS: Record<Tone, [string, string]> = {
  green:  ['rgba(76,175,80,0.16)',  'rgba(76,175,80,0.04)'],
  blue:   ['rgba(33,150,243,0.16)', 'rgba(33,150,243,0.04)'],
  orange: ['rgba(255,152,0,0.16)',  'rgba(255,152,0,0.04)'],
  purple: ['rgba(156,39,176,0.16)', 'rgba(156,39,176,0.04)'],
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  label,
  tone,
  onPress,
}) => (
  <PressableCard
    onPress={onPress}
    accessibilityLabel={label}
    className="flex-1 items-center py-3.5 px-2"
  >
    <LinearGradient
      colors={TONE_GRADIENTS[tone]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
    >
      {icon}
    </LinearGradient>
    <AppText variant="label" className="text-text-primary dark:text-dark-text text-center">
      {label}
    </AppText>
  </PressableCard>
);

QuickActionCard.displayName = 'QuickActionCard';
