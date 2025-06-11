// trang Roomsinformation
'use client';

import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/config';
import { useAuth } from '@/lib/auth';
import Header from '../../components/layout/Header';
import styles from './styles.module.css';
import Image from 'next/image';
import { FaWifi, FaSnowflake, FaTv, FaWineBottle, FaLock, FaBath, FaWater, FaPhone, FaDesktop, FaCoffee, FaStar, FaUsers, FaRuler, FaCalendarAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import React from 'react';
import { getRoomTypes } from '../../../lib/api';
import { RoomType } from '../../../types/auth'; // <-- Sử dụng RoomType từ đây
import Head from 'next/head';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import BookingModal from '../../components/booking/BookingModal';
import Footer from '../../components/layout/Footer';

// Xóa bỏ interface ExtendedRoomType

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
  soPhong?: string;
}

const getValidImageSrc = (imagePath: string | undefined | null): string => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '/images/room-placeholder.jpg';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  return '/images/room-placeholder.jpg';
};

const getValidAltText = (tenPhong: string | undefined): string => {
  return tenPhong && typeof tenPhong === 'string' && tenPhong.trim() !== ''
    ? tenPhong
    : 'Hình ảnh phòng khách sạn';
};

const parseHinhAnh = (hinhAnh: string | undefined | null): string[] => {
  if (!hinhAnh || typeof hinhAnh !== 'string') {
    return ['/images/room-placeholder.jpg'];
  }

  try {
    const parsed = JSON.parse(hinhAnh);
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed.map(getValidImageSrc) : ['/images/room-placeholder.jpg'];
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
  const params = useParams();
  const slug = params?.slug as string;
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomType, setRoomType] = useState<RoomType | null>(null); // <-- Thay đổi ở đây
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);
  const [currentImageModalIndex, setCurrentImageModalIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const extractRoomTypeIdFromSlug = (slug: string | null | undefined): string => {
    if (!slug) return '';
    const parts = slug.split('-');
    return parts[parts.length - 1];
  };

  const fetchRoomsAndRoomType = useCallback(async () => {
    setLoading(true);
    setError('');
    
    const maLoaiPhong = extractRoomTypeIdFromSlug(slug);

    if (!maLoaiPhong) {
      setError('Không có mã loại phòng nào được chọn hoặc slug không hợp lệ.');
      setLoading(false);
      setRooms([]);
      return;
    }

    try {
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
        const roomsData: ApiRoomData[] = Array.isArray(data) ? data : (data ? [data] : []);

        const roomsWithDetails: Room[] = roomsData
          .filter((room: ApiRoomData) => room.trangThai === 'Trống' || room.trangThai === 'Còn trống' || room.trangThai === 'Available')
          .map((room: ApiRoomData) => ({
            maPhong: room.maPhong,
            tenPhong: room.tenPhong || `Phòng ${room.soPhong || room.maPhong}`,
            maLoaiPhong: room.maLoaiPhong,
            trangThai: room.trangThai,
            moTa: room.moTa,
            soPhong: room.soPhong,
            thumbnail: getValidImageSrc(room.thumbnail),
            hinhAnh: parseHinhAnh(room.hinhAnh),
            amenities: defaultAmenities,
          }));
        setRooms(roomsWithDetails);
        if (roomsWithDetails.length === 0 && phongResponse.ok) {
          setError(`Hiện tại không có phòng nào còn trống, đang được dọn hoặc đã được đặt trước.`);
        }
      }

      const roomTypes = await getRoomTypes();
      const selectedRoomType = roomTypes.find((type: RoomType) => type.maLoaiPhong === maLoaiPhong); // <-- Thay đổi ở đây
      if (selectedRoomType) {
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
  }, [slug]);

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
    setCurrentImageModalIndex(0);
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

  const handleBookNow = (room: Room) => {
    if (authLoading) return;
    setSelectedRoomForBooking(room);
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setSelectedRoomForBooking(null);
  };

  const pageTitle = roomType?.tenLoaiPhong ? `Phòng ${roomType.tenLoaiPhong} | Passion Horizon` : 'Danh sách phòng | Passion Horizon';
  const pageDescription = roomType?.moTa || 'Phòng có sẵn tại Passion Horizon với đầy đủ tiện nghi.';
  const pageImage = roomType?.thumbnail ? getValidImageSrc(roomType.thumbnail) : '/images/room-placeholder.jpg';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/users/home' },
    { label: 'Phòng', href: '/users/rooms' },
    { label: roomType?.tenLoaiPhong || 'Danh sách phòng', href: '#' }
  ];

  if (loading || authLoading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải danh sách phòng...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Xin lỗi vì sự bất tiện</h2>
          <p>{error}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Quay lại
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`khách sạn, đặt phòng, ${roomType?.tenLoaiPhong}, Passion Horizon, nghỉ dưỡng`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Passion Horizon" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              "name": "Passion Horizon",
              "description": pageDescription,
              "image": pageImage,
              "url": pageUrl,
              "priceRange": roomType?.giaMoiDem ? `${roomType.giaMoiDem.toLocaleString()}đ` : '',
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "VN"
              },
              "amenityFeature": [
                { "@type": "LocationFeatureSpecification", "name": "WiFi miễn phí" },
                { "@type": "LocationFeatureSpecification", "name": "Smart TV" },
                { "@type": "LocationFeatureSpecification", "name": "Điều hòa" },
                { "@type": "LocationFeatureSpecification", "name": "Phòng tắm riêng" }
              ]
            })
          }}
        />
      </Head>
      <Header />
      <Breadcrumb items={breadcrumbItems} />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.heroImageContainer}>
            {/*Image ở đây*/}
            <div className={styles.heroOverlay}>
              <h1 className={styles.heroMainTitle}>Danh sách phòng {roomType?.tenLoaiPhong} còn trống</h1>
              <p className={styles.heroSubText}>Với đầy đủ tiện nghi và không gian thoải mái</p>
            </div>
          </div>
          <div className={styles.roomsList}>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room.maPhong} className={styles.roomRow}>
                  <div className={styles.roomRowImage}>
                    {room.hinhAnh && room.hinhAnh.length > 1 ? (
                      <div className={styles.imageGallery}>
                        <div className={styles.mainImage}>
                          <Image
                            src={room.hinhAnh[0]}
                            alt={getValidAltText(room.tenPhong)}
                            width={250}
                            height={150}
                            className={styles.rowImage}
                            priority={rooms.indexOf(room) < 3}
                          />
                          <div className={styles.imageCount}>
                            <span>{room.hinhAnh.length} ảnh</span>
                          </div>
                        </div>
                        <div className={styles.thumbnailGrid}>
                          {room.hinhAnh.slice(1, 4).map((img, index) => (
                            <div key={index} className={styles.thumbnailItem}>
                              <Image
                                src={img}
                                alt={`${getValidAltText(room.tenPhong)} ${index + 2}`}
                                width={60}
                                height={40}
                                className={styles.thumbnailImage}
                              />
                            </div>
                          ))}
                          {room.hinhAnh.length > 4 && (
                            <div className={styles.moreImages} onClick={() => handleViewImages(room.hinhAnh!)}>
                              <span>+{room.hinhAnh.length - 4}</span>
                            </div>
                          )}
                        </div>
                        <button 
                          className={styles.viewAllButton}
                          onClick={() => handleViewImages(room.hinhAnh!)}
                        >
                          Xem tất cả ảnh
                        </button>
                      </div>
                    ) : (
                      <Image
                        src={room.thumbnail}
                        alt={getValidAltText(room.tenPhong)}
                        width={250}
                        height={150}
                        className={styles.rowImage}
                        priority={rooms.indexOf(room) < 3}
                      />
                    )}
                  </div>
<div className={styles.roomRowContent}>
  <div className={styles.roomOverviewLeft}>
    <div className={styles.roomOverviewRow}>
      <span className={styles.roomOverviewLabel}>Tên phòng:</span>
      <span className={styles.roomOverviewValue}>{room.tenPhong}</span>
    </div>
    <div className={styles.roomOverviewRow}>
      <span className={styles.roomOverviewLabel}>Trạng thái:</span>
      <span className={`${styles.roomOverviewValue} ${room.trangThai === 'Trống' ? styles.roomStatus : styles.roomStatusUnavailable}`}>
        {room.trangThai === 'Trống' ? 'Còn trống' : room.trangThai}
      </span>
    </div>
    <div className={styles.roomOverviewRow}>
      <span className={styles.roomOverviewLabel}>Loại phòng:</span>
      <span className={styles.roomTypeValue}>{roomType?.tenLoaiPhong || 'Không xác định'}</span>
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
                      <button
                        className={styles.bookNowButton}
                        onClick={() => handleBookNow(room)}
                      >
                        Đặt phòng ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noRoomsFound}>
                <p>Hiện tại không có phòng trống nào thuộc loại này.</p>
                <button onClick={() => router.back()} className={styles.backButton}>
                  Quay lại
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {showBookingModal && selectedRoomForBooking && (
        <BookingModal
          loaiPhong={roomType} // Pass the roomType details to the booking modal
          onClose={handleCloseBookingModal}
          selectedRoom={selectedRoomForBooking} // Pass the specific room selected
        />
      )}
    </div>
  );
}