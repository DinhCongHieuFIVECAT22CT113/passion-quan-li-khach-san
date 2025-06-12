/**
 * Cấu hình chung cho ứng dụng
 */

// URL của API backend - sử dụng biến môi trường hoặc fallback về production
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://passion-quan-li-khach-san.onrender.com/api';

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
    managerDashboard: '/employe/dashboard',
    employeeDashboard: '/employe/bookings',
    accountantDashboard: '/employe/invoices',
    customerDashboard: '/users/home',
  },
  
  // Các mã role của người dùng
  roles: {
    admin: 'R00',    // Admin - Toàn quyền
    manager: 'R01',  // Quản lý - Quản lý nhân sự, báo cáo, phòng, dịch vụ
    employee: 'R02', // Nhân viên - Xử lý nghiệp vụ thường ngày
    accountant: 'R03', // Kế toán - Quản lý hóa đơn, thanh toán
    customer: 'R04',  // Khách hàng - Chỉ được sử dụng frontend
  },

  // Các đường dẫn phù hợp với từng vai trò
  roleRoutes: {
    'R00': '/admin/dashboard',  // Admin đến trang dashboard
    'R01': '/employe/dashboard', // Quản lý đến trang quản lý
    'R02': '/employe/bookings', // Nhân viên đến trang đặt phòng
    'R03': '/employe/invoices', // Kế toán đến trang hóa đơn
    'R04': '/users/home',       // Khách hàng đến trang home
    // Mã legacy cho tương thích ngược
    'CTM': '/users/home',
    'CRW': '/employe/bookings',
  }
};

// Hàm trợ giúp để kiểm tra quyền truy cập
export const hasRole = (userRole: string | null | undefined, requiredRoles: string[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

// Hàm lấy thông tin người dùng từ localStorage
export const getUserInfo = () => {
  if (typeof window === 'undefined') {
    console.log('getUserInfo: Running on server, cannot access localStorage');
    return null;
  }
  
  try {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userName) {
      console.log('getUserInfo: Missing token or username');
      return null;
    }
    
    return {
      token,
      userName,
      userId,
      isAuthenticated: !!token,
    };
  } catch (error) {
    console.error('getUserInfo: Error accessing localStorage', error);
    return null;
  }
};

// Hàm lấy trang chuyển hướng theo role
export const getRedirectPathByRole = (role: string | null | undefined): string => {
  if (!role) {
    console.log('getRedirectPathByRole: No role provided, using default home path');
    return APP_CONFIG.routes.home;
  }
  
  const redirectPath = APP_CONFIG.roleRoutes[role as keyof typeof APP_CONFIG.roleRoutes] || APP_CONFIG.routes.home;
  console.log(`getRedirectPathByRole: Role ${role} -> Path ${redirectPath}`);
  return redirectPath;
}; 