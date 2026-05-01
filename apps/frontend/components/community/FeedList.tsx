import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { Edit3, MessageSquare } from 'lucide-react-native';
import { PostCard } from '../ui/PostCard';
import { Post } from '../../api/community';

export interface FeedListProps {
  posts: Post[];
  isLoading: boolean;
  onRefresh: () => void;
  onLike: (id: number) => void;
  onShare: (id: number) => void;
  onCreatePost: () => void;
}

/** @description 커뮤니티 게시글 피드 리스트 (FlashList + PostCard) */
const FeedListComponent = ({
  posts,
  isLoading,
  onRefresh,
  onLike,
  onShare,
  onCreatePost,
}: FeedListProps) => (
  <View className="flex-1">
    <FlashList
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PostCard post={item} onPress={() => {}} onLike={onLike} onShare={onShare} />
      )}
      showsVerticalScrollIndicator={false}
      onRefresh={onRefresh}
      refreshing={isLoading}
      contentContainerStyle={{ padding: 20 }}
      ListEmptyComponent={
        <View className="items-center justify-center py-32" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View className="w-24 h-24 bg-[#4CAF50]/5 rounded-full items-center justify-center mb-8" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={48} color="rgba(76, 175, 80, 0.4)" />
          </View>
          <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-lg text-[#1A1A1A] dark:text-dark-text">
            아직 게시물이 없습니다
          </Text>
          <Text style={{ fontFamily: 'NotoSansKR_400Regular' }} className="text-[#BDBDBD] dark:text-dark-text-secondary mt-2 text-center">
            첫 번째 게시물의 주인공이 되어보세요!
          </Text>
          <TouchableOpacity
            onPress={onCreatePost}
            activeOpacity={0.8}
            className="mt-10 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="게시물 작성하기"
          >
            <LinearGradient
              colors={['#4CAF50', '#388E3C']}
              className="px-8 py-3.5 rounded-full"
              style={{ shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
            >
              <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Edit3 size={18} color="white" className="mr-2" />
                <Text style={{ fontFamily: 'NotoSansKR_700Bold' }} className="text-white text-base">게시물 작성하기</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      }
    />
  </View>
);

export const FeedList = memo(FeedListComponent);
