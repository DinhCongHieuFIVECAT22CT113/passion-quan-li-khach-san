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
    // Gọi logout từ auth context
    logout();
    
    // Clear tất cả cookies
    Cookies.remove('token');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    Cookies.remove('userRole');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('bookingFormData');
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('cartItems');
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('tempBookingData');
    sessionStorage.removeItem('currentBooking');
    
    // Clear tất cả cookies với domain và path khác nhau
    const cookiesToClear = ['token', 'refreshToken', 'user', 'userRole', 'sessionId'];
    cookiesToClear.forEach(cookieName => {
      // Clear với path mặc định
      Cookies.remove(cookieName);
      // Clear với path root
      Cookies.remove(cookieName, { path: '/' });
      // Clear với domain hiện tại
      Cookies.remove(cookieName, { path: '/', domain: window.location.hostname });
    });
    
    // Force reload để đảm bảo state được reset hoàn toàn
    setTimeout(() => {
      window.location.href = '/users/home';
    }, 100);
  };

  return handleLogout;
}; 