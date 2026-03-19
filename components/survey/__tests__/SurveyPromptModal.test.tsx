import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      overlay: 'rgba(0,0,0,0.5)',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#999999',
      primary: '#7c3aed',
      contrastText: '#ffffff',
      border: '#333333',
    },
    gradients: { button: ['#7c3aed', '#a855f7'] },
    glow: { purple: '#7c3aed' },
  }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      require('react').createElement(View, props, children),
  };
});

import { SurveyPromptModal } from '../SurveyPromptModal';

describe('SurveyPromptModal', () => {
  const defaultProps = {
    visible: true,
    onAccept: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('visible=true のときレンダリングされる', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    expect(getByText('アンケートのお願い')).toBeTruthy();
  });

  it('本文が表示される', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    expect(getByText(/体験向上と機能改善のため/)).toBeTruthy();
  });

  it('「回答する」ボタンが表示される', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    expect(getByText('回答する')).toBeTruthy();
  });

  it('「あとで」ボタンが表示される', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    expect(getByText('あとで')).toBeTruthy();
  });

  it('「回答する」を押すとonAcceptが呼ばれる', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    fireEvent.press(getByText('回答する'));
    expect(defaultProps.onAccept).toHaveBeenCalledTimes(1);
  });

  it('「あとで」を押すとonDismissが呼ばれる', () => {
    const { getByText } = render(<SurveyPromptModal {...defaultProps} />);
    fireEvent.press(getByText('あとで'));
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });
});
