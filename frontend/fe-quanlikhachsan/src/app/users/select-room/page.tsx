'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';

// Define the shape of formData
interface FormData {
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}

// Define the shape of a room
interface Room {
  id: number;
  name: string;
  price: string;
  image: string;
  availability: string;
  amenities: string[];
}

export default function SelectRoomPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) || 0 : value,
    }));
  };

  const rooms: Room[] = [
    {
      id: 1,
      name: t('selectRoom.poolRoom'),
      price: '4.500.000đ',
      image: '/images/pool-room.jpg',
      availability: t('selectRoom.available'),
      amenities: [t('selectRoom.tv'), t('selectRoom.wifi'), t('selectRoom.airConditioning')],
    },
    {
      id: 2,
      name: t('selectRoom.penthouse'),
      price: '6.000.000đ',
      image: '/images/penthouse.jpg',
      availability: t('selectRoom.available'),
      amenities: [t('selectRoom.tv'), t('selectRoom.wifi'), t('selectRoom.airConditioning')],
    },
    {
      id: 3,
      name: t('selectRoom.nobleRoom'),
      price: '5.500.000đ',
      image: '/images/noble-room.jpg',
      availability: t('selectRoom.available'),
      amenities: [t('selectRoom.tv'), t('selectRoom.wifi'), t('selectRoom.airConditioning')],
    },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
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
            {t('select.rooms')}
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('selectRoom.title')}</h1>
          <p>{t('selectRoom.description')}</p>
        </div>
      </section>

      <section className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <form className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label htmlFor="checkInDate">{t('selectRoom.checkIn')}</label>
              <input
                type="date"
                id="checkInDate"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                placeholder={t('selectRoom.checkIn')}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="checkOutDate">{t('selectRoom.checkOut')}</label>
              <input
                type="date"
                id="checkOutDate"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                placeholder={t('selectRoom.checkOut')}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="adults">{t('selectRoom.adults')}</label>
              <input
                type="number"
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                min="1"
                placeholder={t('selectRoom.adults')}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="children">{t('selectRoom.children')}</label>
              <input
                type="number"
                id="children"
                name="children"
                value={formData.children}
                onChange={handleChange}
                min="0"
                placeholder={t('selectRoom.children')}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </form>
        </div>
      </section>

      <section className={styles.roomsSection}>
        <div className={styles.roomsContainer}>
          {rooms.map((room) => (
            <div key={room.id} className={styles.roomCard}>
              <Image src={room.image} alt={room.name} width={300} height={200} />
              <h3>{room.name}</h3>
              <p>{t('selectRoom.price')}: {room.price}</p>
              <p>{t('selectRoom.status')}: {room.availability}</p>
              <ul>
                {room.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
              {formData.checkInDate && formData.checkOutDate && (
                <button
                  className={styles.selectBtn}
                  onClick={() => {
                    localStorage.setItem('selectedRoomData', JSON.stringify({ ...formData, ...room }));
                    router.push('/users/booking');
                  }}
                >
                  {t('selectRoom.selectRoom')}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

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
            <div className={styles.linkColumn}>
              <h4>{t('about.footerAbout')}</h4>
              <Link href="/location">{t('about.location')}</Link>
            </div>
            <div className={styles.linkColumn}>
              <h4>{t('about.support')}</h4>
              <Link href="/faq">{t('about.faq')}</Link>
              <Link href="/terms">{t('about.terms')}</Link>
              <Link href="/privacy">{t('about.privacy')}</Link>
            </div>
            <div className={styles.linkColumn}>
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