import React from 'react';
import { render } from '@testing-library/react-native';
import { DopamineBarsIllustration } from '../illustrations/DopamineBarsIllustration';
import { LockIconIllustration } from '../illustrations/LockIconIllustration';
import { DimmedIconsIllustration } from '../illustrations/DimmedIconsIllustration';
import { RecoveryProgressIllustration } from '../illustrations/RecoveryProgressIllustration';
import { ScatteredFocusIllustration } from '../illustrations/ScatteredFocusIllustration';
import { ShameCycleIllustration } from '../illustrations/ShameCycleIllustration';
import { IsolationIllustration } from '../illustrations/IsolationIllustration';
import { BrainSparkleIllustration } from '../illustrations/BrainSparkleIllustration';
import { VibrantLifeIllustration } from '../illustrations/VibrantLifeIllustration';
import { renderIllustration } from '../illustrations/renderIllustration';

describe('イラストコンポーネント', () => {
  it('DopamineBarsIllustration がクラッシュしない', () => {
    expect(() => render(<DopamineBarsIllustration />)).not.toThrow();
  });

  it('LockIconIllustration がクラッシュしない', () => {
    expect(() => render(<LockIconIllustration />)).not.toThrow();
  });

  it('DimmedIconsIllustration がクラッシュしない', () => {
    expect(() => render(<DimmedIconsIllustration />)).not.toThrow();
  });

  it('RecoveryProgressIllustration がクラッシュしない', () => {
    expect(() => render(<RecoveryProgressIllustration />)).not.toThrow();
  });

  it('ScatteredFocusIllustration がクラッシュしない', () => {
    expect(() => render(<ScatteredFocusIllustration />)).not.toThrow();
  });

  it('ShameCycleIllustration がクラッシュしない', () => {
    expect(() => render(<ShameCycleIllustration />)).not.toThrow();
  });

  it('IsolationIllustration がクラッシュしない', () => {
    expect(() => render(<IsolationIllustration />)).not.toThrow();
  });

  it('BrainSparkleIllustration がクラッシュしない', () => {
    expect(() => render(<BrainSparkleIllustration />)).not.toThrow();
  });

  it('VibrantLifeIllustration がクラッシュしない', () => {
    expect(() => render(<VibrantLifeIllustration />)).not.toThrow();
  });
});

describe('renderIllustration', () => {
  it('dopamine_bars のとき DopamineBarsIllustration を返す', () => {
    const result = renderIllustration('dopamine_bars');
    expect(result).toBeTruthy();
    expect(() => render(<>{result}</>)).not.toThrow();
  });

  it('lock_icon のとき LockIconIllustration を返す', () => {
    const result = renderIllustration('lock_icon');
    expect(result).toBeTruthy();
    expect(() => render(<>{result}</>)).not.toThrow();
  });

  it('vibrant_life のとき VibrantLifeIllustration を返す', () => {
    const result = renderIllustration('vibrant_life');
    expect(result).toBeTruthy();
    expect(() => render(<>{result}</>)).not.toThrow();
  });
});
