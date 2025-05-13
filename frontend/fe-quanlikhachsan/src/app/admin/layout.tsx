'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminLayout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
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
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}