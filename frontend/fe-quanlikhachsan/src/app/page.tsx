'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, getRedirectPathByRole, APP_CONFIG } from '../lib/config';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra người dùng đã đăng nhập chưa
    const userInfo = getUserInfo();
    
    if (userInfo && userInfo.isAuthenticated) {
      // Đã đăng nhập, chuyển hướng dựa vào role
      console.log('Người dùng đã đăng nhập, chuyển hướng theo role');
      const redirectPath = getRedirectPathByRole(userInfo.userRole);
      router.push(redirectPath);
    } else {
      // Chưa đăng nhập, chuyển hướng đến trang đăng nhập
      console.log('Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập');
      router.push(APP_CONFIG.routes.login);
    }
  }, [router]);
  
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