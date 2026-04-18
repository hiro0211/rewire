import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (c: any) => c,
    },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    useAnimatedProps: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    withRepeat: (v: any) => v,
    withDelay: (_d: any, v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    Easing: {
      out: (f: any) => f,
      inOut: (f: any) => f,
      cubic: (v: number) => v,
      sin: (v: number) => v,
      quad: (v: number) => v,
    },
    useFrameCallback: () => {},
    useAnimatedReaction: () => {},
    useDerivedValue: (fn: any) => ({ value: fn() }),
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => <View {...props} />,
    Svg: (props: any) => <View {...props} />,
    Defs: (props: any) => <View {...props} />,
    RadialGradient: (props: any) => <View {...props} />,
    Stop: (props: any) => <View {...props} />,
    Circle: (props: any) => <View {...props} />,
  };
});

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: true,
    colors: {
      text: '#FFFFFF',
      textSecondary: '#888888',
    },
    glow: { cyan: 'rgba(0, 212, 255, 0.2)' },
  }),
}));

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({ isJapanese: true }),
}));

import { OrbCarousel } from '../OrbCarousel';
import { BADGE_DEFINITIONS } from '@/constants/badges/BADGE_DEFINITIONS';

describe('OrbCarousel', () => {
  it('orb-carousel のFlatListを描画する', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={45} />);
    expect(getByTestId('orb-carousel')).toBeTruthy();
  });

  it('18件のバッジすべてがFlatListのdataに渡される', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={45} />);
    const list = getByTestId('orb-carousel');
    expect(list.props.data.length).toBe(BADGE_DEFINITIONS.length);
    expect(list.props.data.length).toBe(18);
  });

  it('currentDays=45のときmarsが初期アクティブ', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={45} />);
    expect(getByTestId('orb-carousel').props.initialScrollIndex).toBe(
      BADGE_DEFINITIONS.findIndex((b) => b.id === 'mars')
    );
  });

  it('currentDays=0のときstardustが初期アクティブ', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    expect(getByTestId('orb-carousel').props.initialScrollIndex).toBe(
      BADGE_DEFINITIONS.findIndex((b) => b.id === 'stardust')
    );
  });

  it('currentDays=9999のときcosmosが初期アクティブ（境界値）', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={9999} />);
    expect(getByTestId('orb-carousel').props.initialScrollIndex).toBe(
      BADGE_DEFINITIONS.findIndex((b) => b.id === 'cosmos')
    );
  });

  it('onMomentumScrollEndで活性indexが更新される', () => {
    // currentDays=0: 初期 Stardust(index 0) がアクティブで unlocked、Nebula(index 1) は locked
    const { getByTestId, queryByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');

    // 初期状態: Stardust active + unlocked → animated-orb 1個
    expect(queryByTestId('animated-orb')).toBeTruthy();

    // Nebula(index 1, day=1) にスクロール → locked
    const itemWidth = list.props.snapToInterval as number;
    fireEvent.scroll(list, {
      nativeEvent: {
        contentOffset: { x: itemWidth, y: 0 },
        contentSize: { width: itemWidth * 18, height: 200 },
        layoutMeasurement: { width: itemWidth, height: 200 },
      },
    });
    fireEvent(list, 'onMomentumScrollEnd', {
      nativeEvent: {
        contentOffset: { x: itemWidth, y: 0 },
        contentSize: { width: itemWidth * 18, height: 200 },
        layoutMeasurement: { width: itemWidth, height: 200 },
      },
    });

    // 活性indexが1に更新された結果: Nebula は locked なので animated-orb は描画されない
    expect(queryByTestId('animated-orb')).toBeNull();
  });

  it('onLongPressをアクティブアイテムに伝播する', () => {
    const onLongPress = jest.fn();
    const { getByTestId } = render(
      <OrbCarousel currentDays={45} onLongPress={onLongPress} />
    );
    fireEvent(getByTestId('orb-carousel-item-active-touch'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('onLayout前の初期 paddingHorizontal は 0', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');
    const style = Array.isArray(list.props.contentContainerStyle)
      ? Object.assign({}, ...list.props.contentContainerStyle.filter(Boolean))
      : list.props.contentContainerStyle;
    expect(style.paddingHorizontal).toBe(0);
  });

  it('onLayout発火後も paddingHorizontal は 0 のまま（paddingはHeader/Footerに移行）', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');
    fireEvent(list, 'layout', {
      nativeEvent: { layout: { width: 358, height: 400, x: 0, y: 0 } },
    });
    const style = Array.isArray(list.props.contentContainerStyle)
      ? Object.assign({}, ...list.props.contentContainerStyle.filter(Boolean))
      : list.props.contentContainerStyle;
    expect(style.paddingHorizontal).toBe(0);
  });

  it('snapToAlignment が "start"（両端のsnap中央揃えのため）', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    expect(getByTestId('orb-carousel').props.snapToAlignment).toBe('start');
  });

  it('onLayout後、ListHeaderComponent が width=109 の spacer View を返す', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');
    fireEvent(list, 'layout', {
      nativeEvent: { layout: { width: 358, height: 400, x: 0, y: 0 } },
    });
    const header = list.props.ListHeaderComponent;
    // JSX Element として渡される
    expect(header).toBeTruthy();
    expect(header.props.style.width).toBe(109);
  });

  it('onLayout後、ListFooterComponent が width=109 の spacer View を返す', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');
    fireEvent(list, 'layout', {
      nativeEvent: { layout: { width: 358, height: 400, x: 0, y: 0 } },
    });
    const footer = list.props.ListFooterComponent;
    expect(footer).toBeTruthy();
    expect(footer.props.style.width).toBe(109);
  });

  it('snapToInterval が 140 (ITEM_WIDTH_PADDING=20)', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    expect(getByTestId('orb-carousel').props.snapToInterval).toBe(140);
  });

  it('getItemLayout の length が 140', () => {
    const { getByTestId } = render(<OrbCarousel currentDays={0} />);
    const list = getByTestId('orb-carousel');
    expect(list.props.getItemLayout(null, 0).length).toBe(140);
    expect(list.props.getItemLayout(null, 3).offset).toBe(420);
  });

  it('currentDays=0 で Stardust(day=0) が active+unlocked のとき animated-orb が描画される', () => {
    // 初期 active が unlocked のパターン
    const { queryByTestId } = render(<OrbCarousel currentDays={0} />);
    expect(queryByTestId('animated-orb')).toBeTruthy();
  });

  it('currentDays=0 で全バッジが locked または active 以外のとき animated-orb 数は最大1', () => {
    // currentDays=0 では Stardust(day=0) のみ unlocked
    // 初期 active=Stardust → animated-orb 1個
    const { getAllByTestId } = render(<OrbCarousel currentDays={0} />);
    expect(getAllByTestId('animated-orb').length).toBe(1);
  });
});
