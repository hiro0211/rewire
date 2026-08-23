import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { ja } from 'date-fns/locale/ja';
import { enUS } from 'date-fns/locale/en-US';

/**
 * トライアル終了後に初回請求が発生する日を返す。
 *
 * なぜ today を引数で受けるか: 内部で new Date() を呼ぶと実行日に依存して
 * テストが壊れるため。純関数に保ち、現在時刻の取得は呼び出し側の責務にする。
 */
export function calcBillingStartDate(today: Date, trialDays: number): Date {
  return addDays(today, trialDays);
}

/** 請求開始日をロケールに合わせた短い表記（ja: 8月18日 / en: Aug 18）に整形する */
export function formatBillingDate(date: Date, locale: 'ja' | 'en'): string {
  return locale === 'ja'
    ? format(date, 'M月d日', { locale: ja })
    : format(date, 'MMM d', { locale: enUS });
}
