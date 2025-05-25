'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

/**
 * Hook để xử lý đăng xuất
 * @returns Hàm xử lý đăng xuất
 */
export const useLogout = () => {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      // Xóa tất cả thông tin đăng nhập từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      
      // Các thông tin khác nếu có
      localStorage.removeItem('staffInfo');
      
      // Xóa cookies liên quan đến phiên đăng nhập
      Cookies.remove('token');
      
      // Chuyển hướng về trang chủ người dùng
      router.push('/users/home');
    }
  };

  return handleLogout;
}; 