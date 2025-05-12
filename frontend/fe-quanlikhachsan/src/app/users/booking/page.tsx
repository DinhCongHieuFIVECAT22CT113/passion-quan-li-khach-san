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

// Define the shape of selectedRoomData
interface RoomData {
  name: string;
  image?: string;
  price: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}

// Define the shape of formData
interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  paymentMethod: string;
  cardType: string;
}

export default function BookingPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState<RoomData | null>(null);
  const [mainImage, setMainImage] = useState('/images/default-room.jpg');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    paymentMethod: '',
    cardType: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('selectedRoomData') || '{}');
    if (data.name) {
      setSelectedRoomData(data);
      setMainImage(data.image || '/images/default-room.jpg');
      setFormData((prev) => ({
        ...prev,
        message: `${t('booking.bookingFor')} ${data.name} ${t('booking.from')} ${data.checkInDate} ${t('booking.to')} ${data.checkOutDate}`,
      }));
    }
  }, [t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.paymentMethod) {
      setError(t('booking.fillAllFields'));
      setSuccess('');
      return;
    }

    if (formData.paymentMethod !== 'cash' && !formData.cardType) {
      setError(t('booking.selectCardType'));
      setSuccess('');
      return;
    }

    setError('');
    setSuccess(t('booking.notification'));
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: formData.message,
      paymentMethod: '',
      cardType: '',
    });

    setTimeout(() => {
      setSuccess('');
      router.push('/users/profile');
    }, 3000);
  };

  const calculatePrice = () => {
    if (!selectedRoomData?.price) return { basePrice: 0, tax: 0, serviceFee: 0, total: 0 };
    const basePrice = parseInt(selectedRoomData.price.replace(/[^0-9]/g, '')) || 0;
    const tax = basePrice * 0.1;
    const serviceFee = basePrice * 0.05;
    const total = basePrice + tax + serviceFee;
    return { basePrice, tax, serviceFee, total };
  };

  const priceDetails = calculatePrice();

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {success && <div className={styles.notification}>{success}</div>}

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
            {t('booking.rooms')}
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.description')}</p>
        </div>
      </section>

      <section className={styles.bookingSection}>
        <div className={styles.formContainer}>
          <div className={styles.imageGallery}>
            <div className={styles.mainImage}>
              {mainImage && (
                <Image src={mainImage} alt="Main Room" fill style={{ objectFit: 'cover' }} />
              )}
            </div>
          </div>

          <div>
            <h2>{t('booking.bookingDetails')}</h2>
            {selectedRoomData ? (
              <div className={styles.roomSummary}>
                <p>
                  <strong>{t('booking.room')}:</strong> {selectedRoomData.name}
                </p>
                <p>
                  <strong>{t('booking.checkIn')}:</strong> {selectedRoomData.checkInDate}
                </p>
                <p>
                  <strong>{t('booking.checkOut')}:</strong> {selectedRoomData.checkOutDate}
                </p>
                <p>
                  <strong>{t('booking.guests')}:</strong> {selectedRoomData.adults} {t('booking.adults')},{' '}
                  {selectedRoomData.children} {t('booking.children')}
                </p>
              </div>
            ) : (
              <p>{t('booking.noRoomSelected')}</p>
            )}

            <form onSubmit={handleSubmit} className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">{t('booking.name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('booking.namePlaceholder')}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">{t('booking.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('booking.emailPlaceholder')}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">{t('booking.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('booking.phonePlaceholder')}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">{t('booking.specialRequests')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('booking.specialRequestsPlaceholder')}
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="paymentMethod">{t('profile.paymentMethod')}</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="">{t('profile.chooseMethod')}</option>
                  <option value="cash">{t('profile.cash')}</option>
                  <option value="card">{t('profile.internationalCards')}</option>
                  <option value="bankCard">{t('profile.vietnameseBanks')}</option>
                </select>
              </div>
              {formData.paymentMethod === 'card' || formData.paymentMethod === 'bankCard' ? (
                <div className={styles.formGroup}>
                  <label htmlFor="cardType">{t('profile.chooseCard')}</label>
                  <select id="cardType" name="cardType" value={formData.cardType} onChange={handleChange}>
                    <option value="">{t('profile.chooseCard')}</option>
                    {formData.paymentMethod === 'card' && (
                      <>
                        <option value="visa">Visa</option>
                        <option value="mastercard">MasterCard</option>
                      </>
                    )}
                    {formData.paymentMethod === 'bankCard' && (
                      <>
                        <option value="vietcombank">Vietcombank</option>
                        <option value="techcombank">Techcombank</option>
                      </>
                    )}
                  </select>
                </div>
              ) : null}

              {selectedRoomData && (
                <div className={styles.priceBreakdown}>
                  <h3>{t('booking.priceBreakdown')}</h3>
                  <p>
                    <strong>{t('booking.basePrice')}:</strong>{' '}
                    {priceDetails.basePrice.toLocaleString('vi-VN')}đ
                  </p>
                  <p>
                    <strong>{t('booking.tax')} (10%):</strong> {priceDetails.tax.toLocaleString('vi-VN')}đ
                  </p>
                  <p>
                    <strong>{t('booking.serviceFee')} (5%):</strong>{' '}
                    {priceDetails.serviceFee.toLocaleString('vi-VN')}đ
                  </p>
                  <p>
                    <strong>{t('booking.total')}:</strong> {priceDetails.total.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.bookNowBtn}>
                {t('booking.bookNow')}
              </button>
            </form>
          </div>
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