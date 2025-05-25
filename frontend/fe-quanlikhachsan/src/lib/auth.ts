import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';

export const ROLES = {
  ADMIN: 'R00',
  MANAGER: 'R01',
  STAFF: 'R02',
  CUSTOMER: 'R03', // Giả sử có thêm role Customer
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

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
    case ROLES.CUSTOMER: // R03
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

// Custom hook để lấy thông tin người dùng hiện tại và quyền
export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const permissions = getUserPermissions(decodedToken.role);
        setUser({
          maNguoiDung: decodedToken.nameid,
          hoTen: decodedToken.unique_name,
          role: decodedToken.role,
          permissions,
        });
      } catch (e) {
        // Token không hợp lệ hoặc hết hạn
        localStorage.removeItem('token');
        // Có thể redirect về login tại đây nếu muốn, nhưng middleware đã xử lý
        // router.push('/login'); 
      }
    }
    setLoading(false);
  }, [router]);

  return { user, loading };
}

// Higher-Order Component để bảo vệ route/component
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles?: Role[] // Danh sách các role được phép truy cập
) {
  return function ComponentWithAuth(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        const userRole = decodedToken.role;

        if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
          router.push('/unauthorized'); // Trang báo không có quyền
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        // Token không hợp lệ, xóa và redirect
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      setAuthLoading(false);
    }, [router]);

    if (authLoading) {
      return React.createElement('div', null, 'Loading authentication...');
    }

    if (!isAuthorized) {
      return null;
    }

    const Component = WrappedComponent as React.ComponentType<P>;
    return React.createElement(Component, props);
  };
} 