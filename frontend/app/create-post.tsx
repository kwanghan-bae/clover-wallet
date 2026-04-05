import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { Input } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/community';

/**
 * @description 커뮤니티에 새로운 게시물을 작성하고 등록하는 화면입니다.
 */
const CreatePostScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { prefillTitle, prefillContent } = useLocalSearchParams<{ prefillTitle?: string; prefillContent?: string }>();
  const [title, setTitle] = useState(prefillTitle ?? '');
  const [content, setContent] = useState(prefillContent ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await communityApi.createPost(title.trim(), content.trim());
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      router.back();
    } catch (error) {
      Alert.alert('오류', '게시물 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{
        headerShown: true,
        title: 'Create Post',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color="#212121" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={handleSubmit}>
            <Text className="text-primary font-bold text-lg">Post</Text>
          </TouchableOpacity>
        )
      }} />

      <ScrollView className="flex-1 p-4 gap-4">
        <Input
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          className="border-0 border-b border-gray-100 px-0 text-xl font-bold"
        />
        <Input
          placeholder="What's on your mind?"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
          className="border-0 px-0 h-60"
        />
      </ScrollView>

      <View className="p-4 border-t border-gray-50">
        <PrimaryButton
          label="Post Story"
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default CreatePostScreen;
