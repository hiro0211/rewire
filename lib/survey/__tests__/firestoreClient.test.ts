const mockAdd = jest.fn();

jest.mock('@react-native-firebase/firestore', () => {
  const firestoreFn = () => ({
    collection: () => ({
      add: mockAdd,
    }),
  });
  return { __esModule: true, default: firestoreFn };
});

jest.mock('@/lib/nativeGuard', () => ({
  isExpoGo: false,
}));

import { firestoreClient } from '../firestoreClient';
import type { SurveyResponse } from '@/types/survey';

const testResponse: SurveyResponse = {
  userId: 'user-1',
  responses: {
    age_range: '25-34',
    discovery_channel: 'sns',
    motivation: 'self_control',
    perceived_change: 'slight',
  },
  completedAt: '2026-03-18T00:00:00Z',
  appVersion: '1.0.0',
  platform: 'ios',
};

describe('firestoreClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitSurvey', () => {
    it('Firestore surveysコレクションにデータを追加する', async () => {
      mockAdd.mockResolvedValue({ id: 'doc-1' });
      await firestoreClient.submitSurvey(testResponse);
      expect(mockAdd).toHaveBeenCalledWith(testResponse);
    });

    it('エラー時にクラッシュしない', async () => {
      mockAdd.mockRejectedValueOnce(new Error('Firestore error'));
      await expect(
        firestoreClient.submitSurvey(testResponse)
      ).resolves.toBeUndefined();
    });
  });
});
