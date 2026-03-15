import { create } from 'zustand';
import { asyncStorageClient } from '@/lib/storage/asyncStorageClient';
import { LESSONS, type Lesson } from '@/constants/lessons';

interface LearnProgressData {
  completedLessons: string[];
}

interface LearnState {
  completedLessons: string[];
}

interface LearnActions {
  completeLesson: (id: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  isCompleted: (id: string) => boolean;
  isUnlocked: (lesson: Lesson) => boolean;
}

export const useLearnStore = create<LearnState & LearnActions>((set, get) => ({
  completedLessons: [],

  completeLesson: async (id) => {
    const { completedLessons } = get();
    if (completedLessons.includes(id)) return;

    const updated = [...completedLessons, id];
    set({ completedLessons: updated });
    await asyncStorageClient.set('learn_progress', { completedLessons: updated });
  },

  resetProgress: async () => {
    set({ completedLessons: [] });
    await asyncStorageClient.set('learn_progress', { completedLessons: [] });
  },

  loadProgress: async () => {
    try {
      const data = await asyncStorageClient.get<LearnProgressData>('learn_progress');
      if (data?.completedLessons) {
        set({ completedLessons: data.completedLessons });
      }
    } catch {
      // Keep default empty array
    }
  },

  isCompleted: (id) => {
    return get().completedLessons.includes(id);
  },

  isUnlocked: (lesson) => {
    if (lesson.number === 1) return true;
    const prevLesson = LESSONS.find((l) => l.number === lesson.number - 1);
    if (!prevLesson) return false;
    return get().completedLessons.includes(prevLesson.id);
  },
}));
