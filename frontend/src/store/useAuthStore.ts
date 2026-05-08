import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AccountType } from "@/schemaValidations/auth.schema";

interface AuthState {
  user: AccountType | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AccountType, token: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // Gọi khi Login thành công
      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),

      // Gọi ngầm khi Refresh Token thành công
      setAccessToken: (token) => set({ accessToken: token }),

      // Gọi khi Đăng xuất hoặc bị văng ra
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // Tên key sẽ lưu dưới LocalStorage
      // BẢO MẬT: Chỉ lưu 'user' và 'isAuthenticated'. KHÔNG LƯU accessToken!
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
