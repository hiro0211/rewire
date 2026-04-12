import { renderHook, act } from '@testing-library/react-native';

const mockRequest = jest.fn();
let mockPermission: any = null;

jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [mockPermission, mockRequest],
}));

import { useCameraPermission } from '../useCameraPermission';

describe('useCameraPermission', () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockPermission = null;
  });

  it('permission が null のとき isLoading=true を返す', () => {
    mockPermission = null;
    const { result } = renderHook(() => useCameraPermission());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasPermission).toBe(false);
  });

  it('permission.granted=true のとき hasPermission=true を返す', () => {
    mockPermission = { granted: true, status: 'granted' };
    const { result } = renderHook(() => useCameraPermission());
    expect(result.current.hasPermission).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('permission.granted=false のとき hasPermission=false を返す', () => {
    mockPermission = { granted: false, status: 'denied' };
    const { result } = renderHook(() => useCameraPermission());
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('requestPermission を呼び出すと expo-camera の request が呼ばれる', async () => {
    mockPermission = { granted: false, status: 'undetermined' };
    mockRequest.mockResolvedValue({ granted: true, status: 'granted' });
    const { result } = renderHook(() => useCameraPermission());
    await act(async () => {
      await result.current.requestPermission();
    });
    expect(mockRequest).toHaveBeenCalled();
  });
});
