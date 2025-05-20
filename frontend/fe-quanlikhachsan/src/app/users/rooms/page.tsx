'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaWifi, FaTv, FaSnowflake, FaBath, FaSearch, FaFilter, FaBed, FaDollarSign, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './styles.module.css';
import { getRoomTypes } from '../../../lib/api';
import { RoomType } from '../../../types/auth';
import { API_BASE_URL } from '../../../lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

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
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([500000, 5000000]);
  const [capacity, setCapacity] = useState(2);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Thêm trạng thái tạm thời cho bộ lọc
  const [tempSelectedFilter, setTempSelectedFilter] = useState('all');
  const [tempPriceRange, setTempPriceRange] = useState([500000, 5000000]);
  const [tempCapacity, setTempCapacity] = useState(2);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        // Gọi API lấy danh sách loại phòng từ backend
        console.log(`Đang gọi API lấy danh sách loại phòng từ: ${API_BASE_URL}/LoaiPhong`);
        const data = await getRoomTypes();
        setRoomTypes(data || []);
        console.log('Dữ liệu loại phòng nhận được:', data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách phòng:', err);
        let errorMessage = '';
        
        if (err instanceof Error) {
          errorMessage = err.message;
          
          // Kiểm tra lỗi Failed to fetch để hiển thị thông báo cụ thể hơn
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
    setShowFilters(false); // Ẩn bộ lọc sau khi áp dụng
  };

  // Lọc phòng theo bộ lọc đã chọn và từ khóa tìm kiếm
  const filteredRoomTypes = roomTypes.filter((roomType) => {
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery && !roomType.tenLoaiPhong.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Lọc theo loại phòng
    if (selectedFilter !== 'all' && selectedFilter !== roomType.maLoaiPhong) {
      return false;
    }
    
    // Lọc theo giá - kiểm tra trường giaMoiDem có tồn tại không
    if (roomType.giaMoiDem !== undefined && (roomType.giaMoiDem < priceRange[0] || roomType.giaMoiDem > priceRange[1])) {
      return false;
    }
    
    // Lọc theo số người - kiểm tra trường sucChua có tồn tại không
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
        <button onClick={() => window.location.reload()} className={styles.reloadButton}>
          Thử lại
        </button>
      </div>
    );
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>Khám phá không gian nghỉ dưỡng tuyệt vời</h1>
          <p>Tìm kiếm phòng phù hợp cho kì nghỉ hoàn hảo của bạn</p>
          
          {/* Search and filter control bar */}
          <div className={styles.searchContainer}>
            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Tìm kiếm loại phòng..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button onClick={toggleFilters} className={styles.filterToggle}>
              <FaFilter />
              <span>Bộ lọc</span>
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
      </section>

      {/* Advanced Filters Section */}
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

            {/* Nút Áp dụng */}
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

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2>Danh sách phòng ({sortedRoomTypes.length})</h2>
          <p>Sắp xếp theo giá từ thấp đến cao</p>
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
          <div className={styles.roomGrid}>
            {sortedRoomTypes.map((roomType) => (
              <div key={roomType.maLoaiPhong} className={styles.roomCard}>
                <div className={styles.roomImageContainer}>
                  <Image
                    src={getValidImageSrc(roomType.thumbnail)}
                    alt={roomType.tenLoaiPhong}
                    width={500}
                    height={300}
                    className={styles.roomImage}
                  />
                  <div className={styles.roomBadge}>{roomType.tenLoaiPhong}</div>
                  <div className={styles.roomRating}>
                    <FaStar className={styles.starIcon} />
                    <span>5.0</span>
                  </div>
                </div>
                
                <div className={styles.roomContent}>
                  <h3 className={styles.roomTitle}>{roomType.tenLoaiPhong}</h3>
                  
                  <p className={styles.roomDescription}>
                    {roomType.moTa || `Phòng ${roomType.tenLoaiPhong} sang trọng với diện tích ${roomType.kichThuocPhong || 0}m², trang bị đầy đủ tiện nghi hiện đại.`}
                  </p>
                  
                  <div className={styles.amenitiesRow}>
                    <div className={styles.amenityItem}>
                      <FaWifi className={styles.amenityIcon} />
                      <span>WiFi</span>
                    </div>
                    <div className={styles.amenityItem}>
                      <FaTv className={styles.amenityIcon} />
                      <span>Smart TV</span>
                    </div>
                    <div className={styles.amenityItem}>
                      <FaSnowflake className={styles.amenityIcon} />
                      <span>Điều hòa</span>
                    </div>
                    <div className={styles.amenityItem}>
                      <FaBath className={styles.amenityIcon} />
                      <span>Phòng tắm</span>
                    </div>
                  </div>
                  
                  <div className={styles.roomSpecifications}>
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Diện tích</span>
                      <span className={styles.specValue}>{roomType.kichThuocPhong || 0}m²</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Giường</span>
                      <span className={styles.specValue}>{roomType.soGiuongNgu || 0}</span>
                    </div>
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Khách</span>
                      <span className={styles.specValue}>{roomType.sucChua || 0}</span>
                    </div>
                  </div>
                  
                  <div className={styles.roomCardFooter}>
                    <div className={styles.priceInfo}>
                      <span className={styles.priceAmount}>{(roomType.giaMoiDem !== undefined) ? roomType.giaMoiDem.toLocaleString() : 0}đ</span>
                      <span className={styles.priceUnit}>/đêm</span>
                    </div>
                    <Link 
                      href={`/users/roomsinformation?id=${roomType.maLoaiPhong}`} 
                      className={styles.viewDetailButton}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}