'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaHome, FaBed, FaUsers, FaCalendarAlt, 
         FaFileInvoiceDollar, FaConciergeBell, FaChartBar, 
         FaUserTie, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../lib/auth';
import { useLogout } from '../../lib/hooks';
import styles from './NhanVienSidebar.module.css';

export default function NhanVienSidebarClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const handleLogout = useLogout();

  // Danh sách tất cả các mục menu có thể có
  const allNavItems = [
    { href: "/employe/dashboard", label: "Tổng quan", icon: <FaHome />, roles: ["R01"] }, // Chỉ quản lý
    { href: "/employe/bookings", label: "Đặt phòng", icon: <FaCalendarAlt />, roles: ["R01", "R02"] }, // Quản lý và nhân viên
    { href: "/employe/rooms", label: "Phòng", icon: <FaBed />, roles: ["R01", "R02"] }, // Quản lý và nhân viên
    { href: "/employe/services", label: "Dịch vụ", icon: <FaConciergeBell />, roles: ["R01", "R02"] }, // Quản lý và nhân viên 
    { href: "/employe/invoices", label: "Hóa đơn", icon: <FaFileInvoiceDollar />, roles: ["R01", "R03"] }, // Quản lý và kế toán
    { href: "/employe/reports", label: "Báo cáo", icon: <FaChartBar />, roles: ["R01", "R03"] }, // Quản lý và kế toán
    { href: "/employe/staff", label: "Nhân viên", icon: <FaUserTie />, roles: ["R01"] }, // Chỉ quản lý
  ];

  // Kiểm tra kích thước màn hình
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Kiểm tra khi component mount
    checkMobile();
    
    // Thêm event listener
    window.addEventListener('resize', checkMobile);
    
    // Load trạng thái sidebar từ localStorage
    const savedState = localStorage.getItem('employeSidebarOpen');
    if (savedState !== null) {
      setIsOpen(savedState === 'true');
    } else {
      // Mặc định: mở trên desktop, đóng trên mobile
      setIsOpen(window.innerWidth >= 768);
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Điều chỉnh layout khi trạng thái sidebar thay đổi
  const adjustLayout = useCallback(() => {
    if (isOpen) {
      document.body.classList.remove('sidebar-closed');
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.classList.add('sidebar-closed');
    }
  }, [isOpen]);

  useEffect(() => {
    adjustLayout();
  }, [isOpen, adjustLayout]);

  // Toggle sidebar
  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem('employeSidebarOpen', newState.toString());
  };

  // Đóng sidebar khi click vào link trên mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
      localStorage.setItem('employeSidebarOpen', 'false');
    }
  };

  // Lọc các mục menu dựa trên vai trò của người dùng
  const filteredNavItems = allNavItems.filter(item => {
    if (!user || !user.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className={styles.layout}>
      <button 
        className={styles.toggleButton} 
        onClick={toggleSidebar}
        aria-label={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2>{isOpen ? 'Nhân Viên' : ''}</h2>
        </div>
        
        <nav className={styles.sidebarNav}>
          {filteredNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
              onClick={handleLinkClick}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {isOpen && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        {/* User info và nút đăng xuất */}
        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userInfo}>
              {isOpen && (
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user.hoTen || user.maNguoiDung}</p>
                  <p className={styles.userRole}>
                    {user.role === 'R01' ? 'Quản lý' : 
                     user.role === 'R02' ? 'Nhân viên' : 
                     user.role === 'R03' ? 'Kế toán' : 'Người dùng'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <button 
            className={styles.logoutButton} 
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <span className={styles.navIcon}><FaSignOutAlt /></span>
            {isOpen && <span className={styles.navLabel}>Đăng xuất</span>}
          </button>
        </div>
      </aside>
      
      {/* Overlay cho mobile */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
      
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
