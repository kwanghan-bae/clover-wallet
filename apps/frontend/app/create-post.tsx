import React, { useState, useMemo } from 'react';
import { ScrollView, Alert, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppBar } from '../components/ui/AppBar';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Input } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { PostNumbersPreview } from '../components/ui/PostNumbersPreview';
import { communityApi } from '../api/community';
import { Logger } from '../utils/logger';
import * as Haptics from 'expo-haptics';

export interface PrefillNumbers {
  games: { numbers: number[] }[];
  method?: string;
}

export const parsePrefill = (raw?: string): PrefillNumbers | null => {
  if (!raw) return null;
  // expected format: "추천 번호 (Ngame):\n<game lines>\n\n<method> 방식으로 생성했습니다!"
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const gameLines = lines.filter(l => /^[A-Z]?:?\s*\d/.test(l) || /^\d/.test(l));
  const methodLine = lines.find(l => l.includes('방식으로'));
  const games = gameLines.map(line => {
    const numStr = line.replace(/^[A-Z]:\s*/, '');
    const numbers = numStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return { numbers };
  }).filter(g => g.numbers.length === 6);
  if (games.length === 0) return null;
  const method = methodLine?.replace('방식으로 생성했습니다!', '').trim();
  return { games, method };
};

const CreatePostScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { prefillTitle, prefillContent } = useLocalSearchParams<{ prefillTitle?: string; prefillContent?: string }>();
  const [title, setTitle] = useState(prefillTitle ?? '');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const prefillNumbers = useMemo(() => parsePrefill(prefillContent), [prefillContent]);

  const handleSubmit = async () => {
    if (!title.trim() || (!content.trim() && !prefillNumbers)) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const finalContent = prefillNumbers
        ? `${prefillContent}${content.trim() ? `\n\n${content.trim()}` : ''}`
        : content.trim();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await communityApi.createPost(title.trim(), finalContent);
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      router.back();
    } catch (error) {
      Alert.alert('오류', '게시물 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      Logger.error('CreatePost', '게시물 등록 중 오류가 발생했습니다.', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['top', 'bottom', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar variant="modal" title="글 작성" onClosePress={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={56}
      >
        <ScrollView className="flex-1 px-5 pt-3" keyboardShouldPersistTaps="handled">
          <Input
            testID="input-title"
            placeholder="제목"
            value={title}
            onChangeText={setTitle}
            className="border-0 border-b border-border-hairline px-0 text-title-lg font-extrabold mb-4"
          />
          {prefillNumbers ? (
            <PostNumbersPreview games={prefillNumbers.games} method={prefillNumbers.method} />
          ) : null}
          <Input
            testID="input-content"
            placeholder="내 이야기를 써보세요"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="border-0 px-0 h-40"
          />
        </ScrollView>
        <View className="px-5 pb-5 pt-3 border-t border-border-hairline">
          <PrimaryButton label="게시하기" onPress={handleSubmit} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default CreatePostScreen;
