import { create } from "zustand";

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  register: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      set({ user: data.user, error: null });
      localStorage.setItem("auth_token", data.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      set({ user: data.user, error: null });
      localStorage.setItem("auth_token", data.token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      set({ user: null });
      localStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        set({ user: null });
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        set({ user: data.user });
      } else {
        localStorage.removeItem("auth_token");
        set({ user: null });
      }
    } catch (error) {
      console.error("Get user failed:", error);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
