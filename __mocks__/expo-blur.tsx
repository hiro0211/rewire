import React from 'react';
import { View } from 'react-native';

export const BlurView = ({ children, style, ...rest }: any) => (
  <View style={style} {...rest}>
    {children}
  </View>
);
