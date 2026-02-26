import { checkinValidator } from '../checkinValidator';
import type { CheckinFormInput } from '@/types/checkin';

const validInput: CheckinFormInput = {
  watchedPorn: false,
  urgeLevel: 2,
  stressLevel: 2,
  qualityOfLife: 3,
  memo: '',
};

describe('checkinValidator', () => {
  it('有効な入力でok=trueを返す', () => {
    const result = checkinValidator.validate(validInput);
    expect(result).toEqual({ ok: true });
  });

  it('watchedPorn=trueでもok=trueを返す', () => {
    const result = checkinValidator.validate({ ...validInput, watchedPorn: true });
    expect(result).toEqual({ ok: true });
  });

  it('watchedPorn=nullの場合ok=falseとエラーメッセージを返す', () => {
    const result = checkinValidator.validate({ ...validInput, watchedPorn: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ポルノ視聴の有無を選択してください');
  });

  it('各スライダー値が最低値でもバリデーション通過', () => {
    const result = checkinValidator.validate({
      ...validInput,
      urgeLevel: 0,
      stressLevel: 0,
      qualityOfLife: 1,
    });
    expect(result.ok).toBe(true);
  });

  it('各スライダー値が最大値でもバリデーション通過', () => {
    const result = checkinValidator.validate({
      ...validInput,
      urgeLevel: 4,
      stressLevel: 4,
      qualityOfLife: 5,
    });
    expect(result.ok).toBe(true);
  });

  it('空メモでもバリデーション通過', () => {
    const result = checkinValidator.validate({ ...validInput, memo: '' });
    expect(result.ok).toBe(true);
  });

  it('長いメモでもバリデーション通過', () => {
    const result = checkinValidator.validate({
      ...validInput,
      memo: 'テスト'.repeat(1000),
    });
    expect(result.ok).toBe(true);
  });
});
