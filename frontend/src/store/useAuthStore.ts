import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AccountType } from "@/schemaValidations/auth.schema";
import authApiRequest from "@/apiRequests/auth";

interface AuthState {
  user: AccountType | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AccountType, token: string) => void;
  setAccessToken: (token: string) => void;
  silentRefresh: () => Promise<boolean>;
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

      // Gokhi gọi khi app khởi động hoặc khi vừa refresh trang web để thử lấy access token mới bằng refresh token
      silentRefresh: async () => {
        try {
          // Gọi API lên Backend. Trình duyệt tự mang theo Refresh Token trong Cookie.
          const res = await authApiRequest.refreshToken();

          // Trích xuất dữ liệu từ Response (Tùy thuộc vào thiết kế JSON của Backend NestJS)
          const newAccessToken = res.data.access_token;
          const user = res.data.user; // Backend trả về thông tin user không có password cùng với access token mới
          // Cập nhật lại Zustand (RAM) và LocalStorage (Thông qua persist)
          set({
            accessToken: newAccessToken,
            user: user,
            isAuthenticated: true,
          });

          return true; // Báo hiệu refresh thành công
        } catch (error) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return false; // Báo hiệu refresh thất bại
        }
      },

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
