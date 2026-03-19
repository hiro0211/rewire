const mockIsCompleted = jest.fn();
const mockGetUser = jest.fn();
const mockGetPromptState = jest.fn();

jest.mock('@/lib/storage/surveyStorage', () => ({
  surveyStorage: {
    isCompleted: (...args: any[]) => mockIsCompleted(...args),
  },
}));

jest.mock('@/lib/storage/userStorage', () => ({
  userStorage: {
    get: (...args: any[]) => mockGetUser(...args),
  },
}));

jest.mock('@/lib/storage/surveyPromptStorage', () => ({
  surveyPromptStorage: {
    getState: (...args: any[]) => mockGetPromptState(...args),
  },
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import { useSurveyEligibility } from '../useSurveyEligibility';

describe('useSurveyEligibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未完了・3日以上・初回プロンプト → true', async () => {
    mockIsCompleted.mockResolvedValue(false);
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    mockGetUser.mockResolvedValue({
      id: 'user-1',
      createdAt: fourDaysAgo.toISOString(),
    });
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: null,
      dismissCount: 0,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(true);
    });
  });

  it('完了済み → false', async () => {
    mockIsCompleted.mockResolvedValue(true);
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    mockGetUser.mockResolvedValue({
      id: 'user-1',
      createdAt: fiveDaysAgo.toISOString(),
    });
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: null,
      dismissCount: 0,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(false);
    });
  });

  it('利用開始から3日未満 → false', async () => {
    mockIsCompleted.mockResolvedValue(false);
    mockGetUser.mockResolvedValue({
      id: 'user-1',
      createdAt: new Date().toISOString(),
    });
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: null,
      dismissCount: 0,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(false);
    });
  });

  it('ユーザーが存在しない → false', async () => {
    mockIsCompleted.mockResolvedValue(false);
    mockGetUser.mockResolvedValue(null);
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: null,
      dismissCount: 0,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(false);
    });
  });

  it('dismiss 3回 → false', async () => {
    mockIsCompleted.mockResolvedValue(false);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    mockGetUser.mockResolvedValue({
      id: 'user-1',
      createdAt: '2026-01-01T00:00:00Z',
    });
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: tenDaysAgo.toISOString(),
      dismissCount: 3,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(false);
    });
  });

  it('dismiss後7日以内 → false', async () => {
    mockIsCompleted.mockResolvedValue(false);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    mockGetUser.mockResolvedValue({
      id: 'user-1',
      createdAt: '2026-01-01T00:00:00Z',
    });
    mockGetPromptState.mockResolvedValue({
      lastPromptedAt: threeDaysAgo.toISOString(),
      dismissCount: 1,
    });

    const { result } = renderHook(() => useSurveyEligibility());

    await waitFor(() => {
      expect(result.current.shouldShowSurvey).toBe(false);
    });
  });
});
