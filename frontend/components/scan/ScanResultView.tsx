import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RotateCw } from 'lucide-react-native';
import { BallRow } from '../ui/BallRow';

export interface ScanResultData {
  numbers: number[];
  round?: number;
}

export interface ScanResultViewProps {
  result: ScanResultData;
  onRetry: () => void;
  onConfirm: () => void;
}

/** @description 스캔 결과를 보여주는 카드 (번호 표시 + 확인/다시 촬영 버튼) */
const ScanResultViewComponent = ({ result, onRetry, onConfirm }: ScanResultViewProps) => (
  <View className="bg-white dark:bg-dark-surface rounded-3xl p-6 w-[90%] shadow-2xl" testID="scan-result">
    <Text className="text-xl font-bold text-text-dark dark:text-dark-text mb-2 text-center">
      인식된 번호 확인
    </Text>
    {result.round && (
      <Text className="text-primary font-bold text-center mb-4">{result.round}회차</Text>
    )}
    <View className="items-center mb-6">
      <BallRow numbers={result.numbers} />
    </View>

    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={onRetry}
        className="flex-1 h-14 bg-gray-100 dark:bg-dark-card rounded-xl items-center justify-center flex-row"
      >
        <RotateCw size={18} color="#757575" />
        <Text className="text-text-light dark:text-dark-text-secondary font-bold ml-2">다시 촬영</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onConfirm}
        className="flex-2 h-14 bg-primary rounded-xl items-center justify-center"
      >
        <Text className="text-white font-bold text-lg px-8">확인</Text>
      </TouchableOpacity>
    </View>
    <Text className="text-gray-400 text-[10px] text-center mt-4">
      ※ 인식된 번호가 정확한지 확인해주세요.
    </Text>
  </View>
);

export const ScanResultView = memo(ScanResultViewComponent);
