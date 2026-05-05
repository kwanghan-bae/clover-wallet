import React, { memo } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Trash2, MoreHorizontal } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/community';

export interface PostCardMenuProps {
  postId: number;
  isOwner: boolean;
}

/** @description 게시글의 삭제/더보기 메뉴 액션 컴포넌트입니다. */
const PostCardMenuComponent = ({ postId, isOwner }: PostCardMenuProps) => {
  const queryClient = useQueryClient();

  const handleDeletePress = () => {
    Alert.alert(
      '게시글 삭제',
      '이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await communityApi.deletePost(postId);
              queryClient.invalidateQueries({ queryKey: ['communityPosts'], exact: false });
            } catch {
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  if (isOwner) {
    return (
      <TouchableOpacity className="p-2" activeOpacity={0.6} onPress={handleDeletePress} testID="btn-delete-post" accessibilityRole="button" accessibilityLabel="게시글 삭제">
        <Trash2 size={20} color="#EF5350" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity className="p-2" activeOpacity={0.6} testID="btn-more-post" accessibilityRole="button" accessibilityLabel="게시글 더보기">
      <MoreHorizontal size={20} color="#E0E0E0" />
    </TouchableOpacity>
  );
};

export const PostCardMenu = memo(PostCardMenuComponent);
