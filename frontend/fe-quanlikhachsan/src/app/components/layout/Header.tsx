'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../profile/LanguageContext';
import i18n from '../../i18n';
import { useAuth } from '../../../lib/auth';
import { useLogout } from '../../../lib/hooks';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const handleLogout = useLogout();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (i18n.language !== selectedLanguage) {
      i18n.changeLanguage(selectedLanguage).then(() => {
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  }, [selectedLanguage]);

  // Don't render during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/images/logo-clean.png" 
                alt="Passion Hotel" 
                width={120} 
                height={60} 
                priority
              />
            </Link>
          </div>
          <nav className={styles.mainNav}></nav>
          <div className={styles.userActions}></div>
        </div>
      </header>
    );
  }

  if (authLoading) {
    return (
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/images/logo-clean.png" 
                alt="Passion Hotel" 
                width={120} 
                height={60} 
                priority
              />
            </Link>
          </div>
          <nav className={styles.mainNav}></nav>
          <div className={styles.userActions}></div>
        </div>
      </header>
    );
  }

  if (!isReady) return null;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image src="/images/h_logo.png" alt="Hotel Logo" width={70} height={70} />
          </Link>
        </div>
        <nav className={styles.mainNav}>
          <Link href="/users/home" className={pathname === '/users/home' ? styles.active : ''}>
            {t('profile.home')}
          </Link>
          <Link href="/users/about" className={pathname === '/users/about' ? styles.active : ''}>
            {t('profile.about')}
          </Link>
          <Link href="/users/explore" className={pathname === '/users/explore' ? styles.active : ''}>
            {t('profile.explore')}
          </Link>
          <Link href="/users/rooms" className={pathname === '/users/rooms' ? styles.active : ''}>
            {t('profile.rooms')}
          </Link>
          <Link href="/users/services" className={pathname === '/users/services' ? styles.active : ''}>
            {t('profile.services')}
          </Link>
          <Link href="/users/promotions" className={pathname === '/users/promotions' ? styles.active : ''}>
            {t('profile.promotions')}
          </Link>
        </nav>
        <div className={styles.userActions}>
          {user ? (
            <>
              <Link href="/users/profile" className={styles.profileLink}>
                <FaUser className={styles.userIcon} />
                <span className={styles.userName}>{user.hoTen || user.maNguoiDung}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                <FaSignOutAlt /> {t('profile.logout', 'Đăng xuất')}
              </button>
            </>
          ) : (
            <>
              <a 
                href="/login" 
                className={styles.authButton || "login-button"}
              >
                Đăng nhập
              </a>
              <Link href="/signup" className={`${styles.authLink} ${styles.signupButton}`}>
                {t('profile.signup', 'Đăng ký')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
