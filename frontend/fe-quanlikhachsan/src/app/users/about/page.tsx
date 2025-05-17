'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';

export default function AboutPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Quản lý',
      image: '/images/manager.jpg',
      description: t('about.description'), // Nội dung động, không cần dịch
    },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('about.title')}</h1>
          <p>{t('about.description')}</p>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        {teamMembers.map((member) => (
          <div key={member.id} className={styles.teamMember}>
            <div className={styles.memberImage}>
              <Image
                src={member.image}
                alt={member.name}
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.memberInfo}>
              <h2>
                {member.name} ({member.role})
              </h2>
              <div className={styles.memberDescription}>
                {member.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Clients Section */}
      <section className={styles.clientsSection}>
        <h2>{t('about.partners')}</h2>
        <div className={styles.clientsGrid}>{/* Add client logos here */}</div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.newsletter}>
            <h3>{t('about.subscribe')}</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder={t('about.subscribePlaceholder')} />
              <button>{t('about.subscribeButton')}</button>
            </div>
          </div>
          <div className={styles.footerLogo}>
            <Image src="/images/hotel-logo.png" alt="Logo Khách sạn" width={150} height={60} />
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h4>{t('about.footerAbout')}</h4>
              <Link href="/location">{t('about.location')}</Link>
            </div>
            <div>
              <h4>{t('about.support')}</h4>
              <Link href="/faq">{t('about.faq')}</Link>
              <Link href="/terms">{t('about.terms')}</Link>
              <Link href="/privacy">{t('about.privacy')}</Link>
            </div>
            <div>
              <h4>{t('about.downloadApp')}</h4>
              <Link href="/services">{t('about.services')}</Link>
              <Link href="/careers">{t('about.careers')}</Link>
              <Link href="/book">{t('about.howToBook')}</Link>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>{t('about.copyright')}</div>
      </footer>
    </div>
  );
}