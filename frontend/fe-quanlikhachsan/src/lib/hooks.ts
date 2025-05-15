'use client';

import { useRouter } from 'next/navigation';

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
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      
      // Các thông tin khác nếu có
      localStorage.removeItem('staffInfo');
      
      // Chuyển hướng về trang đăng nhập
      router.push('/login');
    }
  };

  return handleLogout;
}; 