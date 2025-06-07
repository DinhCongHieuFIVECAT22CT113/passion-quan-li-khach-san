'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ customItems, showHome = true, items }: BreadcrumbProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate breadcrumb items from pathname if no custom items provided
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (!mounted || !pathname) return [];
    
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const items: BreadcrumbItem[] = [];

    if (showHome) {
      items.push({
        label: 'Trang chủ',
        href: '/users/home',
        isActive: pathname === '/users/home'
      });
    }

    // Map path segments to readable labels
    const segmentLabels: Record<string, string> = {
      'users': 'Khách hàng',
      'home': 'Trang chủ',
      'rooms': 'Phòng',
      'roomsinformation': 'Thông tin phòng',
      'booking': 'Đặt phòng',
      'profile': 'Hồ sơ',
      'services': 'Dịch vụ',
      'promotions': 'Khuyến mãi',
      'about': 'Giới thiệu',
      'explore': 'Khám phá',
      'guest-booking': 'Đặt phòng khách',
      'login': 'Đăng nhập',
      'signup': 'Đăng ký'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip 'users' segment for cleaner breadcrumb
      if (segment === 'users') return;

      const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const isActive = index === pathSegments.length - 1;

      items.push({
        label,
        href: currentPath,
        isActive
      });
    });

    return items;
  };

  const breadcrumbItems = items || customItems || generateBreadcrumbItems();

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single item
  }

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList} itemScope itemType="https://schema.org/BreadcrumbList">
        {breadcrumbItems.map((item, index) => (
          <li 
            key={item.href} 
            className={styles.breadcrumbItem}
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && (
              <FaChevronRight className={styles.separator} aria-hidden="true" />
            )}
            
            {item.isActive ? (
              <span className={styles.currentPage} aria-current="page" itemProp="name">
                {index === 0 && showHome && <FaHome className={styles.homeIcon} />}
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className={styles.breadcrumbLink} itemProp="item">
                {index === 0 && showHome && <FaHome className={styles.homeIcon} />}
                <span itemProp="name">{item.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Specific breadcrumb components for common pages
export function RoomsBreadcrumb() {
  const customItems: BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/users/home' },
    { label: 'Phòng', href: '/users/rooms', isActive: true }
  ];

  return <Breadcrumb customItems={customItems} />;
}

export function RoomDetailBreadcrumb({ roomName }: { roomName: string }) {
  const customItems: BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/users/home' },
    { label: 'Phòng', href: '/users/rooms' },
    { label: roomName, href: '#', isActive: true }
  ];

  return <Breadcrumb customItems={customItems} />;
}

export function BookingBreadcrumb({ roomName }: { roomName?: string }) {
  const customItems: BreadcrumbItem[] = [
    { label: 'Trang chủ', href: '/users/home' },
    { label: 'Phòng', href: '/users/rooms' },
    ...(roomName ? [{ label: roomName, href: '#' }] : []),
    { label: 'Đặt phòng', href: '#', isActive: true }
  ];

  return <Breadcrumb customItems={customItems} />;
}