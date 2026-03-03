import { useState, useCallback } from 'react';

export function useOnboardingForm() {
  const [nickname, setNickname] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [dataAgreed, setDataAgreed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notifyTime, setNotifyTime] = useState('22:00');

  const now = new Date();
  const [lastViewedYear, setLastViewedYear] = useState(now.getFullYear());
  const [lastViewedMonth, setLastViewedMonth] = useState(now.getMonth() + 1);
  const [lastViewedDay, setLastViewedDay] = useState(now.getDate());

  const togglePrivacyAgreed = useCallback(() => {
    setPrivacyAgreed((prev) => !prev);
  }, []);

  const toggleDataAgreed = useCallback(() => {
    setDataAgreed((prev) => !prev);
  }, []);

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  return {
    nickname,
    setNickname,
    privacyAgreed,
    togglePrivacyAgreed,
    dataAgreed,
    toggleDataAgreed,
    answers,
    setAnswer,
    notifyTime,
    setNotifyTime,
    lastViewedYear,
    setLastViewedYear,
    lastViewedMonth,
    setLastViewedMonth,
    lastViewedDay,
    setLastViewedDay,
  };
}
