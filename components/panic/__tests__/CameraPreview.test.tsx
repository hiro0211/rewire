import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockRequestPermission = jest.fn();
let mockPermissionState: {
  hasPermission: boolean;
  isLoading: boolean;
} = { hasPermission: false, isLoading: false };

jest.mock('@/hooks/panic/useCameraPermission', () => ({
  useCameraPermission: () => ({
    hasPermission: mockPermissionState.hasPermission,
    isLoading: mockPermissionState.isLoading,
    requestPermission: mockRequestPermission,
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'panic.cameraPrompt': 'カメラを有効にする',
        'panic.cameraFallback': 'カメラが利用できません',
      };
      return map[key] ?? key;
    },
  }),
}));

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    CameraView: (props: any) => <View testID="camera-view" {...props} />,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: View };
});

import { CameraPreview } from '../CameraPreview';

describe('CameraPreview', () => {
  beforeEach(() => {
    mockRequestPermission.mockReset();
    mockPermissionState = { hasPermission: false, isLoading: false };
  });

  it('許可未取得のときはカメラ有効化ボタンを表示する', () => {
    mockPermissionState = { hasPermission: false, isLoading: false };
    const { getByText, queryByTestId } = render(<CameraPreview />);
    expect(getByText('カメラを有効にする')).toBeTruthy();
    expect(queryByTestId('camera-view')).toBeNull();
  });

  it('許可ボタン押下で requestPermission が呼ばれる', () => {
    mockPermissionState = { hasPermission: false, isLoading: false };
    mockRequestPermission.mockResolvedValueOnce(true);
    const { getByTestId } = render(<CameraPreview />);
    fireEvent.press(getByTestId('camera-permission-request'));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('許可済みのときはカメラビューを表示する', () => {
    mockPermissionState = { hasPermission: true, isLoading: false };
    const { getByTestId } = render(<CameraPreview />);
    expect(getByTestId('camera-view')).toBeTruthy();
  });
});
