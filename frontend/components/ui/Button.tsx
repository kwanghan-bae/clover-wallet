import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { cn } from '../../utils/cn';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
  icon?: React.ReactNode;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  label,
  icon,
  children,
  ...props
}: ButtonProps) {

  const baseStyles = "flex-row items-center justify-center rounded-2xl";

  const variants = {
    default: "bg-emerald-500 active:bg-emerald-600",
    destructive: "bg-red-500 active:bg-red-600",
    outline: "border border-slate-200 bg-transparent active:bg-slate-100 dark:border-slate-800 dark:active:bg-slate-800",
    ghost: "bg-transparent active:bg-slate-100 dark:active:bg-slate-800",
    link: "bg-transparent underline-offset-4 hover:underline text-primary",
  };

  const sizes = {
    default: "h-12 px-6 py-3",
    sm: "h-9 rounded-lg px-3",
    lg: "h-14 rounded-xl px-8",
    icon: "h-10 w-10",
  };

  const textBaseStyles = "font-medium text-base";

  const textVariants = {
    default: "text-white",
    destructive: "text-white",
    outline: "text-slate-900 dark:text-slate-50",
    ghost: "text-slate-900 dark:text-slate-50",
    link: "text-emerald-500",
  };

  return (
    <TouchableOpacity
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      activeOpacity={0.7}
      {...props}
    >
      {icon && <View className={cn(label || children ? "mr-2" : "")}>{icon}</View>}
      {label ? (
        <Text className={cn(textBaseStyles, textVariants[variant])}>
          {label}
        </Text>
      ) : children}
    </TouchableOpacity>
  );
}
