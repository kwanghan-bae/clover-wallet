import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Animated, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Sparkles, ChevronLeft } from 'lucide-react-native';
import { generateLottoNumbersWithSeed } from '../utils/lotto';
import { METHODS } from '../constants/generation-methods';
import { GenerationInputModal } from '../components/ui/GenerationInputModal';
import { GenerationResult } from '../components/generation/GenerationResult';
import { MethodSelector } from '../components/generation/MethodSelector';
import { appendToItemArray } from '../utils/storage';

export default function NumberGenerationScreen() {
  const router = useRouter();
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paramInput, setParamInput] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (['DREAM', 'SAJU', 'PERSONAL_SIGNIFICANCE'].includes(methodId)) {
      setParamInput('');
      setIsModalVisible(true);
    } else {
      generateNumbers(methodId);
    }
  };

  const generateNumbers = (methodId: string, param?: string) => {
    const sorted = generateLottoNumbersWithSeed(methodId, param);
    setGeneratedNumbers(sorted);
    setIsModalVisible(false);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  };

  const handleShare = () => {
    const numbersStr = generatedNumbers.join(', ');
    router.push({
      pathname: '/create-post',
      params: {
        prefillTitle: '🍀 오늘의 로또 번호',
        prefillContent: `추천 번호: ${numbersStr}\n\n${METHODS.find(m => m.id === selectedMethod)?.title ?? ''} 방식으로 생성했습니다!`,
      },
    });
  };

  const handleSave = async () => {
    if (generatedNumbers.length === 0) return;
    setIsSaving(true);
    try {
      const record = {
        id: Date.now(),
        numbers: generatedNumbers,
        method: selectedMethod,
        createdAt: new Date().toISOString(),
      };
      appendToItemArray('saved-numbers', record);
      Alert.alert('성공', '번호가 저장되었습니다! 내역 탭에서 확인하세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const methodTitle = METHODS.find(m => m.id === selectedMethod)?.title;

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <Stack.Screen options={{
        title: '행운의 번호 추첨',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <GenerationResult
          numbers={generatedNumbers}
          methodTitle={methodTitle}
          scaleAnim={scaleAnim}
          isSaving={isSaving}
          onSave={handleSave}
          onShare={handleShare}
        />
        <MethodSelector selectedMethod={selectedMethod} onSelect={handleMethodSelect} />
        <GenerationInputModal
          isVisible={isModalVisible}
          methodTitle={methodTitle}
          selectedMethod={selectedMethod}
          paramInput={paramInput}
          setParamInput={setParamInput}
          onCancel={() => setIsModalVisible(false)}
          onConfirm={() => generateNumbers(selectedMethod, paramInput)}
        />
        {/* Tip Section */}
        <View className="bg-amber-50 dark:bg-dark-card rounded-2xl p-4 border border-amber-100 dark:border-dark-card mt-8 mb-10 flex-row">
          <Sparkles size={24} color="#D84315" />
          <View className="flex-1 ml-3">
            <Text className="text-[#5D4037] dark:text-dark-text-secondary text-[13px] leading-5">
              각 방식마다 고유한 알고리즘으로 번호를 생성합니다. 마음에 드는 방법을 선택해보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
