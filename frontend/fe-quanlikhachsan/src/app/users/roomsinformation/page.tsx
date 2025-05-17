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
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

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
      <Header />
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