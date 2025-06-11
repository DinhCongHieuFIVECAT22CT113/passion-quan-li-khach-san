'use client';
import React, { Suspense, useEffect } from 'react';
import LoginForm from '../../app/components/logsign/LoginForm';
import './page.css';
import { useRouter } from 'next/navigation';
import { getRedirectPathByRole } from '../../lib/config';
import { useAuth } from '../../lib/auth';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;

    if (user && user.role) {
      console.log('Người dùng đã đăng nhập, chuyển hướng theo role từ trang login:', user.role);
      
      // Kiểm tra xem có redirectUrl trong query params không
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirectUrl');
      
      if (redirectUrl) {
        // Nếu có redirectUrl, chuyển hướng đến đó
        console.log('Chuyển hướng đến:', redirectUrl);
        router.push(redirectUrl);
      } else {
        // Nếu không có, sử dụng logic chuyển hướng mặc định
        const defaultRedirectPath = getRedirectPathByRole(user.role);
        console.log('Chuyển hướng theo role đến:', defaultRedirectPath);
        router.push(defaultRedirectPath);
      }
    }
  }, [router, user, loading]);

  return (
    <div className="login-container">
      <div className="form-wrapper">
        <Suspense fallback={<div>Đang tải...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      <div className="image-section">
        <h2>Chào mừng đến với Passion Horizon</h2>
        <p>Trải nghiệm quản lý khách sạn chuyên nghiệp và tiện lợi nhất.</p>
      </div>
    </div>
  );
};

export default LoginPage;
