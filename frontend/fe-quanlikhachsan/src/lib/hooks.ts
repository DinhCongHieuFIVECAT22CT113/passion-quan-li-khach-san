'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from './auth';

/**
 * Hook để xử lý đăng xuất
 * @returns Hàm xử lý đăng xuất
 */
export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    Cookies.remove('token');
    
    // Chuyển hướng về trang chủ người dùng
    router.push('/users/home');
  };

  return handleLogout;
}; 