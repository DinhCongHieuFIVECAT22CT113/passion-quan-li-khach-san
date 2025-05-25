import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // Cần cài đặt: npm install jwt-decode

interface DecodedToken {
  role: string;
  // Thêm các trường khác trong token nếu cần
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Lấy giá trị của cookie

  // Nếu không có token và không phải trang login, redirect về trang login
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userRole = decodedToken.role;

      // Kiểm tra quyền truy cập các route admin
      // Ví dụ: chỉ role 'R00' (Admin) mới được vào /admin
      if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'R00') {
        // Có thể redirect đến trang "Không có quyền" hoặc trang chủ người dùng
        return NextResponse.redirect(new URL('/unauthorized', request.url)); // Giả sử có trang /unauthorized
      }

      // Kiểm tra quyền truy cập các route employe
      // Ví dụ: role 'R00' (Admin) và 'R01' (Manager) được vào /employe
      if (request.nextUrl.pathname.startsWith('/employe') && !['R00', 'R01'].includes(userRole)) {
         return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Nếu đã login và cố vào trang login, redirect về trang welcome hoặc dashboard tương ứng
      if (request.nextUrl.pathname.startsWith('/login')) {
        if (userRole === 'R00' || userRole === 'R01') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url)); // ví dụ trang dashboard của admin
        } else {
            return NextResponse.redirect(new URL('/users/welcome', request.url)); // ví dụ trang welcome của user
        }
      }


    } catch (error) {
      // Lỗi giải mã token (token không hợp lệ hoặc hết hạn)
      // Xóa cookie token và redirect về trang login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Cấu hình matcher để middleware chỉ chạy trên các path nhất định
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - heros (public heros)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|heros).*)',
  ],
}; 