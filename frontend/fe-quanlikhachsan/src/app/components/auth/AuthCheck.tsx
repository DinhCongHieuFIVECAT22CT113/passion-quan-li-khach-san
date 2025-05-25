'use client';

import { useEffect, ReactNode, FC } from 'react';
import { useRouter } from 'next/navigation';
// import { getUserInfo, APP_CONFIG, getRedirectPathByRole } from '../../../lib/config'; // Bỏ getUserInfo
import { APP_CONFIG, getRedirectPathByRole } from '../../../lib/config';
import { useAuth } from '../../../lib/auth'; // Thêm useAuth

interface AuthCheckProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[]; // Giữ nguyên kiểu string[] vì allNavItems dùng string
}

const AuthCheck: FC<AuthCheckProps> = ({ 
  children, 
  requireAuth = true,
  requiredRoles = []
}) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Sử dụng useAuth
  // Bỏ các state không cần thiết nếu dùng trực tiếp từ useAuth
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [isAuthorized, setIsAuthorized] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);

  // Bỏ qua xác thực trong chế độ development nếu cần thiết
  // Có thể bỏ comment dòng dưới đây để bỏ qua xác thực trong môi trường development
  /*
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }
  */

  useEffect(() => {
    if (authLoading) {
      return; // Đợi cho đến khi thông tin auth được tải
    }

    console.log('AuthCheck with useAuth - User:', user, 'Loading:', authLoading);

    if (requireAuth && !user) {
      console.log('User not authenticated (useAuth), redirecting to login');
      const currentPath = window.location.pathname + window.location.search;
      router.push(`${APP_CONFIG.routes.login}?redirectUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (user && requireAuth && requiredRoles.length > 0) {
      const userRole = user.role; // Lấy role từ useAuth
      console.log('Checking user role (useAuth):', userRole, 'against required roles:', requiredRoles);
      const hasRequiredRole = requiredRoles.includes(userRole as string); // Ép kiểu nếu cần so sánh với string[]
      
      if (!hasRequiredRole) {
        console.log('User does not have required role (useAuth), redirecting based on role');
        const redirectPath = getRedirectPathByRole(userRole);
        console.log('Redirecting to (useAuth):', redirectPath);
        router.push(redirectPath);
        return;
      }
      console.log('User has required role (useAuth), authorizing');
    }
    // Nếu không bị redirect, coi như authorized nếu user tồn tại (cho trường hợp requireAuth=true nhưng không có requiredRoles)
    // hoặc không cần auth

  }, [router, requireAuth, requiredRoles, user, authLoading]);

  if (authLoading) {
    return <div>Đang kiểm tra quyền truy cập (useAuth)...</div>;
  }

  // Nếu yêu cầu auth và không có user (đã xử lý redirect ở trên nhưng thêm 1 lớp kiểm tra)
  if (requireAuth && !user) {
    // Không nên hiển thị children, redirect đã được gọi
    return <div>Đang chuyển hướng đến đăng nhập...</div>; 
  }

  // Nếu yêu cầu role cụ thể và user không có role đó (đã xử lý redirect)
  if (user && requireAuth && requiredRoles.length > 0 && !requiredRoles.includes(user.role as string)) {
    // Không nên hiển thị children, redirect đã được gọi
    return <div>Không có quyền truy cập (đang chuyển hướng)...</div>;
  }

  return <>{children}</>;
};

export default AuthCheck;
