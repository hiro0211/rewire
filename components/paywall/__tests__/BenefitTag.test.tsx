import React from 'react';
import { render } from '@testing-library/react-native';
import { BenefitTag } from '../BenefitTag';

describe('BenefitTag', () => {
  it('クラッシュせずにレンダリングされる', () => {
    expect(() =>
      render(<BenefitTag label="集中力回復" color="#3DD68C" emoji="🎯" />)
    ).not.toThrow();
  });

  it('ラベルテキストが表示される', () => {
    const { getByText } = render(
      <BenefitTag label="集中力回復" color="#3DD68C" emoji="🎯" />
    );
    expect(getByText(/集中力回復/)).toBeTruthy();
  });

  it('絵文字が表示される', () => {
    const { getByText } = render(
      <BenefitTag label="脳のリセット" color="#00D4FF" emoji="🧠" />
    );
    expect(getByText(/🧠/)).toBeTruthy();
  });
});
