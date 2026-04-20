/**
 * Manual Jest mock for @shopify/react-native-skia.
 * Replaces GPU-native Canvas/Shader with plain React Native Views.
 */
import React from 'react';
import { View } from 'react-native';

export const Canvas = ({ children, style, testID }: any) => (
  <View style={style} testID={testID}>
    {children}
  </View>
);

export const Fill = ({ children }: any) => <>{children ?? null}</>;

export const Shader = () => null;

export const useImage = () => null;
export const ImageShader = () => null;

export const Skia = {
  RuntimeEffect: {
    // Return a non-null sentinel so the component renders the Canvas path
    Make: () => ({ __isMockEffect: true }),
  },
};
