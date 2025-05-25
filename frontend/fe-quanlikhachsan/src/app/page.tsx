'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectPathByRole, APP_CONFIG } from '../lib/config';
import { useAuth } from '../lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && user.role) {
      // Đã đăng nhập, chuyển hướng dựa vào role
      console.log('Người dùng đã đăng nhập, chuyển hướng theo role:', user.role);
      const redirectPath = getRedirectPathByRole(user.role);
      router.push(redirectPath);
    } else {
      // Chưa đăng nhập hoặc không có role, chuyển hướng đến trang đăng nhập
      console.log('Người dùng chưa đăng nhập hoặc không có role, chuyển hướng đến trang đăng nhập');
      router.push(APP_CONFIG.routes.login);
    }
  }, [router, user, loading]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>Passion Horizon</h1>
      <p>Đang chuyển hướng...</p>
    </div>
  );
}