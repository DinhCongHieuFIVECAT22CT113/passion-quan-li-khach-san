'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './styles.module.css';

const menuItems = [
  { path: '/', icon: '🏠', label: 'Trang chủ' },
  { path: '/account', icon: '👤', label: 'Tài Khoản' },
  { path: '/permissions', icon: '🔑', label: 'Phân Quyền' },
  { path: '/language', icon: '🌐', label: 'Đa Ngôn Ngữ' }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Image src="/diamond.svg" alt="" width={24} height={24} />
        </div>
        <div className={styles.logoText}>
          <Image src="/passion-text.svg" alt="PASSION" width={96} height={24} />
        </div>
      </div>

      <div className={styles.menuSection}>
        <span className={styles.menuTitle}>Menu</span>
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 