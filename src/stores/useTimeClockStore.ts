import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface TimeClockEntry {
  id: string;
  userId: string;
  clockIn: string;
  clockOut: string | null;
}

interface TimeClockState {
  entries: TimeClockEntry[];
  clockIn: (userId: string) => void;
  clockOut: (userId: string) => void;
}

export const useTimeClockStore = create<TimeClockState>()(
  persist(
    (set) => ({
      entries: [],
      clockIn: (userId) =>
        set((state) => {
          const openEntry = state.entries.find(
            (entry) => entry.userId === userId && entry.clockOut === null,
          );

          if (openEntry) {
            return state;
          }

          return {
            entries: [
              ...state.entries,
              {
                id: crypto.randomUUID(),
                userId,
                clockIn: new Date().toISOString(),
                clockOut: null,
              },
            ],
          };
        }),
      clockOut: (userId) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.userId === userId && entry.clockOut === null
              ? { ...entry, clockOut: new Date().toISOString() }
              : entry,
          ),
        })),
    }),
    {
      name: "stock-control-time-clock",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
