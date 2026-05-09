import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { cn } from '../../utils/cn';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  edges?: Edge[];
  scroll?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className,
  edges = ['top', 'left', 'right'],
}) => (
  <SafeAreaView
    edges={edges}
    className={cn('flex-1 bg-surface-muted dark:bg-dark-bg', className)}
  >
    <View className="flex-1">{children}</View>
  </SafeAreaView>
);

ScreenContainer.displayName = 'ScreenContainer';
