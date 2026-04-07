import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

// Mock Reanimated hooks used by AuroraBackground
jest.mock('react-native-reanimated', () => ({
  useSharedValue: (v: any) => ({ value: v }),
  useDerivedValue: (fn: any) => ({ value: fn() }),
  useFrameCallback: () => {},
}));

// @shopify/react-native-skia is auto-mocked via __mocks__/@shopify/react-native-skia.tsx

import { AuroraBackground } from '../AuroraBackground';

describe('AuroraBackground', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() => render(<AuroraBackground />)).not.toThrow();
  });

  it('children が表示される', () => {
    const { getByText } = render(
      <AuroraBackground>
        <Text>テストコンテンツ</Text>
      </AuroraBackground>,
    );
    expect(getByText('テストコンテンツ')).toBeTruthy();
  });

  it('aurora-container が存在する', () => {
    const { getByTestId } = render(<AuroraBackground />);
    expect(getByTestId('aurora-container')).toBeTruthy();
  });

  it('aurora-canvas が存在する', () => {
    const { getByTestId } = render(<AuroraBackground />);
    expect(getByTestId('aurora-canvas')).toBeTruthy();
  });

  it('children なしでもクラッシュしない', () => {
    expect(() => render(<AuroraBackground />)).not.toThrow();
  });
});
