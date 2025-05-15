'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminLayout.module.css";
import AuthCheck from '../components/auth/AuthCheck';
import { APP_CONFIG, getUserInfo } from '../../lib/config';
import { useLogout } from '../../lib/hooks';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('Admin');
  const handleLogout = useLogout();
  
  useEffect(() => {
    // Lấy thông tin người dùng nếu có
    const userInfo = getUserInfo();
    if (userInfo) {
      setUserName(userInfo.userName || 'Admin');
    }
  }, []);
  
  return (
    <AuthCheck requireAuth={true} requiredRoles={[APP_CONFIG.roles.admin]}>
      <div className={styles.adminContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>🏨 <span>Admin</span></div>
          <nav className={styles.nav}>
            <Link href="/admin/rooms" className={`${styles.navLink} ${pathname === '/admin/rooms' ? styles.active : ''}`}>Quản lý phòng</Link>
            <Link href="/admin/customers" className={`${styles.navLink} ${pathname === '/admin/customers' ? styles.active : ''}`}>Khách hàng</Link>
            <Link href="/admin/bookings" className={`${styles.navLink} ${pathname === '/admin/bookings' ? styles.active : ''}`}>Đặt phòng</Link>
            <Link href="/admin/invoices" className={`${styles.navLink} ${pathname === '/admin/invoices' ? styles.active : ''}`}>Hóa đơn</Link>
            <Link href="/admin/services" className={`${styles.navLink} ${pathname === '/admin/services' ? styles.active : ''}`}>Dịch vụ</Link>
            <Link href="/admin/promotions" className={`${styles.navLink} ${pathname === '/admin/promotions' ? styles.active : ''}`}>Khuyến mãi</Link>
            <Link href="/admin/reviews" className={`${styles.navLink} ${pathname === '/admin/reviews' ? styles.active : ''}`}>Đánh giá</Link>
            <Link href="/admin/staffs" className={`${styles.navLink} ${pathname === '/admin/staffs' ? styles.active : ''}`}>Nhân viên</Link>
            <Link href="/admin/reports" className={`${styles.navLink} ${pathname === '/admin/reports' ? styles.active : ''}`}>Báo cáo</Link>
            <Link href="/admin/languages" className={`${styles.navLink} ${pathname === '/admin/languages' ? styles.active : ''}`}>Ngôn Ngữ</Link>
            <Link href="/admin/permissions" className={`${styles.navLink} ${pathname === '/admin/permissions' ? styles.active : ''}`}>Phân Quyền</Link>
          </nav>
          
          {/* Phần thông tin người dùng và nút đăng xuất */}
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userName}>{userName}</div>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Đăng xuất
            </button>
          </div>
        </aside>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </AuthCheck>
  );
}