const mockOpen = jest.fn();
let mockVisible = false;
let mockUser: any = null;
let mockLastReflectionDate: string | null = null;

jest.mock('@/stores/userStore', () => ({
  useUserStore: (selector: any) => selector({ user: mockUser }),
}));

jest.mock('@/stores/reflectionStore', () => ({
  useReflectionStore: (selector: any) =>
    selector({ lastReflectionDate: mockLastReflectionDate }),
}));

jest.mock('@/hooks/reflection/useReflectionSheet', () => ({
  useReflectionSheet: (selector: any) =>
    selector({ visible: mockVisible, open: mockOpen }),
}));

import { renderHook } from '@testing-library/react-native';
import { useAutoOpenReflectionSheet } from '../useAutoOpenReflectionSheet';

describe('useAutoOpenReflectionSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockVisible = false;
    mockUser = null;
    mockLastReflectionDate = null;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('user.notifyEnabled が false の場合は open されない', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = { notifyEnabled: false, notifyTime: '22:00' };

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('現在時刻が notifyTime より前の場合は open されない', () => {
    jest.setSystemTime(new Date('2026-04-21T21:59:00'));
    mockUser = { notifyEnabled: true, notifyTime: '22:00' };

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('今日既に振り返り済み (lastReflectionDate === today) の場合は open されない', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = { notifyEnabled: true, notifyTime: '22:00' };
    mockLastReflectionDate = '2026-04-21';

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('全条件を満たす場合 (有効 & 時刻超過 & 今日未完了 & 非表示) に open が呼ばれる', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = { notifyEnabled: true, notifyTime: '22:00' };
    mockLastReflectionDate = '2026-04-20';

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('既に visible=true (通知タップ経由で開かれている) の場合は open されない', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = { notifyEnabled: true, notifyTime: '22:00' };
    mockLastReflectionDate = '2026-04-20';
    mockVisible = true;

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('user が null の場合は open されない', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = null;

    renderHook(() => useAutoOpenReflectionSheet());

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('同じレンダーツリーで再レンダーされても open は 1 回のみ (ref ガード)', () => {
    jest.setSystemTime(new Date('2026-04-21T22:30:00'));
    mockUser = { notifyEnabled: true, notifyTime: '22:00' };
    mockLastReflectionDate = '2026-04-20';

    const { rerender } = renderHook(() => useAutoOpenReflectionSheet());
    rerender(undefined);
    rerender(undefined);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });
});
