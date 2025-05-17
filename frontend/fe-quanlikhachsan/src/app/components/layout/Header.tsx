'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaUser } from 'react-icons/fa';
import styles from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../profile/LanguageContext';
import i18n from '../../i18n';

export default function Header() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    i18n.changeLanguage(selectedLanguage).then(() => {
      setIsReady(true);
    });
  }, [selectedLanguage]);

  if (!isReady) return null;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
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
          <Link href="/users/profile" className={styles.profileIconLink}>
            <FaUser className={styles.userIcon} />
          </Link>
        </div>
      </div>
    </header>
  );
} 