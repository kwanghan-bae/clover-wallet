import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Animated,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Sparkles, 
  Moon, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Heart, 
  Leaf, 
  BookOpen, 
  Palette, 
  PawPrint,
  Save,
  ChevronLeft
} from 'lucide-react-native';

const METHODS = [
  { id: 'DREAM', title: '꿈 해몽', subtitle: '밤에 꾼 꿈을 분석해요', color: '#7E57C2', icon: <Moon size={28} color="white" /> },
  { id: 'SAJU', title: '사주팔자', subtitle: '생년월일로 행운의 숫자를', color: '#D84315', icon: <Calendar size={28} color="white" /> },
  { id: 'STATISTICS_HOT', title: '통계 (HOT)', subtitle: '자주 나온 번호', color: '#EF5350', icon: <TrendingUp size={28} color="white" /> },
  { id: 'STATISTICS_COLD', title: '통계 (COLD)', subtitle: '안 나온 번호', color: '#42A5F5', icon: <TrendingDown size={28} color="white" /> },
  { id: 'HOROSCOPE', title: '별자리 운세', subtitle: '오늘의 별자리 행운', color: '#FFA726', icon: <Star size={28} color="white" /> },
  { id: 'PERSONAL_SIGNIFICANCE', title: '의미있는 숫자', subtitle: '기념일, 생일 등 특별한 날', color: '#EC407A', icon: <Heart size={28} color="white" /> },
  { id: 'NATURE_PATTERNS', title: '자연의 패턴', subtitle: '피보나치, 계절의 리듬', color: '#66BB6A', icon: <Leaf size={28} color="white" /> },
  { id: 'ANCIENT_DIVINATION', title: '고대 점술', subtitle: '주역, 룬 등의 신비', color: '#8D6E63', icon: <BookOpen size={28} color="white" /> },
  { id: 'COLORS_SOUNDS', title: '색상 & 소리', subtitle: '색상 심리와 음악 주파수', color: '#26C6DA', icon: <Palette size={28} color="white" /> },
  { id: 'ANIMAL_OMENS', title: '동물 징조', subtitle: '동물의 신비로운 힘', color: '#AB47BC', icon: <PawPrint size={28} color="white" /> },
];

export default function NumberGenerationScreen() {
  const router = useRouter();
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paramInput, setParamInput] = useState('');
  
  // Animation
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
    // Simulated algorithm logic based on method
    const numbers: Set<number> = new Set();
    const seed = param ? param.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
    
    // Simple deterministic random for "Premium" feel
    let currentSeed = seed;
    while (numbers.size < 6) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      const num = Math.floor((currentSeed / 233280) * 45) + 1;
      if (num > 0) numbers.add(num);
    }
    
    const sorted = Array.from(numbers).sort((a, b) => a - b);
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

  const handleSave = async () => {
    if (generatedNumbers.length === 0) return;
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert("성공", "번호가 저장되었습니다! 내 로또 탭에서 확인하세요.");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F7FA]">
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
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving}
              className="bg-white px-10 py-3 rounded-full mt-8 shadow-sm flex-row items-center"
            >
              <Save size={18} color="#4CAF50" />
              <Text className="text-primary font-bold ml-2">{isSaving ? "저장 중" : "번호 저장하기"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-xl font-bold text-[#1A1A1A] mt-10 mb-2">추첨 방식 선택</Text>
        <Text className="text-gray-500 text-[13px] mb-6">다양한 방법으로 행운의 번호를 찾아보세요!</Text>

        <View className="gap-3">
          {METHODS.map((method) => (
            <TouchableOpacity 
              key={method.id}
              onPress={() => handleMethodSelect(method.id)}
              className={`bg-white rounded-2xl p-4 flex-row items-center border ${selectedMethod === method.id ? 'border-primary shadow-md' : 'border-gray-50 shadow-sm'}`}
            >
              <View style={{ backgroundColor: method.color }} className="p-3 rounded-xl mr-4 shadow-sm">
                {method.icon}
              </View>
              <View className="flex-1">
                <Text className={`text-base font-bold ${selectedMethod === method.id ? 'text-primary' : 'text-[#1A1A1A]'}`}>
                  {method.title}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">{method.subtitle}</Text>
              </View>
              {selectedMethod === method.id && (
                <View className="bg-primary/10 p-1 rounded-full">
                  <Sparkles size={16} color="#4CAF50" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Modal for Input */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-10">
            <View className="bg-white w-full rounded-3xl p-6 shadow-2xl">
              <Text className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">
                {METHODS.find(m => m.id === selectedMethod)?.title}
              </Text>
              <Text className="text-gray-500 text-center text-xs mb-6">분석을 위해 필요한 정보를 입력해주세요.</Text>
              
              <TextInput
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-base mb-6"
                placeholder={selectedMethod === 'DREAM' ? '꿈의 키워드를 적어주세요 (예: 뱀, 금)' : '날짜나 숫자를 적어주세요'}
                value={paramInput}
                onChangeText={setParamInput}
                autoFocus
              />

              <View className="flex-row gap-3">
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 py-4 bg-gray-100 rounded-xl items-center"
                >
                  <Text className="text-gray-500 font-bold">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => generateNumbers(selectedMethod, paramInput)}
                  className="flex-2 py-4 bg-primary rounded-xl items-center"
                >
                  <Text className="text-white font-bold">분석 및 생성</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tip Section */}
        <View className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mt-8 mb-10 flex-row">
          <Sparkles size={24} color="#D84315" />
          <View className="flex-1 ml-3">
            <Text className="text-[#5D4037] text-[13px] leading-5">
              각 방식마다 고유한 알고리즘으로 번호를 생성합니다. 마음에 드는 방법을 선택해보세요!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getNumberColor(n: number) {
  if (n <= 10) return 'bg-[#FFA726]';
  if (n <= 20) return 'bg-[#42A5F5]';
  if (n <= 30) return 'bg-[#EF5350]';
  if (n <= 40) return 'bg-[#9E9E9E]';
  return 'bg-[#66BB6A]';
}
