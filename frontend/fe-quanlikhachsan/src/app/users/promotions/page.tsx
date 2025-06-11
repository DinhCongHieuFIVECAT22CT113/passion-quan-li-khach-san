'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaTag, FaPercent, FaClock, FaCalendarAlt, FaInfoCircle, FaCheck, FaCopy, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from './styles.module.css';
import { useLanguage } from '../../components/profile/LanguageContext';
import i18n from '../../i18n';
import { API_BASE_URL } from '@/lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

interface Promotion {
  maMK: string;
  tenKhuyenMai: string;
  moTa: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  phanTramGiam: number;
  dieuKien: string;
  maGiamGia: string;
  thumbnail: string;
  trangThai: string;
}

export default function PromotionsPage() {
  const { selectedLanguage } = useLanguage();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    fetchPromotions();

  }, [selectedLanguage]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/KhuyenMai`);
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      const data = await response.json();
      setPromotions(data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
      setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);

    // Sau 3 giây, đặt lại trạng thái đã sao chép
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      // Kiểm tra nếu ngày không hợp lệ
      if (isNaN(date.getTime())) {
        console.error('Ngày không hợp lệ:', dateString);
        return '';
      }
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Lỗi định dạng ngày tháng:', error, dateString);
      return '';
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    try {
      if (!promotion.ngayBatDau || !promotion.ngayKetThuc) return false;

      const now = new Date();
      const startDate = new Date(promotion.ngayBatDau);
      const endDate = new Date(promotion.ngayKetThuc);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Ngày không hợp lệ trong khuyến mãi:', promotion);
        return false;
      }

      return now >= startDate && now <= endDate;
    } catch (error) {
      console.error('Lỗi kiểm tra khuyến mãi còn hiệu lực:', error);
      return false;
    }
  };

  const getValidImageSrc = (imagePath: string | undefined): string => {
    if (!imagePath) return '/images/promotion-placeholder.jpg';

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return imagePath;
    }

    return '/images/promotion-placeholder.jpg';
  };

  // Lọc khuyến mãi theo trạng thái - Adjusted
  const filteredPromotions = promotions.filter(promotion => {
    if (filter === 'active') {
      return isPromotionActive(promotion);
    }
    else {
      return true; // 'all'
    }
  });

  // Hàm kiểm tra chuỗi an toàn trước khi dùng các phương thức length, substring
  const safeString = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return String(value);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách khuyến mãi...</p>
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
          <h1>Ưu đãi đặc biệt</h1>
          <p>Khám phá các chương trình khuyến mãi hấp dẫn từ khách sạn chúng tôi</p>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {selectedPromotion ? (
          <div className={styles.promotionDetail}>
            <button
              onClick={() => setSelectedPromotion(null)}
              className={styles.backButton}
            >
              <FaArrowLeft /> Quay lại danh sách khuyến mãi
            </button>

            <div className={styles.promotionDetailHeader}>
              <div className={styles.promotionDetailImage}>
                <Image
                  src={getValidImageSrc(selectedPromotion.thumbnail)}
                  alt={selectedPromotion.tenKhuyenMai}
                  width={600}
                  height={400}
                  className={styles.detailImage}
                />
                <div className={styles.promotionBadge}>
                  <FaPercent className={styles.percentIcon} />
                  <span>{selectedPromotion.phanTramGiam}%</span>
                </div>
              </div>
              <div className={styles.promotionDetailInfo}>
                <h2>{selectedPromotion.tenKhuyenMai || 'Khuyến mãi đặc biệt'}</h2>

                <div className={styles.promotionMeta}>
                  <div className={styles.metaItem}>
                    <FaCalendarAlt className={styles.metaIcon} />
                    <span>Hiệu lực: {formatDate(selectedPromotion.ngayBatDau)} - {formatDate(selectedPromotion.ngayKetThuc)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaTag className={styles.metaIcon} />
                    <span>Giảm: {selectedPromotion.phanTramGiam || 0}%</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FaInfoCircle className={styles.metaIcon} />
                    <span>Trạng thái: {isPromotionActive(selectedPromotion) ? 'Đang áp dụng' : 'Hết hạn'}</span>
                  </div>
                </div>

                <p className={styles.promotionDescription}>{safeString(selectedPromotion.moTa)}</p>

                <div className={styles.promotionCode}>
                  <div className={styles.codeBox}>
                    <span>{selectedPromotion.maGiamGia || 'N/A'}</span>
                    <button
                      onClick={() => copyToClipboard(selectedPromotion.maGiamGia || '')}
                      className={styles.copyButton}
                      disabled={copiedCode === selectedPromotion.maGiamGia}
                    >
                      {copiedCode === selectedPromotion.maGiamGia ? (
                        <><FaCheck /> Đã sao chép</>
                      ) : (
                        <><FaCopy /> Sao chép mã</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.promotionDetailContent}>
              <div className={styles.promotionTerms}>
                <h3>Điều kiện áp dụng</h3>
                <div className={styles.termsContent}>
                  <p>{selectedPromotion.dieuKien || 'Áp dụng cho tất cả các đặt phòng trong thời gian khuyến mãi.'}</p>
                  <ul>
                    <li key="online-booking">Chỉ áp dụng cho đặt phòng trực tuyến</li>
                    <li key="no-combine">Không áp dụng đồng thời với các khuyến mãi khác</li>
                    <li key="time-change">Thời gian áp dụng có thể thay đổi mà không báo trước</li>
                    <li key="one-per-customer">Mỗi khách hàng chỉ được sử dụng một lần</li>
                  </ul>
                </div>
              </div>

              <div className={styles.howToUse}>
                <h3>Cách sử dụng mã giảm giá</h3>
                <ol>
                  <li key="step-1">Chọn phòng và dịch vụ bạn muốn đặt</li>
                  <li key="step-2">Nhập mã giảm giá tại trang thanh toán</li>
                  <li key="step-3">Giá tiền sẽ được giảm tự động theo phần trăm khuyến mãi</li>
                  <li key="step-4">Hoàn tất quá trình đặt phòng</li>
                </ol>
              </div>

              <div className={styles.callToAction}>
                <Link href="/users/rooms" className={styles.bookNowButton}>
                  Đặt phòng ngay <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.sectionHeader}>
              <h2>Khuyến mãi đặc biệt</h2>
              <p>Tiết kiệm hơn với các ưu đãi độc quyền</p>
            </div>

            <div className={styles.filterTabs}>
              <button
                className={filter === 'all' ? styles.activeTab : ''}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={filter === 'active' ? styles.activeTab : ''}
                onClick={() => setFilter('active')}
              >
                Đang áp dụng
              </button>
            </div>

            <div className={styles.promotionsGrid}>
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promotion, index) => (
                  <div
                    key={promotion.maMK || index}
                    className={styles.promotionCard}
                    onClick={() => handlePromotionClick(promotion)}
                  >
                    <div className={styles.promotionImageContainer}>
                      <Image
                        src={getValidImageSrc(promotion.thumbnail)}
                        alt={promotion.tenKhuyenMai || 'Khuyến mãi'}
                        width={400}
                        height={250}
                        className={styles.promotionImage}
                      />
                      <div className={styles.promotionDiscount}>
                        <span>{promotion.phanTramGiam || 0}%</span>
                      </div>
                      <div className={`${styles.promotionStatus} ${isPromotionActive(promotion) ? styles.active : styles.expired}`}>
                        {isPromotionActive(promotion) ? 'Đang áp dụng' : 'Hết hạn'}
                      </div>
                    </div>
                    <div className={styles.promotionContent}>
                      <h3>{promotion.tenKhuyenMai || 'Khuyến mãi đặc biệt'}</h3>
                      <div className={styles.promotionPeriod}>
                        <FaCalendarAlt className={styles.periodIcon} />
                        <span>
                          <strong>Từ:</strong> {formatDate(promotion.ngayBatDau)}
                          <strong> đến:</strong> {formatDate(promotion.ngayKetThuc)}
                        </span>
                      </div>
                      <p className={styles.promotionShortDesc}>
                        {safeString(promotion.moTa).length > 100
                          ? safeString(promotion.moTa).substring(0, 100) + '...'
                          : safeString(promotion.moTa)}
                      </p>
                      <div className={styles.promotionCardFooter}>
                        <div className={styles.promotionCode}>
                          <span>{promotion.maGiamGia || 'N/A'}</span>
                        </div>
                        <button className={styles.viewDetailBtn}>
                          Xem chi tiết <FaArrowRight style={{ marginLeft: '8px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noPromotions}>
                  <Image
                    src="/images/no-results.png"
                    alt="Không có khuyến mãi"
                    width={200}
                    height={200}
                  />
                  <h3>Không tìm thấy khuyến mãi</h3>
                  <p>
                    {filter === 'active'
                      ? 'Hiện không có khuyến mãi nào đang áp dụng.'
                      : 'Hiện không có khuyến mãi nào.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}