'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '@/lib/auth';
import { APP_CONFIG, API_BASE_URL } from '@/lib/config';

// Define the shape of selectedRoomData
interface RoomData {
  name?: string;
  image?: string;
  price?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
}

// Define the shape of formData
interface FormData {
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  message: string;
  paymentMethod: string;
  cardType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
}

// Define the shape of errors
interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  paymentMethod?: string;
  cardType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: string;
}

export default function BookingPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState<RoomData | null>(null);
  const [mainImage, setMainImage] = useState('/images/default-room.jpg');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    message: '',
    paymentMethod: '',
    cardType: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    if (!authLoading && !user) {
      const maPhong = searchParams?.get('maPhong');
      const redirectUrl = maPhong ? `/users/booking?maPhong=${maPhong}` : '/users/booking';
      router.push(`${APP_CONFIG.routes.login}?redirect=${encodeURIComponent(redirectUrl)}`);
    }
  }, [user, authLoading, router, searchParams]);

  useEffect(() => {
    if (user) {
      const maPhongFromUrl = searchParams?.get('maPhong');
      
      const data = JSON.parse(localStorage.getItem('selectedRoomData') || '{}');
      
      if (data.name) {
        setSelectedRoomData({
          name: data.name || 'Unknown Room',
          image: data.image || '/images/default-room.jpg',
          price: data.price || '0đ',
          checkInDate: data.checkInDate || '',
          checkOutDate: data.checkOutDate || '',
          adults: data.adults || 1,
          children: data.children || 0,
        });
        setMainImage(data.image || '/images/default-room.jpg');
        setFormData((prev) => ({
          ...prev,
          name: user.hoTen || '',
          email: prev.email,
          message: data.name
            ? `${t('booking.bookingFor')} ${data.name} ${data.checkInDate ? t('booking.from') + ' ' + data.checkInDate : ''} ${data.checkOutDate ? t('booking.to') + ' ' + data.checkOutDate : ''}`
            : t('booking.noRoomSelected'),
          checkInDate: data.checkInDate || '',
          checkOutDate: data.checkOutDate || '',
          adults: data.adults || 1,
          children: data.children || 0,
        }));
      } else if (maPhongFromUrl) {
        console.log("Cần fetch chi tiết phòng cho: ", maPhongFromUrl)
      }
    }
  }, [user, t, searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) || 0 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
    if (name === 'checkInDate' || name === 'checkOutDate' || name === 'adults' || name === 'children') {
      setSelectedRoomData((prev) => ({
        ...prev,
        [name]: name === 'adults' || name === 'children' ? parseInt(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentToken = localStorage.getItem('token');
    if (!user || !currentToken) {
      const maPhong = searchParams?.get('maPhong');
      const redirectUrl = maPhong ? `/users/booking?maPhong=${maPhong}` : '/users/booking';
      router.push(`${APP_CONFIG.routes.login}?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    setIsSubmitting(true);
    setApiError('');
    const newErrors: Errors = {};

    if (!formData.name) {
      newErrors.name = t('booking.nameRequired') || 'Vui lòng điền Họ và Tên của bạn';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = t('booking.emailRequired') || 'Vui lòng điền Email của bạn';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t('booking.invalidEmail') || 'Email không hợp lệ';
    }

    if (!formData.phone) {
      newErrors.phone = t('booking.phoneRequired') || 'Vui lòng điền số điện thoại của bạn';
    }

    const idNumberRegex = /^[0-9]{12}$/;
    if (!formData.idNumber) {
      newErrors.idNumber = t('booking.idNumberRequired') || 'Vui lòng điền số CMND/CCCD của bạn';
    } else if (!idNumberRegex.test(formData.idNumber)) {
      newErrors.idNumber =
        t('booking.invalidIdNumber') ||
        'Số CMND/CCCD phải có tối đa 12 số và không chứa chữ cái hoặc ký tự đặc biệt';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod =
        t('booking.paymentMethodRequired') || 'Vui lòng chọn phương thức thanh toán';
    }

    if (formData.paymentMethod !== 'cash' && !formData.cardType) {
      newErrors.cardType = t('booking.selectCardType') || 'Vui lòng chọn loại thẻ';
    }

    if (!selectedRoomData?.name) {
      newErrors.name = t('booking.noRoomSelected') || 'Vui lòng chọn phòng';
    }
    if (!formData.checkInDate) {
      newErrors.checkInDate = t('booking.checkInRequired') || 'Vui lòng chọn ngày nhận phòng';
    }
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = t('booking.checkOutRequired') || 'Vui lòng chọn ngày trả phòng';
    }
    if (!formData.adults || formData.adults < 1) {
      newErrors.adults = t('booking.adultsRequired') || 'Vui lòng chọn số người lớn';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccess('');
      setIsSubmitting(false);
      return;
    }

    localStorage.setItem('selectedRoomData', JSON.stringify({
      ...selectedRoomData,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      adults: formData.adults,
      children: formData.children,
    }));

    setErrors({});
    try {
      const maPhong = searchParams?.get('maPhong');
      if (!maPhong) {
        throw new Error('Mã phòng không tồn tại để thực hiện đặt phòng.');
      }
      const bookingData = {
        maNguoiDung: user.maNguoiDung,
        maPhong: maPhong, 
        ngayNhan: formData.checkInDate,
        ngayTra: formData.checkOutDate,
        soLuongNguoiLon: formData.adults,
        soLuongTreEm: formData.children,
        tongTien: calculatePrice().total,
        ghiChu: formData.message,
      };

      const response = await fetch(`${API_BASE_URL}/PhieuDatPhong`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server.' }));
        throw new Error(errorData.message || `Lỗi đặt phòng: ${response.status}`);
      }

      setSuccess(t('booking.notification') || 'Đặt phòng thành công!');
      localStorage.removeItem('selectedRoomData');
      
      setTimeout(() => {
        setSuccess('');
        router.push('/users/profile?tab=bookings');
      }, 3000);

    } catch (error: any) {
      console.error('Lỗi khi đặt phòng:', error);
      setApiError(error.message || 'Đã có lỗi xảy ra trong quá trình đặt phòng.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
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

  if (!isClient || authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải trang đặt phòng...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
         <p>Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={styles.bookingContainer}>
          {success && <div className={styles.notificationSuccess}>{success}</div>}
          {apiError && <div className={styles.notificationError}>{apiError}</div>}

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
                {selectedRoomData?.name ? (
                  <div className={styles.roomSummary}>
                    <p>
                      <strong>{t('booking.room')}:</strong> {selectedRoomData.name}
                    </p>
                    <p>
                      <strong>{t('booking.checkIn')}:</strong>{' '}
                      {formData.checkInDate || t('booking.notSelected')}
                    </p>
                    <p>
                      <strong>{t('booking.checkOut')}:</strong>{' '}
                      {formData.checkOutDate || t('booking.notSelected')}
                    </p>
                    <p>
                      <strong>{t('booking.guests')}:</strong>{' '}
                      {formData.adults || 1} {t('booking.adults')},{' '}
                      {formData.children || 0} {t('booking.children')}
                    </p>
                  </div>
                ) : (
                  <p>{t('booking.noRoomSelected')}</p>
                )}

                <form onSubmit={handleSubmit} className={styles.bookingForm} noValidate>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">{t('booking.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('booking.namePlaceholder') || 'Họ và Tên'}
                    />
                    {errors.name && <p className={styles.error}>{errors.name}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">{t('booking.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('booking.emailPlaceholder') || 'Email'}
                    />
                    {errors.email && <p className={styles.error}>{errors.email}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phone">{t('booking.phone')}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('booking.phonePlaceholder') || 'Số điện thoại'}
                    />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="idNumber">{t('booking.idNumber') || 'CMND/CCCD'}</label>
                    <input
                      type="text"
                      id="idNumber"
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      placeholder={t('booking.idNumberPlaceholder') || 'Số CMND/CCCD'}
                    />
                    {errors.idNumber && <p className={styles.error}>{errors.idNumber}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="checkInDate">{t('booking.checkIn')}</label>
                    <input
                      type="date"
                      id="checkInDate"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                    />
                    {errors.checkInDate && <p className={styles.error}>{errors.checkInDate}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="checkOutDate">{t('booking.checkOut')}</label>
                    <input
                      type="date"
                      id="checkOutDate"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                    />
                    {errors.checkOutDate && <p className={styles.error}>{errors.checkOutDate}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="adults">{t('booking.adults')}</label>
                    <input
                      type="number"
                      id="adults"
                      name="adults"
                      value={formData.adults}
                      onChange={handleChange}
                      min="1"
                    />
                    {errors.adults && <p className={styles.error}>{errors.adults}</p>}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="children">{t('booking.children')}</label>
                    <input
                      type="number"
                      id="children"
                      name="children"
                      value={formData.children}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">{t('booking.specialRequests')}</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('booking.specialRequestsPlaceholder') || 'Yêu cầu đặc biệt'}
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
                    {errors.paymentMethod && <p className={styles.error}>{errors.paymentMethod}</p>}
                  </div>
                  {formData.paymentMethod === 'card' || formData.paymentMethod === 'bankCard' ? (
                    <div className={styles.formGroup}>
                      <label htmlFor="cardType">{t('profile.chooseCard')}</label>
                      <select
                        id="cardType"
                        name="cardType"
                        value={formData.cardType}
                        onChange={handleChange}
                      >
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
                      {errors.cardType && <p className={styles.error}>{errors.cardType}</p>}
                    </div>
                  ) : null}

                  {selectedRoomData?.price && (
                    <div className={styles.priceBreakdown}>
                      <h3>{t('booking.priceBreakdown')}</h3>
                      <p>
                        <strong>{t('booking.basePrice')}:</strong>{' '}
                        {priceDetails.basePrice.toLocaleString('vi-VN')}đ
                      </p>
                      <p>
                        <strong>{t('booking.tax')} (10%):</strong>{' '}
                        {priceDetails.tax.toLocaleString('vi-VN')}đ
                      </p>
                      <p>
                        <strong>{t('booking.serviceFee')} (5%):</strong>{' '}
                        {priceDetails.serviceFee.toLocaleString('vi-VN')}đ
                      </p>
                      <p>
                        <strong>{t('booking.total')}:</strong>{' '}
                        {priceDetails.total.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                      {isSubmitting ? t('booking.submitting') : t('booking.submitBooking')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}