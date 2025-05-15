'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser, FaBed, FaWifi, FaTv, FaSnowflake } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function RoomInformationPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams?.get('id');

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
      name: t('rooms.room1Name'),
      price: '4.500.000đ',
      image: '/images/pool-room.jpg',
      description: t('rooms.room1Description'),
      amenities: [
        { icon: <FaBed />, name: t('rooms.bedKingSize') },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '40m²',
      maxGuests: 2,
      bedType: t('rooms.bedKingSize'),
      view: t('rooms.poolView'),
      additionalFeatures: [
        t('rooms.minibar'),
        t('rooms.luxuryBathroom'),
        t('rooms.roomService247'),
        t('rooms.safeBox'),
      ],
    },
    2: {
      name: t('rooms.room2Name'),
      price: '10.500.000đ',
      image: '/images/penthouse.jpg',
      description: t('rooms.room2Description'),
      amenities: [
        { icon: <FaBed />, name: t('rooms.bedKingSize') },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '120m²',
      maxGuests: 4,
      bedType: `2 ${t('rooms.bedKingSize')}`,
      view: t('rooms.cityView'),
      additionalFeatures: [
        t('rooms.fullKitchen'),
        t('rooms.separateLivingRoom'),
        t('rooms.largeBalcony'),
        t('rooms.privateJacuzzi'),
      ],
    },
    3: {
      name: t('rooms.room3Name'),
      price: '5.500.000đ',
      image: '/images/noble-room.jpg',
      description: t('rooms.room3Description'),
      amenities: [
        { icon: <FaBed />, name: t('rooms.bedQueen') },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '35m²',
      maxGuests: 3,
      bedType: t('rooms.bedQueen'),
      view: t('rooms.cityView'),
      additionalFeatures: [
        t('rooms.hairDryer'),
        t('rooms.kettle'),
        t('rooms.toiletries'),
        t('rooms.workDesk'),
      ],
    },
    4: {
      name: t('rooms.room4Name'),
      price: '8.500.000đ',
      image: '/images/green-apartment.jpg',
      description: t('rooms.room4Description'),
      amenities: [
        { icon: <FaBed />, name: `2 ${t('rooms.bedQueen')}` },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '60m²',
      maxGuests: 5,
      bedType: `2 ${t('rooms.bedQueen')}`,
      view: t('rooms.parkView'),
      additionalFeatures: [
        t('rooms.miniFridge'),
        t('rooms.smallKitchen'),
        t('rooms.workDesk'),
        t('rooms.greenBalcony'),
      ],
    },
    5: {
      name: t('rooms.room5Name'),
      price: '2.500.000đ',
      image: '/images/simp-room.jpg',
      description: t('rooms.room5Description'),
      amenities: [
        { icon: <FaBed />, name: t('rooms.bedSingle') },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '20m²',
      maxGuests: 2,
      bedType: t('rooms.bedSingle'),
      view: t('rooms.seaView'),
      additionalFeatures: [
        t('rooms.standingShower'),
        t('rooms.dressingMirror'),
        t('rooms.privateBalcony'),
      ],
    },
    6: {
      name: t('rooms.room6Name'),
      price: '7.500.000đ',
      image: '/images/royal-room.jpg',
      description: t('rooms.room6Description'),
      amenities: [
        { icon: <FaBed />, name: t('rooms.bedKingSize') },
        { icon: <FaWifi />, name: t('rooms.highSpeedWifi') },
        { icon: <FaTv />, name: t('rooms.flatScreenTV') },
        { icon: <FaSnowflake />, name: t('rooms.airConditioning') },
      ],
      size: '50m²',
      maxGuests: 3,
      bedType: t('rooms.bedKingSize'),
      view: t('rooms.cityView'),
      additionalFeatures: [
        t('rooms.bathtub'),
        t('rooms.premiumMinibar'),
        t('rooms.roomService247'),
        t('rooms.safeBox'),
      ],
    },
  };

  const room = roomId ? rooms[roomId] : null;

  const handleBookNow = () => {
    if (room) {
      const roomData = {
        name: room.name,
        price: room.price,
        image: room.image,
      };
      localStorage.setItem('selectedRoomData', JSON.stringify(roomData));
      router.push('/users/booking');
    }
  };

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
            {t('rooms.booking')}
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
            <p className={styles.price}>{room.price} {t('rooms.perNight')}</p>
            <p className={styles.description}>{room.description}</p>
          </div>
        </div>

        <div className={styles.roomDetails}>
          <section className={styles.amenities}>
            <h2>{t('rooms.amenities')}</h2>
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
            <h2>{t('rooms.roomSpecs')}</h2>
            <div className={styles.specGrid}>
              <div className={styles.specItem}>
                <strong>{t('rooms.size')}:</strong> {room.size}
              </div>
              <div className={styles.specItem}>
                <strong>{t('rooms.maxGuests')}:</strong> {room.maxGuests} {t('rooms.people')}
              </div>
              <div className={styles.specItem}>
                <strong>{t('rooms.bedType')}:</strong> {room.bedType}
              </div>
              <div className={styles.specItem}>
                <strong>{t('rooms.view')}:</strong> {room.view}
              </div>
            </div>
          </section>

          <section className={styles.additionalFeatures}>
            <h2>{t('rooms.additionalFeatures')}</h2>
            <ul className={styles.featuresList}>
              {room.additionalFeatures.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>

          <div className={styles.bookingActions}>
            <button onClick={handleBookNow} className={styles.bookButton}>
              {t('rooms.bookNow')}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <h3>{t('about.subscribe')}</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder={t('about.subscribePlaceholder')} />
              <button className={styles.subscribeButton}>{t('about.subscribeButton')}</button>
            </div>
          </div>

          <div className={styles.footerCenter}>
            <Image src="/images/logo.png" alt={t('about.hotelLogo')} width={150} height={60} />
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>{t('about.footerAbout')}</h4>
                <Link href="/location">{t('about.location')}</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>{t('about.support')}</h4>
                <Link href="/faq">{t('about.faq')}</Link>
                <Link href="/terms">{t('about.terms')}</Link>
                <Link href="/privacy">{t('about.privacy')}</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>{t('about.downloadApp')}</h4>
                <Link href="/services">{t('about.services')}</Link>
                <Link href="/careers">{t('about.careers')}</Link>
                <Link href="/book">{t('about.howToBook')}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>{t('about.copyright')}</div>
      </footer>
    </div>
  );
}