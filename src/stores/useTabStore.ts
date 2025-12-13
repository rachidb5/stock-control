import { create } from "zustand";

interface TabState {
  tab: string;
  setTab: (value: string) => void;
}

export const useTabStore = create<TabState>((set) => ({
  tab: "overview", // valor inicial
  setTab: (value) => set({ tab: value }),
}));