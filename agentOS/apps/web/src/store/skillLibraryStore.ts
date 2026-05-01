import { create } from "zustand";

type SkillLibraryState = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

export const useSkillLibraryStore = create<SkillLibraryState>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
