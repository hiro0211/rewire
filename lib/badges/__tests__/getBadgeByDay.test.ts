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
  it('day=0 → stardust', () => {
    expect(getBadgeByDay(0).id).toBe('stardust');
  });

  it('day=1 → nebula', () => {
    expect(getBadgeByDay(1).id).toBe('nebula');
  });

  it('day=2 → nebula（1と3の間）', () => {
    expect(getBadgeByDay(2).id).toBe('nebula');
  });

  it('day=3 → protostar', () => {
    expect(getBadgeByDay(3).id).toBe('protostar');
  });

  it('day=6 → protostar（3と7の間）', () => {
    expect(getBadgeByDay(6).id).toBe('protostar');
  });

  it('day=7 → moon', () => {
    expect(getBadgeByDay(7).id).toBe('moon');
  });

  it('day=14 → mercury', () => {
    expect(getBadgeByDay(14).id).toBe('mercury');
  });

  it('day=21 → venus', () => {
    expect(getBadgeByDay(21).id).toBe('venus');
  });

  it('day=22 → venus（21と30の間）', () => {
    expect(getBadgeByDay(22).id).toBe('venus');
  });

  it('day=30 → earth', () => {
    expect(getBadgeByDay(30).id).toBe('earth');
  });

  it('day=45 → mars', () => {
    expect(getBadgeByDay(45).id).toBe('mars');
  });

  it('day=60 → jupiter', () => {
    expect(getBadgeByDay(60).id).toBe('jupiter');
  });

  it('day=61 → jupiter（60と90の間）', () => {
    expect(getBadgeByDay(61).id).toBe('jupiter');
  });

  it('day=90 → saturn', () => {
    expect(getBadgeByDay(90).id).toBe('saturn');
  });

  it('day=120 → uranus', () => {
    expect(getBadgeByDay(120).id).toBe('uranus');
  });

  it('day=180 → neptune', () => {
    expect(getBadgeByDay(180).id).toBe('neptune');
  });

  it('day=181 → neptune（180と270の間）', () => {
    expect(getBadgeByDay(181).id).toBe('neptune');
  });

  it('day=270 → sun', () => {
    expect(getBadgeByDay(270).id).toBe('sun');
  });

  it('day=365 → whiteDwarf', () => {
    expect(getBadgeByDay(365).id).toBe('whiteDwarf');
  });

  it('day=500 → stellarSystem', () => {
    expect(getBadgeByDay(500).id).toBe('stellarSystem');
  });

  it('day=501 → stellarSystem（500と730の間）', () => {
    expect(getBadgeByDay(501).id).toBe('stellarSystem');
  });

  it('day=730 → starCluster', () => {
    expect(getBadgeByDay(730).id).toBe('starCluster');
  });

  it('day=1000 → galaxy', () => {
    expect(getBadgeByDay(1000).id).toBe('galaxy');
  });

  it('day=1094 → galaxy（1000と1095の間）', () => {
    expect(getBadgeByDay(1094).id).toBe('galaxy');
  });

  it('day=1095 → cosmos', () => {
    expect(getBadgeByDay(1095).id).toBe('cosmos');
  });

  it('day=9999 → cosmos', () => {
    expect(getBadgeByDay(9999).id).toBe('cosmos');
  });

  it('day=-1 → RangeError', () => {
    expect(() => getBadgeByDay(-1)).toThrow(RangeError);
  });

  it('返り値はNeuralBadgeDefinitionの全フィールドを持つ', () => {
    const badge = getBadgeByDay(7);
    expect(badge.id).toBe('moon');
    expect(badge.day).toBe(7);
    expect(badge.chapter).toBe('innerPlanets');
    expect(badge.nameJa).toBeTruthy();
    expect(badge.nameEn).toBeTruthy();
    expect(badge.message).toBeTruthy();
    expect(badge.colors.core).toBeTruthy();
  });
});
