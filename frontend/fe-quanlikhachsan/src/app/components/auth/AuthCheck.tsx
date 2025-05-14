'use client';

import { useEffect, ReactNode, FC, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthCheckProps {
  children: ReactNode;
}

const AuthCheck: FC<AuthCheckProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirectUrl=${encodeURIComponent(currentPath)}`);
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Không render children cho đến khi xác thực xong
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthCheck;
