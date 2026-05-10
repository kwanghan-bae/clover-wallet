import React, { memo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { MessageSquare } from 'lucide-react-native';
import { PostCard } from '../ui/PostCard';
import { EmptyState } from '../ui/EmptyState';
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
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 96 }}
      ListEmptyComponent={
        <View className="px-5">
          <EmptyState
            icon={<MessageSquare size={24} color="#2E7D32" />}
            title="아직 게시물이 없습니다"
            description="첫 번째 게시물의 주인공이 되어보세요!"
            cta={{ label: '게시물 작성하기', onPress: onCreatePost }}
          />
        </View>
      }
    />
  </View>
);

export const FeedList = memo(FeedListComponent);
