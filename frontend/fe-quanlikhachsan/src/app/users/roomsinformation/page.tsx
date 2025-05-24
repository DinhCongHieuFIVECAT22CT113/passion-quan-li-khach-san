'use client';

import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
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
  } catch (e) {
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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);

const fetchRooms = async () => {
  setLoading(true);
  try {
    const id = searchParams?.get('id') ?? null;
    const apiUrl = id
      ? `<span class="math-inline">\{API\_BASE\_URL\}/Phong?id\=</span>{encodeURIComponent(id)}`
      : `${API_BASE_URL}/Phong`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Lỗi: ${response.status}`);
    }

    const data = await response.json();
    // Ép kiểu dữ liệu thô nhận được từ API thành ApiRoomData[]
    const roomsData: ApiRoomData[] = Array.isArray(data) ? data : [data];

    // Ánh xạ dữ liệu thô sang kiểu Room đã được xử lý
    const roomsWithDetails: Room[] = roomsData.map((room: ApiRoomData) => ({
      maPhong: room.maPhong,
      tenPhong: room.tenPhong || `Phòng ${room.maPhong}`,
      maLoaiPhong: room.maLoaiPhong,
      trangThai: room.trangThai,
      moTa: room.moTa, // moTa vẫn có thể là undefined
      thumbnail: getValidImageSrc(room.thumbnail), // room.thumbnail là string | undefined (từ ApiRoomData)
      hinhAnh: parseHinhAnh(room.hinhAnh), // room.hinhAnh là string | undefined (từ ApiRoomData)
      amenities: defaultAmenities // Hoặc bạn có thể xử lý room.amenities từ API nếu cần
    }));

    setRooms(roomsWithDetails); // Bây giờ roomsWithDetails là Room[], khớp với useState<Room[]>([]);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách phòng:', err);
    setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    fetchRooms();
  }, [selectedLanguage, searchParams]);

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

  if (loading) {
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
          <h1 className={styles.roomTitle}>Danh sách phòng</h1>
          
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
                        {room.amenities?.map((amenity, index) => (
                          <li key={index} className={styles.amenityItem}>
                            <span className={styles.amenityIcon}>{renderAmenityIcon(amenity)}</span>
                            <span className={styles.amenityName}>{amenity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={styles.roomRowActions}>
                    <button 
                      className={styles.viewImagesButton}
                      onClick={() => handleViewImages(room.hinhAnh || [])}
                    >
                      Xem ảnh
                    </button>
                    <button 
                      className={styles.bookButton}
                      onClick={() => router.push(`/users/booking?roomId=${room.maPhong}`)}
                    >
                      Đặt phòng ngay
                    </button>
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