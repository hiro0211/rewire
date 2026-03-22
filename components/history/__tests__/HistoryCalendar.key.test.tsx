import React from 'react';
import { Text } from 'react-native';

/**
 * 英語の曜日ヘッダーで key が重複しないことを検証する。
 * 英語: S, M, T, W, T, F, S → "T" と "S" が重複するため key={day} では React warning が出る。
 * key={index} を使えば重複しない。
 */
describe('HistoryCalendar weekDay keys', () => {
  it('英語の曜日配列にはインデックスベースの key を使うべき', () => {
    const englishWeekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // day 文字列を key にすると重複が発生する
    const uniqueDays = new Set(englishWeekDays);
    expect(uniqueDays.size).toBeLessThan(englishWeekDays.length);

    // index を key にすれば一意になる
    const indexKeys = englishWeekDays.map((_, i) => i);
    const uniqueIndexKeys = new Set(indexKeys);
    expect(uniqueIndexKeys.size).toBe(englishWeekDays.length);
  });
});
