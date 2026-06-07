import React from 'react';
import { View } from 'react-native';

export const BlurView = ({ children, ...props }) => {
  return React.createElement(View, props, children);
};
