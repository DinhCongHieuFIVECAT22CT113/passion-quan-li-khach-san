'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { API_BASE_URL } from '../../../lib/config';
import { getAuthHeaders, handleResponse, getBookingPromotions, getBookingServices } from '../../../lib/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './bookings.module.css';
import { FaCalendarAlt, FaBed, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSpinner, FaClock } from 'react-icons/fa';

interface Booking {
  maDatPhong: string;
  maPhong: string;
  tenPhong?: string;
  soPhong?: string;
  loaiPhong?: string;
  ngayDat: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  tongTien: number;
  giaGoc?: number;
  trangThai: string;
  phuongThucThanhToan?: string;
  ghiChu?: string;
  thoiGianDen?: string;
  treEm?: number;
  nguoiLon?: number;
  soLuongPhong?: number;
  thumbnail?: string;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'past', 'cancelled'
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [bookingPromotions, setBookingPromotions] = useState<any[]>([]);
  const [bookingServices, setBookingServices] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login?redirectUrl=/users/bookings');
      return;
    }
    
    fetchBookings();
  }, [user, authLoading, router]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Thử nhiều endpoint để lấy dữ liệu đặt phòng
      const headers = await getAuthHeaders();
      let data = null;

      // Thử endpoint đầu tiên - lấy đặt phòng của khách hàng hiện tại
      try {
        const response1 = await fetch(`${API_BASE_URL}/DatPhong/KhachHang`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });
        data = await handleResponse(response1);
        console.log('Dữ liệu từ /DatPhong/KhachHang:', data);
        console.log('User maNguoiDung khi gọi API:', user?.maNguoiDung);

        // Nếu endpoint này trả về tất cả đặt phòng, cần lọc theo user
        if (Array.isArray(data) && user?.maNguoiDung) {
          const originalLength = data.length;
          data = data.filter(booking => {
            const bookingMaKH = booking.maKH || booking.MaKH;
            return bookingMaKH === user.maNguoiDung;
          });
          console.log(`Lọc từ ${originalLength} xuống ${data.length} đặt phòng cho user ${user.maNguoiDung}`);
        }
      } catch (err) {
        console.warn('Endpoint /DatPhong/KhachHang không hoạt động:', err);

        // Thử endpoint thứ hai
        try {
          const response2 = await fetch(`${API_BASE_URL}/DatPhong`, {
            method: 'GET',
            headers,
            credentials: 'include'
          });
          const allBookings = await handleResponse(response2);
          console.log('Dữ liệu từ /DatPhong (tất cả):', allBookings);

          // Lọc chỉ lấy đặt phòng của user hiện tại
          if (Array.isArray(allBookings) && user?.maNguoiDung) {
            data = allBookings.filter(booking => {
              const bookingMaKH = booking.maKH || booking.MaKH;
              console.log(`So sánh: ${bookingMaKH} === ${user.maNguoiDung}`);
              return bookingMaKH === user.maNguoiDung;
            });
            console.log('Đặt phòng của user hiện tại:', data);
            console.log('User maNguoiDung:', user.maNguoiDung);
          }
        } catch (err2) {
          console.error('Cả hai endpoint đều không hoạt động:', err2);
          throw new Error('Không thể lấy dữ liệu đặt phòng');
        }
      }

      console.log('Dữ liệu đặt phòng cuối cùng:', data);
      console.log('Số lượng đặt phòng:', Array.isArray(data) ? data.length : 'Không phải mảng');
      
      // Xử lý dữ liệu đặt phòng với mapping đúng từ API
      const processedBookings = await Promise.all(Array.isArray(data) && data.length > 0 ? data.map(async (booking: any) => {
        console.log('Processing booking:', booking);

        // Lấy chi tiết đặt phòng để có thông tin phòng
        let roomData = null;
        let roomTypeData = null;
        let maPhong = null;

        try {
          // Thử lấy chi tiết đặt phòng từ nhiều endpoint
          let chiTietData = null;
          const maDatPhong = booking.maDatPhong || booking.MaDatPhong;

          // Thử endpoint 1: /ChiTietDatPhong/DatPhong/{id}
          try {
            const chiTietResponse = await fetch(`${API_BASE_URL}/ChiTietDatPhong/DatPhong/${maDatPhong}`, {
              method: 'GET',
              headers,
              credentials: 'include'
            });
            chiTietData = await handleResponse(chiTietResponse);
            console.log('Chi tiết đặt phòng từ endpoint 1:', chiTietData);
          } catch (err) {
            console.warn('Endpoint 1 không hoạt động, thử endpoint 2');

            // Thử endpoint 2: /ChiTietDatPhong và lọc theo maDatPhong
            try {
              const allChiTietResponse = await fetch(`${API_BASE_URL}/ChiTietDatPhong`, {
                method: 'GET',
                headers,
                credentials: 'include'
              });
              const allChiTietData = await handleResponse(allChiTietResponse);
              if (Array.isArray(allChiTietData)) {
                chiTietData = allChiTietData.filter(ct =>
                  (ct.maDatPhong || ct.MaDatPhong) === maDatPhong
                );
                console.log('Chi tiết đặt phòng từ endpoint 2:', chiTietData);
              }
            } catch (err2) {
              console.warn('Cả hai endpoint chi tiết đặt phòng đều không hoạt động:', err2);
            }
          }

          if (Array.isArray(chiTietData) && chiTietData.length > 0) {
            const chiTiet = chiTietData[0]; // Lấy chi tiết đầu tiên
            maPhong = chiTiet.maPhong || chiTiet.MaPhong;
            console.log('Mã phòng từ chi tiết:', maPhong);

            // Lấy thông tin phòng nếu có maPhong
            if (maPhong) {
              try {
                const roomResponse = await fetch(`${API_BASE_URL}/Phong/${maPhong}`, {
                  method: 'GET',
                  headers,
                  credentials: 'include'
                });
                roomData = await handleResponse(roomResponse);
                console.log('Thông tin phòng:', roomData);

                // Lấy thông tin loại phòng
                const maLoaiPhong = roomData?.maLoaiPhong || roomData?.MaLoaiPhong;
                if (maLoaiPhong) {
                  try {
                    const roomTypeResponse = await fetch(`${API_BASE_URL}/LoaiPhong/${maLoaiPhong}`, {
                      method: 'GET',
                      headers,
                      credentials: 'include'
                    });
                    roomTypeData = await handleResponse(roomTypeResponse);
                    console.log('Thông tin loại phòng:', roomTypeData);
                  } catch (err) {
                    console.warn(`Không thể lấy thông tin loại phòng ${maLoaiPhong}:`, err);
                  }
                }
              } catch (err) {
                console.warn(`Không thể lấy thông tin phòng ${maPhong}:`, err);
              }
            }
          } else {
            console.warn('Không tìm thấy chi tiết đặt phòng cho:', maDatPhong);
          }
        } catch (err) {
          console.warn(`Lỗi khi lấy chi tiết đặt phòng ${booking.maDatPhong || booking.MaDatPhong}:`, err);
        }

        // Tạo tên phòng thông minh
        const soPhong = roomData?.soPhong || roomData?.SoPhong;
        const tenPhong = roomData?.tenPhong || roomData?.TenPhong ||
                        (soPhong ? `Phòng ${soPhong}` :
                        (maPhong ? `Phòng ${maPhong}` : 'Phòng không xác định'));

        // Tạo tên loại phòng
        const tenLoaiPhong = roomTypeData?.tenLoaiPhong || roomTypeData?.TenLoaiPhong ||
                            (roomData?.maLoaiPhong || roomData?.MaLoaiPhong ?
                            `Loại ${roomData.maLoaiPhong || roomData.MaLoaiPhong}` :
                            'Loại phòng không xác định');

        return {
          maDatPhong: booking.maDatPhong || booking.MaDatPhong || 'N/A',
          maPhong: maPhong || booking.maPhong || booking.MaPhong || 'N/A',
          tenPhong: tenPhong,
          soPhong: soPhong || maPhong || 'N/A',
          loaiPhong: tenLoaiPhong,
          ngayDat: booking.ngayTao || booking.NgayTao || booking.ngayDat || booking.NgayDat || new Date().toISOString(),
          ngayBatDau: booking.ngayNhanPhong || booking.NgayNhanPhong || booking.ngayBatDau || booking.NgayBatDau,
          ngayKetThuc: booking.ngayTraPhong || booking.NgayTraPhong || booking.ngayKetThuc || booking.NgayKetThuc,
          tongTien: booking.tongTien || booking.TongTien || 0,
          giaGoc: booking.giaGoc || booking.GiaGoc || 0,
          trangThai: booking.trangThai || booking.TrangThai || 'Chờ xác nhận',
          phuongThucThanhToan: booking.phuongThucThanhToan || booking.PhuongThucThanhToan || 'Chưa xác định',
          ghiChu: booking.ghiChu || booking.GhiChu || '',
          thoiGianDen: booking.thoiGianDen || booking.ThoiGianDen || '14:00',
          treEm: booking.treEm || booking.TreEm || 0,
          nguoiLon: booking.nguoiLon || booking.NguoiLon || 1,
          soLuongPhong: booking.soLuongPhong || booking.SoLuongPhong || 1,
          thumbnail: roomData?.thumbnail || roomData?.Thumbnail || roomTypeData?.thumbnail || roomTypeData?.Thumbnail
        };
      }) : []);

      console.log('Đặt phòng đã xử lý:', processedBookings);
      console.log('Số lượng đặt phòng sau xử lý:', processedBookings.length);

      setBookings(processedBookings);

      if (processedBookings.length === 0) {
        console.log('=== DEBUG: Không có đặt phòng nào ===');
        console.log('User hiện tại:', user);
        console.log('User maNguoiDung:', user?.maNguoiDung);
        console.log('Dữ liệu gốc từ API:', data);
        console.log('Số lượng dữ liệu gốc:', Array.isArray(data) ? data.length : 'Không phải mảng');
        if (Array.isArray(data) && data.length > 0) {
          console.log('Mẫu đặt phòng đầu tiên:', data[0]);
          console.log('Các mã khách hàng trong dữ liệu:', data.map(b => b.maKH || b.MaKH));
        }
      } else {
        console.log('=== DEBUG: Tìm thấy đặt phòng ===');
        console.log('Số lượng đặt phòng sau lọc:', processedBookings.length);
        console.log('Mẫu đặt phòng đầu tiên:', processedBookings[0]);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đặt phòng:', err);
      setError('Không thể tải danh sách đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'confirmed':
        return styles.confirmed;
      case 'đang chờ':
      case 'chờ xác nhận':
      case 'đã đặt':
      case 'pending':
        return styles.pending;
      case 'đã hủy':
      case 'cancelled':
        return styles.cancelled;
      case 'đã hoàn thành':
      case 'đã trả phòng':
      case 'completed':
        return styles.completed;
      case 'đang ở':
      case 'checked-in':
        return styles.checkedIn;
      default:
        return styles.default;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'đã hoàn thành':
      case 'đã trả phòng':
      case 'confirmed':
      case 'completed':
        return <FaCheckCircle />;
      case 'đang chờ':
      case 'chờ xác nhận':
      case 'đã đặt':
      case 'pending':
        return <FaSpinner />;
      case 'đã hủy':
      case 'cancelled':
        return <FaTimesCircle />;
      case 'đang ở':
      case 'checked-in':
        return <FaBed />;
      default:
        return <FaCalendarAlt />;
    }
  };

  const filterBookings = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(booking => {
          const endDate = new Date(booking.ngayKetThuc);
          return endDate >= now && booking.trangThai.toLowerCase() !== 'đã hủy';
        });
      case 'past':
        return bookings.filter(booking => {
          const endDate = new Date(booking.ngayKetThuc);
          return endDate < now && booking.trangThai.toLowerCase() !== 'đã hủy';
        });
      case 'cancelled':
        return bookings.filter(booking => 
          booking.trangThai.toLowerCase() === 'đã hủy'
        );
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  // Hàm mở popup chi tiết
  const openDetailModal = async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);

    try {
      // Load khuyến mãi và dịch vụ song song
      const [promotions, services] = await Promise.all([
        getBookingPromotions(booking.maDatPhong),
        getBookingServices(booking.maDatPhong)
      ]);

      setBookingPromotions(promotions);
      setBookingServices(services);
      console.log('Loaded user booking details:', { promotions, services });
    } catch (error) {
      console.error('Error loading user booking details:', error);
      setBookingPromotions([]);
      setBookingServices([]);
    }
  };

  // Hàm đóng popup chi tiết
  const closeDetailModal = () => {
    setSelectedBooking(null);
    setShowDetailModal(false);
    setBookingPromotions([]);
    setBookingServices([]);
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Đặt phòng của tôi</h1>
          <p>Quản lý tất cả các đặt phòng của bạn tại đây</p>
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Sắp tới
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'past' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Đã qua
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'cancelled' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Đã hủy
          </button>
        </div>
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu đặt phòng...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
            <button onClick={fetchBookings} className={styles.retryButton}>
              Thử lại
            </button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <FaCalendarAlt />
            </div>
            <h3>Không có đặt phòng nào</h3>
            <p>Bạn chưa có đặt phòng nào trong danh mục này</p>
            <button 
              onClick={() => router.push('/users/rooms')}
              className={styles.browseRoomsButton}
            >
              Tìm phòng ngay
            </button>
          </div>
        ) : (
          <div className={styles.bookingsList}>
            {filteredBookings.map(booking => (
              <div key={booking.maDatPhong} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingId}>
                    <span>Mã đặt phòng:</span> {booking.maDatPhong}
                  </div>
                  <div className={`${styles.bookingStatus} ${getStatusClass(booking.trangThai)}`}>
                    {getStatusIcon(booking.trangThai)} {booking.trangThai}
                  </div>
                </div>
                
                <div className={styles.bookingDetails}>
                  <div className={styles.roomInfo}>
                    <h3>{booking.tenPhong || `Phòng ${booking.soPhong}`}</h3>
                    <p className={styles.roomType}>
                      <FaBed /> {booking.loaiPhong}
                    </p>
                  </div>
                  
                  <div className={styles.dateInfo}>
                    <div>
                      <span>Ngày đặt:</span> {formatDate(booking.ngayDat)}
                    </div>
                    <div>
                      <span>Nhận phòng:</span> {formatDate(booking.ngayBatDau)}
                    </div>
                    <div>
                      <span>Trả phòng:</span> {formatDate(booking.ngayKetThuc)}
                    </div>
                    <div>
                      <span>Thời gian đến:</span> {booking.thoiGianDen || '14:00'}
                    </div>
                  </div>
                  
                  <div className={styles.paymentInfo}>
                    <div className={styles.totalPrice}>
                      <FaMoneyBillWave /> {formatCurrency(booking.tongTien)}
                    </div>
                    <div className={styles.paymentMethod}>
                      {booking.phuongThucThanhToan}
                    </div>
                  </div>
                </div>
                
                {booking.ghiChu && (
                  <div className={styles.bookingNotes}>
                    <span>Ghi chú:</span> {booking.ghiChu}
                  </div>
                )}
                
                <div className={styles.bookingActions}>
                  <button
                    className={styles.viewDetailsButton}
                    onClick={() => openDetailModal(booking)}
                  >
                    Xem chi tiết
                  </button>
                  
                  {booking.trangThai.toLowerCase() !== 'đã hủy' && 
                   booking.trangThai.toLowerCase() !== 'đã hoàn thành' && 
                   new Date(booking.ngayBatDau) > new Date() && (
                    <button className={styles.cancelButton}>
                      Hủy đặt phòng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal chi tiết đặt phòng */}
      {showDetailModal && selectedBooking && (
        <div className={styles.modalOverlay} onClick={closeDetailModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Chi tiết đặt phòng</h2>
              <button className={styles.closeButton} onClick={closeDetailModal}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Thông tin đặt phòng</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Mã đặt phòng:</span>
                    <span className={styles.detailValue}>{selectedBooking.maDatPhong}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trạng thái:</span>
                    <span className={`${styles.detailValue} ${styles.statusBadge} ${getStatusClass(selectedBooking.trangThai)}`}>
                      {getStatusIcon(selectedBooking.trangThai)} {selectedBooking.trangThai}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Ngày đặt:</span>
                    <span className={styles.detailValue}>{formatDate(selectedBooking.ngayDat)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Thông tin phòng</h3>
                <div className={styles.roomDetailCard}>
                  {selectedBooking.thumbnail && (
                    <div className={styles.roomImage}>
                      <img src={selectedBooking.thumbnail} alt={selectedBooking.tenPhong} />
                    </div>
                  )}
                  <div className={styles.roomInfo}>
                    <h4>{selectedBooking.tenPhong}</h4>
                    <p><FaBed /> {selectedBooking.loaiPhong}</p>
                    <p>Số phòng: {selectedBooking.soPhong}</p>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Thời gian lưu trú</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nhận phòng:</span>
                    <span className={styles.detailValue}>{formatDate(selectedBooking.ngayBatDau)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trả phòng:</span>
                    <span className={styles.detailValue}>{formatDate(selectedBooking.ngayKetThuc)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Thời gian đến:</span>
                    <span className={styles.detailValue}>{selectedBooking.thoiGianDen}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Số đêm:</span>
                    <span className={styles.detailValue}>
                      {Math.ceil((new Date(selectedBooking.ngayKetThuc).getTime() - new Date(selectedBooking.ngayBatDau).getTime()) / (1000 * 60 * 60 * 24))} đêm
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Thông tin khách</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Người lớn:</span>
                    <span className={styles.detailValue}>{selectedBooking.nguoiLon} người</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Trẻ em:</span>
                    <span className={styles.detailValue}>{selectedBooking.treEm} trẻ</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Số phòng:</span>
                    <span className={styles.detailValue}>{selectedBooking.soLuongPhong} phòng</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Thông tin thanh toán</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Giá gốc:</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedBooking.giaGoc || 0)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Tổng tiền:</span>
                    <span className={`${styles.detailValue} ${styles.totalPrice}`}>{formatCurrency(selectedBooking.tongTien)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phương thức:</span>
                    <span className={styles.detailValue}>{selectedBooking.phuongThucThanhToan}</span>
                  </div>
                </div>
              </div>

              {/* Khuyến mãi đã áp dụng */}
              {bookingPromotions.length > 0 && (
                <div className={styles.detailSection}>
                  <h3 style={{color: '#e74c3c'}}>🏷️ Khuyến mãi đã áp dụng</h3>
                  {bookingPromotions.map((promotion, index) => (
                    <div key={index} className={styles.promotionCard}>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Tên khuyến mãi:</span>
                          <span className={styles.detailValue}>{promotion.tenKhuyenMai || promotion.TenKhuyenMai || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Mã giảm giá:</span>
                          <span className={styles.detailValue}>{promotion.maGiamGia || promotion.MaGiamGia || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Số tiền giảm:</span>
                          <span className={styles.detailValue} style={{color: '#e74c3c', fontWeight: '700'}}>
                            -{formatCurrency(promotion.soTienGiam || promotion.SoTienGiam || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dịch vụ đã sử dụng */}
              {bookingServices.length > 0 && (
                <div className={styles.detailSection}>
                  <h3 style={{color: '#3498db'}}>🛎️ Dịch vụ đã sử dụng</h3>
                  {bookingServices.map((service, index) => (
                    <div key={index} className={styles.serviceCard}>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Tên dịch vụ:</span>
                          <span className={styles.detailValue}>{service.tenDichVu || service.TenDichVu || 'N/A'}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Số lượng:</span>
                          <span className={styles.detailValue}>{service.soLuong || service.SoLuong || 0}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Đơn giá:</span>
                          <span className={styles.detailValue}>{formatCurrency(service.donGia || service.DonGia || 0)}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Thành tiền:</span>
                          <span className={styles.detailValue} style={{color: '#27ae60', fontWeight: '700'}}>
                            {formatCurrency((service.soLuong || service.SoLuong || 0) * (service.donGia || service.DonGia || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tổng kết chi phí nếu có khuyến mãi hoặc dịch vụ */}
              {(bookingPromotions.length > 0 || bookingServices.length > 0) && (
                <div className={styles.detailSection}>
                  <h3 style={{color: '#2c3e50'}}>💰 Tổng kết chi phí</h3>
                  <div className={styles.priceBreakdown}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Tiền phòng gốc:</span>
                      <span className={styles.detailValue}>{formatCurrency(selectedBooking.giaGoc || selectedBooking.tongTien)}</span>
                    </div>
                    {bookingServices.length > 0 && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tổng tiền dịch vụ:</span>
                        <span className={styles.detailValue} style={{color: '#3498db'}}>
                          +{formatCurrency(bookingServices.reduce((total, service) =>
                            total + ((service.soLuong || service.SoLuong || 0) * (service.donGia || service.DonGia || 0)), 0
                          ))}
                        </span>
                      </div>
                    )}
                    {bookingPromotions.length > 0 && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Tổng giảm giá:</span>
                        <span className={styles.detailValue} style={{color: '#e74c3c'}}>
                          -{formatCurrency(bookingPromotions.reduce((total, promotion) =>
                            total + (promotion.soTienGiam || promotion.SoTienGiam || 0), 0
                          ))}
                        </span>
                      </div>
                    )}
                    <div className={styles.detailItem} style={{borderTop: '2px solid #dee2e6', paddingTop: '1rem', marginTop: '1rem'}}>
                      <span className={styles.detailLabel} style={{fontWeight: '700', fontSize: '1.1rem'}}>Tổng thanh toán:</span>
                      <span className={styles.detailValue} style={{fontWeight: '700', fontSize: '1.1rem', color: '#27ae60'}}>
                        {formatCurrency(
                          (selectedBooking.giaGoc || selectedBooking.tongTien) +
                          bookingServices.reduce((total, service) =>
                            total + ((service.soLuong || service.SoLuong || 0) * (service.donGia || service.DonGia || 0)), 0
                          ) -
                          bookingPromotions.reduce((total, promotion) =>
                            total + (promotion.soTienGiam || promotion.SoTienGiam || 0), 0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.ghiChu && (
                <div className={styles.detailSection}>
                  <h3>Ghi chú</h3>
                  <p className={styles.noteText}>{selectedBooking.ghiChu}</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.closeModalButton} onClick={closeDetailModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}