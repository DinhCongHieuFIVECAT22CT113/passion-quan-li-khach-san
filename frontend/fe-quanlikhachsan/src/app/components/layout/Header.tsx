'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={120} height={40} />
          </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/">Trang chủ</Link>
          <Link href="/about">Giới thiệu</Link>
          <Link href="/explore">Khám phá</Link>
          <Link href="/rooms">Phòng</Link>
        </div>
        <div className={styles.navRight}>
          {isLoggedIn ? (
            <>
              <Link href="/profile">
                <Image 
                  src="/default-avatar.jpg" 
                  alt="Profile" 
                  width={32} 
                  height={32} 
                  className={styles.avatar}
                />
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
} 