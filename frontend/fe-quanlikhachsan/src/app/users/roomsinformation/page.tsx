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
import { getRoomTypes } from '../../../lib/api';
import { RoomType } from '../../../types/auth';

interface ExtendedRoomType extends RoomType {
  giaMoiGio?: number;
  soPhongTam?: number;
  giuongDoi?: number;
  giuongDon?: number;
}

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
  tenPhong?: string;
  maLoaiPhong: string;
  trangThai: string;
  moTa?: string;
  thumbnail?: string;
  hinhAnh?: string;
  amenities?: string;
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
  const [roomType, setRoomType] = useState<ExtendedRoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);
  const [currentImageModalIndex, setCurrentImageModalIndex] = useState(0); // Mới
  const fetchRoomsAndRoomType = useCallback(async () => {
    setLoading(true);
    setError('');
    const maLoaiPhong = searchParams?.get('maLoaiPhong');

    if (!maLoaiPhong) {
      setError('Không có mã loại phòng nào được chọn.');
      setLoading(false);
      setRooms([]);
      return;
    }

    try {
      // Fetch Phong data
      const phongResponse = await fetch(`${API_BASE_URL}/Phong/GetPhongByLoai/${maLoaiPhong}`, {
        method: 'GET',
      });

      if (!phongResponse.ok) {
        if (phongResponse.status === 404) {
          setError(`Không tìm thấy phòng nào cho loại phòng ${maLoaiPhong}.`);
          setRooms([]);
        } else {
          throw new Error(`Lỗi khi tải phòng: ${phongResponse.status}`);
        }
      } else {
        const data = await phongResponse.json();
        console.log('Phong API Response:', data);
        const roomsData: ApiRoomData[] = Array.isArray(data) ? data : (data ? [data] : []);

        const roomsWithDetails: Room[] = roomsData.map((room: ApiRoomData) => ({
          maPhong: room.maPhong,
          tenPhong: room.tenPhong || `Phòng ${room.maPhong}`,
          maLoaiPhong: room.maLoaiPhong,
          trangThai: room.trangThai,
          moTa: room.moTa,
          thumbnail: getValidImageSrc(room.thumbnail),
          hinhAnh: parseHinhAnh(room.hinhAnh),
          amenities: defaultAmenities,
        }));
        setRooms(roomsWithDetails);
        if (roomsWithDetails.length === 0 && phongResponse.ok) {
          setError(`Không có phòng nào thuộc loại ${maLoaiPhong} hiện có sẵn.`);
        }
      }

      // Fetch LoaiPhong data using getRoomTypes
      const roomTypes = await getRoomTypes();
      const selectedRoomType = roomTypes.find((type: ExtendedRoomType) => type.maLoaiPhong === maLoaiPhong);
      if (selectedRoomType) {
        console.log('Selected RoomType:', selectedRoomType);
        setRoomType(selectedRoomType);
      } else {
        console.warn(`Không tìm thấy loại phòng ${maLoaiPhong}`);
      }
    } catch (err: any) {
      console.error(`Lỗi khi lấy dữ liệu:`, err);
      setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
    fetchRoomsAndRoomType();
  }, [selectedLanguage, fetchRoomsAndRoomType]);

  const renderAmenityIcon = (amenity: string) => {
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
  setCurrentImageModalIndex(0); // Đặt lại index về 0 khi mở modal mới
};

const handleNextImageModal = () => {
  if (selectedRoomImages) {
    setCurrentImageModalIndex((prevIndex) => (prevIndex + 1) % selectedRoomImages.length);
  }
};

const handlePrevImageModal = () => {
  if (selectedRoomImages) {
    setCurrentImageModalIndex((prevIndex) =>
      (prevIndex - 1 + selectedRoomImages.length) % selectedRoomImages.length
    );
  }
};

const handleThumbnailModalClick = (index: number) => {
  setCurrentImageModalIndex(index);
};

  const handleCloseModal = () => {
    setSelectedRoomImages(null);
  };

  const handleBookNow = (maPhong: string) => {
    if (authLoading) return;

    // Lưu thông tin phòng vào localStorage để sử dụng trong các bước tiếp theo
    const selectedRoom = rooms.find(room => room.maPhong === maPhong);
    if (selectedRoom && roomType) {
      const roomData = {
        maPhong: selectedRoom.maPhong,
        tenPhong: selectedRoom.tenPhong,
        maLoaiPhong: selectedRoom.maLoaiPhong,
        tenLoaiPhong: roomType.tenLoaiPhong,
        giaMoiDem: roomType.giaMoiDem,
        giaMoiGio: roomType.giaMoiGio,
        thumbnail: selectedRoom.thumbnail,
        moTa: roomType.moTa || selectedRoom.moTa,
        sucChua: roomType.sucChua,
        kichThuocPhong: roomType.kichThuocPhong
      };
      localStorage.setItem('selectedRoomData', JSON.stringify(roomData));
    }

    // Chuyển đến trang booking-form để điền thông tin trước
    router.push(`/users/booking-form?maPhong=${maPhong}`);
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
          <h1 className={styles.roomTitle}>Danh sách phòng {searchParams?.get('maLoaiPhong') ? `(Loại: ${roomType?.tenLoaiPhong || searchParams.get('maLoaiPhong')})` : ''}</h1>
          
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
                      <p>{roomType?.moTa || room.moTa || 'Không có mô tả cho phòng này.'}</p>
                      {roomType && (
                        <div className={styles.roomSpecifications}>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Giá mỗi giờ:</span>
                            <span className={styles.specValue}>
                              {roomType.giaMoiGio ? `${roomType.giaMoiGio.toLocaleString()}đ` : 'Không có thông tin'}
                            </span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Giá mỗi đêm:</span>
                            <span className={styles.specValue}>
                              {roomType.giaMoiDem ? `${roomType.giaMoiDem.toLocaleString()}đ` : 'Không có thông tin'}
                            </span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Số phòng tắm:</span>
                            <span className={styles.specValue}>{roomType.soPhongTam ?? 'Không có thông tin'}</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Số giường ngủ:</span>
                            <span className={styles.specValue}>{roomType.soGiuongNgu ?? 'Không có thông tin'}</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Giường đôi:</span>
                            <span className={styles.specValue}>{roomType.giuongDoi ?? 'Không có thông tin'}</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Giường đơn:</span>
                            <span className={styles.specValue}>{roomType.giuongDon ?? 'Không có thông tin'}</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Diện tích phòng:</span>
                            <span className={styles.specValue}>
                              {roomType.kichThuocPhong ? `${roomType.kichThuocPhong}m²` : 'Không có thông tin'}
                            </span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Sức chứa:</span>
                            <span className={styles.specValue}>{roomType.sucChua ?? 'Không có thông tin'}</span>
                          </div>
                        </div>
                      )}
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
                      {room.hinhAnh && room.hinhAnh.length > 1 && (
                        <button 
                          className={styles.viewImagesButton}
                          onClick={() => handleViewImages(room.hinhAnh || [room.thumbnail])}
                          aria-label={`Xem thêm ảnh cho phòng ${room.tenPhong}`}
                        >
                          Xem thêm ảnh của phòng
                        </button>
                      )}
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
    <div className={styles.fullImageSliderContainer}> {/* Container mới cho slider */}
      {/* Ảnh chính */}
      <Image
        src={selectedRoomImages[currentImageModalIndex]}
        alt={`Ảnh phòng ${currentImageModalIndex + 1}`}
        width={1200} // Kích thước lớn hơn cho ảnh trong modal
        height={700} // Kích thước lớn hơn
        className={styles.fullImageMain} // Class mới cho ảnh chính trong modal
        priority
      />

      {/* Nút điều hướng (Prev/Next) */}
      {selectedRoomImages.length > 1 && (
        <>
          <button
            className={`${styles.modalSliderNavButton} ${styles.modalPrevButton}`}
            onClick={handlePrevImageModal}
            aria-label="Ảnh trước"
          >
            &lt;
          </button>
          <button
            className={`${styles.modalSliderNavButton} ${styles.modalNextButton}`}
            onClick={handleNextImageModal}
            aria-label="Ảnh tiếp theo"
          >
            &gt;
          </button>
        </>
      )}

      {/* Thanh trượt thumbnail ngang (tùy chọn, nhưng rất nên có) */}
      {selectedRoomImages.length > 1 && (
        <div className={styles.modalThumbnailsSlider}>
          {selectedRoomImages.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt={`Ảnh nhỏ ${index + 1}`}
              width={100}
              height={70}
              className={`${styles.modalThumbnailImage} ${index === currentImageModalIndex ? styles.activeModalThumbnail : ''}`}
              onClick={() => handleThumbnailModalClick(index)}
              priority={false}
            />
          ))}
        </div>
      )}

      {/* Nút đóng modal */}
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