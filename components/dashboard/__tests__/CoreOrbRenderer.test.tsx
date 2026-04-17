import React from 'react';
import { render } from '@testing-library/react-native';

let capturedUniforms: Record<string, unknown> | null = null;

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      View: require('react-native').View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useDerivedValue: (fn: any) => {
      const result = fn();
      capturedUniforms = result;
      return { value: result };
    },
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: { text: '#FFFFFF' },
  }),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
    Defs: (props: any) => <View {...props} />,
    RadialGradient: (props: any) => <View {...props} />,
    Stop: (props: any) => <View {...props} />,
  };
});

import { CoreOrbRenderer } from '../CoreOrbRenderer';

describe('CoreOrbRenderer', () => {
  beforeEach(() => {
    capturedUniforms = null;
  });

  it('glowBoost プロップなしでも uniforms に glowBoost: 0 が含まれる', () => {
    const time = { value: 0 };
    render(
      <CoreOrbRenderer
        colors={['#FF0000', '#00FF00', '#0000FF'] as const}
        size={200}
        time={time as any}
      />
    );
    expect(capturedUniforms).not.toBeNull();
    expect(capturedUniforms!.glowBoost).toBe(0);
  });

  it('glowBoost プロップありの場合は値がそのまま渡される', () => {
    const time = { value: 0 };
    const glowBoost = { value: 0.75 };
    render(
      <CoreOrbRenderer
        colors={['#FF0000', '#00FF00', '#0000FF'] as const}
        size={200}
        time={time as any}
        glowBoost={glowBoost as any}
      />
    );
    expect(capturedUniforms).not.toBeNull();
    expect(capturedUniforms!.glowBoost).toBe(0.75);
  });
});
