'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUser, FaSpa, FaUtensils, FaSwimmer, FaDumbbell, FaCar, FaWifi, FaCoffee, FaShoppingBag, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../components/profile/LanguageContext';
import i18n from '../../i18n';
import { API_BASE_URL } from '../../../lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

interface Service {
  maDichVu: string;
  tenDichVu: string;
  moTa: string;
  donGia: number;
  hinhAnh: string;
  trangThai: string;
}

export default function ServicesPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    guests: 1,
    notes: '',
  });

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    fetchServices();
  }, [selectedLanguage]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/DichVu/Lấy danh sách tất cả dịch vụ`);
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', err);
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      // Thực hiện API call để đặt dịch vụ
      const response = await fetch(`${API_BASE_URL}/SuDungDichVu/Tạo đặt dịch vụ mới`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maDichVu: selectedService.maDichVu,
          ngaySuDung: bookingDetails.date,
          gioSuDung: bookingDetails.time,
          soLuong: bookingDetails.guests,
          ghiChu: bookingDetails.notes,
          // Thêm thông tin người dùng từ localStorage hoặc context
          maKhachHang: localStorage.getItem('userId') || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể đặt dịch vụ');
      }

      // Đặt dịch vụ thành công
      setShowModal(false);
      alert('Đặt dịch vụ thành công!');
      
      // Reset form
      setBookingDetails({
        date: '',
        time: '',
        guests: 1,
        notes: '',
      });
    } catch (err) {
      console.error('Lỗi khi đặt dịch vụ:', err);
      alert('Đã xảy ra lỗi khi đặt dịch vụ. Vui lòng thử lại.');
    }
  };

  // Hàm lấy icon phù hợp với loại dịch vụ
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('spa') || name.includes('massage')) return <FaSpa />;
    if (name.includes('ăn') || name.includes('nhà hàng') || name.includes('restaurant')) return <FaUtensils />;
    if (name.includes('bơi') || name.includes('hồ bơi') || name.includes('swim')) return <FaSwimmer />;
    if (name.includes('gym') || name.includes('thể dục') || name.includes('fitness')) return <FaDumbbell />;
    if (name.includes('đưa đón') || name.includes('xe') || name.includes('transport')) return <FaCar />;
    if (name.includes('wifi') || name.includes('internet')) return <FaWifi />;
    if (name.includes('cà phê') || name.includes('coffee')) return <FaCoffee />;
    return <FaShoppingBag />;
  };

  // Hàm lấy đường dẫn hình ảnh hợp lệ
  const getValidImageSrc = (imagePath: string | undefined): string => {
    if (!imagePath) return '/images/service-placeholder.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return '/images/service-placeholder.jpg';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách dịch vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.reloadButton}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>Dịch vụ đẳng cấp</h1>
          <p>Trải nghiệm những dịch vụ cao cấp tại khách sạn của chúng tôi</p>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {selectedService ? (
          <div className={styles.serviceDetail}>
            <button 
              onClick={() => setSelectedService(null)} 
              className={styles.backButton}
            >
              &larr; Quay lại danh sách dịch vụ
            </button>
            
            <div className={styles.serviceDetailHeader}>
              <div className={styles.serviceDetailImage}>
                <Image 
                  src={getValidImageSrc(selectedService.hinhAnh)} 
                  alt={selectedService.tenDichVu}
                  width={600}
                  height={400}
                  className={styles.detailImage}
                />
              </div>
              <div className={styles.serviceDetailInfo}>
                <h2>{selectedService.tenDichVu}</h2>
                <div className={styles.servicePrice}>
                  {selectedService.donGia.toLocaleString()}đ
                </div>
                <p className={styles.serviceDescription}>{selectedService.moTa}</p>
                <button 
                  onClick={() => setShowModal(true)} 
                  className={styles.bookServiceButton}
                >
                  Đặt dịch vụ
                </button>
              </div>
            </div>
            
            <div className={styles.serviceDetailContent}>
              <h3>Thông tin chi tiết</h3>
              <div className={styles.serviceFeatures}>
                <div className={styles.featureItem}>
                  <FaUser className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <h4>Dành cho</h4>
                    <p>Tất cả khách hàng</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <FaClock className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <h4>Thời gian</h4>
                    <p>8:00 - 22:00 hàng ngày</p>
                  </div>
                </div>
                <div className={styles.featureItem}>
                  <FaMapMarkerAlt className={styles.featureIcon} />
                  <div className={styles.featureText}>
                    <h4>Địa điểm</h4>
                    <p>Tại khách sạn</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.servicePolicy}>
                <h3>Chính sách dịch vụ</h3>
                <ul>
                  <li>Đặt trước ít nhất 2 giờ</li>
                  <li>Có thể hủy miễn phí trước 1 giờ</li>
                  <li>Thanh toán khi sử dụng dịch vụ</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.sectionHeader}>
              <h2>Dịch vụ của chúng tôi</h2>
              <p>Khám phá các dịch vụ cao cấp tại khách sạn</p>
            </div>
            
            <div className={styles.servicesGrid}>
              {services.length > 0 ? (
                services.map((service) => (
                  <div 
                    key={service.maDichVu} 
                    className={styles.serviceCard}
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className={styles.serviceImageContainer}>
                      <Image
                        src={getValidImageSrc(service.hinhAnh)}
                        alt={service.tenDichVu}
                        width={400}
                        height={300}
                        className={styles.serviceImage}
                      />
                      <div className={styles.serviceIcon}>
                        {getServiceIcon(service.tenDichVu)}
                      </div>
                    </div>
                    <div className={styles.serviceContent}>
                      <h3>{service.tenDichVu}</h3>
                      <p className={styles.serviceShortDesc}>
                        {service.moTa.length > 100 
                          ? service.moTa.substring(0, 100) + '...' 
                          : service.moTa}
                      </p>
                      <div className={styles.serviceFooter}>
                        <span className={styles.servicePrice}>
                          {service.donGia.toLocaleString()}đ
                        </span>
                        <button className={styles.viewDetailBtn}>
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noServices}>
                  <p>Không có dịch vụ nào được tìm thấy.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modal đặt dịch vụ */}
      {showModal && selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button 
              onClick={() => setShowModal(false)} 
              className={styles.closeModalBtn}
            >
              &times;
            </button>
            <h2>Đặt dịch vụ: {selectedService.tenDichVu}</h2>
            
            <form onSubmit={handleBookingSubmit} className={styles.bookingForm}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Ngày sử dụng:</label>
                <input
                  type="date"
                  id="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="time">Giờ sử dụng:</label>
                <input
                  type="time"
                  id="time"
                  required
                  value={bookingDetails.time}
                  onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="guests">Số người:</label>
                <input
                  type="number"
                  id="guests"
                  min="1"
                  max="10"
                  required
                  value={bookingDetails.guests}
                  onChange={(e) => setBookingDetails({...bookingDetails, guests: parseInt(e.target.value)})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="notes">Ghi chú:</label>
                <textarea
                  id="notes"
                  rows={4}
                  value={bookingDetails.notes}
                  onChange={(e) => setBookingDetails({...bookingDetails, notes: e.target.value})}
                ></textarea>
              </div>
              
              <div className={styles.bookingSummary}>
                <h3>Tóm tắt đặt dịch vụ</h3>
                <div className={styles.summaryItem}>
                  <span>Dịch vụ:</span>
                  <span>{selectedService.tenDichVu}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Giá:</span>
                  <span>{selectedService.donGia.toLocaleString()}đ</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Tổng cộng:</span>
                  <span>{(selectedService.donGia * bookingDetails.guests).toLocaleString()}đ</span>
                </div>
              </div>
              
              <button type="submit" className={styles.submitBookingBtn}>
                Xác nhận đặt dịch vụ
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
} 