import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = ({ label, error, containerClassName, className, ...props }: InputProps) => {
  return (
    <View className={cn("gap-2", containerClassName)}>
      {label && <Text className="text-text-dark font-medium ml-1">{label}</Text>}
      <TextInput
        className={cn(
          "bg-white border border-gray-200 rounded-xl px-4 py-3 text-text-dark",
          error && "border-red-500",
          className
        )}
        placeholderTextColor="#757575"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs ml-1">{error}</Text>}
    </View>
  );
};
