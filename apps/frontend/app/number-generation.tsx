import React, { useState, useRef } from 'react';
import { View, ScrollView, Animated, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { generateLottoGames, saveLottoSet, labelOf } from '../utils/lotto';
import { METHODS } from '../constants/generation-methods';
import { GenerationInputModal } from '../components/ui/GenerationInputModal';
import { GenerationResultCards } from '../components/generation/GenerationResultCards';
import { GameCountToggle, GameCount } from '../components/generation/GameCountToggle';
import { MethodSelector } from '../components/generation/MethodSelector';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { AppBar } from '../components/ui/AppBar';
import { AppText } from '../components/ui/AppText';

export default function NumberGenerationScreen() {
  const router = useRouter();
  const [gameCount, setGameCount] = useState<GameCount>(1);
  const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [lastParam, setLastParam] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paramInput, setParamInput] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const runGenerate = (methodId: string, count: GameCount, param?: string) => {
    const games = generateLottoGames(methodId, count, param);
    setGeneratedGames(games);
    setLastParam(param);
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (['DREAM', 'SAJU', 'PERSONAL_SIGNIFICANCE'].includes(methodId)) {
      setParamInput('');
      setIsModalVisible(true);
    } else {
      runGenerate(methodId, gameCount);
    }
  };

  const handleConfirmModal = () => {
    setIsModalVisible(false);
    runGenerate(selectedMethod, gameCount, paramInput);
  };

  const handleCountChange = (newCount: GameCount) => {
    setGameCount(newCount);
    if (selectedMethod && generatedGames.length > 0) {
      runGenerate(selectedMethod, newCount, lastParam);
    }
  };

  const methodTitle = METHODS.find((m) => m.id === selectedMethod)?.title;

  const handleSave = () => {
    if (generatedGames.length === 0) return;
    setIsSaving(true);
    try {
      saveLottoSet({
        method: selectedMethod,
        param: lastParam,
        games: generatedGames.map((numbers) => ({ numbers })),
      });
      Alert.alert('성공', `${gameCount}게임이 저장되었습니다! 내역 탭에서 확인하세요.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    const isMulti = generatedGames.length > 1;
    const sets = generatedGames
      .map((nums, i) => (isMulti ? `${labelOf(i)}: ${nums.join(', ')}` : nums.join(', ')))
      .join('\n');
    router.push({
      pathname: '/create-post',
      params: {
        prefillTitle: '🍀 오늘의 로또 번호',
        prefillContent: `추천 번호 (${gameCount}게임):\n${sets}\n\n${methodTitle ?? ''} 방식으로 생성했습니다!`,
      },
    });
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ headerShown: false }} />
      <AppBar variant="screen" title="행운의 번호 추첨" onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <GameCountToggle value={gameCount} onChange={handleCountChange} />
        <GenerationResultCards
          games={generatedGames}
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
          onConfirm={handleConfirmModal}
        />
        {/* Tip Section */}
        <View className="bg-surface dark:bg-dark-card rounded-card p-4 border border-border-hairline mt-8 mb-10 flex-row">
          <Sparkles size={24} color="#E65100" />
          <View className="flex-1 ml-3">
            <AppText variant="body" className="text-text-secondary dark:text-dark-text-secondary leading-5">
              각 방식마다 고유한 알고리즘으로 번호를 생성합니다. 마음에 드는 방법을 선택해보세요!
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
