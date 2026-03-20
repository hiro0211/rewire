// ── 型定義 ──

export interface BenefitItem {
  emoji: string;
  boldKey: string;
  textKey: string;
}

export interface BenefitSection {
  id: string;
  titleKey: string;
  emoji: string;
  benefits: BenefitItem[];
}

export interface BenefitTagData {
  labelKey: string;
  color: string;
  emoji: string;
}

export interface FeatureItem {
  emoji: string;
  titleKey: string;
  descriptionKey: string;
}

// ── ベネフィットタグ ──

export const BENEFIT_TAGS: BenefitTagData[] = [
  { labelKey: 'preBenefits.tags.focusRecovery', color: '#3DD68C', emoji: '🎯' },
  { labelKey: 'preBenefits.tags.edPrevention', color: '#F0A030', emoji: '🛡️' },
  { labelKey: 'preBenefits.tags.selfEfficacy', color: '#8B5CF6', emoji: '💪' },
  { labelKey: 'preBenefits.tags.brainReset', color: '#00D4FF', emoji: '🧠' },
  { labelKey: 'preBenefits.tags.timeRecovery', color: '#EF4444', emoji: '⏰' },
  { labelKey: 'preBenefits.tags.selfGrowth', color: '#C8A84E', emoji: '📈' },
  { labelKey: 'preBenefits.tags.relationships', color: '#4A90D9', emoji: '🤝' },
];

// ── ベネフィットセクション ──

export const BENEFIT_SECTIONS: BenefitSection[] = [
  {
    id: 'rewire_brain',
    titleKey: 'preBenefits.sections.rewireBrain.title',
    emoji: '🧠',
    benefits: [
      { emoji: '🔄', boldKey: 'preBenefits.sections.rewireBrain.dopamineReset.bold', textKey: 'preBenefits.sections.rewireBrain.dopamineReset.text' },
      { emoji: '🎯', boldKey: 'preBenefits.sections.rewireBrain.focusMotivation.bold', textKey: 'preBenefits.sections.rewireBrain.focusMotivation.text' },
      { emoji: '✨', boldKey: 'preBenefits.sections.rewireBrain.dailyJoy.bold', textKey: 'preBenefits.sections.rewireBrain.dailyJoy.text' },
    ],
  },
  {
    id: 'self_control',
    titleKey: 'preBenefits.sections.selfControl.title',
    emoji: '🔥',
    benefits: [
      { emoji: '💪', boldKey: 'preBenefits.sections.selfControl.beatUrges.bold', textKey: 'preBenefits.sections.selfControl.beatUrges.text' },
      { emoji: '🤝', boldKey: 'preBenefits.sections.selfControl.keepPromises.bold', textKey: 'preBenefits.sections.selfControl.keepPromises.text' },
      { emoji: '📈', boldKey: 'preBenefits.sections.selfControl.selfEfficacy.bold', textKey: 'preBenefits.sections.selfControl.selfEfficacy.text' },
    ],
  },
  {
    id: 'move_forward',
    titleKey: 'preBenefits.sections.moveForward.title',
    emoji: '🚀',
    benefits: [
      { emoji: '🌙', boldKey: 'preBenefits.sections.moveForward.reinvestTime.bold', textKey: 'preBenefits.sections.moveForward.reinvestTime.text' },
      { emoji: '📚', boldKey: 'preBenefits.sections.moveForward.readBooks.bold', textKey: 'preBenefits.sections.moveForward.readBooks.text' },
      { emoji: '🏆', boldKey: 'preBenefits.sections.moveForward.achievement.bold', textKey: 'preBenefits.sections.moveForward.achievement.text' },
    ],
  },
  {
    id: 'real_relationships',
    titleKey: 'preBenefits.sections.realRelationships.title',
    emoji: '❤️',
    benefits: [
      { emoji: '💡', boldKey: 'preBenefits.sections.realRelationships.faceEmotions.bold', textKey: 'preBenefits.sections.realRelationships.faceEmotions.text' },
      { emoji: '🔗', boldKey: 'preBenefits.sections.realRelationships.becomeTrustworthy.bold', textKey: 'preBenefits.sections.realRelationships.becomeTrustworthy.text' },
      { emoji: '❤️', boldKey: 'preBenefits.sections.realRelationships.deepRelationship.bold', textKey: 'preBenefits.sections.realRelationships.deepRelationship.text' },
    ],
  },
];

// ── 機能紹介 ──

export const FEATURE_ITEMS: FeatureItem[] = [
  { emoji: '🔥', titleKey: 'preBenefits.features.streakTracking.title', descriptionKey: 'preBenefits.features.streakTracking.description' },
  { emoji: '🔒', titleKey: 'preBenefits.features.contentBlocker.title', descriptionKey: 'preBenefits.features.contentBlocker.description' },
  { emoji: '🌬️', titleKey: 'preBenefits.features.sosBreathing.title', descriptionKey: 'preBenefits.features.sosBreathing.description' },
  { emoji: '📊', titleKey: 'preBenefits.features.dailyCheckin.title', descriptionKey: 'preBenefits.features.dailyCheckin.description' },
  { emoji: '⏱️', titleKey: 'preBenefits.features.widget.title', descriptionKey: 'preBenefits.features.widget.description' },
];
