import React, { useState } from 'react';
import { View, TouchableOpacity, Share, Alert } from 'react-native';
import { Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, Post } from '../../api/community';
import { FeedTabSelector, FeedType } from '../../components/community/FeedTabSelector';
import { FeedList } from '../../components/community/FeedList';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { AppText } from '../../components/ui/AppText';
import { Logger } from '../../utils/logger';
import { useTheme } from '../../hooks/useTheme';

/**
 * @description 사용자들 간의 로또 관련 정보 공유 및 소통을 위한 커뮤니티 화면입니다.
 */
const CommunityScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [feedType, setFeedType] = useState<FeedType>('all');
  const { isDark } = useTheme();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['communityPosts', feedType],
    queryFn: () => feedType === 'all' ? communityApi.getPosts(0, 20) : communityApi.getFeed(0, 20),
  });

  const posts: Post[] = data?.content ?? [];

  const likeMutation = useMutation({
    mutationFn: (id: number) => communityApi.likePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communityPosts', feedType] }),
    onError: () => Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.'),
  });

  const handleShare = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      try {
        await Share.share({ message: `${post.userSummary?.nickname}님의 게시물: ${post.content}` });
      } catch (error) {
        Logger.error('Community', '게시글 공유 중 오류가 발생했습니다.', error);
      }
    }
  };

  return (
    <ScreenContainer>
      <View className="flex-row justify-between items-center px-5 h-14">
        <AppText
          variant="title-lg"
          className="text-text-primary dark:text-dark-text"
        >
          커뮤니티
        </AppText>
        <TouchableOpacity
          onPress={() => router.push('/create-post')}
          accessibilityLabel="새 게시글 작성"
          accessibilityRole="button"
          activeOpacity={0.7}
          testID="fab-create-post"
          className="w-9 h-9 rounded-md items-center justify-center bg-text-primary/[0.04]"
        >
          <Edit3 size={18} color={isDark ? '#E0E0E0' : '#0F1115'} />
        </TouchableOpacity>
      </View>

      <FeedTabSelector feedType={feedType} onSelect={setFeedType} />
      <FeedList
        posts={posts}
        isLoading={isLoading}
        onRefresh={refetch}
        onLike={(id) => likeMutation.mutate(id)}
        onShare={handleShare}
        onCreatePost={() => router.push('/create-post')}
      />
    </ScreenContainer>
  );
};

export default CommunityScreen;
