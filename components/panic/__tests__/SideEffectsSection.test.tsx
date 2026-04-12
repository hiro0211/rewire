import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/hooks/useLocale', () => ({
  useLocale: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'panic.sideEffectsTitle': 'ポルノを見てしまうと？',
        'panic.sideEffects.selfHate.title': '自己嫌悪・罪悪感',
        'panic.sideEffects.selfHate.description':
          '視聴後の後悔が積み重なり、自己肯定感がどんどん下がる。',
        'panic.sideEffects.numbness.title': '快感の麻痺',
        'panic.sideEffects.numbness.description':
          '脳が強い刺激に慣れてしまい、日常の小さな喜びや達成感を感じにくくなる。',
        'panic.sideEffects.ed.title': '勃起不全（ED）',
        'panic.sideEffects.ed.description':
          'ポルノに依存するほど、実際の性行為で身体が反応しなくなる。',
        'panic.sideEffects.willpower.title': '意志力・自制心の崩壊',
        'panic.sideEffects.willpower.description':
          '衝動を抑える力が弱まり、目先の快楽を優先してしまうようになる。',
        'panic.sideEffects.focus.title': '集中力の低下',
        'panic.sideEffects.focus.description':
          '仕事や勉強に集中できなくなり、頭にモヤがかかったような状態が続く。',
        'panic.sideEffects.isolation.title': '社会的孤立',
        'panic.sideEffects.isolation.description':
          '人付き合いを避けるようになり、孤独感が深まる。',
      };
      return map[key] ?? key;
    },
  }),
}));

import { SideEffectsSection } from '../SideEffectsSection';

describe('SideEffectsSection', () => {
  it('見出しを表示する', () => {
    const { getByText } = render(<SideEffectsSection />);
    expect(getByText('ポルノを見てしまうと？')).toBeTruthy();
  });

  it('6種の副作用カードを表示する', () => {
    const { getByText } = render(<SideEffectsSection />);
    expect(getByText('自己嫌悪・罪悪感')).toBeTruthy();
    expect(getByText('快感の麻痺')).toBeTruthy();
    expect(getByText('勃起不全（ED）')).toBeTruthy();
    expect(getByText('意志力・自制心の崩壊')).toBeTruthy();
    expect(getByText('集中力の低下')).toBeTruthy();
    expect(getByText('社会的孤立')).toBeTruthy();
  });
});
