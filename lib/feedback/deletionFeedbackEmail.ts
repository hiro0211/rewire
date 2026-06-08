import { t } from '@/locales/i18n';
import { SUPPORT_EMAIL } from '@/constants/support';
import type { DeletionDebugInfo, DeletionFeedbackEmail } from './types';

/** 値が空なら unknown ラベルに置き換える */
function orUnknown(value: string): string {
  return value.trim().length > 0 ? value : t('deletionFeedback.unknown');
}

/**
 * 削除前フィードバックメールの宛先・件名・本文を組み立てる純粋関数。
 * 本文は「削除理由を書く導入文 + ラベル付きデバッグ情報」で構成する。
 */
export function buildDeletionFeedbackEmail(
  info: DeletionDebugInfo,
): DeletionFeedbackEmail {
  const lines = [
    t('deletionFeedback.bodyIntro'),
    '',
    '',
    '-----',
    `${t('deletionFeedback.labelAppVersion')}: ${orUnknown(info.appVersion)} (${orUnknown(info.buildNumber)})`,
    `${t('deletionFeedback.labelIosVersion')}: ${orUnknown(info.iosVersion)} (${t('deletionFeedback.labelIosBuild')} ${orUnknown(info.iosBuildId)})`,
    `${t('deletionFeedback.labelDevice')}: ${orUnknown(info.deviceModelId)}`,
    `${t('deletionFeedback.labelLanguage')}: ${orUnknown(info.languageTag)}`,
    `${t('deletionFeedback.labelTimezone')}: ${orUnknown(info.timezone)}`,
  ];

  return {
    to: SUPPORT_EMAIL,
    subject: t('deletionFeedback.subject'),
    body: lines.join('\n'),
  };
}

/** 上記メールを mailto: URL 文字列に変換する（件名・本文を URL エンコード） */
export function buildDeletionFeedbackMailto(info: DeletionDebugInfo): string {
  const { to, subject, body } = buildDeletionFeedbackEmail(info);
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${to}?${query}`;
}
