'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth, ROLES } from '../../../lib/auth';
import { useRouter } from 'next/navigation';
import { APP_CONFIG } from '../../../lib/config';

interface AuthCheckProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallbackPath?: string;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children, requireAuth = false, requiredRoles, fallbackPath }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (requireAuth && !user) {
      console.log("AuthCheck: User not logged in, redirecting to /login");
      router.push(fallbackPath || '/login');
      return;
    }

    if (user && requiredRoles && requiredRoles.length > 0) {
      const userRole = user.role;
      if (!userRole || !requiredRoles.includes(userRole)) {
        console.log(`AuthCheck: User role '${userRole}' not in requiredRoles [${requiredRoles.join(', ')}].`);
        if (fallbackPath) {
          router.push(fallbackPath);
        } else {
          const defaultUserRoute = userRole ? APP_CONFIG.roleRoutes[userRole as keyof typeof APP_CONFIG.roleRoutes] : null;
          if (defaultUserRoute && defaultUserRoute !== window.location.pathname) {
            console.log(`AuthCheck: Redirecting to default route '${defaultUserRoute}' for role '${userRole}'.`);
            router.push(defaultUserRoute);
          } else {
            console.log("AuthCheck: Redirecting to /unauthorized");
            router.push('/unauthorized');
          }
        }
        return;
      }
    }

  }, [user, authLoading, requireAuth, requiredRoles, router, fallbackPath]);

  if (authLoading) {
    return <div>Đang kiểm tra quyền truy cập (AuthCheck)...</div>;
  }

  if (requireAuth && !user) {
    return <div>Đang chuyển hướng đến trang đăng nhập...</div>;
  }

  if (user && requiredRoles && requiredRoles.length > 0) {
    const userRole = user.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      return <div>Không có quyền truy cập. Đang chuyển hướng...</div>;
    }
  }
  
  return <>{children}</>;
};

export default AuthCheck;
