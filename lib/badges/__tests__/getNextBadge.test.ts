import { getNextBadge } from '../getNextBadge';

describe('getNextBadge', () => {
  it('day=0 → 次はnebula', () => {
    const next = getNextBadge(0);
    expect(next?.id).toBe('nebula');
  });

  it('day=1 → 次はprotostar', () => {
    const next = getNextBadge(1);
    expect(next?.id).toBe('protostar');
  });

  it('day=2 → 次はprotostar（まだnebula区間）', () => {
    const next = getNextBadge(2);
    expect(next?.id).toBe('protostar');
  });

  it('day=1094 → 次はcosmos', () => {
    const next = getNextBadge(1094);
    expect(next?.id).toBe('cosmos');
  });

  it('day=1095 → null（最終バッジ達成済み）', () => {
    expect(getNextBadge(1095)).toBeNull();
  });

  it('day=9999 → null', () => {
    expect(getNextBadge(9999)).toBeNull();
  });
});
