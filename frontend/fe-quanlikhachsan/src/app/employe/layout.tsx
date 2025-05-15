'use client';
import NhanVienSidebarClient from "./NhanVienSidebarClient";
import AuthCheck from '../components/auth/AuthCheck';
import { APP_CONFIG } from '../../lib/config';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Cho phép tất cả nhân viên (R01, R02, R03) truy cập vào phần "employe"
  const staffRoles = [
    APP_CONFIG.roles.manager,    // R01
    APP_CONFIG.roles.employee,   // R02
    APP_CONFIG.roles.accountant, // R03
    'CRW'  // Legacy code nếu có
  ];
  
  return (
    <AuthCheck requireAuth={true} requiredRoles={staffRoles}>
      <NhanVienSidebarClient>{children}</NhanVienSidebarClient>
    </AuthCheck>
  );
} 