'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser, FaBed, FaWifi, FaTv, FaSnowflake, FaCalendarAlt, FaStar, FaArrowLeft, FaArrowRight, FaExpand, FaUsers, FaEye, FaShower, FaCoffee, FaParking, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../../lib/config';

interface Amenity {
  icon: React.ReactNode;
  name: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

interface RoomType {
  maLoaiPhong: string;
  tenLoaiPhong: string;
  moTa: string;
  donGia: number;
  dienTich: number;
  soNguoi: number;
  soGiuong: number;
  hinhAnh: string;
  trangThai: string;
  tienNghi?: string[];
  galleryImages?: string[];
  reviews?: Review[];
}

export default function RoomInformationPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams?.get('id');
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: '',
  });
  const [totalNights, setTotalNights] = useState(1);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
    
    if (roomId) {
      fetchRoomTypeDetails(roomId);
    }
  }, [selectedLanguage, roomId]);

  useEffect(() => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const checkIn = new Date(selectedDates.checkIn);
      const checkOut = new Date(selectedDates.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTotalNights(diffDays > 0 ? diffDays : 1);
    }
  }, [selectedDates]);

  const fetchRoomTypeDetails = async (id: string) => {
    setLoading(true);
    try {
      // Gọi API để lấy thông tin chi tiết loại phòng
      const response = await fetch(`${API_BASE_URL}/LoaiPhong/Tìm loại phòng theo ID?maLoaiPhong=${id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      let data = await response.json();
      
      // Thêm dữ liệu mẫu cho gallery và đánh giá (trong thực tế sẽ lấy từ API)
      data = {
        ...data,
        tienNghi: [
          'WiFi miễn phí',
          'Điều hòa nhiệt độ',
          'TV màn hình phẳng',
          'Minibar',
          'Két an toàn',
          'Phòng tắm riêng',
          'Máy sấy tóc',
          'Dịch vụ phòng 24/7',
          'Bàn làm việc',
          'Ấm đun nước'
        ],
        galleryImages: [
          data.hinhAnh,
          '/images/room-detail-1.jpg',
          '/images/room-detail-2.jpg',
          '/images/room-detail-3.jpg',
          '/images/room-detail-4.jpg'
        ],
        reviews: [
          {
            id: '1',
            userName: 'Nguyễn Văn A',
            rating: 5,
            comment: 'Phòng rất thoải mái và sạch sẽ. Dịch vụ tuyệt vời!',
            date: '2023-10-15',
            userAvatar: '/images/avatar-1.jpg'
          },
          {
            id: '2',
            userName: 'Trần Thị B',
            rating: 4,
            comment: 'Phòng đẹp, view tuyệt vời. Chỉ có điều hơi ồn một chút từ đường phố.',
            date: '2023-09-22',
            userAvatar: '/images/avatar-2.jpg'
          },
          {
            id: '3',
            userName: 'Lê Văn C',
            rating: 5,
            comment: 'Một trong những phòng khách sạn tốt nhất mà tôi từng ở. Sẽ quay lại lần sau!',
            date: '2023-08-30',
            userAvatar: '/images/avatar-3.jpg'
          }
        ]
      };
      
      setRoomType(data);
      
      // Giả lập lấy ngày còn trống
      generateAvailableDates();
      
    } catch (err) {
      console.error('Lỗi khi lấy thông tin phòng:', err);
      setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const generateAvailableDates = () => {
    // Giả lập các ngày còn trống trong 30 ngày tới
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Giả sử một số ngày ngẫu nhiên đã được đặt
      if (i % 5 !== 0) { // Ngày chia hết cho 5 sẽ là ngày đã đặt
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    setAvailableDates(dates);
  };

  const nextImage = () => {
    if (roomType?.galleryImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === roomType.galleryImages!.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (roomType?.galleryImages) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? roomType.galleryImages!.length - 1 : prevIndex - 1
      );
    }
  };

  const handleBookNow = () => {
    if (roomType && selectedDates.checkIn && selectedDates.checkOut) {
      const bookingData = {
        roomTypeId: roomType.maLoaiPhong,
        roomName: roomType.tenLoaiPhong,
        price: roomType.donGia,
        image: roomType.hinhAnh,
        checkIn: selectedDates.checkIn,
        checkOut: selectedDates.checkOut,
        nights: totalNights
      };
      
      localStorage.setItem('selectedRoomData', JSON.stringify(bookingData));
      router.push('/users/booking');
    } else {
      alert('Vui lòng chọn ngày nhận phòng và trả phòng');
    }
  };

  const getValidImageSrc = (imagePath: string | undefined): string => {
    if (!imagePath) return '/images/room-placeholder.jpg';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    return '/images/room-placeholder.jpg';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? styles.starFilled : styles.starEmpty} 
        />
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (!roomType?.reviews || roomType.reviews.length === 0) return 0;
    
    const sum = roomType.reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / roomType.reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin phòng...</p>
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className={styles.errorContainer}>
        <h2>Có lỗi xảy ra</h2>
        <p>{error || 'Không tìm thấy thông tin phòng'}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/users/home">{t('profile.home')}</Link>
          <Link href="/users/about">{t('profile.about')}</Link>
          <Link href="/users/explore">{t('profile.explore')}</Link>
          <Link href="/users/rooms">{t('profile.rooms')}</Link>
          <Link href="/users/services">{t('profile.services')}</Link>
          <Link href="/users/promotions">{t('profile.promotions')}</Link>
        </div>
        <div className={styles.navRight}>
          <Link href="/users/profile" className={styles.profileIcon}>
            <FaUser />
          </Link>
          <Link href="/users/booking" className={styles.bookNowBtn}>
            {t('rooms.booking')}
          </Link>
        </div>
      </nav>

      {/* Room Information */}
      <main className={styles.main}>
        <div className={styles.breadcrumbs}>
          <Link href="/users/rooms">Phòng</Link> / <span>{roomType.tenLoaiPhong}</span>
        </div>

        <div className={styles.roomHeader}>
          <h1>{roomType.tenLoaiPhong}</h1>
          <div className={styles.roomRating}>
            {renderStars(parseInt(calculateAverageRating()))}
            <span className={styles.ratingValue}>{calculateAverageRating()}</span>
            <span className={styles.reviewCount}>({roomType.reviews?.length || 0} đánh giá)</span>
          </div>
        </div>

        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          <div className={styles.mainImageContainer}>
            <Image 
              src={getValidImageSrc(roomType.galleryImages?.[currentImageIndex])} 
              alt={roomType.tenLoaiPhong} 
              fill 
              className={styles.mainImage}
              onClick={() => setShowFullImage(true)}
            />
            <button className={`${styles.galleryButton} ${styles.prevButton}`} onClick={prevImage}>
              <FaArrowLeft />
            </button>
            <button className={`${styles.galleryButton} ${styles.nextButton}`} onClick={nextImage}>
              <FaArrowRight />
            </button>
            <button className={styles.expandButton} onClick={() => setShowFullImage(true)}>
              <FaExpand />
            </button>
          </div>
          <div className={styles.thumbnailsContainer}>
            {roomType.galleryImages?.map((image, index) => (
              <div 
                key={index} 
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image 
                  src={getValidImageSrc(image)} 
                  alt={`Thumbnail ${index + 1}`} 
                  width={100} 
                  height={70} 
                  className={styles.thumbnailImage}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.roomContent}>
          <div className={styles.roomDetails}>
            <div className={styles.roomDescription}>
              <h2>Thông tin chi tiết</h2>
              <p>{roomType.moTa || 'Không có mô tả cho phòng này.'}</p>
              
              <div className={styles.roomSpecs}>
                <div className={styles.specItem}>
                  <FaUsers className={styles.specIcon} />
                  <div>
                    <h4>Sức chứa</h4>
                    <p>{roomType.soNguoi} người</p>
                  </div>
                </div>
                <div className={styles.specItem}>
                  <FaBed className={styles.specIcon} />
                  <div>
                    <h4>Giường</h4>
                    <p>{roomType.soGiuong} giường</p>
                  </div>
                </div>
                <div className={styles.specItem}>
                  <FaEye className={styles.specIcon} />
                  <div>
                    <h4>View</h4>
                    <p>View thành phố</p>
                  </div>
                </div>
                <div className={styles.specItem}>
                  <FaExpand className={styles.specIcon} />
                  <div>
                    <h4>Diện tích</h4>
                    <p>{roomType.dienTich}m²</p>
                  </div>
                </div>
              </div>
              
              <h3>Tiện nghi phòng</h3>
              <div className={styles.amenitiesGrid}>
                {roomType.tienNghi?.map((amenity, index) => (
                  <div key={index} className={styles.amenityItem}>
                    {getAmenityIcon(amenity)}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.bookingBox}>
              <div className={styles.priceBox}>
                <span className={styles.price}>{roomType.donGia.toLocaleString()}đ</span>
                <span className={styles.perNight}>/ đêm</span>
              </div>
              
              <div className={styles.dateSelection}>
                <h3>Chọn ngày</h3>
                <div className={styles.dateInputs}>
                  <div className={styles.dateInput}>
                    <label htmlFor="checkIn">Nhận phòng</label>
                    <div className={styles.inputWithIcon}>
                      <FaCalendarAlt className={styles.calendarIcon} />
                      <input 
                        type="date" 
                        id="checkIn" 
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDates.checkIn}
                        onChange={(e) => setSelectedDates({...selectedDates, checkIn: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className={styles.dateInput}>
                    <label htmlFor="checkOut">Trả phòng</label>
                    <div className={styles.inputWithIcon}>
                      <FaCalendarAlt className={styles.calendarIcon} />
                      <input 
                        type="date" 
                        id="checkOut" 
                        min={selectedDates.checkIn || new Date().toISOString().split('T')[0]}
                        value={selectedDates.checkOut}
                        onChange={(e) => setSelectedDates({...selectedDates, checkOut: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className={styles.availabilityInfo}>
                  <h4>Tình trạng phòng</h4>
                  <div className={styles.availabilityCalendar}>
                    {/* Hiển thị lịch phòng trống */}
                    <p>Phòng có sẵn trong các ngày được đánh dấu</p>
                    <div className={styles.calendarDays}>
                      {availableDates.slice(0, 10).map((date, index) => (
                        <div key={index} className={styles.calendarDay}>
                          <span className={styles.dayLabel}>{formatDate(date)}</span>
                          <FaCheck className={styles.availableIcon} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={styles.priceSummary}>
                  <div className={styles.summaryRow}>
                    <span>{roomType.donGia.toLocaleString()}đ x {totalNights} đêm</span>
                    <span>{(roomType.donGia * totalNights).toLocaleString()}đ</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Thuế và phí</span>
                    <span>{(roomType.donGia * totalNights * 0.1).toLocaleString()}đ</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Tổng cộng</span>
                    <span>{(roomType.donGia * totalNights * 1.1).toLocaleString()}đ</span>
                  </div>
                </div>
                
                <button onClick={handleBookNow} className={styles.bookButton}>
                  Đặt phòng ngay
                </button>
              </div>
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className={styles.reviewsSection}>
            <h2>Đánh giá từ khách hàng</h2>
            <div className={styles.reviewsSummary}>
              <div className={styles.averageRating}>
                <span className={styles.ratingNumber}>{calculateAverageRating()}</span>
                <div className={styles.ratingStars}>
                  {renderStars(parseInt(calculateAverageRating()))}
                </div>
                <span className={styles.totalReviews}>{roomType.reviews?.length || 0} đánh giá</span>
              </div>
            </div>
            
            <div className={styles.reviewsList}>
              {roomType.reviews?.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.userAvatar}>
                        {review.userAvatar ? (
                          <Image 
                            src={review.userAvatar} 
                            alt={review.userName} 
                            width={50} 
                            height={50} 
                          />
                        ) : (
                          <div className={styles.defaultAvatar}>
                            {review.userName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <h4>{review.userName}</h4>
                        <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Full Image Modal */}
      {showFullImage && roomType.galleryImages && (
        <div className={styles.fullImageModal} onClick={() => setShowFullImage(false)}>
          <div className={styles.fullImageContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalButton} onClick={() => setShowFullImage(false)}>
              &times;
            </button>
            <Image 
              src={getValidImageSrc(roomType.galleryImages[currentImageIndex])} 
              alt={roomType.tenLoaiPhong} 
              fill 
              className={styles.fullImage}
            />
            <button className={`${styles.fullImageButton} ${styles.fullImagePrev}`} onClick={prevImage}>
              <FaArrowLeft />
            </button>
            <button className={`${styles.fullImageButton} ${styles.fullImageNext}`} onClick={nextImage}>
              <FaArrowRight />
            </button>
            <div className={styles.imageCounter}>
              {currentImageIndex + 1} / {roomType.galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <h3>{t('about.subscribe')}</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder={t('about.subscribePlaceholder')} />
              <button className={styles.subscribeButton}>{t('about.subscribeButton')}</button>
            </div>
          </div>

          <div className={styles.footerCenter}>
            <Image src="/images/logo.png" alt={t('about.hotelLogo')} width={150} height={60} />
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>{t('about.footerAbout')}</h4>
                <Link href="/location">{t('about.location')}</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>{t('about.support')}</h4>
                <Link href="/faq">{t('about.faq')}</Link>
                <Link href="/terms">{t('about.terms')}</Link>
                <Link href="/privacy">{t('about.privacy')}</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>{t('about.downloadApp')}</h4>
                <Link href="/services">{t('about.services')}</Link>
                <Link href="/careers">{t('about.careers')}</Link>
                <Link href="/book">{t('about.howToBook')}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>{t('about.copyright')}</div>
      </footer>
    </div>
  );
}

function getAmenityIcon(amenity: string) {
  const amenityLower = amenity.toLowerCase();
  
  if (amenityLower.includes('wifi')) return <FaWifi className={styles.amenityIcon} />;
  if (amenityLower.includes('tv') || amenityLower.includes('tivi')) return <FaTv className={styles.amenityIcon} />;
  if (amenityLower.includes('điều hòa') || amenityLower.includes('máy lạnh')) return <FaSnowflake className={styles.amenityIcon} />;
  if (amenityLower.includes('giường') || amenityLower.includes('bed')) return <FaBed className={styles.amenityIcon} />;
  if (amenityLower.includes('tắm') || amenityLower.includes('shower')) return <FaShower className={styles.amenityIcon} />;
  if (amenityLower.includes('coffee') || amenityLower.includes('cà phê') || amenityLower.includes('ấm')) return <FaCoffee className={styles.amenityIcon} />;
  if (amenityLower.includes('đỗ xe') || amenityLower.includes('parking')) return <FaParking className={styles.amenityIcon} />;
  
  // Icon mặc định
  return <FaCheck className={styles.amenityIcon} />;
}