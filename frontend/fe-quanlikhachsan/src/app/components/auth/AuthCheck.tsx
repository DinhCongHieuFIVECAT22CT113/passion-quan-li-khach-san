'use client';

import { useEffect, ReactNode, FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, APP_CONFIG } from '../../../lib/config';

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

  // Bỏ qua xác thực trong chế độ development
  if (process.env.NODE_ENV === 'development') {
    return <>{children}</>;
  }

  useEffect(() => {
    const userInfo = getUserInfo();
    
    if (requireAuth && !userInfo?.isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`${APP_CONFIG.routes.login}?redirectUrl=${encodeURIComponent(currentPath)}`);
    } else if (requireAuth && requiredRoles.length > 0) {
      // Kiểm tra quyền truy cập
      const hasRequiredRole = userInfo?.userRole && requiredRoles.includes(userInfo.userRole);
      
      if (!hasRequiredRole) {
        // Chuyển hướng dựa vào role
        if (userInfo?.isAdmin) {
          router.push(APP_CONFIG.routes.adminDashboard);
        } else if (userInfo?.isEmployee) {
          router.push(APP_CONFIG.routes.employeeDashboard);
        } else {
          router.push(APP_CONFIG.routes.home);
        }
      } else {
        setIsAuthorized(true);
      }
    } else {
      setIsAuthorized(true);
    }
    
    // Nếu không yêu cầu xác thực hoặc đã xác thực thành công
    if (!requireAuth || userInfo?.isAuthenticated) {
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router, requireAuth, requiredRoles]);

  // Không render children cho đến khi kiểm tra xác thực xong
  if (isLoading) {
    return null;
  }

  if (requireAuth && (!isAuthenticated || !isAuthorized)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthCheck;
