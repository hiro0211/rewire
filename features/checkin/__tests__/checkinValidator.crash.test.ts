import { checkinValidator } from '../checkinValidator';

describe('checkinValidator crash prevention', () => {
  it('watchedPorn=null → バリデーションエラー', () => {
    const result = checkinValidator.validate({ watchedPorn: null, urgeLevel: 3, stressLevel: 3, qualityOfLife: 3 });
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('watchedPorn=true → OK', () => {
    const result = checkinValidator.validate({ watchedPorn: true, urgeLevel: 3, stressLevel: 3, qualityOfLife: 3 });
    expect(result.ok).toBe(true);
  });

  it('watchedPorn=false → OK', () => {
    const result = checkinValidator.validate({ watchedPorn: false, urgeLevel: 3, stressLevel: 3, qualityOfLife: 3 });
    expect(result.ok).toBe(true);
  });

  it('watchedPorn=undefined → バリデーションエラー（not crashする）', () => {
    expect(() =>
      checkinValidator.validate({ watchedPorn: undefined as any, urgeLevel: 3, stressLevel: 3, qualityOfLife: 3 })
    ).not.toThrow();
  });

  it('空オブジェクト → クラッシュしない', () => {
    expect(() => checkinValidator.validate({} as any)).not.toThrow();
  });

  it('全フィールドundefined → クラッシュしない', () => {
    expect(() =>
      checkinValidator.validate({
        watchedPorn: undefined as any,
        urgeLevel: undefined as any,
        stressLevel: undefined as any,
        qualityOfLife: undefined as any,
      })
    ).not.toThrow();
  });
});
