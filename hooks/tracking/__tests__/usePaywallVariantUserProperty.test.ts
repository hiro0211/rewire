import { renderHook } from '@testing-library/react-native';

const mockSetUserProperty = jest.fn();
jest.mock('@/lib/tracking/analyticsClient', () => ({
  analyticsClient: {
    setUserProperty: (...args: any[]) => mockSetUserProperty(...args),
  },
}));

import { usePaywallVariantUserProperty } from '../usePaywallVariantUserProperty';

// resolvePaywallVariant('u1') を実際に呼んで確かめた値。
// 期待値をハードコードするのは、割当ロジックを書き換えたら
// このテストが落ちて「既存ユーザーの割当が入れ替わった」と気づけるようにするため。
const VARIANT_OF_U1 = 'cosmicJourney';

describe('usePaywallVariantUserProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('user.id が渡されたとき paywall_variant にそのIDの割当が設定される', () => {
    renderHook(() => usePaywallVariantUserProperty('u1'));

    expect(mockSetUserProperty).toHaveBeenCalledWith('paywall_variant', VARIANT_OF_U1);
  });

  it('user.id が null のとき paywall_variant は設定されない', () => {
    // 未ハイドレートの一瞬に fallback の 'default' を焼き付けると、
    // 実際は cosmicJourney のユーザーが default 側の母数に入ってしまう
    renderHook(() => usePaywallVariantUserProperty(null));

    expect(mockSetUserProperty).not.toHaveBeenCalled();
  });

  it('null から user.id が入ったとき割当が設定される', () => {
    const { rerender } = renderHook(
      ({ id }: { id: string | null }) => usePaywallVariantUserProperty(id),
      { initialProps: { id: null as string | null } },
    );

    rerender({ id: 'u1' });

    expect(mockSetUserProperty).toHaveBeenCalledWith('paywall_variant', VARIANT_OF_U1);
  });

  it('同じ user.id で再レンダリングしても設定は1回だけ', () => {
    // setUserProperty は非同期ネイティブ呼び出し。再レンダリングのたびに
    // 投げると起動直後に無駄な呼び出しが積み上がる
    const { rerender } = renderHook(
      ({ id }: { id: string | null }) => usePaywallVariantUserProperty(id),
      { initialProps: { id: 'u1' as string | null } },
    );

    rerender({ id: 'u1' });

    expect(mockSetUserProperty).toHaveBeenCalledTimes(1);
  });
});
