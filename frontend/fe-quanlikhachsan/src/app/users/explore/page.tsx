'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaPlay, FaUser } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';

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
      image: '/images/luxurious-room.jpg',
    },
    {
      id: 2,
      title: t('explore.gym'),
      description: t('explore.gymDesc'),
      image: '/images/gym.jpg',
    },
    {
      id: 3,
      title: t('explore.restaurant'),
      description: t('explore.restaurantDesc'),
      image: '/images/restaurant.jpg',
    },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={120} height={40} />
          </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/users/home">{t('profile.home')}</Link>
          <Link href="/users/about">{t('profile.about')}</Link>
          <Link href="/users/explore">{t('profile.explore')}</Link>
          <Link href="/users/rooms">{t('profile.rooms')}</Link>
        </div>
        <div className={styles.navRight}>
          <Link href="/users/profile" className={styles.profileIcon}>
            <FaUser />
          </Link>
          <Link href="/users/booking" className={styles.bookNowBtn}>
            {t('booking.bookNow')}
          </Link>
        </div>
      </nav>

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