'use client';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './Privacy.module.css';

export default function PrivacyPage() {
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
      <section className={styles.privacySection}>
        <h1>{t('privacy.title')}</h1>
        <div className={styles.content}>
          <h2>{t('privacy.introduction')}</h2>
          <p>{t('privacy.introductionText')}</p>
          
          <h2>{t('privacy.dataCollection')}</h2>
          <p>{t('privacy.dataCollectionText')}</p>
          
          <h2>{t('privacy.dataUsage')}</h2>
          <p>{t('privacy.dataUsageText')}</p>
          
          <h2>{t('privacy.dataProtection')}</h2>
          <p>{t('privacy.dataProtectionText')}</p>
          
          <h2>{t('privacy.contact')}</h2>
          <p>{t('privacy.contactText')}</p>
        </div>
      </section>
      
      {/* Map Section - Same as in home page */}

      
      <Footer />
    </div>
  );
}
