import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';

interface GenerationInputModalProps {
  isVisible: boolean;
  methodTitle?: string;
  selectedMethod: string;
  paramInput: string;
  setParamInput: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 
 * @description 번호 생성을 위해 추가 정보(꿈 키워드, 기념일 등)를 입력받는 모달 컴포넌트입니다. 
 */
export function GenerationInputModal({
  isVisible,
  methodTitle,
  selectedMethod,
  paramInput,
  setParamInput,
  onCancel,
  onConfirm,
} : GenerationInputModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-10">
        <View className="bg-white w-full rounded-3xl p-6 shadow-2xl">
          <Text className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">
            {methodTitle}
          </Text>
          <Text className="text-gray-500 text-center text-xs mb-6">분석을 위해 필요한 정보를 입력해주세요.</Text>
          
          <TextInput
            className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-base mb-6"
            placeholder={selectedMethod === 'DREAM' ? '꿈의 키워드를 적어주세요 (예: 뱀, 금)' : '날짜나 숫자를 적어주세요'}
            accessibilityLabel={selectedMethod === 'DREAM' ? '꿈의 키워드 입력' : '날짜나 숫자 입력'}
            accessibilityHint="분석을 위해 필요한 정보를 입력해주세요"
            value={paramInput}
            onChangeText={setParamInput}
            autoFocus
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 bg-gray-100 rounded-xl items-center"
              accessibilityLabel="취소"
              accessibilityRole="button"
            >
              <Text className="text-gray-500 font-bold">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-2 py-4 bg-primary rounded-xl items-center"
              accessibilityLabel="분석 및 생성"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold">분석 및 생성</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
