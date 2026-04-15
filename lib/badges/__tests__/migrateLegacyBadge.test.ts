import { migrateLegacyBadge } from '../migrateLegacyBadge';

describe('migrateLegacyBadge', () => {
  const mappings: [string, string][] = [
    ['fresh_start', 'Stardust'],
    ['first_light', 'Nebula'],
    ['steady_step', 'Protostar'],
    ['one_week', 'Ignition'],
    ['rising_flame', 'MainSequence'],
    ['three_weeks', 'Radiance'],
    ['one_month', 'AccretionDisk'],
    ['resilient', 'Planetesimal'],
    ['two_months', 'PlanetaryBirth'],
    ['reboot', 'HabitableWorld'],
    ['iron_will', 'Biogenesis'],
    ['half_year', 'Civilization'],
    ['pioneer', 'SolarSystem'],
    ['one_year', 'BinaryStars'],
    ['fortress', 'StarCluster'],
    ['two_years', 'Galaxy'],
    ['legend', 'GalaxyCluster'],
    ['three_years', 'Cosmos'],
  ];

  it.each(mappings)('旧ID "%s" → 新ID "%s"', (oldId, expectedNewId) => {
    expect(migrateLegacyBadge(oldId)).toBe(expectedNewId);
  });

  it('不明なID → null', () => {
    expect(migrateLegacyBadge('unknown_badge')).toBeNull();
  });

  it('空文字 → null', () => {
    expect(migrateLegacyBadge('')).toBeNull();
  });
});
