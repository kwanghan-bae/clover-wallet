import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
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
      <TextInput
        accessibilityLabel={label ? `${label} 입력` : undefined}
        accessibilityHint={error ? `오류: ${error}` : undefined}
        className={cn(
          "bg-white border border-gray-200 rounded-xl px-4 py-3 text-text-dark",
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
      {error && <Text className="text-red-500 text-xs ml-1">{error}</Text>}
    </View>
  );
};
