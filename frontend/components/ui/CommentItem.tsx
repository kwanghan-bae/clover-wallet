// frontend/components/ui/CommentItem.tsx
import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Reply } from 'lucide-react-native';

interface CommentData {
  id: number;
  content: string;
  likes: number;
  createdAt: string;
  user?: { id: number; ssoQualifier: string };
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  isReply?: boolean;
  onReply: (parentId: number) => void;
  onUserPress: (userId: number) => void;
}

const CommentItemComponent = ({ comment, isReply = false, onReply, onUserPress }: CommentItemProps) => {
  const nickname = comment.user?.ssoQualifier?.split('@')[0] ?? '익명';
  const date = new Date(comment.createdAt).toLocaleDateString('ko-KR');

  return (
    <View className={`${isReply ? 'ml-8 border-l-2 border-gray-200 dark:border-dark-card pl-3' : ''} mb-3`}>
      <View className="flex-row items-center gap-2 mb-1">
        <Pressable onPress={() => comment.user && onUserPress(comment.user.id)} accessibilityLabel={`${nickname} 프로필 보기`} accessibilityRole="button">
          <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-xs font-bold">{nickname[0]}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => comment.user && onUserPress(comment.user.id)} accessibilityLabel={`${nickname} 프로필 보기`} accessibilityRole="link">
          <Text className="text-sm font-bold text-text-dark dark:text-dark-text">{nickname}</Text>
        </Pressable>
        <Text className="text-xs text-text-grey dark:text-dark-text-secondary">{date}</Text>
      </View>
      <Text className="text-sm text-text-dark dark:text-dark-text ml-8">{comment.content}</Text>
      {!isReply && (
        <Pressable onPress={() => onReply(comment.id)} className="flex-row items-center gap-1 ml-8 mt-1" accessibilityLabel="답글 달기" accessibilityRole="button">
          <Reply size={14} color="#757575" />
          <Text className="text-xs text-text-grey dark:text-dark-text-secondary">답글</Text>
        </Pressable>
      )}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id.toString()}
          comment={reply}
          isReply={true}
          onReply={onReply}
          onUserPress={onUserPress}
        />
      ))}
    </View>
  );
};

export const CommentItem = memo(CommentItemComponent);
CommentItem.displayName = 'CommentItem';
