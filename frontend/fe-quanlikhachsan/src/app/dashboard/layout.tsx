'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './layout.module.css';

const navItems = [
  { href: '/dashboard', label: 'Trang chủ', icon: '🏠' },
  { href: '/dashboard/account', label: 'Tài Khoản', icon: '👤' },
  { href: '/dashboard/permissions', label: 'Phân Quyền', icon: '🔑' },
  { href: '/dashboard/language', label: 'Đa Ngôn Ngữ', icon: '🌐' },
  { href: '/dashboard/settings', label: 'Cài Đặt Hệ Thống', icon: '⚙️' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logoHeader}>
          <div className={styles.logo}>
            <Image src="/logo.svg" alt="PASSION" width={40} height={40} priority />
            <span>PASSION</span>
          </div>
        </div>
        <div className={styles.search}>
          <input type="search" placeholder="Search for something" />
        </div>
      </header>
      
      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}