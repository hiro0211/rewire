export interface EducationSlide {
  id: string;
  titleKey: string;
  bodyKey: string;
  illustrationType:
    | 'dopamine_bars' | 'lock_icon' | 'dimmed_icons' | 'recovery_progress'
    | 'scattered_focus' | 'shame_cycle' | 'isolation'
    | 'brain_sparkle' | 'vibrant_life';
}

export const EDUCATION_SLIDES: EducationSlide[] = [
  {
    id: 'dopamine_trap',
    titleKey: 'education.dopamineTrap.title',
    bodyKey: 'education.dopamineTrap.body',
    illustrationType: 'dopamine_bars',
  },
  {
    id: 'not_willpower',
    titleKey: 'education.notWillpower.title',
    bodyKey: 'education.notWillpower.body',
    illustrationType: 'lock_icon',
  },
  {
    id: 'daily_impact',
    titleKey: 'education.dailyImpact.title',
    bodyKey: 'education.dailyImpact.body',
    illustrationType: 'dimmed_icons',
  },
];

export const DAMAGE_SLIDES: EducationSlide[] = [
  {
    id: 'focus_collapse',
    titleKey: 'education.focusCollapse.title',
    bodyKey: 'education.focusCollapse.body',
    illustrationType: 'scattered_focus',
  },
  {
    id: 'shame_cycle',
    titleKey: 'education.shameCycle.title',
    bodyKey: 'education.shameCycle.body',
    illustrationType: 'shame_cycle',
  },
  {
    id: 'isolation',
    titleKey: 'education.isolation.title',
    bodyKey: 'education.isolation.body',
    illustrationType: 'isolation',
  },
];

export const RECOVERY_SLIDES: EducationSlide[] = [
  {
    id: 'neuroplasticity',
    titleKey: 'education.neuroplasticity.title',
    bodyKey: 'education.neuroplasticity.body',
    illustrationType: 'brain_sparkle',
  },
  {
    id: 'bright_future',
    titleKey: 'education.brightFuture.title',
    bodyKey: 'education.brightFuture.body',
    illustrationType: 'vibrant_life',
  },
];
