import { renderHook, act, waitFor } from '@testing-library/react-native';

const mockGetOfferings = jest.fn();

jest.mock('@/lib/subscription/purchasesModule', () => ({
  Purchases: { getOfferings: (...args: any[]) => mockGetOfferings(...args) },
}));

jest.mock('@/lib/subscription/subscriptionClient', () => ({
  subscriptionClient: {
    isReady: () => true,
    initialize: jest.fn(),
  },
}));

import { useOfferings } from '../useOfferings';

describe('useOfferings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態はloading', () => {
    mockGetOfferings.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useOfferings('default'));
    expect(result.current.paywallState).toBe('loading');
  });

  it('offerings取得成功後はready', async () => {
    const mockOffering = { annual: { product: { price: 2500 } } };
    mockGetOfferings.mockResolvedValue({ current: mockOffering });
    const { result } = renderHook(() => useOfferings('default'));
    await waitFor(() => expect(result.current.paywallState).toBe('ready'));
    expect(result.current.currentOffering).toBe(mockOffering);
  });

  it('offerings取得失敗時はunavailable', async () => {
    mockGetOfferings.mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useOfferings('default'));
    await waitFor(() => expect(result.current.paywallState).toBe('unavailable'));
  });

  it('購入可能なパッケージが空の offering は unavailable にする', async () => {
    // offering オブジェクトの有無しか見ていなかったため、中身が空でも ready になり、
    // ペイウォールは正常表示されるのに購入ボタンで「プランの取得に失敗」に落ちていた
    mockGetOfferings.mockResolvedValue({ current: { availablePackages: [] } });
    const { result } = renderHook(() => useOfferings('default'));
    await waitFor(() => expect(result.current.paywallState).toBe('unavailable'));
  });

  it('availablePackages が無くても annual があれば ready にする', async () => {
    // 一部の Offering 形状では availablePackages が undefined で来る
    const mockOffering = { annual: { product: { price: 5400 } } };
    mockGetOfferings.mockResolvedValue({ current: mockOffering });
    const { result } = renderHook(() => useOfferings('default'));
    await waitFor(() => expect(result.current.paywallState).toBe('ready'));
  });
});
