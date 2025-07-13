import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route không cần kiểm tra quyền
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/access-denied') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Chỉ áp dụng middleware cho các đường dẫn đã được định nghĩa
  // Xác định các route hợp lệ trong ứng dụng
  const validRoutes = ['/dean', '/lecturer', '/faculty'];
  const isValidRoute = validRoutes.some((route) => pathname.startsWith(route));

  // Nếu không phải là route hợp lệ đã biết, cho phép Next.js xử lý (có thể là 404)
  if (!isValidRoute) {
    return NextResponse.next();
  }

  // Lấy token từ cookies
  const token = request.cookies.get('accessToken')?.value;

  // Nếu không có token, chuyển hướng đến trang đăng nhập
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Kiểm tra quyền truy cập sẽ được thực hiện bởi ProtectedRoute
  // Middleware chỉ đảm bảo người dùng đã đăng nhập

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (image files)
     * - public assets
     * - auth routes
     * - access-denied route
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public|auth|access-denied).*)',
  ],
};
