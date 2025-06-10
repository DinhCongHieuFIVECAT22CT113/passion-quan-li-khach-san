'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes, FaHome, FaBed, FaUsers, FaCalendarAlt, 
         FaFileInvoiceDollar, FaConciergeBell, FaPercentage, 
         FaComments, FaUserTie, FaUserShield, FaChartBar, FaGlobe } from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

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
    const savedState = localStorage.getItem('adminSidebarOpen');
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
    localStorage.setItem('adminSidebarOpen', newState.toString());
  };

  // Đóng sidebar khi click vào link trên mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
      localStorage.setItem('adminSidebarOpen', 'false');
    }
  };

  // Danh sách menu với đường dẫn chính xác
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/rooms', label: 'Quản lý phòng', icon: <FaBed /> },
    { path: '/admin/room-types', label: 'Loại phòng', icon: <FaBed /> },
    { path: '/admin/customers', label: 'Khách hàng', icon: <FaUsers /> },
    { path: '/admin/bookings', label: 'Đặt phòng', icon: <FaCalendarAlt /> },
    { path: '/admin/invoices', label: 'Hóa đơn', icon: <FaFileInvoiceDollar /> },
    { path: '/admin/services', label: 'Dịch vụ', icon: <FaConciergeBell /> },
    { path: '/admin/promotions', label: 'Khuyến mãi', icon: <FaPercentage /> },
    { path: '/admin/reviews', label: 'Đánh giá', icon: <FaComments /> },
    { path: '/admin/staffs', label: 'Nhân viên', icon: <FaUserTie /> },
    { path: '/admin/permissions', label: 'Phân Quyền', icon: <FaUserShield /> },
    { path: '/admin/reports', label: 'Báo cáo', icon: <FaChartBar /> },
    { path: '/admin/languages', label: 'Ngôn Ngữ', icon: <FaGlobe /> },
  ];

  return (
    <>
      <button 
        className={styles.toggleButton} 
        onClick={toggleSidebar}
        aria-label={isOpen ? "Thu gọn menu" : "Mở rộng menu"}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <h2>{isOpen ? 'Admin Panel' : ''}</h2>
        </div>
        
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
              onClick={handleLinkClick}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {isOpen && <span className={styles.navLabel}>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* Overlay cho mobile */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;


