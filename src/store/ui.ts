import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarCollapsed: false,
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", next === "dark");
        set({ theme: next });
      },
      setTheme: (t) => {
        document.documentElement.classList.toggle("dark", t === "dark");
        set({ theme: t });
      },
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    {
      name: "nexora-ui",
      onRehydrateStorage: () => (state) => {
        if (state) document.documentElement.classList.toggle("dark", state.theme === "dark");
      },
    }
  )
);
