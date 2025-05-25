// trang Roomsinformation
'use client';

import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import Header from '../../components/layout/Header';
import styles from './styles.module.css';
import Image from 'next/image';
import { FaWifi, FaSnowflake, FaTv, FaWineBottle, FaLock, FaBath, FaWater, FaPhone, FaDesktop, FaCoffee } from 'react-icons/fa';
import React from 'react';

interface Room {
  maPhong: string;
  tenPhong: string;
  maLoaiPhong: string;
  trangThai: string;
  moTa?: string;
  thumbnail: string;
  hinhAnh?: string[];
  amenities?: string[];
}

interface ApiRoomData {
  maPhong: string;
  tenPhong?: string; // Có thể optional từ API
  maLoaiPhong: string;
  trangThai: string;
  moTa?: string;
  thumbnail?: string; // Từ API, có thể là string hoặc undefined
  hinhAnh?: string; // Từ API, đây là một CHUỖI (có thể là JSON hoặc chuỗi ngăn cách bằng dấu phẩy)
  amenities?: string; // Tùy thuộc vào cách API trả về tiện nghi, nếu là string, để là string
}

const getValidImageSrc = (imagePath: string | undefined | null): string => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '/images/no-results.png';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  return '/images/no-results.png';
};

const getValidAltText = (tenPhong: string | undefined): string => {
  return tenPhong && typeof tenPhong === 'string' && tenPhong.trim() !== ''
    ? tenPhong
    : 'Hình ảnh phòng khách sạn';
};

const parseHinhAnh = (hinhAnh: string | undefined | null): string[] => {
  if (!hinhAnh || typeof hinhAnh !== 'string') {
    return ['/images/no-results.png'];
  }

  try {
    const parsed = JSON.parse(hinhAnh);
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed.map(getValidImageSrc) : ['/images/no-results.png'];
    }
  } catch {
    // Continue to other parsing methods
  }

  if (hinhAnh.includes(',')) {
    return hinhAnh.split(',').map(item => getValidImageSrc(item.trim()));
  }

  return [getValidImageSrc(hinhAnh)];
};

const defaultAmenities = [
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
];

export default function RoomsListPage() {
  const { selectedLanguage } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);

const fetchRooms = useCallback(async () => {
  setLoading(true);
  setError('');
  const maLoaiPhong = searchParams?.get('maLoaiPhong');

  if (!maLoaiPhong) {
    setError('Không có mã loại phòng nào được chọn.');
    setLoading(false);
    setRooms([]); // Đảm bảo rooms rỗng nếu không có mã loại phòng
    return;
  }

  try {
    // Gọi API lấy phòng theo mã loại phòng
    const response = await fetch(`${API_BASE_URL}/Phong/GetPhongByLoai/${maLoaiPhong}`, {
      method: 'GET',
      // Không cần gửi token nếu API này là public
    });

    if (!response.ok) {
      if (response.status === 404) {
        setError(`Không tìm thấy phòng nào cho loại phòng ${maLoaiPhong}.`);
        setRooms([]);
      } else {
        throw new Error(`Lỗi khi tải phòng: ${response.status}`);
      }
    } else {
      const data = await response.json();
      // API có thể trả về một object nếu chỉ có 1 phòng, hoặc array nếu nhiều, hoặc 404 nếu không có
      // Nếu API luôn trả về array (kể cả rỗng), thì không cần Array.isArray check phức tạp
      const roomsData: ApiRoomData[] = Array.isArray(data) ? data : (data ? [data] : []);

      const roomsWithDetails: Room[] = roomsData.map((room: ApiRoomData) => ({
        maPhong: room.maPhong,
        tenPhong: room.tenPhong || `Phòng ${room.maPhong}`,
        maLoaiPhong: room.maLoaiPhong, // Giữ lại để kiểm tra nếu cần
        trangThai: room.trangThai,
        moTa: room.moTa,
        thumbnail: getValidImageSrc(room.thumbnail),
        hinhAnh: parseHinhAnh(room.hinhAnh),
        amenities: defaultAmenities // Sử dụng default amenities
      }));
      setRooms(roomsWithDetails);
      if (roomsWithDetails.length === 0 && response.ok) { // response.ok nhưng không có phòng
        setError(`Không có phòng nào thuộc loại ${maLoaiPhong} hiện có sẵn.`);
      }
    }
  } catch (err: any) {
    console.error(`Lỗi khi lấy danh sách phòng cho loại ${maLoaiPhong}:`, err);
    setError(err.message || 'Không thể tải danh sách phòng. Vui lòng thử lại sau.');
    setRooms([]);
  } finally {
    setLoading(false);
  }
}, [searchParams, setLoading, setError, setRooms]);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    // fetchRooms sẽ được gọi khi searchParams thay đổi (do dependency của fetchRooms)
    // hoặc khi selectedLanguage thay đổi.
    // Gọi một lần khi component mount và khi các dependencies này thay đổi.
    fetchRooms(); 
  }, [selectedLanguage, fetchRooms]); // fetchRooms đã có searchParams là dependency

const renderAmenityIcon = (amenity: string) => {
  // Thay đổi JSX.Element thành React.ReactNode
  const iconMap: Record<string, React.ReactNode> = {
    'WiFi': <FaWifi />,
    'Điều hòa': <FaSnowflake />,
    'TV': <FaTv />,
    'Minibar': <FaWineBottle />,
    'Két': <FaLock />,
    'Phòng tắm': <FaBath />,
    'Máy sấy': <FaWater />,
    'Dịch vụ phòng': <FaPhone />,
    'Bàn làm việc': <FaDesktop />,
    'Ấm đun': <FaCoffee />
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (amenity.includes(key)) {
      return icon;
    }
  }
  return null;
};

  const handleViewImages = (images: string[]) => {
    setSelectedRoomImages(images);
  };

  const handleCloseModal = () => {
    setSelectedRoomImages(null);
  };

  const handleBookNow = (maPhong: string) => {
    if (authLoading) return;

    if (!user) {
      router.push(`/login?redirect=/users/booking?maPhong=${maPhong}`);
    } else {
      router.push(`/users/booking?maPhong=${maPhong}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách phòng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
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
          <h1 className={styles.roomTitle}>Danh sách phòng {searchParams?.get('maLoaiPhong') ? `(Loại: ${searchParams.get('maLoaiPhong')})` : ''}</h1>
          
          <div className={styles.roomsList}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.maPhong} className={styles.roomRow}>
                  <div className={styles.roomRowImage}>
                    <Image 
                      src={room.thumbnail}
                      alt={getValidAltText(room.tenPhong)}
                      width={250}
                      height={150}
                      className={styles.rowImage}
                      priority={rooms.indexOf(room) < 3}
                    />
                  </div>
                  <div className={styles.roomRowContent}>
                    <h3>{room.tenPhong}</h3>
                    <div className={styles.roomInfo}>
                      <div className={styles.feature}>
                        <span className={styles.featureLabel}>Mã phòng:</span>
                        <span className={styles.featureValue}>{room.maPhong}</span>
                      </div>
                      <div className={styles.feature}>
                        <span className={styles.featureLabel}>Mã loại phòng:</span>
                        <span className={styles.featureValue}>{room.maLoaiPhong}</span>
                      </div>
                      <div className={styles.feature}>
                        <span className={styles.featureLabel}>Trạng thái:</span>
                        <span className={styles.featureValue}>{room.trangThai}</span>
                      </div>
                    </div>
                    <div className={styles.roomDescription}>
                      <h4>Mô tả</h4>
                      <p>{room.moTa || 'Không có mô tả cho phòng này.'}</p>
                    </div>
                    <div className={styles.amenities}>
                      <h4>Tiện nghi</h4>
                      <ul className={styles.amenitiesList}>
                        {(room.amenities || defaultAmenities)?.map((amenity, index) => (
                          <li key={index} className={styles.amenityItem}>
                            <span className={styles.amenityIcon}>{renderAmenityIcon(amenity)}</span>
                            <span className={styles.amenityName}>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.roomActions}>
                      <button 
                        className={styles.detailsButton}
                        onClick={() => handleViewImages(room.hinhAnh || [room.thumbnail])}
                      >
                        Xem chi tiết
                      </button>
                      <button 
                        className={styles.bookButton}
                        onClick={() => handleBookNow(room.maPhong)}
                        disabled={authLoading}
                      >
                        {authLoading ? 'Đang tải...' : 'Đặt ngay'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noRoomsFound}>
                <p>Không có phòng nào được tìm thấy.</p>
                <button onClick={() => router.back()} className={styles.backButton}>
                  Quay lại
                </button>
              </div>
            )}
          </div>

          {selectedRoomImages && (
            <div className={styles.fullImageModal}>
              <div className={styles.fullImageContainer}>
                {selectedRoomImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Ảnh phòng ${index + 1}`}
                    width={800}
                    height={500}
                    className={styles.fullImage}
                    priority
                  />
                ))}
                <button
                  className={styles.closeModalButton}
                  onClick={handleCloseModal}
                  aria-label="Đóng ảnh"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}