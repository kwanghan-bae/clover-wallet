import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '../../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <View className="space-y-2">
      {label && (
        <Text className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2 text-base shadow-sm placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-50 dark:focus:ring-emerald-500",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && (
        <Text className="text-xs font-medium text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
}
