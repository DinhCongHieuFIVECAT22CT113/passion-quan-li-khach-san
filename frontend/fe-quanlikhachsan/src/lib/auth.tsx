"use client";

import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export const ROLES = {
  ADMIN: 'R00',
  MANAGER: 'R01',
  STAFF: 'R02',
  CUSTOMER: 'R04', // Đã cập nhật từ R03 trong middleware, đồng bộ ở đây
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Định nghĩa các quyền có thể có trong hệ thống
// Đây là một ví dụ, bạn cần tùy chỉnh cho phù hợp với ứng dụng của mình
export interface UserPermissions {
  canViewAdminDashboard: boolean;
  canManageStaff: boolean;
  canManageRooms: boolean;
  canManageBookings: boolean;
  canViewReports: boolean;
  canManagePromotions: boolean;
  canManageServices: boolean;
  canViewUserProfile: boolean;
  canMakeBookings: boolean;
  // Thêm các quyền khác nếu cần
}

// Hàm này sẽ trả về các quyền dựa trên vai trò của người dùng
export function getUserPermissions(role: Role | string | undefined): UserPermissions {
  // Mặc định không có quyền nào
  const defaultPermissions: UserPermissions = {
    canViewAdminDashboard: false,
    canManageStaff: false,
    canManageRooms: false,
    canManageBookings: false,
    canViewReports: false,
    canManagePromotions: false,
    canManageServices: false,
    canViewUserProfile: false,
    canMakeBookings: false,
  };

  if (!role) return defaultPermissions;

  switch (role) {
    case ROLES.ADMIN: // R00
      return {
        ...defaultPermissions,
        canViewAdminDashboard: true,
        canManageStaff: true,
        canManageRooms: true,
        canManageBookings: true,
        canViewReports: true,
        canManagePromotions: true,
        canManageServices: true,
        canViewUserProfile: true, // Admin có thể xem profile của người khác
        canMakeBookings: true, // Admin có thể đặt phòng
      };
    case ROLES.MANAGER: // R01
      return {
        ...defaultPermissions,
        canViewAdminDashboard: true,
        canManageRooms: true,
        canManageBookings: true,
        canViewReports: true,
        canManagePromotions: true,
        canManageServices: true,
      };
    case ROLES.STAFF: // R02
      return {
        ...defaultPermissions,
        canManageBookings: true, // Nhân viên có thể quản lý đặt phòng
        canManageServices: true, // Nhân viên có thể quản lý dịch vụ
      };
    case ROLES.CUSTOMER: // R04
      return {
        ...defaultPermissions,
        canViewUserProfile: true, // Khách hàng xem profile của mình
        canMakeBookings: true, // Khách hàng có thể đặt phòng
      };
    default:
      return defaultPermissions;
  }
}

interface DecodedToken {
  role: Role;
  nameid?: string; // maNguoiDung
  unique_name?: string; // hoTen
  // Thêm các trường khác nếu có trong token
}

export interface AuthUser {
  maNguoiDung?: string;
  hoTen?: string;
  role: Role;
  permissions: UserPermissions;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loginUser = (token: string) => {
    try {
      localStorage.setItem('token', token);
      const decodedToken = jwtDecode<DecodedToken>(token);
      const permissions = getUserPermissions(decodedToken.role);
      const currentUser: AuthUser = {
        maNguoiDung: decodedToken.nameid,
        hoTen: decodedToken.unique_name,
        role: decodedToken.role,
        permissions,
      };
      setUser(currentUser);
      // Lưu các thông tin khác nếu cần, ví dụ:
      // localStorage.setItem('userName', decodedToken.unique_name || '');
      // localStorage.setItem('userId', decodedToken.nameid || '');
      // Hoặc tốt hơn là chỉ dựa vào user state từ context
    } catch (err) {
      // Xử lý lỗi giải mã token hoặc token không hợp lệ
      localStorage.removeItem('token');
      // localStorage.removeItem('userName');
      // localStorage.removeItem('userId');
      // localStorage.removeItem('userRole'); // Đã bỏ
      // localStorage.removeItem('staffInfo'); // Nếu có
      setUser(null);
      console.error("Failed to login user:", err);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    // localStorage.removeItem('userRole'); // Đã bỏ
    localStorage.removeItem('staffInfo'); 
    // Quan trọng: Xóa Cookies nếu được sử dụng để xác thực phía server hoặc middleware
    // Cookies.remove('token'); // Cần import Cookies từ js-cookie nếu dùng ở đây

    setUser(null);
    // Không cần redirect ở đây, việc redirect sẽ do useLogout hoặc component gọi logout xử lý
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loginUser(token); // Sử dụng hàm loginUser nội bộ
    }
    setLoading(false);
  }, []); // Chỉ chạy một lần khi mount

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-Order Component để bảo vệ route/component
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: Role[] // Danh sách các role được phép truy cập
) {
  return function ComponentWithAuth(props: P) {
    const router = useRouter();
    const { user, loading } = useAuth(); // Sử dụng useAuth từ context
    const [isAuthorized, setIsAuthorized] = useState(false);
    // authLoading của HOC sẽ dựa vào loading từ context

    useEffect(() => {
      if (loading) { // Đợi context load xong
        return;
      }

      if (!user) { // Nếu không có user sau khi context đã load xong
        router.push('/login');
        return;
      }

      // Nếu có user, kiểm tra role
      const userRole = user.role;
      if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
      
      setIsAuthorized(true); // Nếu mọi thứ ổn, set authorized
    }, [user, loading, router]); // Bỏ requiredRoles khỏi dependencies

    if (loading) { // Hiển thị loading dựa trên context
      return React.createElement('div', null, 'Loading authentication...');
    }

    if (!isAuthorized && user) { // Nếu có user nhưng chưa authorized (vd: sai role)
        // Redirect đã được xử lý trong useEffect, ở đây có thể return null hoặc loading state
        return React.createElement('div', null, 'Checking authorization or redirecting...');
    }
    
    if(!user && !loading){ // Nếu không có user và không loading -> đã bị redirect hoặc là trang công khai
        // Nếu bị redirect, ComponentWithAuth không nên render gì
        // Nếu là trang công khai mà HOC này vẫn bọc, thì logic HOC cần xem lại
        // Tạm thời, nếu không có user và không loading (nghĩa là đã bị redirect hoặc lỗi)
        // thì không render WrappedComponent
         const currentPath = window.location.pathname;
         if (currentPath !== '/login' && currentPath !== '/unauthorized') {
            // Có thể đang ở trang lỗi sau khi redirect, không render gì thêm.
         }
         return null; 
    }

    if (!isAuthorized) { // If still not authorized after checks (e.g. no user and not loading)
        return React.createElement('div', null, 'Checking authorization or redirecting...'); 
    }

    const Component = WrappedComponent as React.ComponentType<P>;
    return React.createElement(Component, props);
  };
} 