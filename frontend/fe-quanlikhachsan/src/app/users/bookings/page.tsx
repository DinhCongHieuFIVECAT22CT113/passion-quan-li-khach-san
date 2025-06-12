'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { API_BASE_URL } from '../../../lib/config';
import { getAuthHeaders, handleResponse, getBookingPromotions, getBookingServices } from '../../../lib/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import styles from './bookings.module.css';
import { FaCalendarAlt, FaBed, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

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
  const [newBookingId, setNewBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login?redirectUrl=/users/bookings');
      return;
    }

    fetchBookings();
  }, [user, authLoading, router]);

  // Auto-refresh khi user quay lại trang (chỉ khi cần thiết)
  useEffect(() => {
    const handleFocus = () => {
      // Chỉ refresh nếu đã có user và không đang loading
      if (!isLoading && user && bookings.length === 0) {
        console.log('🔄 Page focus - refreshing bookings');
        fetchBookings();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoading, user, bookings.length]); // Thêm bookings.length để tránh refresh không cần thiết

  // Kiểm tra có đặt phòng mới không (từ URL params hoặc localStorage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newBooking = urlParams.get('newBooking');
    const savedNewBooking = localStorage.getItem('newBookingId');

    if (newBooking || savedNewBooking) {
      setNewBookingId(newBooking || savedNewBooking);

      // Xóa khỏi localStorage sau khi đã hiển thị
      if (savedNewBooking) {
        localStorage.removeItem('newBookingId');
      }

      // Tự động xóa highlight sau 10 giây
      setTimeout(() => {
        setNewBookingId(null);
      }, 10000);
    }
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Fetching bookings for user:', user?.maNguoiDung);

      // Sử dụng API đã được cải thiện - trả về đầy đủ thông tin
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/DatPhong/KhachHang`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      const data = await handleResponse(response);
      console.log('📊 Dữ liệu đặt phòng từ API:', data);

      if (!Array.isArray(data)) {
        console.warn('⚠️ API không trả về mảng:', data);
        setBookings([]);
        return;
      }

      // Xử lý dữ liệu đặt phòng - API đã trả về đầy đủ thông tin
      const processedBookings = data.map((booking: any) => {
        console.log('📝 Processing booking:', booking);

        return {
          maDatPhong: booking.maDatPhong || 'N/A',
          maPhong: booking.maPhong || 'N/A',
          tenPhong: booking.tenPhong || (booking.soPhong ? `Phòng ${booking.soPhong}` : 'Phòng không xác định'),
          soPhong: booking.soPhong || booking.maPhong || 'N/A',
          loaiPhong: booking.tenLoaiPhong || 'Loại phòng không xác định',
          ngayDat: booking.ngayTao || new Date().toISOString(),
          ngayBatDau: booking.ngayNhanPhong,
          ngayKetThuc: booking.ngayTraPhong,
          tongTien: booking.tongTien || 0,
          giaGoc: booking.giaMoiDem || 0,
          trangThai: booking.trangThai || 'Chưa xác nhận',
          phuongThucThanhToan: booking.trangThaiThanhToan || 'Chưa xác định',
          ghiChu: booking.ghiChu || '',
          thoiGianDen: booking.thoiGianDen || '14:00',
          treEm: booking.treEm || 0,
          nguoiLon: booking.nguoiLon || 1,
          soLuongPhong: booking.soLuongPhong || 1,
          thumbnail: undefined // Có thể thêm sau nếu cần
        };
      });

      console.log(`✅ Processed ${processedBookings.length} bookings`);
      if (processedBookings.length > 0) {
        console.log('📋 Sample booking:', processedBookings[0]);
      }

      setBookings(processedBookings);
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
    const normalizedStatus = status.toLowerCase().trim();
    switch (normalizedStatus) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'confirmed':
      case 'xác nhận':
        return styles.confirmed;
      case 'đang chờ':
      case 'chờ xác nhận':
      case 'đã đặt':
      case 'pending':
      case 'chờ':
        return styles.pending;
      case 'đã hủy':
      case 'cancelled':
      case 'hủy':
        return styles.cancelled;
      case 'đã hoàn thành':
      case 'đã trả phòng':
      case 'completed':
      case 'hoàn thành':
        return styles.completed;
      case 'đang ở':
      case 'checked-in':
      case 'đã nhận phòng':
        return styles.checkedIn;
      default:
        // Mặc định cho trạng thái mới/chưa xác nhận
        return styles.pending;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toLowerCase().trim();
    switch (normalizedStatus) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'đã hoàn thành':
      case 'đã trả phòng':
      case 'confirmed':
      case 'completed':
      case 'xác nhận':
      case 'hoàn thành':
        return <FaCheckCircle />;
      case 'đang chờ':
      case 'chờ xác nhận':
      case 'đã đặt':
      case 'pending':
      case 'chờ':
        return <FaClock className={styles.spinningIcon} />;
      case 'đã hủy':
      case 'cancelled':
      case 'hủy':
        return <FaTimesCircle />;
      case 'đang ở':
      case 'checked-in':
      case 'đã nhận phòng':
        return <FaBed />;
      default:
        return <FaClock className={styles.spinningIcon} />;
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
              <div
                key={booking.maDatPhong}
                className={`${styles.bookingCard} ${newBookingId === booking.maDatPhong ? styles.newBookingHighlight : ''}`}
              >
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
                    <h4>{selectedBooking.tenPhong || `Phòng ${selectedBooking.soPhong}` || 'Phòng không xác định'}</h4>
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