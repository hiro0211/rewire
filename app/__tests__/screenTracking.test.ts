import { renderHook } from '@testing-library/react-native';

const mockLogScreenView = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    logScreenView: (...args: any[]) => mockLogScreenView(...args),
  },
}));

let mockPathname = '/';
jest.mock('expo-router', () => ({
  usePathname: () => mockPathname,
}));

import { useScreenTracking } from '@/lib/tracking/useScreenTracking';

describe('useScreenTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
  });

  it('マウント時に現在のパスで logScreenView() を呼ぶ', () => {
    mockPathname = '/(tabs)';
    renderHook(() => useScreenTracking());
    expect(mockLogScreenView).toHaveBeenCalledWith('/(tabs)');
  });

  it('パスが変わると新しいパスで logScreenView() を呼ぶ', () => {
    mockPathname = '/(tabs)';
    const { rerender } = renderHook(() => useScreenTracking());
    expect(mockLogScreenView).toHaveBeenCalledWith('/(tabs)');

    mockLogScreenView.mockClear();
    mockPathname = '/checkin';
    rerender({});
    expect(mockLogScreenView).toHaveBeenCalledWith('/checkin');
  });
});
