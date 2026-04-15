import { getNextBadge } from '../getNextBadge';

describe('getNextBadge', () => {
  it('day=0 → 次はNebula', () => {
    const next = getNextBadge(0);
    expect(next?.id).toBe('Nebula');
  });

  it('day=1 → 次はProtostar', () => {
    const next = getNextBadge(1);
    expect(next?.id).toBe('Protostar');
  });

  it('day=2 → 次はProtostar（まだNebula区間）', () => {
    const next = getNextBadge(2);
    expect(next?.id).toBe('Protostar');
  });

  it('day=1094 → 次はCosmos', () => {
    const next = getNextBadge(1094);
    expect(next?.id).toBe('Cosmos');
  });

  it('day=1095 → null（最終バッジ達成済み）', () => {
    expect(getNextBadge(1095)).toBeNull();
  });

  it('day=9999 → null', () => {
    expect(getNextBadge(9999)).toBeNull();
  });
});
