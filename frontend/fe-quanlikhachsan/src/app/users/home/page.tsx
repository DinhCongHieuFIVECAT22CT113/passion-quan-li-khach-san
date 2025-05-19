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
import Footer from '../../components/layout/Footer';

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
      image: '/images/reviews/room.jpg',
      link: '/rooms',
    },
    {
      title: t('home.diverseCuisine'),
      description: t('home.diverseCuisineDesc'),
      icon: <FaUtensils />,
      image: '/images/reviews/dining.jpg',
      link: '/dining',
    },
    {
      title: t('home.fiveStarService'),
      description: t('home.fiveStarServiceDesc'),
      icon: <FaUsers />,
      image: '/images/reviews/conference.jpg',
      link: '/conference',
    },
    {
      title: t('home.specialOffers'),
      description: t('home.specialOffersDesc'),
      icon: <FaSwimmingPool />,
      image: '/images/reviews/pool.jpg',
      link: '/pool',
    },
    {
      title: t('home.specialOffers'),
      description: t('home.specialOffersDesc'),
      icon: <FaRing />,
      image: '/images/reviews/wedding.jpg',
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
      image: '/images/reviews/weekend.jpg',
    },
    {
      type: t('home.specialOffer'),
      title: t('home.businessPackage'),
      description: t('home.businessPackageDesc'),
      rating: 4.5,
      price: 6900000,
      image: '/images/reviews/business.jpg',
    },
    {
      type: t('home.holidayOffer'),
      title: t('home.familyHoliday'),
      description: t('home.familyHolidayDesc'),
      rating: 4.8,
      price: 9200000,
      image: '/images/reviews/family.jpg',
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
              <Image src="/images/reviews/location.jpg" alt="Vị trí" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.location')}</h3>
              <p>{t('home.locationDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/reviews/room.jpg" alt="Phòng" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.luxuriousRoom')}</h3>
              <p>{t('home.luxuriousRoomDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/reviews/service.jpg" alt="Dịch vụ" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>{t('home.fiveStarService')}</h3>
              <p>{t('home.fiveStarServiceDesc')}</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/reviews/dining.jpg" alt="Ẩm thực" fill style={{ objectFit: 'cover' }} />
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
          <Link href="/users/promotions" className={styles.viewAll}>
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
          <section className={styles.mapSection}>
            <h2>{t('home.location')}</h2>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.757135614257!2d105.84125361476292!3d21.007025386010126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac428c3336e5%3A0x384d11d7f7f3b4a8!2zQ29wYWNhYmFuYSBNYXJrZXQgLSBUaOG7jyBMw6A!5e0!3m2!1svi!2s!4v1647901645957!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </section>
      {/* Footer */}
      <Footer />
    </div>
  );
}