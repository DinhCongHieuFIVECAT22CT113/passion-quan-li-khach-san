'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar, FaCalendarAlt, FaUsers, FaSearch } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../components/profile/LanguageContext';
import i18n from '../../i18n';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import SearchBar from '../../components/search/SearchBar';
import { getPromotions, getRoomTypes } from '../../../lib/api';
import { RoomType } from '../../../types/auth';
import BookingModal from '../../components/booking/BookingModal';

// Định nghĩa interface cho Promotion
interface Promotion {
  maMK: string;
  tenKhuyenMai: string;
  moTa: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  phanTramGiam: number;
  dieuKien?: string;
  maGiamGia: string;
  thumbnail?: string;
  trangThai?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // Thêm state cho dữ liệu từ API với kiểu dữ liệu đã định nghĩa
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  // State cho form tìm kiếm
  const [searchForm, setSearchForm] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 2,
  });

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage).then(() => {
      setIsReady(true);
    });
    
    // Lấy dữ liệu từ API
    fetchData();

    // Thiết lập ngày mặc định
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setSearchForm({
      checkInDate: today.toISOString().split('T')[0],
      checkOutDate: tomorrow.toISOString().split('T')[0],
      guests: 2,
    });
  }, [selectedLanguage]);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách khuyến mãi và phòng song song
      const [promotionsData, roomTypesData] = await Promise.all([
        getPromotions(),
        getRoomTypes()
      ]);
      
      console.log('Dữ liệu promotions:', promotionsData);
      console.log('Dữ liệu roomTypes:', roomTypesData);
      
      // Xử lý dữ liệu khuyến mãi
      if (Array.isArray(promotionsData)) {
        const activePromotions = promotionsData.filter((promo: Promotion) => {
          try {
            const now = new Date();
            const startDate = new Date(promo.ngayBatDau);
            const endDate = new Date(promo.ngayKetThuc);
            return now >= startDate && now <= endDate;
          } catch (err) {
            console.error('Lỗi xử lý ngày tháng:', err);
            return false;
          }
        });
        setPromotions(activePromotions.slice(0, 3));
      } else {
        console.error('Dữ liệu promotions không phải dạng mảng:', promotionsData);
      }

      // Xử lý dữ liệu phòng
      if (Array.isArray(roomTypesData)) {
        setRoomTypes(roomTypesData.slice(0, 6)); // Lấy 6 phòng đầu tiên
      } else {
        console.error('Dữ liệu roomTypes không phải dạng mảng:', roomTypesData);
      }
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Không thể tải dữ liệu từ server.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý thay đổi form tìm kiếm
  const handleSearchFormChange = (field: string, value: string | number) => {
    setSearchForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!searchForm.checkInDate || !searchForm.checkOutDate) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    const checkIn = new Date(searchForm.checkInDate);
    const checkOut = new Date(searchForm.checkOutDate);
    
    if (checkOut <= checkIn) {
      alert('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    // Lưu thông tin tìm kiếm vào localStorage
    const searchData = {
      checkInDate: searchForm.checkInDate,
      checkOutDate: searchForm.checkOutDate,
      guests: searchForm.guests,
      searchTimestamp: new Date().toISOString(),
    };
    localStorage.setItem('roomSearchData', JSON.stringify(searchData));

    // Chuyển đến trang rooms với tham số tìm kiếm
    const searchParams = new URLSearchParams({
      checkIn: searchForm.checkInDate,
      checkOut: searchForm.checkOutDate,
      guests: searchForm.guests.toString(),
    });
    
    router.push(`/users/rooms?${searchParams.toString()}`);
  };

  // Hàm lấy đường dẫn hình ảnh hợp lệ
  const getValidImageSrc = (imagePath?: string): string => {
    if (!imagePath) return '/images/room-placeholder.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return '/images/room-placeholder.jpg';
  };

  if (!isReady) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('home.title')}</h1>
          <p>{t('home.description')}</p>
          
          {/* Search Form */}
          <SearchBar variant="hero" showRoomCount={true} />
          
          <div className={styles.heroActions}>
            <Link href="/users/rooms" className={styles.heroButton}>
              {t('home.viewRooms')}
            </Link>
          </div>
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

      {/* Special Offers - Hiển thị từ API */}
      <section className={styles.specialOffers}>
        <div className={styles.sectionHeader}>
          <h2>{t('home.specialOffers')}</h2>
          <p>{t('home.specialOffersDesc')}</p>
          <Link href="/users/promotions" className={styles.viewAll}>
            {t('home.viewAllOffers')}
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu khuyến mãi...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchData} className={styles.retryButton}>Thử lại</button>
          </div>
        ) : (
          <div className={styles.offerGrid}>
            {promotions.length > 0 ? (
              promotions.map((promotion, index) => (
                <div key={promotion.maMK || index} className={styles.offerCard}>
                  <div className={styles.offerImage}>
                    <Image src={getValidImageSrc(promotion.thumbnail)} alt={promotion.tenKhuyenMai || 'Khuyến mãi'} fill style={{ objectFit: 'cover' }} />
                    <div className={styles.offerType}>{promotion.phanTramGiam || 0}% Giảm</div>
                  </div>
                  <div className={styles.offerContent}>
                    <h3>{promotion.tenKhuyenMai || 'Khuyến mãi đặc biệt'}</h3>
                    <p>
                      {promotion.moTa.length > 100 
                        ? promotion.moTa.substring(0, 100) + '...' 
                        : promotion.moTa}
                    </p>
                    <div className={styles.offerRating}>
                      <FaStar className={styles.starActive} />
                      <FaStar className={styles.starActive} />
                      <FaStar className={styles.starActive} />
                      <FaStar className={styles.starActive} />
                      <FaStar className={styles.starActive} />
                    </div>
                    <div className={styles.offerFooter}>
                      <div className={styles.offerCode}>{promotion.maGiamGia || 'N/A'}</div>
                      <Link href={`/users/promotions?id=${promotion.maMK || ''}`} className={styles.viewOfferBtn}>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noOffers}>
                <p>Hiện không có khuyến mãi nào.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Map Section */}
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