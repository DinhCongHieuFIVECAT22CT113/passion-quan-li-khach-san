"use client";

import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { tokenManager } from './tokenManager';

export const ROLES = {
  ADMIN: 'R00',
  MANAGER: 'R01',
  STAFF: 'R02',
  ACCOUNTANT: 'R03',
  CUSTOMER: 'R04',
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
  canManageInvoices: boolean;
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
    canManageInvoices: false,
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
        canViewUserProfile: true,
        canMakeBookings: true,
        canManageInvoices: true,
      };
    case ROLES.MANAGER: // R01
      return {
        ...defaultPermissions,
        canViewAdminDashboard: true,
        canManageStaff: true,
        canManageRooms: true,
        canManageBookings: true,
        canViewReports: true,
        canManagePromotions: true,
        canManageServices: true,
        canManageInvoices: true,
      };
    case ROLES.STAFF: // R02
      return {
        ...defaultPermissions,
        canManageRooms: true,
        canManageBookings: true,
        canManageServices: true,
      };
    case ROLES.ACCOUNTANT: // R03 - Kế toán
      return {
        ...defaultPermissions,
        // Quyền chính của Kế toán
        canManageInvoices: true,     // Quản lý hóa đơn
        canViewReports: true,        // Xem báo cáo doanh thu

        // Quyền hỗ trợ (chỉ đọc) để làm việc hiệu quả
        canViewUserProfile: true,    // Xem profile cá nhân

        // Không cần các quyền khác như quản lý phòng, đặt phòng, dịch vụ
        // Kế toán chỉ cần truy cập dữ liệu để tạo hóa đơn và báo cáo
      };
    case ROLES.CUSTOMER: // R04
      return {
        ...defaultPermissions,
        canViewUserProfile: true,
        canMakeBookings: true,
      };
    default:
      return defaultPermissions;
  }
}

interface DecodedToken {
  role: Role;
  nameid?: string; // maNguoiDung
  name?: string; // hoTen
  email?: string;
  mobilephone?: string; // Số điện thoại
  address?: string;
  cccd?: string; // Số CCCD
  picture?: string; // Avatar nếu có
  username?: string; // Nếu cần
  unique_name?: string; // hoTen
  // Thêm các trường khác nếu có trong token
  phone_number?: string; // Giả sử token dùng key này cho số điện thoại
  family_name?: string; // Giả sử token dùng key này cho họ
  given_name?: string;  // Giả sử token dùng key này cho tên
  identity_number?: string; // Giả sử token dùng key này cho số CCCD
}

export interface AuthUser {
  maNguoiDung?: string;
  hoTen?: string;
  role: Role;
  permissions: UserPermissions;
  email?: string;
  soDienThoai?: string;
  diaChi?: string;
  hoKh?: string;
  tenKh?: string;
  soCccd?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

const loginUser = (token: string, refreshToken?: string) => {
  try {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    const decodedToken = jwtDecode<DecodedToken>(token);
    const permissions = getUserPermissions(decodedToken.role);

    // Tách họ và tên từ fullName
    const fullName = decodedToken.name || '';
    const nameParts = fullName.trim().split(' ');
    const tenKh = nameParts.length > 0 ? nameParts[nameParts.length - 1] : ''; // "Tín"
    const hoKh = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''; // "Trương Trung"

    const currentUser: AuthUser = {
      maNguoiDung: decodedToken.nameid, // "KH023"
      hoTen: decodedToken.name, // "Trương Trung Tín"
      role: decodedToken.role, // "R04"
      permissions,
      email: decodedToken.email, // "tint08771@gmail.com"
      soDienThoai: decodedToken.mobilephone, // "0866684277"
      diaChi: decodedToken.address, // ""
      hoKh, // "Trương Trung"
      tenKh, // "Tín"
      soCccd: decodedToken.cccd, // "122001042210"
      avatarUrl: decodedToken.picture, // undefined
    };
    setUser(currentUser);
    
    // Khởi tạo auto-refresh
    tokenManager.initializeAutoRefresh();
  } catch (err) {
    tokenManager.clearTokens();
    setUser(null);
    console.error("Failed to login user:", err);
  }
};

  const logoutUser = () => {
    // Dừng auto-refresh và xóa tất cả tokens
    tokenManager.stopAutoRefresh();
    tokenManager.clearTokens();
    
    setUser(null);
    // Không cần redirect ở đây, việc redirect sẽ do useLogout hoặc component gọi logout xử lý
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    if (token) {
      // Kiểm tra token có hết hạn không
      if (tokenManager.isTokenExpired(token)) {
        // Nếu token hết hạn, thử refresh
        if (refreshTokenValue) {
          tokenManager.refreshTokenIfNeeded()
            .then((result) => {
              if (result) {
                loginUser(result.token, result.refreshToken);
              } else {
                tokenManager.clearTokens();
              }
              setLoading(false);
            })
            .catch(() => {
              tokenManager.clearTokens();
              setLoading(false);
            });
        } else {
          tokenManager.clearTokens();
          setLoading(false);
        }
      } else {
        loginUser(token, refreshTokenValue || undefined);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    // Lắng nghe sự kiện refresh token thất bại
    const handleTokenRefreshFailed = () => {
      logoutUser();
    };

    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);

    return () => {
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
      tokenManager.stopAutoRefresh();
    };
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