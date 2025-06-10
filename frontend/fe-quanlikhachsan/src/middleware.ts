import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode'; // Cần cài đặt: npm install jwt-decode

interface DecodedToken {
  role: string;
  // Thêm các trường khác trong token nếu cần
}

// Danh sách các đường dẫn công khai không yêu cầu token
const PUBLIC_PATHS = ['/login', '/signup', '/users/home', '/users/about', '/users/explore', '/users/rooms', '/users/services', '/users/promotions', '/users/booking', '/users/booking-form', '/guest-booking', '/guest-booking/success'];

// Hàm kiểm tra đường dẫn công khai (bao gồm dynamic routes)
const isPublicPath = (path: string): boolean => {
  // Kiểm tra các đường dẫn tĩnh
  if (PUBLIC_PATHS.includes(path)) {
    return true;
  }
  
  // Kiểm tra dynamic routes cho trang chi tiết phòng
  if (path.startsWith('/rooms/') && path.split('/').length === 3) {
    return true; // /rooms/[slug] - trang chi tiết phòng
  }
  
  return false;
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Lấy giá trị của cookie
  const currentPath = request.nextUrl.pathname;

  // Nếu không có token và đường dẫn hiện tại không nằm trong danh sách công khai và không phải là trang gốc
  if (!token && !isPublicPath(currentPath) && currentPath !== '/') {
    // Giữ lại redirectUrl nếu có để sau khi login thành công sẽ quay lại trang đó
    const redirectUrl = currentPath + request.nextUrl.search;
    const loginUrl = new URL('/login', request.url);
    if (redirectUrl !== '/' && redirectUrl !== '/login') { // Tránh redirectUrl trống hoặc về chính login
        loginUrl.searchParams.set('redirectUrl', redirectUrl);
    }
    console.log(`Middleware: No token, path ${currentPath} is not public. Redirecting to login with redirectUrl: ${redirectUrl}`);
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
        } else if (userRole === 'R02') { // Nhân viên
            return NextResponse.redirect(new URL('/employe/bookings', request.url));
        } else if (userRole === 'R03') { // Kế toán
            return NextResponse.redirect(new URL('/employe/invoices', request.url));
        } else if (userRole === 'R04') { // Khách hàng
            return NextResponse.redirect(new URL('/users/home', request.url));
        } else {
            // Fallback cho các role khác nếu có, hoặc về trang unauthorized nếu không xác định được trang đích
            return NextResponse.redirect(new URL('/', request.url));
        }
      }

      // Kiểm tra quyền truy cập các route admin
      if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'R00') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Kiểm tra quyền truy cập các route employe
      // Cho phép R00, R01, R02, R03 truy cập vào /employe.
      // Việc kiểm tra quyền chi tiết hơn sẽ do AuthCheck ở từng trang đảm nhiệm.
      if (request.nextUrl.pathname.startsWith('/employe') && !['R00', 'R01', 'R02', 'R03'].includes(userRole)) {
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