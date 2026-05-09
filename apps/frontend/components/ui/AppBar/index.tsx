import React from 'react';
import { AppBarHome, AppBarHomeProps } from './AppBarHome';
import { AppBarScreen, AppBarScreenProps } from './AppBarScreen';
import { AppBarModal, AppBarModalProps } from './AppBarModal';

export type AppBarProps =
  | ({ variant: 'home' } & AppBarHomeProps)
  | ({ variant: 'screen' } & AppBarScreenProps)
  | ({ variant: 'modal' } & AppBarModalProps);

export const AppBar: React.FC<AppBarProps> = (props) => {
  if (props.variant === 'home') {
    const { variant, ...rest } = props;
    void variant;
    return <AppBarHome {...rest} />;
  }
  if (props.variant === 'screen') {
    const { variant, ...rest } = props;
    void variant;
    return <AppBarScreen {...rest} />;
  }
  const { variant, ...rest } = props;
  void variant;
  return <AppBarModal {...rest} />;
};

AppBar.displayName = 'AppBar';
