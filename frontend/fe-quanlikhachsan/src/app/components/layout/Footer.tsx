'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../profile/LanguageContext';
import i18n from '../../i18n';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage).then(() => {
      setIsReady(true);
    });
  }, [selectedLanguage]);

  if (!isReady) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <Image src="/images/f_logo.png" alt="Logo" width={150} height={150} />
          <p>{t('footer.tagline')}</p>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.linkGroup}>
            <h4>{t('footer.links')}</h4>
            <Link href="/users/home">{t('profile.home')}</Link>
            <Link href="/users/about">{t('profile.about')}</Link>
            <Link href="/users/rooms">{t('profile.rooms')}</Link>
            <Link href="/users/explore">{t('profile.explore')}</Link>
            <Link href="/users/services">{t('profile.services')}</Link>
            <Link href="/users/promotions">{t('profile.promotions')}</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>{t('footer.policies')}</h4>
            <Link href="/users/privacy">{t('footer.privacy')}</Link>
            <Link href="/users/terms">{t('footer.terms')}</Link>
            <Link href="/users/faq">{t('footer.faq')}</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>{t('footer.contact')}</h4>
            <p>{t('footer.email')}: info@hotel.com</p>
            <p>{t('footer.phone')}: +84 123 456 789</p>
            <p>{t('footer.address')}: 123 Street, City</p>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
      </div>
    </footer>
  );
}