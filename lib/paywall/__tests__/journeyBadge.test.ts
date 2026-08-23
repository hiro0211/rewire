import { getJourneyBadge, getBadgeById } from '../journeyBadge';
import { getBadgeByDay } from '@/lib/badges/getBadgeByDay';
import type { BadgeId } from '@/constants/badges/BadgeId';

describe('getJourneyBadge', () => {
  it('0日のときstardustを返す', () => {
    expect(getJourneyBadge(0).id).toBe('stardust');
  });

  it('3日のときprotostarを返す', () => {
    expect(getJourneyBadge(3).id).toBe('protostar');
  });

  it('7日のときmoonを返す', () => {
    expect(getJourneyBadge(7).id).toBe('moon');
  });

  it('99999日のときcosmosを返す', () => {
    expect(getJourneyBadge(99999).id).toBe('cosmos');
  });

  it('小数の日数のとき切り捨てた日数のバッジを返す', () => {
    expect(getJourneyBadge(6.9).id).toBe('protostar');
  });

  describe('不正な日数のクランプ', () => {
    // 対比: 素の getBadgeByDay は負数で throw する。
    // ペイウォールで throw すると PaywallErrorBoundary が課金導線ごと消すため、
    // getJourneyBadge が必ず値を返すことが本質的な仕様になる。
    it('素のgetBadgeByDayは負数のときRangeErrorを投げる', () => {
      expect(() => getBadgeByDay(-1)).toThrow(RangeError);
    });

    it('-1のときthrowせずstardustを返す', () => {
      expect(getJourneyBadge(-1).id).toBe('stardust');
    });

    it('-Infinityのときthrowせずstardustを返す', () => {
      expect(getJourneyBadge(-Infinity).id).toBe('stardust');
    });

    it('NaNのときthrowせずstardustを返す', () => {
      expect(getJourneyBadge(NaN).id).toBe('stardust');
    });

    it('Infinityのときthrowせずstardustを返す', () => {
      expect(getJourneyBadge(Infinity).id).toBe('stardust');
    });
  });
});

describe('getBadgeById', () => {
  it('既知のIDのとき対応するバッジを返す', () => {
    expect(getBadgeById('jupiter').id).toBe('jupiter');
  });

  it('既知のIDのとき定義された日数を持つバッジを返す', () => {
    expect(getBadgeById('earth').day).toBe(30);
  });

  it('未知のIDのときstardust（先頭バッジ）にフォールバックする', () => {
    const unknownId = 'unknownBadge' as unknown as BadgeId;

    expect(getBadgeById(unknownId).id).toBe('stardust');
  });
});
