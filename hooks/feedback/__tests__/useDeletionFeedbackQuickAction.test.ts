import { renderHook, act } from '@testing-library/react-native';
import { Linking, Platform } from 'react-native';

// useQuickActionCallback に渡されたコールバックを捕捉する
const mockCallbackRef: { current: ((a: unknown) => void | Promise<void>) | null } =
  { current: null };
jest.mock('expo-quick-actions/hooks', () => ({
  useQuickActionCallback: (cb: (a: unknown) => void | Promise<void>) => {
    mockCallbackRef.current = cb;
  },
}));

const mockCollect = jest.fn();
jest.mock('@/lib/feedback/collectDeletionDebugInfo', () => ({
  collectDeletionDebugInfo: () => mockCollect(),
}));

jest.mock('@/locales/i18n', () => ({ t: (k: string) => k }));

import {
  useDeletionFeedbackQuickAction,
  DELETION_FEEDBACK_ACTION_ID,
} from '../useDeletionFeedbackQuickAction';

const fakeInfo = {
  appVersion: '2.1.0',
  buildNumber: '42',
  iosVersion: '26.5',
  iosBuildId: '23F77',
  deviceModelId: 'iPhone17,5',
  languageTag: 'ja-JP',
  timezone: 'Asia/Tokyo',
  webExtensionStatus: 'active',
};

let openURLSpy: jest.SpyInstance;

const trigger = async (id: string) => {
  await act(async () => {
    await mockCallbackRef.current!({ id });
  });
};

beforeEach(() => {
  mockCallbackRef.current = null;
  mockCollect.mockReset().mockResolvedValue(fakeInfo);
  (Platform as { OS: string }).OS = 'ios';
  openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
});

afterEach(() => {
  openURLSpy.mockRestore();
});

describe('useDeletionFeedbackQuickAction', () => {
  it('削除フィードバックアクションのときLinking.openURLを呼ぶ', async () => {
    renderHook(() => useDeletionFeedbackQuickAction());
    await trigger(DELETION_FEEDBACK_ACTION_ID);
    expect(openURLSpy).toHaveBeenCalled();
  });

  it('openURLにmailto文字列が渡される', async () => {
    renderHook(() => useDeletionFeedbackQuickAction());
    await trigger(DELETION_FEEDBACK_ACTION_ID);
    expect(openURLSpy).toHaveBeenCalledWith(expect.stringContaining('mailto:'));
  });

  it('アクションIDが一致しないときopenURLを呼ばない', async () => {
    renderHook(() => useDeletionFeedbackQuickAction());
    await trigger('some-other-action');
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it('iOS以外のプラットフォームではopenURLを呼ばない', async () => {
    (Platform as { OS: string }).OS = 'android';
    renderHook(() => useDeletionFeedbackQuickAction());
    await trigger(DELETION_FEEDBACK_ACTION_ID);
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it('メール起動前にデバッグ情報を収集する', async () => {
    renderHook(() => useDeletionFeedbackQuickAction());
    await trigger(DELETION_FEEDBACK_ACTION_ID);
    expect(mockCollect).toHaveBeenCalled();
  });
});
