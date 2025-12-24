import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { LottoBall } from '../../components/ui/LottoBall';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { BallRow } from '../../components/ui/BallRow';
import { generateLottoNumbers } from '../../utils/lotto';
import { StorageKeys, appendToItemArray } from '../../utils/storage';
import { LottoRecord } from '../../api/types/lotto';

import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setHasSaved(false);
    // Simulate generation delay for UX
    setTimeout(() => {
      const newNumbers = generateLottoNumbers();
      setCurrentNumbers(newNumbers);
      setIsGenerating(false);
    }, 800);
  };

  const handleSave = () => {
    if (currentNumbers.length === 0 || hasSaved) return;

    const newRecord: LottoRecord = {
      id: Date.now().toString(),
      round: 1103, // TODO: Get current round from API
      numbers: currentNumbers,
      createdAt: new Date().toISOString(),
    };

    appendToItemArray(StorageKeys.SAVED_NUMBERS, newRecord);
    setHasSaved(true);
    alert('Numbers saved successfully!');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        
        {/* Welcome Section */}
        <View className="py-4">
          <Text className="text-3xl font-bold text-text-dark">Hello, Lucky!</Text>
          <Text className="text-text-light text-lg">Today is a great day to win.</Text>
        </View>

        {/* 1. Last Draw Result (Mock) */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-text-dark">Last Draw Result</Text>
          <GlassCard>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-primary">Round 1102</Text>
              <Text className="text-text-light text-sm">2024.03.23</Text>
            </View>
            <BallRow numbers={[7, 13, 20, 24, 27, 35]} />
          </GlassCard>
        </View>

        {/* 2. Generation Area */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-text-dark">Quick Pick</Text>
          <GlassCard className="items-center py-8">
            {currentNumbers.length > 0 ? (
              <BallRow numbers={currentNumbers} className="w-full px-2" />
            ) : (
              <View className="h-14 justify-center">
                <Text className="text-text-light italic">Tap the button to pick numbers</Text>
              </View>
            )}
          </GlassCard>
          
          <View className="gap-3">
            <PrimaryButton 
              label={isGenerating ? "Picking..." : "Generate Random Numbers"} 
              onPress={handleGenerate}
              isLoading={isGenerating}
            />
            
            {currentNumbers.length > 0 && (
              <PrimaryButton 
                label={hasSaved ? "Saved" : "Save to My History"} 
                onPress={handleSave}
                disabled={hasSaved}
                className={hasSaved ? "bg-gray-300" : "bg-transparent border border-primary"}
                textClassName={hasSaved ? "text-gray-500" : "text-primary"}
              />
            )}
          </View>
        </View>

        {/* 3. Navigation Shortcuts */}
        <View className="gap-4">
          <Text className="text-xl font-bold text-text-dark">More Features</Text>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <PrimaryButton 
                label="Scan Ticket" 
                className="bg-transparent border border-primary h-12"
                textClassName="text-primary text-sm"
                onPress={() => router.push('/scan')} 
              />
            </View>
            <View className="flex-1">
              <PrimaryButton 
                label="My History" 
                className="bg-transparent border border-primary h-12"
                textClassName="text-primary text-sm"
                onPress={() => router.push('/history')} 
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}