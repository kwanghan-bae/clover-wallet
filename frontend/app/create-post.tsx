import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X } from 'lucide-react-native';
import { Input } from '../components/ui/Input';
import { PrimaryButton } from '../components/ui/PrimaryButton';

export default function CreatePostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // TODO: Connect to communityApi.createPost()
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1000);
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
}
