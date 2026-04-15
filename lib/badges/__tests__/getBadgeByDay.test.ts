import { getBadgeByDay, asDayCount } from '../getBadgeByDay';

describe('asDayCount', () => {
  it('0以上の整数を受け付ける', () => {
    expect(asDayCount(0)).toBe(0);
    expect(asDayCount(100)).toBe(100);
  });

  it('負の数でRangeErrorを投げる', () => {
    expect(() => asDayCount(-1)).toThrow(RangeError);
  });
});

describe('getBadgeByDay', () => {
  it('day=0 → Stardust', () => {
    expect(getBadgeByDay(0).id).toBe('Stardust');
  });

  it('day=1 → Nebula', () => {
    expect(getBadgeByDay(1).id).toBe('Nebula');
  });

  it('day=2 → Nebula（1と3の間）', () => {
    expect(getBadgeByDay(2).id).toBe('Nebula');
  });

  it('day=3 → Protostar', () => {
    expect(getBadgeByDay(3).id).toBe('Protostar');
  });

  it('day=6 → Protostar（3と7の間）', () => {
    expect(getBadgeByDay(6).id).toBe('Protostar');
  });

  it('day=7 → Ignition', () => {
    expect(getBadgeByDay(7).id).toBe('Ignition');
  });

  it('day=14 → MainSequence', () => {
    expect(getBadgeByDay(14).id).toBe('MainSequence');
  });

  it('day=21 → Radiance', () => {
    expect(getBadgeByDay(21).id).toBe('Radiance');
  });

  it('day=22 → Radiance（21と30の間）', () => {
    expect(getBadgeByDay(22).id).toBe('Radiance');
  });

  it('day=30 → AccretionDisk', () => {
    expect(getBadgeByDay(30).id).toBe('AccretionDisk');
  });

  it('day=45 → Planetesimal', () => {
    expect(getBadgeByDay(45).id).toBe('Planetesimal');
  });

  it('day=60 → PlanetaryBirth', () => {
    expect(getBadgeByDay(60).id).toBe('PlanetaryBirth');
  });

  it('day=61 → PlanetaryBirth（60と90の間）', () => {
    expect(getBadgeByDay(61).id).toBe('PlanetaryBirth');
  });

  it('day=90 → HabitableWorld', () => {
    expect(getBadgeByDay(90).id).toBe('HabitableWorld');
  });

  it('day=120 → Biogenesis', () => {
    expect(getBadgeByDay(120).id).toBe('Biogenesis');
  });

  it('day=180 → Civilization', () => {
    expect(getBadgeByDay(180).id).toBe('Civilization');
  });

  it('day=181 → Civilization（180と270の間）', () => {
    expect(getBadgeByDay(181).id).toBe('Civilization');
  });

  it('day=270 → SolarSystem', () => {
    expect(getBadgeByDay(270).id).toBe('SolarSystem');
  });

  it('day=365 → BinaryStars', () => {
    expect(getBadgeByDay(365).id).toBe('BinaryStars');
  });

  it('day=500 → StarCluster', () => {
    expect(getBadgeByDay(500).id).toBe('StarCluster');
  });

  it('day=501 → StarCluster（500と730の間）', () => {
    expect(getBadgeByDay(501).id).toBe('StarCluster');
  });

  it('day=730 → Galaxy', () => {
    expect(getBadgeByDay(730).id).toBe('Galaxy');
  });

  it('day=1000 → GalaxyCluster', () => {
    expect(getBadgeByDay(1000).id).toBe('GalaxyCluster');
  });

  it('day=1094 → GalaxyCluster（1000と1095の間）', () => {
    expect(getBadgeByDay(1094).id).toBe('GalaxyCluster');
  });

  it('day=1095 → Cosmos', () => {
    expect(getBadgeByDay(1095).id).toBe('Cosmos');
  });

  it('day=9999 → Cosmos', () => {
    expect(getBadgeByDay(9999).id).toBe('Cosmos');
  });

  it('day=-1 → RangeError', () => {
    expect(() => getBadgeByDay(-1)).toThrow(RangeError);
  });

  it('返り値はNeuralBadgeDefinitionの全フィールドを持つ', () => {
    const badge = getBadgeByDay(7);
    expect(badge.id).toBe('Ignition');
    expect(badge.day).toBe(7);
    expect(badge.chapter).toBe('ignition');
    expect(badge.nameJa).toBeTruthy();
    expect(badge.nameEn).toBeTruthy();
    expect(badge.message).toBeTruthy();
    expect(badge.colors.core).toBeTruthy();
  });
});
