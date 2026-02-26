import React from 'react';
import { render } from '@testing-library/react-native';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/hooks/achievements/useAchievements', () => ({
  useAchievements: () => ({ unlocked: [], locked: [] }),
}));

let mockUser: any = null;
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({ user: mockUser }),
}));

import { ProfileHeader } from '../ProfileHeader';

describe('ProfileHeader crash prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = null;
  });

  it('user=null → クラッシュしない', () => {
    mockUser = null;
    expect(() => render(<ProfileHeader />)).not.toThrow();
  });

  it('user.nickname=undefined → フォールバック表示', () => {
    mockUser = { goalDays: 30 };
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('ユーザー')).toBeTruthy();
  });

  it('user.nickname=空文字 → フォールバック表示', () => {
    mockUser = { nickname: '', goalDays: 30 };
    const { getByText } = render(<ProfileHeader />);
    expect(getByText('ユーザー')).toBeTruthy();
  });

  it('user.createdAt=null → joinDate非表示、クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, createdAt: null };
    expect(() => render(<ProfileHeader />)).not.toThrow();
  });

  it('user.createdAt=不正な値 → クラッシュしない', () => {
    mockUser = { nickname: 'Test', goalDays: 30, createdAt: 'invalid-date' };
    expect(() => render(<ProfileHeader />)).not.toThrow();
  });

  it('user.createdAt=有効なISO → 日付表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30, createdAt: '2026-02-17T00:00:00Z' };
    const { getByText } = render(<ProfileHeader />);
    expect(getByText(/Rewire参加/)).toBeTruthy();
  });

  it('unlocked=空配列 → デフォルトアイコン表示', () => {
    mockUser = { nickname: 'Test', goalDays: 30 };
    expect(() => render(<ProfileHeader />)).not.toThrow();
  });
});
