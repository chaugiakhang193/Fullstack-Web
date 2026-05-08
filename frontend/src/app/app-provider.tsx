"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const silentRefresh = useAuthStore((state) => state.silentRefresh);

  // Dùng useRef để ngăn chặn React 18 Strict Mode gọi API 2 lần lúc dev
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;

      // Ngay khi ứng dụng vừa load (F5), âm thầm gọi API xin lại Access Token
      silentRefresh();
    }
  }, [silentRefresh]);

  // Trả về nguyên vẹn giao diện gốc
  return <>{children}</>;
}
