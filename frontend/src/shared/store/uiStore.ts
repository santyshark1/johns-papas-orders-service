import { create } from "zustand";

type Theme = "light" | "dark";

type UiState = {
  theme: Theme;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
