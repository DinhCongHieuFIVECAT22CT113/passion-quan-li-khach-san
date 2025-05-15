'use client';

import { useEffect, ReactNode, FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, APP_CONFIG, getRedirectPathByRole } from '../../../lib/config';

interface AuthCheckProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

const AuthCheck: FC<AuthCheckProps> = ({ 
  children, 
  requireAuth = true,
  requiredRoles = []
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Bỏ qua xác thực trong chế độ development nếu cần thiết
  // Có thể bỏ comment dòng dưới đây để bỏ qua xác thực trong môi trường development
  /*
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }
  */

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const userInfo = getUserInfo();
    console.log('AuthCheck checking user info:', userInfo);
    
    if (requireAuth && (!userInfo || !userInfo.isAuthenticated)) {
      // Nếu cần xác thực nhưng chưa đăng nhập, chuyển đến trang đăng nhập
      console.log('User not authenticated, redirecting to login');
      const currentPath = window.location.pathname + window.location.search;
      router.push(`${APP_CONFIG.routes.login}?redirectUrl=${encodeURIComponent(currentPath)}`);
    } else if (requireAuth && requiredRoles.length > 0) {
      // Kiểm tra quyền truy cập
      const userRole = userInfo?.userRole || '';
      console.log('Checking user role:', userRole, 'against required roles:', requiredRoles);
      const hasRequiredRole = requiredRoles.includes(userRole);
      
      if (!hasRequiredRole) {
        console.log('User does not have required role, redirecting based on role');
        // Chuyển hướng dựa vào role của người dùng
        const redirectPath = getRedirectPathByRole(userRole);
        console.log('Redirecting to:', redirectPath);
        router.push(redirectPath);
      } else {
        console.log('User has required role, authorizing');
        setIsAuthorized(true);
      }
    } else {
      setIsAuthorized(true);
    }
    
    // Nếu không yêu cầu xác thực hoặc đã xác thực thành công
    if (!requireAuth || (userInfo && userInfo.isAuthenticated)) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router, requireAuth, requiredRoles]);

  // Không render children cho đến khi kiểm tra xác thực xong
  if (isLoading) {
    return <div>Đang kiểm tra quyền truy cập...</div>;
  }

  if (requireAuth && (!isAuthenticated || !isAuthorized)) {
    return <div>Không có quyền truy cập...</div>;
  }

  return <>{children}</>;
};

export default AuthCheck;
