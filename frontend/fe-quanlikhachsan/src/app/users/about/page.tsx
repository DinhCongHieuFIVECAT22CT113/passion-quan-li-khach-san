'use client';

import Image from 'next/image';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const teamMembers = [
    {
      id: 1,
      name: 'Công Hiếu',
      role: 'Quản lý',
      image: '/images/members/manager.jpg',
      description: t('about.description'),
    },
        {
      id: 2,
      name: 'Giang Trường',
      role: 'Giám Đốc Điều Hành',
      image: '/images/members/director.jpg',
      description: t('about.description1'),
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
      <Footer />
    </div>
  );
}