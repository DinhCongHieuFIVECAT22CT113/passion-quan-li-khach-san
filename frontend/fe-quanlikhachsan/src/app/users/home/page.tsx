'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar, FaHotel, FaUtensils, FaUsers, FaSwimmingPool, FaRing } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import Header from '../../components/layout/Header';

export default function Home() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage).then(() => {
      setIsReady(true);
    });
  }, [selectedLanguage]);

  if (!isReady) return null; 

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
      {/* Header */}
      <Header />

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