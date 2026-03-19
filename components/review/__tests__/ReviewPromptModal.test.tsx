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
      warning: '#F0A030',
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

jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, testID, ...props }: any) =>
      require('react').createElement(Text, { testID, ...props }, name),
  };
});

import { ReviewPromptModal } from '../ReviewPromptModal';

describe('ReviewPromptModal', () => {
  const defaultProps = {
    visible: true,
    selectedRating: 0,
    showFeedback: false,
    onRate: jest.fn(),
    onFeedbackTap: jest.fn(),
    onDismiss: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('星評価画面（showFeedback=false）', () => {
    it('タイトルが表示される', () => {
      const { getByText } = render(<ReviewPromptModal {...defaultProps} />);
      expect(getByText('Rewireを気に入っていますか？')).toBeTruthy();
    });

    it('本文が表示される', () => {
      const { getByText } = render(<ReviewPromptModal {...defaultProps} />);
      expect(getByText(/あなたの評価は今後の改善に/)).toBeTruthy();
    });

    it('5つの星がタップ可能に表示される', () => {
      const { getAllByRole } = render(<ReviewPromptModal {...defaultProps} />);
      const buttons = getAllByRole('button');
      // 5 stars + 1 "あとで" button = 6
      expect(buttons.length).toBeGreaterThanOrEqual(5);
    });

    it('星をタップするとonRateが呼ばれる', () => {
      const { getByLabelText } = render(<ReviewPromptModal {...defaultProps} />);
      fireEvent.press(getByLabelText('3つ星'));
      expect(defaultProps.onRate).toHaveBeenCalledWith(3);
    });

    it('星5をタップするとonRate(5)が呼ばれる', () => {
      const { getByLabelText } = render(<ReviewPromptModal {...defaultProps} />);
      fireEvent.press(getByLabelText('5つ星'));
      expect(defaultProps.onRate).toHaveBeenCalledWith(5);
    });

    it('「あとで」ボタンが表示される', () => {
      const { getByText } = render(<ReviewPromptModal {...defaultProps} />);
      expect(getByText('あとで')).toBeTruthy();
    });

    it('「あとで」を押すとonDismissが呼ばれる', () => {
      const { getByText } = render(<ReviewPromptModal {...defaultProps} />);
      fireEvent.press(getByText('あとで'));
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('selectedRating=3のとき3つの星がfilled、2つがoutline', () => {
      const { getAllByText } = render(
        <ReviewPromptModal {...defaultProps} selectedRating={3} />
      );
      // Ionicons mock renders icon name as text children
      expect(getAllByText('star').length).toBe(3);
      expect(getAllByText('star-outline').length).toBe(2);
    });
  });

  describe('フィードバック画面（showFeedback=true）', () => {
    const feedbackProps = { ...defaultProps, showFeedback: true, selectedRating: 2 };

    it('タイトルが変わる', () => {
      const { getByText } = render(<ReviewPromptModal {...feedbackProps} />);
      expect(getByText('ご意見をお聞かせください')).toBeTruthy();
    });

    it('フィードバック本文が表示される', () => {
      const { getByText } = render(<ReviewPromptModal {...feedbackProps} />);
      expect(getByText(/フィードバックをお寄せください/)).toBeTruthy();
    });

    it('「フィードバックを送る」ボタンが表示される', () => {
      const { getByText } = render(<ReviewPromptModal {...feedbackProps} />);
      expect(getByText('フィードバックを送る')).toBeTruthy();
    });

    it('「フィードバックを送る」を押すとonFeedbackTapが呼ばれる', () => {
      const { getByText } = render(<ReviewPromptModal {...feedbackProps} />);
      fireEvent.press(getByText('フィードバックを送る'));
      expect(defaultProps.onFeedbackTap).toHaveBeenCalledTimes(1);
    });

    it('「閉じる」を押すとonDismissが呼ばれる', () => {
      const { getByText } = render(<ReviewPromptModal {...feedbackProps} />);
      fireEvent.press(getByText('閉じる'));
      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
