import React from 'react';
import { View } from 'react-native';
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

const hash = '#';
const TONE_THEMES: Record<Tone, { start: string; end: string; glow: string }> = {
  green:  { start: hash + '34D399', end: hash + '059669', glow: hash + '10B981' },
  blue:   { start: hash + '60A5FA', end: hash + '2563EB', glow: hash + '3B82F6' },
  orange: { start: hash + 'FBBF24', end: hash + 'D97706', glow: hash + 'F59E0B' },
  purple: { start: hash + 'C084FC', end: hash + '7C3AED', glow: hash + '8B5CF6' },
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  label,
  tone,
  onPress,
}) => {
  const theme = TONE_THEMES[tone];
  
  // Clone the icon to enforce size and white color for a unified high-contrast premium widget style
  const clonedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, { color: 'white', size: 20 })
    : icon;

  return (
    <PressableCard
      onPress={onPress}
      accessibilityLabel={label}
      className="flex-1 items-center justify-center py-4 px-2 rounded-2xl bg-white/70 dark:bg-[#1E293B]/70 border border-white/40 dark:border-white/10"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View 
        style={{
          borderRadius: 14,
          shadowColor: theme.glow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 4,
          marginBottom: 10,
        }}
      >
        <LinearGradient
          colors={[theme.start, theme.end]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            alignItems: 'center', 
            justifyContent: 'center',
          }}
        >
          {clonedIcon}
        </LinearGradient>
      </View>
      <AppText 
        variant="label" 
        className="text-text-primary dark:text-dark-text font-bold text-[13px] tracking-tight text-center"
      >
        {label}
      </AppText>
    </PressableCard>
  );
};

QuickActionCard.displayName = 'QuickActionCard';
