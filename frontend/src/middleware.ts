import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các đường dẫn chỉ dành cho KHÁCH (chưa đăng nhập)
const guestOnlyPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Kiểm tra xem trình duyệt có cookie 'refresh_token' do Backend NestJS set không
  const hasToken = request.cookies.has("refresh_token");

  // Nếu ĐÃ CÓ token VÀ đang cố truy cập vào các trang của Khách (/login, /register)
  if (hasToken && guestOnlyPaths.includes(pathname)) {
    // Chuyển hướng người dùng về trang chủ
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Nếu không vi phạm gì, cho phép request đi tiếp bình thường
  return NextResponse.next();
}

// Middleware chỉ chạy trên các route này
export const config = {
  matcher: ["/login", "/register"],
};
