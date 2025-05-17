'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function ExplorePage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const features = [
    {
      id: 1,
      title: t('explore.luxuriousRoom'),
      description: t('explore.luxuriousRoomDesc'),
      image: '/images/reviews/room.jpg',
    },
    {
      id: 2,
      title: t('explore.gym'),
      description: t('explore.gymDesc'),
      image: '/images/reviews/gym.jpg',
    },
    {
      id: 3,
      title: t('explore.restaurant'),
      description: t('explore.restaurantDesc'),
      image: '/images/reviews/restaurant.jpg',
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
          <h1>{t('explore.title')}</h1>
          <p>{t('explore.description')}</p>
          <button className={styles.playButton}>
            <FaPlay />
            <span>{t('explore.playButton')}</span>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>{t('explore.features')}</h2>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div className={styles.featureImage}>
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.featureContent}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href="/users/rooms" className={styles.learnMore}>
                  {t('explore.learnMore')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}