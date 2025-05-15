'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaWifi, FaTv, FaSnowflake, FaBath, FaUser } from 'react-icons/fa';
import styles from './styles.module.css';
import { getRooms, getRoomTypes } from '../../../lib/api';
import { Room, RoomType } from '../../../types/auth';
import { API_BASE_URL } from '../../../lib/config';

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([500000, 5000000]);
  const [capacity, setCapacity] = useState(2);

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

  // Lọc phòng theo bộ lọc đã chọn
  const filteredRoomTypes = roomTypes.filter((roomType) => {
    if (selectedFilter !== 'all' && selectedFilter !== roomType.maLoaiPhong) {
      return false;
    }
    
    // Lọc theo giá
    if (roomType.donGia < priceRange[0] || roomType.donGia > priceRange[1]) {
      return false;
    }
    
    // Lọc theo số người
    if (roomType.soNguoi < capacity) {
      return false;
    }
    
    return true;
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

  return (
    <div className={styles.roomsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.navLeft}>
        <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
        </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/users/home">Trang chủ</Link>
          <Link href="/users/about">Giới thiệu</Link>
          <Link href="/users/explore">Khám phá</Link>
          <Link href="/users/rooms" className={styles.active}>Phòng</Link>
        </div>
        <div className={styles.navRight}>
          <Link href="/users/profile" className={styles.profileIcon}>
            <FaUser />
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <div className={styles.pageTitle}>
        <h1>Danh sách phòng</h1>
        <p>Khám phá các loại phòng sang trọng và tiện nghi của chúng tôi</p>
      </div>

      {/* Filters */}
      <div className={styles.filtersWrapper}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Loại phòng</label>
            <select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={styles.selectFilter}
            >
              <option value="all">Tất cả phòng</option>
              {roomTypes.map((type) => (
                <option key={type.maLoaiPhong} value={type.maLoaiPhong}>
                  {type.tenLoaiPhong}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Giá tiền (VNĐ): {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}</label>
            <div className={styles.rangeContainer}>
              <input
                type="range"
                min="500000"
                max="5000000"
                step="100000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className={styles.rangeInput}
              />
              <input
                type="range"
                min="500000"
                max="5000000"
                step="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className={styles.rangeInput}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Số người: {capacity}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
        </div>
      </div>

      {/* Room List */}
      <div className={styles.roomList}>
        {filteredRoomTypes.length === 0 ? (
          <div className={styles.noResults}>
            <h3>Không tìm thấy phòng phù hợp</h3>
            <p>Vui lòng thử lại với bộ lọc khác</p>
          </div>
        ) : (
          filteredRoomTypes.map((roomType) => (
            <div key={roomType.maLoaiPhong} className={styles.roomCard}>
            <div className={styles.roomImage}>
                <Image
                  src={roomType.hinhAnh || "/images/room-placeholder.jpg"}
                  alt={roomType.tenLoaiPhong}
                  width={400}
                  height={250}
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.roomBadge}>{roomType.tenLoaiPhong}</div>
              </div>
              <div className={styles.roomContent}>
                <h3>{roomType.tenLoaiPhong}</h3>
                <div className={styles.roomRating}>
                  <div className={styles.stars}>
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
            </div>
                  <span>5.0</span>
                </div>
                <p className={styles.roomDescription}>
                  {roomType.moTa || `Phòng ${roomType.tenLoaiPhong} sang trọng với diện tích ${roomType.dienTich}m², trang bị đầy đủ tiện nghi hiện đại.`}
                </p>
                <div className={styles.amenities}>
                  <div className={styles.amenity}><FaWifi /> WiFi miễn phí</div>
                  <div className={styles.amenity}><FaTv /> Smart TV</div>
                  <div className={styles.amenity}><FaSnowflake /> Điều hòa</div>
                  <div className={styles.amenity}><FaBath /> Bồn tắm</div>
                </div>
                <div className={styles.roomDetails}>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Diện tích</span>
                    <span className={styles.detailValue}>{roomType.dienTich}m²</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Số giường</span>
                    <span className={styles.detailValue}>{roomType.soGiuong}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>Số người</span>
                    <span className={styles.detailValue}>{roomType.soNguoi}</span>
                  </div>
                </div>
                <div className={styles.roomFooter}>
                  <div className={styles.roomPrice}>
                    <span className={styles.price}>{roomType.donGia.toLocaleString()} VNĐ</span>
                    <span className={styles.perNight}>/đêm</span>
                  </div>
                  <Link 
                    href={`/users/roomsinformation?type=${roomType.maLoaiPhong}`} 
                    className={styles.viewDetailsButton}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
          </div>
          ))
        )}
        </div>
    </div>
  );
}