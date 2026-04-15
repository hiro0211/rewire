import type { BadgeId } from '@/constants/badges/BadgeId';

const LEGACY_TO_NEURAL: Record<string, BadgeId> = {
  fresh_start: 'Stardust',
  first_light: 'Nebula',
  steady_step: 'Protostar',
  one_week: 'Ignition',
  rising_flame: 'MainSequence',
  three_weeks: 'Radiance',
  one_month: 'AccretionDisk',
  resilient: 'Planetesimal',
  two_months: 'PlanetaryBirth',
  reboot: 'HabitableWorld',
  iron_will: 'Biogenesis',
  half_year: 'Civilization',
  pioneer: 'SolarSystem',
  one_year: 'BinaryStars',
  fortress: 'StarCluster',
  two_years: 'Galaxy',
  legend: 'GalaxyCluster',
  three_years: 'Cosmos',
};

/** 旧バッジIDから新BadgeIdへの変換。不明なIDはnull */
export function migrateLegacyBadge(oldId: string): BadgeId | null {
  return LEGACY_TO_NEURAL[oldId] ?? null;
}
