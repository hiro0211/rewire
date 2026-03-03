import React from 'react';
import type { EducationSlide } from '@/constants/education';
import { DopamineBarsIllustration } from './DopamineBarsIllustration';
import { LockIconIllustration } from './LockIconIllustration';
import { DimmedIconsIllustration } from './DimmedIconsIllustration';
import { RecoveryProgressIllustration } from './RecoveryProgressIllustration';
import { ScatteredFocusIllustration } from './ScatteredFocusIllustration';
import { ShameCycleIllustration } from './ShameCycleIllustration';
import { IsolationIllustration } from './IsolationIllustration';
import { BrainSparkleIllustration } from './BrainSparkleIllustration';
import { VibrantLifeIllustration } from './VibrantLifeIllustration';

export function renderIllustration(type: EducationSlide['illustrationType']) {
  switch (type) {
    case 'dopamine_bars':
      return <DopamineBarsIllustration />;
    case 'lock_icon':
      return <LockIconIllustration />;
    case 'dimmed_icons':
      return <DimmedIconsIllustration />;
    case 'recovery_progress':
      return <RecoveryProgressIllustration />;
    case 'scattered_focus':
      return <ScatteredFocusIllustration />;
    case 'shame_cycle':
      return <ShameCycleIllustration />;
    case 'isolation':
      return <IsolationIllustration />;
    case 'brain_sparkle':
      return <BrainSparkleIllustration />;
    case 'vibrant_life':
      return <VibrantLifeIllustration />;
  }
}
