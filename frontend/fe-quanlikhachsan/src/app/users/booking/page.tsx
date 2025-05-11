'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect } from 'react';

export default function BookingPage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: '',
  });

  const roomImages = [
    '/images/room1.jpg',
    '/images/room2.jpg',
    '/images/room3.jpg',
    '/images/room4.jpg',
  ];

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowNotification(true);

    setFormData({
      fullname: '',
      email: '',
      phone: '',
      message: '',
    });

    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Logo Khách sạn" width={120} height={40} />
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

      {showNotification && (
        <div className={styles.notification}>
          <p>{t('booking.notification')}</p>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.description')}</p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className={styles.bookingSection}>
        <div className={styles.formContainer}>
          <div className={styles.imageGallery}>
            <div className={styles.mainImage}>
              <Image
                src={roomImages[activeImageIndex]}
                alt="Room View"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.thumbnails}>
              {roomImages.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${index === activeImageIndex ? styles.active : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`Room ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <form className={styles.bookingForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>{t('booking.fullname')}</label>
              <input
                type="text"
                name="fullname"
                placeholder={t('booking.fullnamePlaceholder')}
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('booking.email')}</label>
              <input
                type="email"
                name="email"
                placeholder={t('booking.emailPlaceholder')}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('booking.phone')}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t('booking.phonePlaceholder')}
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>{t('booking.message')}</label>
              <textarea
                name="message"
                placeholder={t('booking.messagePlaceholder')}
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <button type="submit" className={styles.bookNowBtn}>
              {t('booking.bookNow')}
            </button>
          </form>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6763231438226!2d105.84125361476292!3d21.007025386010126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac428c3336e5%3A0x384d11d7f7f3b4a8!2zQ29wYWNhYmFuYSBNYXJrZXQgLSBUaOG7jyBMw6A!5e0!3m2!1svi!2s!4v1647901645957!5m2!1svi!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.newsletter}>
            <h3>{t('about.subscribe')}</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder={t('about.subscribePlaceholder')} />
              <button type="submit">{t('about.subscribeButton')}</button>
            </div>
          </div>
          <div className={styles.logo}>
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={150} height={50} />
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <Link href="/about">{t('about.footerAbout')}</Link>
              <Link href="/contact">{t('about.support')}</Link>
              <Link href="/location">{t('about.location')}</Link>
            </div>
            <div className={styles.linkColumn}>
              <Link href="/faq">{t('about.faq')}</Link>
              <Link href="/terms">{t('about.terms')}</Link>
              <Link href="/privacy">{t('about.privacy')}</Link>
            </div>
            <div className={styles.linkColumn}>
              <Link href="/services">{t('about.services')}</Link>
              <Link href="/careers">{t('about.careers')}</Link>
              <Link href="/how-to-book">{t('about.howToBook')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}