import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

/** @description 라벨과 에러 메시지 기능을 포함한 공통 입력 필드 컴포넌트입니다. */
export const Input = ({ label, error, containerClassName, className, onFocus, onBlur, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={cn("gap-2", containerClassName)}
    >
      {label && <Text nativeID={label} className="text-text-dark font-medium ml-1">{label}</Text>}
      <View className="relative justify-center">
        <TextInput
          accessibilityLabel={label ? `${label} 입력` : undefined}
          accessibilityHint={error ? `오류: ${error}` : undefined}
          className={cn(
            "bg-white border border-gray-200 rounded-xl px-4 py-3 text-text-dark pr-10",
            isFocused && "border-primary shadow-sm",
            error && "border-red-500",
            className
          )}
          placeholderTextColor="#757575"
          onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
          accessibilityLabelledBy={label ? label : undefined}
          accessibilityState={{ invalid: !!error }}
          {...props}
        />
        {props.value && props.value.length > 0 && props.editable !== false && (
          <TouchableOpacity
            onPress={() => props.onChangeText?.('')}
            className="absolute right-3"
            accessibilityRole="button"
            accessibilityLabel="입력 내용 지우기"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs ml-1">{error}</Text>}
    </View>
  );
};
