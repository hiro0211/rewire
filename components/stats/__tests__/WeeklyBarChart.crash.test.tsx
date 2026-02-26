import React from 'react';
import { render } from '@testing-library/react-native';
import { WeeklyBarChart } from '../WeeklyBarChart';

describe('WeeklyBarChart crash prevention', () => {
  it('空配列 → クラッシュしない', () => {
    // Math.max(...[]) returns -Infinity, but we guard with ,1
    expect(() => render(<WeeklyBarChart data={[]} />)).not.toThrow();
  });

  it('totalDuration=0の全データ → クラッシュしない', () => {
    const data = [
      { date: '2026-02-24', totalDuration: 0 },
      { date: '2026-02-25', totalDuration: 0 },
      { date: '2026-02-26', totalDuration: 0 },
    ];
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });

  it('7日分の通常データ → クラッシュしない', () => {
    const data = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-02-${20 + i}`,
      totalDuration: i * 60000,
    }));
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });

  it('非常に大きな totalDuration → クラッシュしない', () => {
    const data = [
      { date: '2026-02-26', totalDuration: Number.MAX_SAFE_INTEGER },
    ];
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });

  it('不正な日付文字列 → クラッシュしない', () => {
    const data = [
      { date: 'invalid-date', totalDuration: 60000 },
    ];
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });

  it('1日分のみ → クラッシュしない', () => {
    const data = [
      { date: '2026-02-26', totalDuration: 120000 },
    ];
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });

  it('負の totalDuration → クラッシュしない', () => {
    const data = [
      { date: '2026-02-26', totalDuration: -1000 },
    ];
    expect(() => render(<WeeklyBarChart data={data as any} />)).not.toThrow();
  });
});
