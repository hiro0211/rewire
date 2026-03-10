import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { IOS18TabBar } from '../iOS18TabBar';

const mockImpactAsync = jest.fn();
jest.mock('expo-haptics', () => ({
  impactAsync: (...args: any[]) => mockImpactAsync(...args),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c: any) => c },
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: (fn: any) => fn(),
    withSpring: (v: any) => v,
    Easing: {},
  };
});

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Ionicons: ({ name }: any) => <Text>{name}</Text> };
});

const defaultTabs = [
  { icon: 'home-outline', label: 'ホーム' },
  { icon: 'stats-chart-outline', label: '統計' },
  { icon: 'settings-outline', label: '設定' },
];

describe('IOS18TabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('全タブのラベルが表示される', () => {
    const { getByText } = render(
      <IOS18TabBar tabs={defaultTabs} selectedIndex={0} onChange={jest.fn()} />
    );
    expect(getByText('ホーム')).toBeTruthy();
    expect(getByText('統計')).toBeTruthy();
    expect(getByText('設定')).toBeTruthy();
  });

  it('全タブのアイコンが表示される', () => {
    const { getByText } = render(
      <IOS18TabBar tabs={defaultTabs} selectedIndex={0} onChange={jest.fn()} />
    );
    expect(getByText('home-outline')).toBeTruthy();
    expect(getByText('stats-chart-outline')).toBeTruthy();
    expect(getByText('settings-outline')).toBeTruthy();
  });

  it('タブタップ時にonChangeが正しいインデックスで呼ばれる', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <IOS18TabBar tabs={defaultTabs} selectedIndex={0} onChange={onChange} />
    );
    fireEvent.press(getByText('統計'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('タブタップ時にハプティクス(impactAsync Light)が呼ばれる', () => {
    const { getByText } = render(
      <IOS18TabBar tabs={defaultTabs} selectedIndex={0} onChange={jest.fn()} />
    );
    fireEvent.press(getByText('統計'));
    expect(mockImpactAsync).toHaveBeenCalledWith('Light');
  });

  it('カスタムaccentColorを渡してもクラッシュしない', () => {
    const { getByText } = render(
      <IOS18TabBar
        tabs={defaultTabs}
        selectedIndex={0}
        onChange={jest.fn()}
        accentColor="#FF0000"
      />
    );
    expect(getByText('ホーム')).toBeTruthy();
  });
});
