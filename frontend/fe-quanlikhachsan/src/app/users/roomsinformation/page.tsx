'use client';

import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, handleResponse } from '@/lib/api';
import Header from '../../components/layout/Header';
import styles from './styles.module.css';
import Image from 'next/image';
import { FaStar, FaStarHalfAlt, FaWifi, FaSnowflake, FaTv, FaWineBottle, FaLock, FaBath, FaWater, FaPhone, FaDesktop, FaCoffee } from 'react-icons/fa';

interface Review {
  reviewId: string;
  bookingId: string;
  rating: number;
  comment: string;
  customerName?: string;
  avatar?: string;
  reviewDate?: string;
}

interface RoomType {
  roomTypeId: string;
  roomTypeName: string;
  description: string;
  pricePerHour: number;
  pricePerNight: number;
  bathroomCount: number;
  bedCount: number;
  doubleBeds: number;
  singleBeds: number;
  roomSize: number;
  capacity: number;
  thumbnail: string;
  amenities?: string[];
  galleryImages?: string[];
  reviews?: Review[];
}

export default function RoomInformationPage() {
  const { selectedLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams?.get('id');
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  // Hàm hiển thị đánh giá sao
  const renderRating = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className={styles.starIcon} />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className={styles.starIcon} />);
      } else {
        stars.push(<FaStar key={i} className={styles.starIconEmpty} />);
      }
    }
    return stars;
  };

  const generateAvailableDates = useCallback(() => {
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
    return dates;
  }, []);

  const fetchRoomTypeDetails = useCallback(async (id: string) => {
    setLoading(true);
    try {
      // Gọi API để lấy thông tin chi tiết loại phòng
      const response = await fetch(`${API_BASE_URL}/LoaiPhong/${id}`);
      
      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status}`);
      }
      
      let data = await response.json();
      
      // Thêm dữ liệu mẫu cho gallery và tiện nghi
      data = {
        ...data,
        amenities: [
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
          data.thumbnail,
          '/images/thumb/room-1.jpg',
          '/images/thumb/room-2.jpg',
          '/images/thumb/room-3.jpg',
          '/images/thumb/room-4.jpg'
        ]
      };
      
      setRoomType(data);
      
      // Tìm đánh giá cho loại phòng này
      fetchReviews();
      
    } catch (err) {
      console.error('Lỗi khi lấy thông tin phòng:', err);
      setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchReviews = async () => {
    try {
      // Trong thực tế, API sẽ cho phép lọc review theo mã phòng/loại phòng
      // Hiện tại lấy tất cả reviews và sử dụng mock data
      const mockReviews = [
        {
          reviewId: '1',
          bookingId: 'DP001',
          rating: 5,
          comment: 'Phòng rất thoải mái và sạch sẽ. Dịch vụ tuyệt vời!',
          customerName: 'Nguyễn Văn A',
          avatar: '/images/members/member1.jpg',
          reviewDate: '2023-10-15'
        },
        {
          reviewId: '2',
          bookingId: 'DP002',
          rating: 4,
          comment: 'Phòng đẹp, view tuyệt vời. Chỉ có điều hơi ồn một chút từ đường phố.',
          customerName: 'Trần Thị B',
          avatar: '/images/members/member2.jpg',
          reviewDate: '2023-09-22'
        },
        {
          reviewId: '3',
          bookingId: 'DP003',
          rating: 5,
          comment: 'Một trong những phòng khách sạn tốt nhất mà tôi từng ở. Sẽ quay lại lần sau!',
          customerName: 'Lê Văn C',
          avatar: '/images/members/member3.jpg',
          reviewDate: '2023-08-30'
        }
      ];
      
      setReviews(mockReviews);
      
    } catch (err) {
      console.error('Lỗi khi lấy đánh giá:', err);
    }
  };

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    
    if (roomId) {
      fetchRoomTypeDetails(roomId);
    }
  }, [selectedLanguage, roomId, fetchRoomTypeDetails]);

  // Hiển thị biểu tượng tiện nghi
  const renderAmenityIcon = (amenity: string) => {
    if (amenity.includes('WiFi')) return <FaWifi />;
    if (amenity.includes('Điều hòa')) return <FaSnowflake />;
    if (amenity.includes('TV')) return <FaTv />;
    if (amenity.includes('Minibar')) return <FaWineBottle />;
    if (amenity.includes('Két')) return <FaLock />;
    if (amenity.includes('Phòng tắm')) return <FaBath />;
    if (amenity.includes('Máy sấy')) return <FaWater />;
    if (amenity.includes('Dịch vụ phòng')) return <FaPhone />;
    if (amenity.includes('Bàn làm việc')) return <FaDesktop />;
    if (amenity.includes('Ấm đun')) return <FaCoffee />;
    return null;
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
    <>
      <Header />
      <div className={styles.roomInformationContainer}>
        <div className={styles.container}>
          <h1 className={styles.roomTitle}>{roomType.roomTypeName}</h1>
          
          <div className={styles.roomGallery}>
            {roomType.galleryImages?.map((img, index) => (
              <div key={index} className={index === 0 ? styles.mainImage : styles.thumbnailImage}>
                <Image 
                  src={img.startsWith('http') ? img : img} 
                  alt={`${roomType.roomTypeName} - Ảnh ${index + 1}`}
                  width={index === 0 ? 800 : 200}
                  height={index === 0 ? 500 : 150}
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>
          
          <div className={styles.roomDetails}>
            <div className={styles.roomInfo}>
              <h2>Thông tin chi tiết</h2>
              <div className={styles.roomFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Diện tích:</span>
                  <span className={styles.featureValue}>{roomType.roomSize}m²</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Sức chứa:</span>
                  <span className={styles.featureValue}>{roomType.capacity} người</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Số giường:</span>
                  <span className={styles.featureValue}>
                    {roomType.doubleBeds} giường đôi, {roomType.singleBeds} giường đơn
                  </span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Phòng tắm:</span>
                  <span className={styles.featureValue}>{roomType.bathroomCount}</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Giá theo giờ:</span>
                  <span className={styles.featureValue}>{roomType.pricePerHour.toLocaleString('vi-VN')} VNĐ/giờ</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureLabel}>Giá theo đêm:</span>
                  <span className={styles.featureValue}>{roomType.pricePerNight.toLocaleString('vi-VN')} VNĐ/đêm</span>
                </div>
              </div>
              
              <div className={styles.roomDescription}>
                <h3>Mô tả</h3>
                <p>{roomType.description || 'Không có mô tả cho loại phòng này.'}</p>
              </div>
            </div>
            
            <div className={styles.amenities}>
              <h3>Tiện nghi</h3>
              <ul className={styles.amenitiesList}>
                {roomType.amenities?.map((amenity, index) => (
                  <li key={index} className={styles.amenityItem}>
                    <span className={styles.amenityIcon}>{renderAmenityIcon(amenity)}</span>
                    <span className={styles.amenityName}>{amenity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className={styles.bookingSection}>
            <h2>Đặt phòng</h2>
            <button 
              className={styles.bookButton}
              onClick={() => router.push(`/users/booking?roomTypeId=${roomType.roomTypeId}`)}
            >
              Đặt phòng ngay
            </button>
          </div>
          
          <div className={styles.reviewsSection}>
            <h2>Đánh giá từ khách hàng</h2>
            <div className={styles.reviewsList}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.reviewId} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        {review.avatar && (
                          <Image 
                            src={review.avatar} 
                            alt={review.customerName || 'Khách hàng'}
                            width={50}
                            height={50}
                            className={styles.reviewerAvatar}
                          />
                        )}
                        <div>
                          <p className={styles.reviewerName}>{review.customerName || 'Khách hàng'}</p>
                          <p className={styles.reviewDate}>{review.reviewDate}</p>
                        </div>
                      </div>
                      <div className={styles.reviewRating}>
                        {renderRating(review.rating)}
                      </div>
                    </div>
                    <div className={styles.reviewContent}>
                      <p>{review.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có đánh giá nào cho loại phòng này.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}