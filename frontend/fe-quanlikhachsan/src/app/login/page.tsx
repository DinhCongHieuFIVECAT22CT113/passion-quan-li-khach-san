'use client';
import React, { Suspense, useEffect } from 'react';
import LoginForm from '../../app/components/logsign/LoginForm';
import './page.css';
import { useRouter } from 'next/navigation';
import { getUserInfo, getRedirectPathByRole } from '../../lib/config';

const LoginPage: React.FC = () => {
  const router = useRouter();
  
  // Kiểm tra nếu người dùng đã đăng nhập, chuyển hướng tới trang theo role
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.isAuthenticated) {
      console.log('Người dùng đã đăng nhập, chuyển hướng theo role');
      const redirectPath = getRedirectPathByRole(userInfo.userRole);
      router.push(redirectPath);
    }
  }, [router]);

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
