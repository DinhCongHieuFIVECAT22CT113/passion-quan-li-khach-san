'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar, FaHotel, FaUtensils, FaUsers, FaSwimmingPool, FaRing, FaUser } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect } from 'react';

export default function Home() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const router = useRouter();

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const services = [
    {
      title: t('home.luxuriousRoom'),
      description: t('home.luxuriousRoomDesc'),
      icon: <FaHotel />,
      image: '/images/room.jpg',
      link: '/rooms',
    },
    {
      title: t('home.diverseCuisine'),
      description: t('home.diverseCuisineDesc'),
      icon: <FaUtensils />,
      image: '/images/dining.jpg',
      link: '/dining',
    },
    {
      title: t('home.fiveStarService'),
      description: t('home.fiveStarServiceDesc'),
      icon: <FaUsers />,
      image: '/images/conference.jpg',
      link: '/conference',
    },
    {
      title: t('home.specialOffers'),
      description: t('home.specialOffersDesc'),
      icon: <FaSwimmingPool />,
      image: '/images/pool.jpg',
      link: '/pool',
    },
    {
      title: t('home.specialOffers'),
      description: t('home.specialOffersDesc'),
      icon: <FaRing />,
      image: '/images/wedding.jpg',
      link: '/wedding',
    },
  ];

  const offers = [
    {
      type: t('home.roomPackage'),
      title: t('home.weekendGetaway'),
      description: t('home.weekendGetawayDesc'),
      rating: 5,
      price: 4500000,
      image: '/images/weekend.jpg',
    },
    {
      type: t('home.specialOffer'),
      title: t('home.businessPackage'),
      description: t('home.businessPackageDesc'),
      rating: 4.5,
      price: 6900000,
      image: '/images/business.jpg',
    },
    {
      type: t('home.holidayOffer'),
      title: t('home.familyHoliday'),
      description: t('home.familyHolidayDesc'),
      rating: 4.8,
      price: 9200000,
      image: '/images/family.jpg',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
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
          <h1>{t('home.title')}</h1>
          <p>{t('home.description')}</p>
          <Link href="/users/rooms" className={styles.heroButton}>
            {t('home.viewRooms')}
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/location.jpg" alt="Vị trí" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.location')}</h3>
              <p>{t('home.locationDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/room.jpg" alt="Phòng" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.luxuriousRoom')}</h3>
              <p>{t('home.luxuriousRoomDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/service.jpg" alt="Dịch vụ" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.fiveStarService')}</h3>
              <p>{t('home.fiveStarServiceDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/dining.jpg" alt="Ẩm thực" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.diverseCuisine')}</h3>
              <p>{t('home.diverseCuisineDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className={styles.bookingForm}>
        <div className={styles.formContent}>
          <div className={styles.formGroup}>
            <label>{t('home.checkInDate')}</label>
            <input type="date" placeholder={t('home.checkInDate')} />
          </div>

          <div className={styles.formGroup}>
            <label>{t('home.checkOutDate')}</label>
            <input type="date" placeholder={t('home.checkOutDate')} />
          </div>

          <div className={styles.guestGroup}>
            <div className={styles.guestCounter}>
              <label>{t('home.adults')}</label>
              <div className={styles.counter}>
                <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                <span>{adults}</span>
                <button onClick={() => setAdults(adults + 1)}>+</button>
              </div>
            </div>

            <div className={styles.guestCounter}>
              <label>{t('home.children')}</label>
              <div className={styles.counter}>
                <button onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                <span>{children}</span>
                <button onClick={() => setChildren(children + 1)}>+</button>
              </div>
            </div>
          </div>

          <button className={styles.searchButton} onClick={() => router.push('/users/rooms')}>
            {t('home.searchRooms')}
          </button>
        </div>
      </section>

      {/* Special Offers */}
      <section className={styles.specialOffers}>
        <div className={styles.sectionHeader}>
          <h2>{t('home.specialOffers')}</h2>
          <p>{t('home.specialOffersDesc')}</p>
          <Link href="/offers" className={styles.viewAll}>
            {t('home.viewAllOffers')}
          </Link>
        </div>
        <div className={styles.offerGrid}>
          {offers.map((offer, index) => (
            <div key={index} className={styles.offerCard}>
              <div className={styles.offerImage}>
                <Image src={offer.image} alt={offer.title} fill style={{ objectFit: 'cover' }} />
                <div className={styles.offerType}>{offer.type}</div>
              </div>
              <div className={styles.offerContent}>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <div className={styles.offerRating}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.floor(offer.rating) ? styles.starActive : styles.star} />
                  ))}
                </div>
                <div className={styles.offerPrice}>
                  <span className={styles.amount}>{offer.price.toLocaleString('en-US')}đ</span>
                  <span className={styles.perNight}>{t('home.perNight')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={150} height={60} />
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