'use client';

import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '../../../lib/config';
import Header from '../../components/layout/Header';
import styles from './styles.module.css';

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
  const { selectedLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = searchParams?.get('id');
  
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [generateAvailableDates]);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    
    if (roomId) {
      fetchRoomTypeDetails(roomId);
    }
  }, [selectedLanguage, roomId, fetchRoomTypeDetails]);

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