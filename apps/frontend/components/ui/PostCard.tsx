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

  const handleUserProfilePress = () => router.push(`/user/${post.userSummary.id}`);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(post.id)}
      className="bg-surface rounded-card-lg p-5 mb-5 shadow-card"
      accessibilityRole="button"
      accessibilityLabel={`${post.title ? post.title + ' ' : ''}${post.content.substring(0, 20)} 게시글 보기`}
    >
      {/* Header */}
      <View className="flex-row items-start mb-4">
        <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} className="mr-3" accessibilityRole="button" accessibilityLabel={`${nickname} 프로필 보기`}>
          <View className="w-10 h-10 rounded-full bg-[#4CAF50]/10 items-center justify-center">
            <AppText variant="title" className="text-primary-text">{initial}</AppText>
          </View>
        </TouchableOpacity>
        <View className="flex-1">
          <TouchableOpacity activeOpacity={0.7} onPress={handleUserProfilePress} accessibilityRole="button" accessibilityLabel={`${nickname} 프로필 보기`}>
            <AppText variant="title" className="text-text-primary text-[15px]">{nickname}</AppText>
          </TouchableOpacity>
          <AppText variant="body" className="text-text-muted text-[12px] mt-0.5">{dateStr}</AppText>
        </View>
        <PostCardMenu postId={post.id} isOwner={isOwner} />
      </View>

      {post.title ? (
        <AppText variant="title" className="text-text-primary mb-1" numberOfLines={1}>{post.title}</AppText>
      ) : null}

      <AppText variant="body" className="text-text-primary text-[15px] leading-[22.5px] mb-4" numberOfLines={4}>{post.content}</AppText>

      <View className="h-[1px] bg-[#F5F5F5] mb-3" />

      {/* Footer / Actions */}
      <View className="flex-row items-center px-1">
        <TouchableOpacity onPress={() => onLike?.(post.id)} className="flex-row items-center mr-5" activeOpacity={0.6} accessibilityRole="button" accessibilityLabel={post.isLiked ? '좋아요 취소' : '좋아요'}>
          <Heart size={18} color={post.isLiked ? "#EF5350" : "#9E9E9E"} fill={post.isLiked ? "#EF5350" : "transparent"} />
          <AppText variant="body" className={`ml-1.5 ${post.isLiked ? 'text-[#EF5350]' : 'text-text-muted'}`}>{post.likes}</AppText>
        </TouchableOpacity>
        <View className="flex-row items-center mr-5" accessible={true} accessibilityLabel={`댓글 ${commentCount}개`}>
          <MessageCircle size={18} color="#9E9E9E" />
          <AppText variant="body" className="ml-1.5 text-text-muted">{commentCount}</AppText>
        </View>
        <View className="flex-1" />
        <TouchableOpacity onPress={() => onShare?.(post.id)} className="p-1" accessibilityRole="button" accessibilityLabel="공유하기">
          <Share2 size={18} color="#BDBDBD" />
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
