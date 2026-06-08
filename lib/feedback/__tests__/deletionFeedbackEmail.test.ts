// t() はキー名をそのまま返すモックにして、件名/ラベルの参照キーを検証する
jest.mock('@/locales/i18n', () => ({
  t: (key: string) => key,
}));

import {
  buildDeletionFeedbackEmail,
  buildDeletionFeedbackMailto,
} from '../deletionFeedbackEmail';
import { SUPPORT_EMAIL } from '@/constants/support';
import type { DeletionDebugInfo } from '../types';

const fullInfo: DeletionDebugInfo = {
  appVersion: '2.1.0',
  buildNumber: '42',
  iosVersion: '26.5',
  iosBuildId: '23F77',
  deviceModelId: 'iPhone17,5',
  languageTag: 'ja-JP',
  timezone: 'Asia/Tokyo',
};

describe('buildDeletionFeedbackEmail', () => {
  it('宛先がサポートメールアドレスになる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).to).toBe(SUPPORT_EMAIL);
  });

  it('件名がdeletionFeedback.subjectのi18nキーになる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).subject).toBe(
      'deletionFeedback.subject',
    );
  });

  it('本文にアプリバージョンが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('2.1.0');
  });

  it('本文にビルド番号が含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('42');
  });

  it('本文にiOSバージョンが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('26.5');
  });

  it('本文にiOSビルドIDが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('23F77');
  });

  it('本文にデバイスモデルIDが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('iPhone17,5');
  });

  it('本文に言語タグが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('ja-JP');
  });

  it('本文にタイムゾーンが含まれる', () => {
    expect(buildDeletionFeedbackEmail(fullInfo).body).toContain('Asia/Tokyo');
  });

  it('デバイスモデルIDが空文字のときunknownラベルにフォールバックする', () => {
    const body = buildDeletionFeedbackEmail({
      ...fullInfo,
      deviceModelId: '',
    }).body;
    expect(body).toContain('deletionFeedback.unknown');
  });
});

describe('buildDeletionFeedbackMailto', () => {
  it('mailto:サポートアドレスで始まる', () => {
    expect(buildDeletionFeedbackMailto(fullInfo)).toMatch(
      new RegExp(`^mailto:${SUPPORT_EMAIL}`),
    );
  });

  it('件名がURLエンコードされてクエリに含まれる', () => {
    const subject = buildDeletionFeedbackEmail(fullInfo).subject;
    expect(buildDeletionFeedbackMailto(fullInfo)).toContain(
      `subject=${encodeURIComponent(subject)}`,
    );
  });

  it('本文の改行がURLエンコード(%0A)される', () => {
    expect(buildDeletionFeedbackMailto(fullInfo)).toContain('%0A');
  });

  it('iOSビルドIDが空でも例外なくmailtoを生成できる', () => {
    expect(
      buildDeletionFeedbackMailto({ ...fullInfo, iosBuildId: '' }),
    ).toMatch(/^mailto:/);
  });
});
