/**
 * Cấu hình chung cho ứng dụng
 */

// URL của API backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7181/api';

// Các cấu hình khác
export const APP_CONFIG = {
  // Thời gian hết hạn token (ms)
  tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  
  // Các đường dẫn trong ứng dụng
  routes: {
    home: '/users/home',
    login: '/login',
    signup: '/signup',
    userProfile: '/users/profile',
    adminDashboard: '/admin/dashboard',
    employeeDashboard: '/employe/dashboard',
  },
  
  // Các mã role của người dùng
  roles: {
    admin: 'R01',
    manager: 'R02',
    employee: 'R03',
    customer: 'R04',
  }
};

// Hàm trợ giúp để kiểm tra quyền truy cập
export const hasRole = (userRole: string | null | undefined, requiredRoles: string[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

// Hàm lấy thông tin người dùng từ localStorage
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userName) return null;
  
  return {
    token,
    userName,
    userRole,
    userId,
    isAuthenticated: !!token,
    isAdmin: userRole === APP_CONFIG.roles.admin,
    isEmployee: userRole === APP_CONFIG.roles.employee || userRole === APP_CONFIG.roles.manager,
    isCustomer: userRole === APP_CONFIG.roles.customer,
  };
}; 