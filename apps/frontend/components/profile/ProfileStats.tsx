import React, { memo } from 'react';
import { View, Text } from 'react-native';

export interface FollowCounts {
  followers: number;
  following: number;
}

export interface ProfileStatsProps {
  followCounts?: FollowCounts | null;
}

/** @description 팔로워/팔로잉 카운트 표시 컴포넌트입니다. */
const ProfileStatsComponent = ({ followCounts }: ProfileStatsProps) => (
  <View className="flex-row mb-5" testID="profile-stats">
    <View className="mr-6 items-center">
      <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] dark:text-dark-text text-base">
        {followCounts?.followers ?? 0}
      </Text>
      <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#9E9E9E] dark:text-dark-text-secondary text-xs mt-0.5">
        팔로워
      </Text>
    </View>
    <View className="items-center">
      <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-[#1A1A1A] dark:text-dark-text text-base">
        {followCounts?.following ?? 0}
      </Text>
      <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#9E9E9E] dark:text-dark-text-secondary text-xs mt-0.5">
        팔로잉
      </Text>
    </View>
  </View>
);

export const ProfileStats = memo(ProfileStatsComponent);
