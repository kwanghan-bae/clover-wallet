import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Sparkles,
  Save,
  ChevronLeft,
  Share2
} from 'lucide-react-native';
import { generateLottoNumbersWithSeed, getNumberColor } from '../utils/lotto';
import { METHODS } from '../constants/generation-methods';
import { GenerationMethodCard } from '../components/ui/GenerationMethodCard';
import { GenerationInputModal } from '../components/ui/GenerationInputModal';

export default function NumberGenerationScreen() {
  const router = useRouter();
  /** 생성된 로또 번호 배열 상태입니다. */
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  /** 사용자가 선택한 추출 방법론의 ID입니다. */
  const [selectedMethod, setSelectedMethod] = useState('');
  /** 번호 저장 프로세스 진행 여부입니다. */
  const [isSaving, setIsSaving] = useState(false);
  /** 파라미터 입력 모달의 표시 여부입니다. */
  const [isModalVisible, setIsModalVisible] = useState(false);
  /** 꿈 키워드나 기념일 등 사용자가 입력한 파라미터 값입니다. */
  const [paramInput, setParamInput] = useState('');
  
  // Animation
  /** 번호가 나타날 때의 스케일 애니메이션 값입니다. */
  const scaleAnim = useRef(new Animated.Value(0)).current;

  /**
   * 사용자가 추출 방식을 선택했을 때 호출됩니다.
   * 추가 정보가 필요한 방식이면 모달을 띄우고, 아니면 바로 번호를 생성합니다.
   */
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (['DREAM', 'SAJU', 'PERSONAL_SIGNIFICANCE'].includes(methodId)) {
      setParamInput('');
      setIsModalVisible(true);
    } else {
      generateNumbers(methodId);
    }
  };

  /**
   * 유틸리티를 사용하여 로또 번호를 생성하고 애니메이션을 실행합니다.
   */
  const generateNumbers = (methodId: string, param?: string) => {
    const sorted = generateLottoNumbersWithSeed(methodId, param);
    setGeneratedNumbers(sorted);
    setIsModalVisible(false);
    
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
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
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert("성공", "번호가 저장되었습니다! 내 로또 탭에서 확인하세요.");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA] dark:bg-dark-bg">
      <Stack.Screen options={{ 
        title: '행운의 번호 추첨',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#1A1A1A" />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Result Display (Gradient Area) */}
        <View className="bg-primary rounded-[24px] p-8 shadow-lg items-center overflow-hidden">
          {selectedMethod ? (
            <View className="bg-white/20 px-4 py-2 rounded-full border border-white/30 mb-6">
              <Text className="text-white font-bold">{METHODS.find(m => m.id === selectedMethod)?.title}</Text>
            </View>
          ) : null}

          {generatedNumbers.length === 0 ? (
            <View className="items-center py-4">
              <Sparkles size={56} color="white" />
              <Text className="text-white/70 text-base mt-4 text-center">
                아래에서 생성 방식을 선택하세요!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-center gap-3">
              {generatedNumbers.map((n, idx) => (
                <Animated.View 
                  key={idx} 
                  style={{ transform: [{ scale: scaleAnim }] }}
                  className={`${getNumberColor(n)} w-12 h-12 rounded-full items-center justify-center shadow-md`}
                >
                  <Text className="text-white text-xl font-black">{n}</Text>
                </Animated.View>
              ))}
            </View>
          )}

          {generatedNumbers.length > 0 && (
            <View className="flex-row mt-8 gap-3">
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center"
              >
                <Save size={18} color="#4CAF50" />
                <Text className="text-primary font-bold ml-2">{isSaving ? "저장 중" : "번호 저장하기"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                className="bg-white px-6 py-3 rounded-full shadow-sm flex-row items-center"
              >
                <Share2 size={18} color="#4CAF50" />
                <Text className="text-primary font-bold ml-2">커뮤니티에 공유</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text className="text-xl font-bold text-[#1A1A1A] dark:text-dark-text mt-10 mb-2">추첨 방식 선택</Text>
        <Text className="text-gray-500 dark:text-dark-text-secondary text-[13px] mb-6">다양한 방법으로 행운의 번호를 찾아보세요!</Text>

        <View className="gap-3">
          {METHODS.map((method) => (
            <GenerationMethodCard
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onPress={() => handleMethodSelect(method.id)}
            />
          ))}
        </View>

        {/* Modal for Input */}
        <GenerationInputModal
          isVisible={isModalVisible}
          methodTitle={METHODS.find(m => m.id === selectedMethod)?.title}
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

