'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaUser, FaSpa, FaUtensils, FaSwimmer, FaDumbbell, FaCar, FaWifi, 
         FaCoffee, FaShoppingBag, FaClock, FaMapMarkerAlt, FaStar, 
         FaArrowLeft, FaCheck, FaInfoCircle } from 'react-icons/fa';
import styles from './styles.module.css';
import { useLanguage } from '../../components/profile/LanguageContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { API_BASE_URL } from '@/lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getServices } from '../../../lib/api';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';
import { withErrorBoundary, NetworkError } from '@/app/components/ui/ErrorBoundary';
import { SafeImage } from '@/config/supabase';

interface Service {
  maDichVu: string;
  tenDichVu: string;
  moTa: string;
  donGia: number;
  thumbnail: string;
  loaiDichVu?: string;
}

// Định nghĩa các danh mục dịch vụ
const SERVICE_CATEGORIES = {
  SPA: 'Spa & Làm đẹp',
  FOOD: 'Ẩm thực',
  POOL: 'Hồ bơi & Thể thao',
  TRANSPORT: 'Đưa đón & Di chuyển',
  ENTERTAINMENT: 'Giải trí',
  OTHER: 'Dịch vụ khác'
};

function ServicesPage() {
  const { selectedLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [categorizedServices, setCategorizedServices] = useState<{[key: string]: Service[]}>({});
  const [retryCount, setRetryCount] = useState(0);

  // Phân loại dịch vụ dựa trên tên
  const categorizeService = useCallback((service: Service): Service => {
    const name = (service.tenDichVu || '').toLowerCase();
    let category = 'OTHER';
    
    if (name.includes('spa') || name.includes('massage') || name.includes('làm đẹp') || name.includes('beauty')) {
      category = 'SPA';
    } else if (name.includes('ăn') || name.includes('food') || name.includes('nhà hàng') || name.includes('restaurant') || name.includes('buffet')) {
      category = 'FOOD';
    } else if (name.includes('bơi') || name.includes('swim') || name.includes('gym') || name.includes('thể thao') || name.includes('sport')) {
      category = 'POOL';
    } else if (name.includes('đưa đón') || name.includes('transport') || name.includes('xe') || name.includes('car')) {
      category = 'TRANSPORT';
    } else if (name.includes('giải trí') || name.includes('entertainment') || name.includes('game') || name.includes('tour')) {
      category = 'ENTERTAINMENT';
    }
    
    return {
      ...service,
      loaiDichVu: category
    };
  }, []);

  // Tạo object chứa dịch vụ theo danh mục
  const categorizeServices = useCallback((servicesList: Service[]) => {
    const categorized: {[key: string]: Service[]} = {
      ALL: servicesList
    };
    
    Object.keys(SERVICE_CATEGORIES).forEach(category => {
      categorized[category] = servicesList.filter(
        (service: Service) => service.loaiDichVu === category
      );
    });
    
    return categorized;
  }, []);

  // Fetch dịch vụ từ API
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServices();
      
      if (!Array.isArray(data)) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      
      // Phân loại dịch vụ vào các danh mục
      const servicesWithCategories = data.map(categorizeService);
      
      setServices(servicesWithCategories);
      setCategorizedServices(categorizeServices(servicesWithCategories));
      setError(null);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err?.message || 'Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [categorizeService, categorizeServices]);

  // Xử lý retry khi lỗi
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    setIsClient(true);
    
    // Đảm bảo i18n được cập nhật khi ngôn ngữ thay đổi
    if (selectedLanguage) {
      i18n.changeLanguage(selectedLanguage);
    }
    
    fetchServices();
  }, [selectedLanguage, fetchServices]);

  const handleServiceClick = useCallback((service: Service) => {
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackClick = useCallback(() => {
    setSelectedService(null);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  const getServiceIcon = useCallback((serviceName: string) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('spa') || name.includes('massage') || name.includes('làm đẹp')) return <FaSpa />;
    if (name.includes('ăn') || name.includes('food') || name.includes('nhà hàng') || name.includes('restaurant')) return <FaUtensils />;
    if (name.includes('bơi') || name.includes('swim')) return <FaSwimmer />;
    if (name.includes('gym') || name.includes('thể dục') || name.includes('fitness')) return <FaDumbbell />;
    if (name.includes('đưa đón') || name.includes('transport') || name.includes('xe')) return <FaCar />;
    if (name.includes('wifi') || name.includes('internet')) return <FaWifi />;
    if (name.includes('cà phê') || name.includes('coffee')) return <FaCoffee />;
    if (name.includes('mua sắm') || name.includes('shopping')) return <FaShoppingBag />;
    return <FaInfoCircle />;
  }, []);

  const getCategoryIcon = useCallback((category: string) => {
    switch(category) {
      case 'SPA': return <FaSpa />;
      case 'FOOD': return <FaUtensils />;
      case 'POOL': return <FaSwimmer />;
      case 'TRANSPORT': return <FaCar />;
      case 'ENTERTAINMENT': return <FaShoppingBag />;
      case 'OTHER': return <FaInfoCircle />;
      default: return null;
    }
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return formatCurrencyUtil(amount);
  }, []);

  const getValidImageSrc = useCallback((src: string) => {
    if (!src) return '/images/service-placeholder.jpg';
    if (src.startsWith('http')) return src;
    return `${API_BASE_URL}/${src.replace(/^\//, '')}`;
  }, []);

  // Tránh lỗi hydration
  if (!isClient) {
    return null;
  }

  // Hiển thị lỗi kết nối
  if (error && error.includes('kết nối')) {
    return <NetworkError onRetry={handleRetry} />;
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>{t('explore.services', 'Dịch vụ đẳng cấp')}</h1>
          <p>{t('explore.exploreServices', 'Khám phá các dịch vụ cao cấp tại khách sạn của chúng tôi')}</p>
        </div>
      </section>

      <div className={styles.mainContent}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dịch vụ...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <h3>Đã xảy ra lỗi</h3>
            <p>{error}</p>
            <button 
              className={styles.reloadButton}
              onClick={handleRetry}
            >
              Tải lại trang
            </button>
          </div>
        ) : selectedService ? (
          <div className={styles.serviceDetail}>
            <button 
              className={styles.backButton}
              onClick={handleBackClick}
              aria-label="Quay lại danh sách dịch vụ"
            >
              <FaArrowLeft style={{ marginRight: '8px' }} /> Quay lại danh sách dịch vụ
            </button>
            
            <div className={styles.serviceDetailHeader}>
              <div className={styles.serviceDetailImage}>
                <SafeImage 
                  src={getValidImageSrc(selectedService.thumbnail)} 
                  alt={selectedService.tenDichVu || 'Chi tiết dịch vụ'}
                  fill
                  className={styles.detailImage}
                  fallbackSrc="/images/service-placeholder.jpg"
                />
              </div>
              
              <div className={styles.serviceDetailInfo}>
                <div className={styles.serviceCategoryBadge}>
                  {getCategoryIcon(selectedService.loaiDichVu || 'OTHER')}
                  <span>{SERVICE_CATEGORIES[selectedService.loaiDichVu as keyof typeof SERVICE_CATEGORIES] || 'Dịch vụ khác'}</span>
                </div>
                <h2>{selectedService.tenDichVu || 'Dịch vụ không xác định'}</h2>
                <div className={styles.servicePrice}>
                  {formatCurrency(selectedService.donGia)}
                </div>
                <div className={styles.serviceDescription}>
                  {selectedService.moTa || 'Không có mô tả chi tiết cho dịch vụ này.'}
                </div>
                <button 
                  className={styles.bookServiceButton}
                  aria-label="Đặt dịch vụ ngay"
                >
                  Đặt dịch vụ ngay
                </button>
              </div>
            </div>
            
            <div className={styles.serviceDetailContent}>
              <h3>Tính năng nổi bật</h3>
              <div className={styles.serviceFeatures}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FaClock />
                  </div>
                  <div className={styles.featureText}>
                    <h4>Thời gian linh hoạt</h4>
                    <p>Dịch vụ được cung cấp 24/7 theo yêu cầu của khách hàng</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FaMapMarkerAlt />
                  </div>
                  <div className={styles.featureText}>
                    <h4>Vị trí thuận tiện</h4>
                    <p>Dịch vụ được cung cấp tại khách sạn hoặc địa điểm bạn chọn</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FaUser />
                  </div>
                  <div className={styles.featureText}>
                    <h4>Nhân viên chuyên nghiệp</h4>
                    <p>Đội ngũ nhân viên được đào tạo bài bản và giàu kinh nghiệm</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.servicePolicy}>
                <h3>Chính sách dịch vụ</h3>
                <ul>
                  <li>Đặt trước ít nhất 2 giờ để đảm bảo dịch vụ tốt nhất</li>
                  <li>Miễn phí hủy trước 24 giờ, sau đó phí hủy là 30%</li>
                  <li>Giá đã bao gồm thuế và phí dịch vụ</li>
                  <li>Thanh toán có thể thực hiện bằng tiền mặt hoặc thẻ tín dụng</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.sectionHeader}>
              <h2>{t('explore.ourServices', 'Dịch vụ của chúng tôi')}</h2>
              <p>{t('explore.servicesDescription', 'Khám phá các dịch vụ cao cấp tại khách sạn')}</p>
            </div>
            
            <div className={styles.categoryTabs}>
              <button 
                className={`${styles.categoryTab} ${activeCategory === 'ALL' ? styles.activeTab : ''}`}
                onClick={() => handleCategoryChange('ALL')}
                aria-label="Hiển thị tất cả dịch vụ"
                aria-pressed={activeCategory === 'ALL'}
              >
                Tất cả
              </button>
              {Object.entries(SERVICE_CATEGORIES).map(([key, value]) => (
                categorizedServices[key] && categorizedServices[key].length > 0 && (
                  <button 
                    key={key}
                    className={`${styles.categoryTab} ${activeCategory === key ? styles.activeTab : ''}`}
                    onClick={() => handleCategoryChange(key)}
                    aria-label={`Hiển thị dịch vụ ${value}`}
                    aria-pressed={activeCategory === key}
                  >
                    {getCategoryIcon(key)}
                    <span>{value}</span>
                  </button>
                )
              ))}
            </div>
            
            {(categorizedServices[activeCategory]?.length || 0) === 0 ? (
              <div className={styles.noServices}>
                <p>Hiện tại không có dịch vụ nào trong danh mục này. Vui lòng quay lại sau.</p>
              </div>
            ) : (
              <div className={styles.servicesGrid}>
                {categorizedServices[activeCategory]?.map((service, index) => (
                  <div 
                    key={service.maDichVu || `service-${index}`} 
                    className={styles.serviceCard}
                    onClick={() => handleServiceClick(service)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem chi tiết dịch vụ ${service.tenDichVu || 'Dịch vụ'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleServiceClick(service);
                      }
                    }}
                  >
                    <div className={styles.serviceImageContainer}>
                      <SafeImage 
                        src={getValidImageSrc(service.thumbnail)} 
                        alt={service.tenDichVu || 'Dịch vụ'}
                        width={400}
                        height={250}
                        className={styles.serviceImage}
                        fallbackSrc="/images/service-placeholder.jpg"
                      />
                      <div className={styles.serviceIcon}>
                        {getServiceIcon(service.tenDichVu || '')}
                      </div>
                      <div className={styles.serviceCategoryTag}>
                        {SERVICE_CATEGORIES[service.loaiDichVu as keyof typeof SERVICE_CATEGORIES] || 'Dịch vụ khác'}
                      </div>
                    </div>
                    <div className={styles.serviceContent}>
                      <h3>{service.tenDichVu || 'Dịch vụ không xác định'}</h3>
                      <div className={styles.serviceRating}>
                        <FaStar className={styles.starIcon} />
                        <FaStar className={styles.starIcon} />
                        <FaStar className={styles.starIcon} />
                        <FaStar className={styles.starIcon} />
                        <FaStar className={styles.starIcon} />
                      </div>
                      <div className={styles.serviceShortDesc}>
                        {service.moTa 
                          ? service.moTa.length > 100 
                            ? `${service.moTa.substring(0, 100)}...` 
                            : service.moTa
                          : 'Không có mô tả cho dịch vụ này.'}
                      </div>
                      <div className={styles.serviceFooter}>
                        <div className={styles.servicePrice}>
                          {formatCurrency(service.donGia)}
                        </div>
                        <button 
                          className={styles.viewDetailsBtn}
                          aria-label={`Xem chi tiết dịch vụ ${service.tenDichVu || 'Dịch vụ'}`}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

// Bọc component bằng ErrorBoundary để xử lý lỗi
export default withErrorBoundary(ServicesPage); 
