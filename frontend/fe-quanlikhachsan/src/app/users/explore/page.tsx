'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaPlay } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getRoomTypes, getServices } from '../../../lib/api';

// Định nghĩa interface cho RoomType
interface RoomType {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa?: string;
  donGia?: number;
  soNguoi?: number;
  dienTich?: number;
  hinhAnh?: string;
  trangThai?: string;
}

// Định nghĩa interface cho Service
interface Service {
  maDichVu: string;
  tenDichVu: string;
  moTa: string;
  donGia: number;
  hinhAnh?: string;
  trangThai?: string;
}

export default function ExplorePage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  
  // Thêm state cho dữ liệu từ API với kiểu dữ liệu đã định nghĩa
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
    
    // Gọi API để lấy dữ liệu
    fetchData();
  }, [selectedLanguage]);
  
  // Hàm lấy dữ liệu từ API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách loại phòng
      const roomTypesData = await getRoomTypes();
      setRoomTypes(roomTypesData.slice(0, 3)); // Chỉ lấy 3 phòng đầu tiên
      
      // Lấy danh sách dịch vụ
      const servicesData = await getServices();
      setServices(servicesData.slice(0, 3)); // Chỉ lấy 3 dịch vụ đầu tiên
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu:', err);
      setError('Không thể tải dữ liệu từ server.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy đường dẫn hình ảnh hợp lệ
  const getValidImageSrc = (imagePath?: string): string => {
    if (!imagePath) return '/images/reviews/room.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return '/images/reviews/room.jpg';
  };

  if (!isClient) {
    return null;
  }

  // Tạo mảng features từ dữ liệu API hoặc sử dụng dữ liệu mặc định nếu API không có dữ liệu
  const features = loading || error || roomTypes.length === 0 ? [
    {
      id: 1,
      title: t('explore.luxuriousRoom'),
      description: t('explore.luxuriousRoomDesc'),
      image: '/images/reviews/room.jpg',
    },
    {
      id: 2,
      title: t('explore.gym'),
      description: t('explore.gymDesc'),
      image: '/images/reviews/gym.jpg',
    },
    {
      id: 3,
      title: t('explore.restaurant'),
      description: t('explore.restaurantDesc'),
      image: '/images/reviews/restaurant.jpg',
    },
  ] : roomTypes.map((roomType) => ({
    id: roomType.maLoaiPhong,
    title: roomType.tenLoaiPhong,
    description: roomType.moTa || t('explore.luxuriousRoomDesc'),
    image: getValidImageSrc(roomType.hinhAnh),
  }));

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('explore.title')}</h1>
          <p>{t('explore.description')}</p>
          <button className={styles.playButton}>
            <FaPlay />
            <span>{t('explore.playButton')}</span>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>{t('explore.features')}</h2>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchData} className={styles.retryButton}>Thử lại</button>
          </div>
        ) : (
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div key={feature.id} className={styles.featureCard}>
                <div className={styles.featureImage}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.featureContent}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <Link href="/users/rooms" className={styles.learnMore}>
                    {t('explore.learnMore')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Services Section */}
      <section className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>{t('explore.services')}</h2>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu dịch vụ...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.maDichVu} className={styles.serviceCard}>
                <div className={styles.serviceImage}>
                  <Image
                    src={getValidImageSrc(service.hinhAnh)}
                    alt={service.tenDichVu}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.serviceContent}>
                  <h3>{service.tenDichVu}</h3>
                  <p>{service.moTa?.length > 100 ? service.moTa.substring(0, 100) + '...' : service.moTa}</p>
                  <div className={styles.servicePrice}>{service.donGia?.toLocaleString()}đ</div>
                  <Link href="/users/services" className={styles.exploreButton}>
                    {t('explore.exploreServices')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}