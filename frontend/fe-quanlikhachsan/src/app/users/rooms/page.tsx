// trang Rooms
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaWifi, FaTv, FaSnowflake, FaBath, FaSearch, FaFilter, FaBed, FaDollarSign, FaUsers, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './styles.module.css';
import { getRoomTypes, countAvailableRoomsByType } from '../../../lib/api';
import { RoomType } from '../../../types/auth';
import { API_BASE_URL } from '../../../lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import EnhancedSearchBar from '../../components/search/EnhancedSearchBar';
import { RoomGridSkeleton, LoadingSpinner } from '../../components/ui/LoadingStates';
import { NetworkError } from '../../components/ui/ErrorBoundary';
import { useSearchParams } from 'next/navigation';

// Hàm hỗ trợ để đảm bảo đường dẫn hình ảnh hợp lệ
const getValidImageSrc = (imagePath: string | undefined): string => {
  if (!imagePath) return '/images/room-placeholder.jpg';

  // Nếu là URL đầy đủ
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Nếu là đường dẫn tương đối bắt đầu bằng /
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Nếu đường dẫn không hợp lệ, trả về ảnh mặc định
  return '/images/room-placeholder.jpg';
};

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const location = searchParams?.get('location') || '';
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const guestsParam = searchParams?.get('guests') || '';

  // Sử dụng các tham số này để lọc phòng nếu cần
  useEffect(() => {
    if (location || checkIn || checkOut || guestsParam) {
      // Có thể thêm logic lọc phòng dựa trên các tham số tìm kiếm ở đây
      console.log('Search params:', { location, checkIn, checkOut, guestsParam });
    }
  }, [location, checkIn, checkOut, guestsParam]);

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRoomCounts, setAvailableRoomCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([500000, 5000000]);
  const [capacity, setCapacity] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  // Thêm trạng thái tạm thời cho bộ lọc
  const [tempSelectedFilter, setTempSelectedFilter] = useState('all');
  const [tempPriceRange, setTempPriceRange] = useState([500000, 5000000]);
  const [tempCapacity, setTempCapacity] = useState(2);

  // States mới cho các trường input được kiểm soát
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState<number>(2);

  const scrollContainer = useRef(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setMounted(true);

    // Đặt giá trị ban đầu cho ngày và số khách chỉ khi component mount trên client
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setCheckInDate(today);
    setCheckOutDate(tomorrow);
    setNumberOfGuests(2); // Giá trị mặc định

    const fetchRooms = async () => {
      setLoading(true);
      try {
        console.log(`Đang gọi API lấy danh sách loại phòng từ: ${API_BASE_URL}/RoomType`);
        const data = await getRoomTypes();
        setRoomTypes(data || []);
        console.log('Dữ liệu loại phòng nhận được:', data);

        // Lấy số phòng còn trống cho mỗi loại phòng
        const counts: {[key: string]: number} = {};
        for (const roomType of data || []) {
          try {
            const count = await countAvailableRoomsByType(roomType.maLoaiPhong);
            counts[roomType.maLoaiPhong] = count;
          } catch (err) {
            console.error(`Lỗi khi đếm phòng cho loại ${roomType.maLoaiPhong}:`, err);
            counts[roomType.maLoaiPhong] = 0;
          }
        }
        setAvailableRoomCounts(counts);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng:', err);
        let errorMessage = '';

        if (err instanceof Error) {
          errorMessage = err.message;

          if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
            errorMessage = `Không thể kết nối đến server backend tại ${API_BASE_URL}. Vui lòng kiểm tra:
            1. Server backend đã chạy chưa
            2. URL (${API_BASE_URL}) có chính xác không
            3. CORS đã được cấu hình đúng chưa`;
          }
        } else {
          errorMessage = 'Không thể tải danh sách phòng';
        }

        setError(`Lỗi kết nối đến server backend: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    setSelectedFilter(tempSelectedFilter);
    setPriceRange(tempPriceRange);
    setCapacity(tempCapacity);
    setShowFilters(false);
  };

  // Lọc phòng theo bộ lọc đã chọn và từ khóa tìm kiếm
  const filteredRoomTypes = roomTypes.filter((roomType) => {
    if (searchQuery && !roomType.tenLoaiPhong.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    if (selectedFilter !== 'all' && selectedFilter !== roomType.maLoaiPhong) {
      return false;
    }

    if (roomType.giaMoiDem !== undefined && (roomType.giaMoiDem < priceRange[0] || roomType.giaMoiDem > priceRange[1])) {
      return false;
    }

    if (roomType.sucChua !== undefined && roomType.sucChua < capacity) {
      return false;
    }

    return true;
  });

  // Sắp xếp phòng theo giá từ thấp đến cao
  const sortedRoomTypes = [...filteredRoomTypes].sort((a, b) => {
    if (a.giaMoiDem === undefined) return 1;
    if (b.giaMoiDem === undefined) return -1;
    return a.giaMoiDem - b.giaMoiDem;
  });

  if (!mounted) {
    // Render một div trống hoặc skeleton cho đến khi component mount
    return <div className={styles.pageContainer}></div>;
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <Breadcrumb />
        <main className={styles.main}>
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1>Khám phá không gian nghỉ dưỡng tuyệt vời</h1>
              {/* <SearchBar variant="compact" /> */}
              {/* Giữ nguyên SearchBar nếu nó là một component riêng và không gây lỗi */}
              {/* Nếu SearchBar cũng gây lỗi tương tự, cần kiểm tra logic của nó */}
            </div>
          </div>
          <RoomGridSkeleton count={6} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <Breadcrumb />
        <main className={styles.main}>
          <NetworkError onRetry={() => window.location.reload()} />
        </main>
        <Footer />
      </div>
    );
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Tạo slug thân thiện cho URL
  const createRoomSlug = (roomName: string, roomId: string): string => {
    const slug = roomName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return `${slug}-${roomId}`;
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <Breadcrumb />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Khám phá không gian nghỉ dưỡng tuyệt vời</h1>
          <p>Tìm kiếm phòng phù hợp cho kì nghỉ hoàn hảo của bạn</p>
          
          {/* Enhanced Search Form */}
          <EnhancedSearchBar variant="hero" showAdvancedFilters={false} />
        </div>
      </section>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGrid}>
            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <FaBed className={styles.filterIcon} />
                <span>Loại phòng</span>
              </div>
              <select
                value={tempSelectedFilter}
                onChange={(e) => setTempSelectedFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">Tất cả phòng</option>
                {roomTypes.map((type) => (
                  <option key={type.maLoaiPhong} value={type.maLoaiPhong}>
                    {type.tenLoaiPhong}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <FaDollarSign className={styles.filterIcon} />
                <span>Giá tiền (VNĐ): {tempPriceRange[0]?.toLocaleString() || 0} - {tempPriceRange[1]?.toLocaleString() || 0}</span>
              </div>
              <div className={styles.rangeSliderContainer}>
                <input
                  type="range"
                  min="500000"
                  max="5000000"
                  step="100000"
                  value={tempPriceRange[0]}
                  onChange={(e) => setTempPriceRange([parseInt(e.target.value), tempPriceRange[1]])}
                  className={styles.rangeSlider}
                />
                <input
                  type="range"
                  min="500000"
                  max="5000000"
                  step="100000"
                  value={tempPriceRange[1]}
                  onChange={(e) => setTempPriceRange([tempPriceRange[0], parseInt(e.target.value)])}
                  className={styles.rangeSlider}
                />
                <div className={styles.priceLabels}>
                  <span>500.000đ</span>
                  <span>5.000.000đ</span>
                </div>
              </div>
            </div>

            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <FaUsers className={styles.filterIcon} />
                <span>Số người: {tempCapacity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={tempCapacity}
                onChange={(e) => setTempCapacity(parseInt(e.target.value))}
                className={styles.capacitySlider}
              />
              <div className={styles.capacityLabels}>
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div className={styles.filterCard}>
              <button
                onClick={applyFilters}
                className={styles.applyButton}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2>Danh sách các loại phòng ({sortedRoomTypes.length})</h2>
          <p>Kéo sang phải để xem thêm phòng</p>
        </div>

        {sortedRoomTypes.length === 0 ? (
          <div className={styles.noResults}>
            <Image
              src="/images/no-results.png"
              alt="Không tìm thấy phòng"
              width={200}
              height={200}
            />
            <h3>Không tìm thấy phòng phù hợp</h3>
            <p>Vui lòng thử lại với bộ lọc khác</p>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setPriceRange([500000, 5000000]);
                setCapacity(2);
                setSearchQuery('');
              }}
              className={styles.resetButton}
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className={styles.roomsWrapper}>
              <button 
                className={`${styles.navButton} ${styles.prevButton}`} 
                onClick={scrollLeft}
                aria-label="Previous rooms"
              >
                <FaChevronLeft />
              </button>
              
              <div className={styles.roomsContainer} ref={scrollContainer}>
                {sortedRoomTypes.map((roomType) => (
                  <div className={styles.roomCard} key={roomType.maLoaiPhong}>
                    <div className={styles.roomImageContainer}>
                      <Image
                        src={getValidImageSrc(roomType.thumbnail)}
                        alt={roomType.tenLoaiPhong}
                        width={400}
                        height={250}
                        className={styles.roomImage}
                      />
                      <div className={styles.ratingBadge}>
                        <FaStar className={styles.starIcon} /> 5.0
                      </div>
                    </div>
                    
                    <div className={styles.roomContent}>
                      <h3 className={styles.roomTitle}>{roomType.tenLoaiPhong}</h3>
                      <p className={styles.roomDescription}>
                        {roomType.moTa || 'Phòng với thiết kế hiện đại, đầy đủ tiện nghi cao cấp.'}
                      </p>
                      
                      <div className={styles.amenities}>
                        <div className={styles.amenity}>
                          <FaWifi />
                          <span>WiFi</span>
                        </div>
                        <div className={styles.amenity}>
                          <FaTv />
                          <span>Smart TV</span>
                        </div>
                        <div className={styles.amenity}>
                          <FaSnowflake />
                          <span>Điều hòa</span>
                        </div>
                        <div className={styles.amenity}>
                          <FaBath />
                          <span>Phòng tắm</span>
                        </div>
                      </div>
                      
                      <div className={styles.roomSpecs}>
                        <div className={styles.spec}>
                          <span className={styles.specLabel}>Diện tích</span>
                          <span className={styles.specValue}>{roomType.kichThuocPhong}m²</span>
                        </div>
                        <div className={styles.spec}>
                          <span className={styles.specLabel}>Giường</span>
                          <span className={styles.specValue}>{roomType.soGiuongNgu}</span>
                        </div>
                        <div className={styles.spec}>
                          <span className={styles.specLabel}>Khách</span>
                          <span className={styles.specValue}>{roomType.sucChua}</span>
                        </div>
                      </div>
                      
                      <div className={styles.priceContainer}>
                        <div className={styles.price}>
                          {new Intl.NumberFormat('vi-VN').format(roomType.giaMoiDem || 0)}đ
                          <span className={styles.perNight}>/đêm</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/rooms/${createRoomSlug(roomType.tenLoaiPhong, roomType.maLoaiPhong)}`}
                        className={styles.viewDetailButton}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className={`${styles.navButton} ${styles.nextButton}`} 
                onClick={scrollRight}
                aria-label="Next rooms"
              >
                <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
