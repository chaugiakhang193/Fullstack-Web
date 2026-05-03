// app/(auth)/layout.tsx
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-[calc(100dvh-64px)]: Lấy chiều cao màn hình trừ đi chiều cao Navbar (giả sử Navbar cao 64px)
    // overflow-hidden: Chặn cuộn toàn trang ở vùng Auth

    <div
      className="w-full h-[calc(100dvh-52px)] overflow-hidden flex flex-col items-center justify-center bg-muted"
      suppressHydrationWarning={true}
    >
      {children}
    </div>
  );
}
