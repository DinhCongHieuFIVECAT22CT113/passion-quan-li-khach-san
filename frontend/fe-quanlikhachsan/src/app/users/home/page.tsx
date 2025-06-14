'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../components/profile/LanguageContext';
import i18n from '../../i18n';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import EnhancedSearchBar from '../../components/search/EnhancedSearchBar';
import TestimonialsSection from '../../components/testimonials/TestimonialsSection';
import { SkeletonPromotionGrid } from '../../components/ui/SkeletonLoader';
import { getPromotions } from '../../../lib/api';


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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');




  useEffect(() => {
    i18n.changeLanguage(selectedLanguage).then(() => {
      setIsReady(true);
    });
    
    // Lấy dữ liệu từ API
    fetchData();


  }, [selectedLanguage]);

  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách khuyến mãi
      const promotionsData = await getPromotions();
      
      console.log('Dữ liệu promotions:', promotionsData);
      
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
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Không thể tải dữ liệu từ server.');
    } finally {
      setLoading(false);
    }
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
          
          {/* Enhanced Search Form */}
          <div className={styles.searchContainer}>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <i className={`fas fa-map-marker-alt ${styles.searchIcon}`}></i>
                <select defaultValue="Chọn tỉnh thành">
                  <option value="Chọn tỉnh thành">Chọn tỉnh thành</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Nha Trang">Nha Trang</option>
                  <option value="Phú Quốc">Phú Quốc</option>
                </select>
              </div>
              
              <div className={styles.searchField}>
                <i className={`far fa-calendar-alt ${styles.searchIcon}`}></i>
                <span className={styles.dateLabel}>Nhận phòng</span>
                <input 
                  type="date" 
                  defaultValue="2025-11-06" 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className={styles.searchField}>
                <i className={`far fa-calendar-alt ${styles.searchIcon}`}></i>
                <span className={styles.dateLabel}>Trả phòng</span>
                <input 
                  type="date" 
                  defaultValue="2025-11-07" 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className={styles.searchField}>
                <i className={`fas fa-user-friends ${styles.searchIcon}`}></i>
                <select defaultValue="2 khách">
                  <option value="1 khách">1 khách</option>
                  <option value="2 khách">2 khách</option>
                  <option value="3 khách">3 khách</option>
                  <option value="4 khách">4 khách</option>
                  <option value="5+ khách">5+ khách</option>
                </select>
              </div>
            </div>
            
            <Link href="/users/rooms" className={styles.searchButton}>
              <i className="fas fa-search"></i>
              Tìm kiếm
            </Link>
            
            <div className={styles.roomsContainer}>
              {/* Room list content will be here */}
            </div>
            
            <div className={styles.navigationControls}>
              <button 
                className={`${styles.navButton}`} 
                onClick={() => document.querySelector('.roomsContainer')?.scrollBy({left: -300, behavior: 'smooth'})}
                aria-label="Previous rooms"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <button 
                className={`${styles.navButton}`} 
                onClick={() => document.querySelector('.roomsContainer')?.scrollBy({left: 300, behavior: 'smooth'})}
                aria-label="Next rooms"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          
          <div className={styles.heroActions}>
            {/* Xóa dòng Link bên dưới */}
            {/* <Link href="/users/rooms" className={styles.heroButton}>
              {t('home.viewRooms')}
            </Link> */}
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
          <SkeletonPromotionGrid />
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



      {/* Testimonials Section */}
      <TestimonialsSection limit={6} showNavigation={true} autoPlay={true} />

      {/* Footer */}
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
      <Footer />
    </div>
  );
}
  
