import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type FeedType = 'all' | 'following';

export interface FeedTabSelectorProps {
  feedType: FeedType;
  onSelect: (type: FeedType) => void;
}

/** @description 전체/팔로잉 피드 전환 탭 셀렉터 컴포넌트입니다. */
const FeedTabSelectorComponent = ({ feedType, onSelect }: FeedTabSelectorProps) => (
  <View className="flex-row mx-5 mt-3 mb-1 bg-[#F0F0F0] dark:bg-dark-surface rounded-full p-1">
    {(['all', 'following'] as const).map((type) => {
      const isActive = feedType === type;
      const label = type === 'all' ? '전체' : '팔로잉';
      return (
        <TouchableOpacity
          key={type}
          onPress={() => onSelect(type)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: isActive }}
          className={`flex-1 py-2 rounded-full items-center ${isActive ? 'bg-white dark:bg-dark-card' : ''}`}
          style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : undefined}
        >
          <Text
            style={{ fontFamily: 'NotoSansKR_700Bold' }}
            className={`text-sm ${isActive ? 'text-[#1A1A1A] dark:text-dark-text' : 'text-[#9E9E9E] dark:text-dark-text-secondary'}`}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const FeedTabSelector = memo(FeedTabSelectorComponent);
