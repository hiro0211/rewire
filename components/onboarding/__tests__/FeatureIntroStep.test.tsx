import React from 'react';
import { render } from '@testing-library/react-native';
import { FeatureIntroStep } from '../FeatureIntroStep';

describe('FeatureIntroStep', () => {
  describe('recording variant', () => {
    it('タイトル「毎日の記録」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/毎日の記録/)).toBeTruthy();
    });

    it('説明文「1日1回の振り返り」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/1日1回の振り返り/)).toBeTruthy();
    });

    it('「現在の記録」テキストが表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/現在の記録/)).toBeTruthy();
    });

    it('「0」と「Days」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText('0')).toBeTruthy();
      expect(getByText('Days')).toBeTruthy();
    });

    it('「目標: 7日」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/目標: 7日/)).toBeTruthy();
    });

    it('「0%」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText('0%')).toBeTruthy();
    });

    it('「今日の振り返り」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/今日の振り返り/)).toBeTruthy();
    });

    it('「完了済み」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/完了済み/)).toBeTruthy();
    });

    it('「週間サマリー」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/週間サマリー/)).toBeTruthy();
    });

    it('「1/1」と「日間クリア」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="recording" />);
      expect(getByText(/1\/1/)).toBeTruthy();
      expect(getByText(/日間クリア/)).toBeTruthy();
    });
  });

  describe('breathing variant', () => {
    it('タイトル「衝動が来たら」が表示される', () => {
      const { getByText } = render(<FeatureIntroStep variant="breathing" />);
      expect(getByText(/衝動が来たら/)).toBeTruthy();
    });

    it('説明文に「深呼吸」「ボタン」が含まれる', () => {
      const { getAllByText, getByText } = render(<FeatureIntroStep variant="breathing" />);
      expect(getAllByText(/深呼吸/).length).toBeGreaterThan(0);
      expect(getByText(/ボタン/)).toBeTruthy();
    });

    it('「深呼吸」テキストが表示される', () => {
      const { getAllByText } = render(<FeatureIntroStep variant="breathing" />);
      expect(getAllByText(/深呼吸/).length).toBeGreaterThan(0);
    });

    it('testID="breathing-illustration" が存在する', () => {
      const { getByTestId } = render(<FeatureIntroStep variant="breathing" />);
      expect(getByTestId('breathing-illustration')).toBeTruthy();
    });

    it('「6秒」の説明が含まれる', () => {
      const { getByText } = render(<FeatureIntroStep variant="breathing" />);
      expect(getByText(/6秒/)).toBeTruthy();
    });
  });

  describe('共通', () => {
    it('testID="recording-illustration" が存在する', () => {
      const { getByTestId } = render(<FeatureIntroStep variant="recording" />);
      expect(getByTestId('recording-illustration')).toBeTruthy();
    });

    it('recording variantがクラッシュしない', () => {
      expect(() => render(<FeatureIntroStep variant="recording" />)).not.toThrow();
    });

    it('breathing variantがクラッシュしない', () => {
      expect(() => render(<FeatureIntroStep variant="breathing" />)).not.toThrow();
    });

    it('不正variantでもクラッシュしない', () => {
      expect(() => render(<FeatureIntroStep variant={'invalid' as any} />)).not.toThrow();
    });
  });
});
