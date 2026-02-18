import { useState } from 'react';
import { checkinService } from '@/features/checkin/checkinService';
import { useCheckinStore } from '@/stores/checkinStore';
import { useUserStore } from '@/stores/userStore';
import type { CheckinFormInput } from '@/types/checkin';

export const useCheckinSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCheckin } = useCheckinStore();
  const { loadUser } = useUserStore(); // To refresh streak data if reset

  const submit = async (input: CheckinFormInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const checkin = await checkinService.processCheckin(input);
      await addCheckin(checkin);

      // ストリークのリセット・復元どちらの場合もユーザーデータを再取得
      await loadUser();

      return { success: true, data: checkin };
    } catch (e: any) {
      setError(e.message || 'Error processing checkin');
      return { success: false, error: e.message };
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, error };
};
