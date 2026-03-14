import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SymptomSelectStep } from '../SymptomSelectStep';
import { SYMPTOM_CATEGORIES } from '@/constants/symptoms';

describe('SymptomSelectStep', () => {
  const defaultProps = {
    selectedSymptoms: [] as string[],
    onToggleSymptom: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('「症状」タイトルが表示される', () => {
    const { getByTestId } = render(<SymptomSelectStep {...defaultProps} />);
    expect(getByTestId('symptom-title')).toBeTruthy();
  });

  it('情報バブルが表示される', () => {
    const { getByTestId } = render(<SymptomSelectStep {...defaultProps} />);
    expect(getByTestId('info-bubble')).toBeTruthy();
  });

  it('「当てはまる症状を選んでください」が表示される', () => {
    const { getByText } = render(<SymptomSelectStep {...defaultProps} />);
    expect(getByText('当てはまる症状を選んでください')).toBeTruthy();
  });

  it('全3カテゴリのタイトルが表示される', () => {
    const { getByTestId } = render(<SymptomSelectStep {...defaultProps} />);
    expect(getByTestId('category-title-mental')).toBeTruthy();
    expect(getByTestId('category-title-physical')).toBeTruthy();
    expect(getByTestId('category-title-emotional')).toBeTruthy();
  });

  it('全症状アイテムが表示される', () => {
    const { getByText } = render(<SymptomSelectStep {...defaultProps} />);
    SYMPTOM_CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(getByText(item.label)).toBeTruthy();
      });
    });
  });

  it('症状をタップするとonToggleSymptomが呼ばれる', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <SymptomSelectStep {...defaultProps} onToggleSymptom={onToggle} />
    );
    fireEvent.press(getByText('やる気が出ない'));
    expect(onToggle).toHaveBeenCalledWith('mental_motivation');
  });

  it('選択済みアイテムにチェックマークが表示される', () => {
    const { getByTestId } = render(
      <SymptomSelectStep
        {...defaultProps}
        selectedSymptoms={['mental_motivation']}
      />
    );
    expect(getByTestId('symptom-check-mental_motivation')).toBeTruthy();
  });

  it('未選択アイテムは空のサークルが表示される', () => {
    const { getByTestId } = render(<SymptomSelectStep {...defaultProps} />);
    expect(getByTestId('symptom-circle-mental_motivation')).toBeTruthy();
  });

  it('複数アイテムを同時に選択状態にできる', () => {
    const { getByTestId } = render(
      <SymptomSelectStep
        {...defaultProps}
        selectedSymptoms={['mental_motivation', 'physical_fatigue', 'emotional_confidence']}
      />
    );
    expect(getByTestId('symptom-check-mental_motivation')).toBeTruthy();
    expect(getByTestId('symptom-check-physical_fatigue')).toBeTruthy();
    expect(getByTestId('symptom-check-emotional_confidence')).toBeTruthy();
  });
});
