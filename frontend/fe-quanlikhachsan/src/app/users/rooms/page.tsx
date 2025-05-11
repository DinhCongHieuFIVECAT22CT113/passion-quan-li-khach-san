'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';

export default function RoomsPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const rooms = [
    {
      id: 1,
      name: 'Phòng Gần Hồ',
      price: '4.500.000đ',
      image: '/images/pool-room.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
    {
      id: 2,
      name: 'Căn Hộ Áp Mái',
      price: '10.500.000đ',
      image: '/images/penthouse.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
    {
      id: 3,
      name: 'Phòng Quý Tộc',
      price: '5.500.000đ',
      image: '/images/noble-room.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
    {
      id: 4,
      name: 'Căn Hộ Xanh',
      price: '8.500.000đ',
      image: '/images/green-apartment.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
    {
      id: 5,
      name: 'Phòng Đơn Giản',
      price: '2.500.000đ',
      image: '/images/simp-room.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
    {
      id: 6,
      name: 'Phòng Hoàng Gia',
      price: '7.500.000đ',
      image: '/images/royal-room.jpg',
      availability: t('rooms.available'),
      amenities: [t('rooms.tv'), t('rooms.wifi'), t('rooms.airConditioning')],
    },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
        </Link>
        <div className={styles.navLinks}>
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
          <h1>{t('rooms.title')}</h1>
          <p>{t('rooms.description')}</p>
          <div className={styles.scrollIndicator}>
            <span>{t('rooms.scrollDown')}</span>
            <div className={styles.scrollArrow}></div>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className={styles.roomsGrid}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomImage}>
              <Image src={room.image} alt={room.name} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.roomInfo}>
              <div className={styles.roomHeader}>
                <h3>{room.name}</h3>
                <span className={styles.availability}>
                  {t('rooms.status')}: {room.availability}
                </span>
              </div>
              <div className={styles.price}>{room.price}</div>
              <div className={styles.amenities}>
                {room.amenities.map((amenity, index) => (
                  <span key={index} className={styles.amenity}>
                    <Image
                      src={`/images/${amenity.toLowerCase()}-icon.png`}
                      alt={amenity}
                      width={20}
                      height={20}
                    />
                    {amenity}
                  </span>
                ))}
              </div>
              <Link href="/users/booking" className={styles.bookNowLink}>
                {t('booking.bookNow')}
              </Link>
            </div>
          </div>
        ))}
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