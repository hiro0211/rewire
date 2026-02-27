import { createWidgetPayload } from '../widgetPayload';

describe('createWidgetPayload', () => {
  it('全フィールドが正しい形で返る', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2026-02-20T00:00:00Z',
      goalDays: 90,
      relapseCount: 3,
    });
    expect(payload).toEqual({
      streakStartDate: '2026-02-20T00:00:00Z',
      goalDays: 90,
      relapseCount: 3,
      updatedAt: expect.any(String),
    });
  });

  it('null streakStartDate が維持される', () => {
    const payload = createWidgetPayload({
      streakStartDate: null,
      goalDays: 30,
      relapseCount: 0,
    });
    expect(payload.streakStartDate).toBeNull();
    expect(payload.goalDays).toBe(30);
    expect(payload.relapseCount).toBe(0);
  });

  it('goalDays=0 がそのまま返る', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2026-01-01',
      goalDays: 0,
      relapseCount: 0,
    });
    expect(payload.goalDays).toBe(0);
  });

  it('大きな relapseCount がそのまま返る', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2025-01-01',
      goalDays: 365,
      relapseCount: 999,
    });
    expect(payload.relapseCount).toBe(999);
  });

  it('updatedAt がISO文字列', () => {
    const before = new Date().toISOString();
    const payload = createWidgetPayload({
      streakStartDate: '2026-02-20',
      goalDays: 30,
      relapseCount: 0,
    });
    const after = new Date().toISOString();
    expect(payload.updatedAt >= before).toBe(true);
    expect(payload.updatedAt <= after).toBe(true);
  });

  it('JSON.stringify → parse のラウンドトリップ', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2026-02-20T00:00:00Z',
      goalDays: 90,
      relapseCount: 5,
    });
    const json = JSON.stringify(payload);
    const parsed = JSON.parse(json);
    expect(parsed.streakStartDate).toBe('2026-02-20T00:00:00Z');
    expect(parsed.goalDays).toBe(90);
    expect(parsed.relapseCount).toBe(5);
    expect(parsed.updatedAt).toBeDefined();
  });

  it('null streakStartDate が JSON で "null"（not undefined）', () => {
    const payload = createWidgetPayload({
      streakStartDate: null,
      goalDays: 30,
      relapseCount: 0,
    });
    const json = JSON.stringify(payload);
    expect(json).toContain('"streakStartDate":null');
  });

  it('YYYY-MM-DD形式のstreakStartDateがフルISO形式に正規化される', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2026-02-27',
      goalDays: 30,
      relapseCount: 0,
    });
    expect(payload.streakStartDate).toBe('2026-02-27T00:00:00.000Z');
  });

  it('フルISO形式のstreakStartDateはそのまま維持される', () => {
    const payload = createWidgetPayload({
      streakStartDate: '2026-02-27T04:57:00.000Z',
      goalDays: 30,
      relapseCount: 0,
    });
    expect(payload.streakStartDate).toBe('2026-02-27T04:57:00.000Z');
  });

  it('毎回新しいオブジェクトを返す（ミューテーションなし）', () => {
    const input = { streakStartDate: '2026-01-01', goalDays: 30, relapseCount: 0 };
    const a = createWidgetPayload(input);
    const b = createWidgetPayload(input);
    expect(a).not.toBe(b);
  });
});
