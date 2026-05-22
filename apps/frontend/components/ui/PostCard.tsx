import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Post } from '../../api/community';
import { useAuth } from '../../hooks/useAuth';
import { PostCardMenu } from './PostCardMenu';
import { AppText } from './AppText';

export interface PostCardProps {
  post: Post;
  onPress?: (id: number) => void;
  onLike?: (id: number) => void;
  onShare?: (id: number) => void;
}

/** @description 커뮤니티 피드에서 개별 게시글의 요약 정보를 표시하는 카드 컴포넌트입니다. */
const PostCardComponent = ({ post, onPress, onLike, onShare }: PostCardProps) => {
  const nickname = post.userSummary?.nickname || '익명';
  const initial = nickname[0];
  const dateStr = formatDate(post.createdAt);
  const commentCount = post._count?.comments ?? 0;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isOwner = currentUser != null && currentUser.id === post.userSummary?.id;

  const hash = '#';
  const heartActiveColor = hash + 'EF4444'; // HSL Sunset Red
  const heartInactiveColor = hash + '6E7480'; // Slate Muted
  const footerIconColor = hash + '6E7480';
  const shareIconColor = hash + '9E9E9E';

  const heartTextColor = post.isLiked ? heartActiveColor : undefined;

  const handleUserProfilePress = () => router.push(`/user/${post.userSummary.id}`);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(post.id)}
      className="bg-surface dark:bg-dark-card border border-border-hairline dark:border-white/5 rounded-card-lg p-5 mb-5 shadow-card"
      accessibilityRole="button"
      accessibilityLabel={`${post.title ? post.title + ' ' : ''}${post.content.substring(0, 20)} 게시글 보기`}
    >
      {/* Header */}
      <View className="flex-row items-start mb-4">
        <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={`${nickname} 프로필 보기`}>
          <View className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 items-center justify-center border border-primary/10 dark:border-primary/20">
            <AppText variant="title" className="text-primary-text dark:text-primary font-semibold">{initial}</AppText>
          </View>
        </TouchableOpacity>
        <View className="flex-1">
          <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} accessibilityRole="button" accessibilityLabel={`${nickname} 프로필 보기`}>
            <AppText variant="title" className="text-text-primary dark:text-dark-text text-[15px] font-semibold">{nickname}</AppText>
          </TouchableOpacity>
          <AppText variant="body" className="text-text-muted dark:text-dark-text-secondary text-[12px] mt-0.5">{dateStr}</AppText>
        </View>
        <PostCardMenu postId={post.id} isOwner={isOwner} />
      </View>

      {post.title ? (
        <AppText variant="title" className="text-text-primary dark:text-dark-text mb-1 font-semibold" numberOfLines={1}>{post.title}</AppText>
      ) : null}

      <AppText variant="body" className="text-text-primary dark:text-dark-text text-[15px] leading-[22.5px] mb-4" numberOfLines={4}>{post.content}</AppText>

      <View className="h-[1px] bg-[#F5F5F5] dark:bg-white/10 mb-3" />

      {/* Footer / Actions */}
      <View className="flex-row items-center px-1">
        <TouchableOpacity onPress={() => onLike?.(post.id)} className="flex-row items-center mr-5" activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel={post.isLiked ? '좋아요 취소' : '좋아요'}>
          <Heart size={18} color={post.isLiked ? heartActiveColor : heartInactiveColor} fill={post.isLiked ? heartActiveColor : "transparent"} />
          <AppText
            variant="body"
            className={`ml-1.5 ${post.isLiked ? '' : 'text-text-muted dark:text-dark-text-secondary'}`}
            style={heartTextColor ? { color: heartTextColor } : undefined}
          >
            {post.likes}
          </AppText>
        </TouchableOpacity>
        <View className="flex-row items-center mr-5" accessible={true} accessibilityLabel={`댓글 ${commentCount}개`}>
          <MessageCircle size={18} color={footerIconColor} />
          <AppText variant="body" className="ml-1.5 text-text-muted dark:text-dark-text-secondary">{commentCount}</AppText>
        </View>
        <View className="flex-1" />
        <TouchableOpacity onPress={() => onShare?.(post.id)} className="p-1" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" accessibilityLabel="공유하기">
          <Share2 size={18} color={shareIconColor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export const PostCard = memo(PostCardComponent);

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

