export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BadgeDefinition {
  id: string;
  requiredDays: number;
  nameKey: string;
  descriptionKey: string;
  tier: BadgeTier;
  iconName: string;
  gradientColors: string[];
}

export const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#00D4FF',
};

export const BADGES: BadgeDefinition[] = [
  { id: 'fresh_start', requiredDays: 0, nameKey: 'badges.freshStart.name', descriptionKey: 'badges.freshStart.description', tier: 'bronze', iconName: 'leaf-outline', gradientColors: ['#8B9DAF', '#4A6741'] },
  { id: 'first_light', requiredDays: 1, nameKey: 'badges.firstLight.name', descriptionKey: 'badges.firstLight.description', tier: 'bronze', iconName: 'sunny-outline', gradientColors: ['#FFE4A0', '#E8A030'] },
  { id: 'steady_step', requiredDays: 3, nameKey: 'badges.steadyStep.name', descriptionKey: 'badges.steadyStep.description', tier: 'bronze', iconName: 'footsteps-outline', gradientColors: ['#7EC8A0', '#3A8B5C'] },
  { id: 'one_week', requiredDays: 7, nameKey: 'badges.oneWeek.name', descriptionKey: 'badges.oneWeek.description', tier: 'bronze', iconName: 'shield-checkmark-outline', gradientColors: ['#5BBBEF', '#2878B5'] },
  { id: 'rising_flame', requiredDays: 14, nameKey: 'badges.risingFlame.name', descriptionKey: 'badges.risingFlame.description', tier: 'silver', iconName: 'flame-outline', gradientColors: ['#FF9A56', '#E85D30'] },
  { id: 'three_weeks', requiredDays: 21, nameKey: 'badges.threeWeeks.name', descriptionKey: 'badges.threeWeeks.description', tier: 'silver', iconName: 'leaf', gradientColors: ['#A8E06A', '#5BA02E'] },
  { id: 'one_month', requiredDays: 30, nameKey: 'badges.oneMonth.name', descriptionKey: 'badges.oneMonth.description', tier: 'silver', iconName: 'medal-outline', gradientColors: ['#C0C8E0', '#8090B8'] },
  { id: 'resilient', requiredDays: 45, nameKey: 'badges.resilient.name', descriptionKey: 'badges.resilient.description', tier: 'gold', iconName: 'fitness-outline', gradientColors: ['#FFD060', '#C89820'] },
  { id: 'two_months', requiredDays: 60, nameKey: 'badges.twoMonths.name', descriptionKey: 'badges.twoMonths.description', tier: 'gold', iconName: 'heart', gradientColors: ['#FF7878', '#C83030'] },
  { id: 'reboot', requiredDays: 90, nameKey: 'badges.reboot.name', descriptionKey: 'badges.reboot.description', tier: 'gold', iconName: 'refresh-circle', gradientColors: ['#00E5FF', '#0088CC'] },
  { id: 'iron_will', requiredDays: 120, nameKey: 'badges.ironWill.name', descriptionKey: 'badges.ironWill.description', tier: 'platinum', iconName: 'barbell-outline', gradientColors: ['#B0B8C8', '#6070A0'] },
  { id: 'half_year', requiredDays: 180, nameKey: 'badges.halfYear.name', descriptionKey: 'badges.halfYear.description', tier: 'platinum', iconName: 'planet-outline', gradientColors: ['#E8A0FF', '#9040D0'] },
  { id: 'pioneer', requiredDays: 270, nameKey: 'badges.pioneer.name', descriptionKey: 'badges.pioneer.description', tier: 'platinum', iconName: 'compass-outline', gradientColors: ['#FFB830', '#E07000'] },
  { id: 'one_year', requiredDays: 365, nameKey: 'badges.oneYear.name', descriptionKey: 'badges.oneYear.description', tier: 'platinum', iconName: 'trophy', gradientColors: ['#FFD700', '#B8860B'] },
  { id: 'fortress', requiredDays: 500, nameKey: 'badges.fortress.name', descriptionKey: 'badges.fortress.description', tier: 'diamond', iconName: 'shield', gradientColors: ['#E0E8F0', '#A0B0D0'] },
  { id: 'two_years', requiredDays: 730, nameKey: 'badges.twoYears.name', descriptionKey: 'badges.twoYears.description', tier: 'diamond', iconName: 'diamond-outline', gradientColors: ['#70E8FF', '#2090E0'] },
  { id: 'legend', requiredDays: 1000, nameKey: 'badges.legend.name', descriptionKey: 'badges.legend.description', tier: 'diamond', iconName: 'star', gradientColors: ['#FFE070', '#FF8C00', '#FF4500'] },
  { id: 'three_years', requiredDays: 1095, nameKey: 'badges.threeYears.name', descriptionKey: 'badges.threeYears.description', tier: 'diamond', iconName: 'crown-outline', gradientColors: ['#00F0FF', '#A855F7', '#EC4899'] },
];
