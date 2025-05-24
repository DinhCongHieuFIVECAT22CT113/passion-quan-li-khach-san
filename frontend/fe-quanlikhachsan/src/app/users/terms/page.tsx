'use client';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './Terms.module.css';

export default function TermsPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Header />
      <section className={styles.termsSection}>
        <h1>{t('terms.title')}</h1>
        <div className={styles.content}>
          <h2>{t('terms.introduction')}</h2>
          <p>{t('terms.introductionText')}</p>
          
          <h2>{t('terms.booking')}</h2>
          <p>{t('terms.bookingText')}</p>
          
          <h2>{t('terms.cancellation')}</h2>
          <p>{t('terms.cancellationText')}</p>
          
          <h2>{t('terms.liability')}</h2>
          <p>{t('terms.liabilityText')}</p>
          
          <h2>{t('terms.contact')}</h2>
          <p>{t('terms.contactText')}</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}