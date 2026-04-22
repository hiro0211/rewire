import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
import { useReflectionStore } from '@/stores/reflectionStore';
import { useReflectionSheet } from './useReflectionSheet';

export function useAutoOpenReflectionSheet(): void {
  const user = useUserStore((s) => s.user);
  const lastReflectionDate = useReflectionStore((s) => s.lastReflectionDate);
  const visible = useReflectionSheet((s) => s.visible);
  const open = useReflectionSheet((s) => s.open);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (hasOpenedRef.current) return;
    if (!user?.notifyEnabled || !user.notifyTime) return;
    if (visible) return;

    const now = new Date();
    const todayKey = format(now, 'yyyy-MM-dd');
    if (lastReflectionDate === todayKey) return;

    const [hour, minute] = user.notifyTime.split(':').map(Number);
    const reminderAt = new Date(now);
    reminderAt.setHours(hour, minute, 0, 0);

    if (now.getTime() >= reminderAt.getTime()) {
      hasOpenedRef.current = true;
      open();
    }
  }, [user, lastReflectionDate, visible, open]);
}
