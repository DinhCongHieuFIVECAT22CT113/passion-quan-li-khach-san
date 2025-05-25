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
    // Giữ lại redirectUrl nếu có để sau khi login thành công sẽ quay lại trang đó
    const redirectUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginUrl = new URL('/login', request.url);
    if (redirectUrl !== '/' && redirectUrl !== '/login') { // Tránh redirectUrl trống hoặc về chính login
        loginUrl.searchParams.set('redirectUrl', redirectUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userRole = decodedToken.role;

      // Chuyển hướng nếu đã login và vào trang login
      if (request.nextUrl.pathname.startsWith('/login')) {
        if (userRole === 'R00' || userRole === 'R01') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url)); 
        } else if (userRole === 'R04') { // Cập nhật R03 thành R04
            return NextResponse.redirect(new URL('/users/home', request.url)); // Trang home cho user R04
        } else {
            // Fallback cho các role khác nếu có
            return NextResponse.redirect(new URL('/', request.url)); 
        }
      }

      // Kiểm tra quyền truy cập các route admin
      if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'R00') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Kiểm tra quyền truy cập các route employe (Manager hoặc nhân viên nghiệp vụ khác nếu có)
      if (request.nextUrl.pathname.startsWith('/employe') && !['R00', 'R01'].includes(userRole)) {
         return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      
      // Logic cho R02 (STAFF) - ví dụ: không được vào /admin nhưng có thể vào các trang nghiệp vụ khác không phải /employe
      if (request.nextUrl.pathname.startsWith('/admin') && userRole === 'R02') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // Logic cho R04 (CUSTOMER) - không được vào /admin, /employe
      if ((request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/employe')) && userRole === 'R04') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

    } catch (error) {
      console.error("Middleware token decoding error:", error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Cấu hình matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|heros).*)',
  ],
}; 