import { render } from '@testing-library/react-native';
import React from 'react';

import { PaywallLoadingState } from '../PaywallLoadingState';

describe('PaywallLoadingState', () => {
  it('読み込み中のテキストが表示される', () => {
    const { getByText } = render(<PaywallLoadingState />);
    expect(getByText('読み込み中...')).toBeTruthy();
  });
});
