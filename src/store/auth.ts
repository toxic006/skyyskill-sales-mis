import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "Admin" | "Sales Manager" | "Marketing" | "Finance";

export const ROLE_ROUTES: Record<Role, string[]> = {
  Admin: ["/dashboard", "/orders", "/marketing", "/targets"],
  "Sales Manager": ["/dashboard", "/orders", "/targets"],
  Marketing: ["/dashboard", "/marketing"],
  Finance: ["/dashboard", "/orders"],
};

export const canAccess = (role: Role | undefined, path: string) => {
  if (!role) return false;
  return ROLE_ROUTES[role].some((r) => path.startsWith(r));
};

interface AuthState {
  user: { name: string; email: string; role: Role; remember: boolean } | null;
  login: (email: string, role: Role, remember: boolean) => void;
  logout: () => void;
}

const nameFromEmail = (email: string) => {
  const local = email.split("@")[0];
  // Special-case the demo account so it always shows the rebranded display name.
  if (local.toLowerCase() === "sk.tausif" || local.toLowerCase() === "tausif") return "Sk Tausif";
  return local.split(/[._]/).map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ") || "User";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, role, remember) =>
        set({ user: { name: nameFromEmail(email), email, role, remember } }),
      logout: () => set({ user: null }),
    }),
    { name: "skyyskill-auth-v2" }
  )
);
