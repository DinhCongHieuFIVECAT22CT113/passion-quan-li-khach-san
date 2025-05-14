'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser, FaBed, FaWifi, FaTv, FaSnowflake } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RoomInformationPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const roomId = searchParams.get('id');

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  interface Amenity {
    icon: React.ReactNode;
    name: string;
  }

  interface Room {
    name: string;
    price: string;
    image: string;
    description: string;
    amenities: Amenity[];
    size: string;
    maxGuests: number;
    bedType: string;
    view: string;
    additionalFeatures: string[];
  }

  const rooms: Record<string, Room> = {
    1: {
      name: 'Phòng Gần Hồ',
      price: '4.500.000đ',
      image: '/images/pool-room.jpg',
      description: 'Phòng sang trọng với view nhìn ra hồ bơi, không gian thoáng đãng và yên tĩnh.',
      amenities: [
        { icon: <FaBed />, name: 'Giường King Size' },
        { icon: <FaWifi />, name: 'Wifi Tốc Độ Cao' },
        { icon: <FaTv />, name: 'TV Màn Hình Phẳng' },
        { icon: <FaSnowflake />, name: 'Điều Hòa' }
      ],
      size: '40m²',
      maxGuests: 2,
      bedType: 'King Size',
      view: 'Hồ bơi',
      additionalFeatures: [
        'Minibar đầy đủ',
        'Phòng tắm sang trọng',
        'Dịch vụ phòng 24/7',
        'Két sắt cá nhân'
      ]
    },
    2: {
      name: 'Căn Hộ Áp Mái',
      price: '10.500.000đ',
      image: '/images/penthouse.jpg',
      description: 'Căn hộ cao cấp với tầm nhìn panorama ra thành phố, thiết kế hiện đại và sang trọng.',
      amenities: [
        { icon: <FaBed />, name: 'Giường King Size' },
        { icon: <FaWifi />, name: 'Wifi Tốc Độ Cao' },
        { icon: <FaTv />, name: 'TV Màn Hình Phẳng' },
        { icon: <FaSnowflake />, name: 'Điều Hòa' }
      ],
      size: '120m²',
      maxGuests: 4,
      bedType: '2 King Size',
      view: 'Toàn cảnh thành phố',
      additionalFeatures: [
        'Bếp đầy đủ tiện nghi',
        'Phòng khách riêng biệt',
        'Ban công rộng',
        'Jacuzzi riêng'
      ]
    },
    // Thêm thông tin cho các phòng khác tương tự
  };

  const room = roomId ? rooms[roomId] : null;

  if (!isClient || !room) {
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
            {t('đặt phòng')}
          </Link>
        </div>
      </nav>

      {/* Room Information */}
      <main className={styles.main}>
        <div className={styles.roomHeader}>
          <div className={styles.roomImage}>
            <Image src={room.image} alt={room.name} fill style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.roomOverview}>
            <h1>{room.name}</h1>
            <p className={styles.price}>{room.price} / đêm</p>
            <p className={styles.description}>{room.description}</p>
          </div>
        </div>

        <div className={styles.roomDetails}>
          <section className={styles.amenities}>
            <h2>Tiện Nghi</h2>
            <div className={styles.amenitiesGrid}>
              {room.amenities.map((amenity: Amenity, index: number) => (
                <div key={index} className={styles.amenityItem}>
                  {amenity.icon}
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.specifications}>
            <h2>Thông Số Phòng</h2>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <strong>Diện tích:</strong> {room.size}
              </div>
              <div className={styles.specItem}>
                <strong>Số khách tối đa:</strong> {room.maxGuests} người
              </div>
              <div className={styles.specItem}>
                <strong>Loại giường:</strong> {room.bedType}
              </div>
              <div className={styles.specItem}>
                <strong>Hướng nhìn:</strong> {room.view}
              </div>
            </div>
          </section>

          <section className={styles.additionalFeatures}>
            <h2>Tính Năng Bổ Sung</h2>
            <ul className={styles.featuresList}>
              {room.additionalFeatures.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>

          <div className={styles.bookingActions}>
            <Link href={`/users/booking`} className={styles.bookButton}>
              Đặt Phòng Ngay
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Image src="/images/hotel-logo.png" alt="Logo Khách sạn" width={150} height={60} />
          </div>
          <div className={styles.copyright}>{t('about.copyright')}</div>
        </div>
      </footer>
    </div>
  );
}
