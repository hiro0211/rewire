import { shouldShowReviewPrompt } from '../reviewPromptEligibility';

describe('shouldShowReviewPrompt', () => {
  const now = new Date('2026-03-18T12:00:00Z');

  const baseInput = {
    hasLeftPositiveReview: false,
    accountCreatedAt: '2026-01-01T00:00:00Z',
    checkinCount: 10,
    lastPromptedAt: null,
    dismissCount: 0,
    isIOS: true,
    now,
  };

  describe('レビュー済み → 永久非表示', () => {
    it('hasLeftPositiveReview=true → false', () => {
      expect(shouldShowReviewPrompt({ ...baseInput, hasLeftPositiveReview: true })).toBe(false);
    });
  });

  describe('iOS以外 → 非表示', () => {
    it('isIOS=false → false', () => {
      expect(shouldShowReviewPrompt({ ...baseInput, isIOS: false })).toBe(false);
    });
  });

  describe('アカウント未作成 → 非表示', () => {
    it('accountCreatedAt=null → false', () => {
      expect(shouldShowReviewPrompt({ ...baseInput, accountCreatedAt: null })).toBe(false);
    });
  });

  describe('アカウント作成から7日未満 → 非表示', () => {
    it('作成3日前 → false', () => {
      expect(shouldShowReviewPrompt({
        ...baseInput,
        accountCreatedAt: '2026-03-15T12:00:00Z',
      })).toBe(false);
    });

    it('作成ちょうど7日前 → true', () => {
      expect(shouldShowReviewPrompt({
        ...baseInput,
        accountCreatedAt: '2026-03-11T12:00:00Z',
      })).toBe(true);
    });
  });

  describe('チェックイン5回未満 → 非表示', () => {
    it('checkinCount=3 → false', () => {
      expect(shouldShowReviewPrompt({ ...baseInput, checkinCount: 3 })).toBe(false);
    });

    it('checkinCount=5 → true', () => {
      expect(shouldShowReviewPrompt({ ...baseInput, checkinCount: 5 })).toBe(true);
    });
  });

  describe('dismiss 3回以上 → 永久非表示', () => {
    it('dismissCount=3 → false', () => {
      expect(shouldShowReviewPrompt({
        ...baseInput,
        lastPromptedAt: '2026-01-01T00:00:00Z',
        dismissCount: 3,
      })).toBe(false);
    });
  });

  describe('初回（未プロンプト） → 表示', () => {
    it('lastPromptedAt=null → true', () => {
      expect(shouldShowReviewPrompt(baseInput)).toBe(true);
    });
  });

  describe('クールダウン90日', () => {
    it('前回から60日 → false', () => {
      expect(shouldShowReviewPrompt({
        ...baseInput,
        lastPromptedAt: '2026-01-17T12:00:00Z',
      })).toBe(false);
    });

    it('前回から90日 → true', () => {
      expect(shouldShowReviewPrompt({
        ...baseInput,
        lastPromptedAt: '2025-12-18T12:00:00Z',
      })).toBe(true);
    });
  });

  describe('全条件満たすハッピーパス', () => {
    it('全条件クリア → true', () => {
      expect(shouldShowReviewPrompt(baseInput)).toBe(true);
    });
  });
});
