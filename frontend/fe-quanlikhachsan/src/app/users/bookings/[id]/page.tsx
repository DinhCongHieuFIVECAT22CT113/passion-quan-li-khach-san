'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../../lib/auth';
import { API_BASE_URL } from '../../../../lib/config';
import { getAuthHeaders, handleResponse } from '../../../../lib/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import styles from './bookingDetail.module.css';
import { FaCalendarAlt, FaBed, FaUsers, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaSpinner, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaIdCard, FaFileAlt } from 'react-icons/fa';

interface BookingDetail {
  maDatPhong: string;
  maPhong: string;
  tenPhong?: string;
  soPhong?: string;
  loaiPhong?: string;
  ngayDat: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  thoiGianDen: string;
  tongTien: number;
  trangThai: string;
  phuongThucThanhToan: string;
  ghiChu?: string;
  hoKh?: string;
  tenKh?: string;
  email?: string;
  soDienThoai?: string;
  soCccd?: string;
  soNguoiLon: number;
  soTreEm: number;
  anhPhong?: string;
  diaChi?: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const bookingId = params?.id as string;

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login?redirectUrl=/users/bookings/' + bookingId);
      return;
    }
    
    fetchBookingDetails();
  }, [user, authLoading, bookingId, router]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/DatPhong/${bookingId}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      console.log('Chi tiết đặt phòng:', data);
      
      // Lấy thông tin phòng
      const roomResponse = await fetch(`${API_BASE_URL}/Phong/${data.maPhong}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      let roomData = null;
      try {
        roomData = await handleResponse(roomResponse);
      } catch (err) {
        console.warn(`Không thể lấy thông tin phòng ${data.maPhong}:`, err);
      }
      
      setBooking({
        ...data,
        tenPhong: roomData?.tenPhong || 'Phòng không xác định',
        soPhong: roomData?.soPhong || 'N/A',
        loaiPhong: roomData?.tenLoaiPhong || 'Loại phòng không xác định',
        anhPhong: roomData?.anhPhong || '/placeholder-room.jpg'
      });
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết đặt phòng:', err);
      setError('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đặt phòng');
      return;
    }
    
    try {
      setIsCancelling(true);
      
      const headers = await getAuthHeaders('POST');
      const response = await fetch(`${API_BASE_URL}/DatPhong/cancel/${bookingId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ lyDo: cancelReason }),
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Cập nhật trạng thái đặt phòng
      setCancelModalOpen(false);
      fetchBookingDetails();
      alert('Đã hủy đặt phòng thành công');
    } catch (err) {
      console.error('Lỗi khi hủy đặt phòng:', err);
      alert('Không thể hủy đặt phòng. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
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
        return styles.confirmed;
      case 'đang chờ':
      case 'chờ xác nhận':
        return styles.pending;
      case 'đã hủy':
        return styles.cancelled;
      case 'đã hoàn thành':
        return styles.completed;
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'đã xác nhận':
      case 'đã thanh toán':
      case 'đã hoàn thành':
        return <FaCheckCircle />;
      case 'đang chờ':
      case 'chờ xác nhận':
        return <FaSpinner />;
      case 'đã hủy':
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.ngayBatDau);
    const checkOut = new Date(booking.ngayKetThuc);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const canCancel = () => {
    if (!booking) return false;
    
    const now = new Date();
    const checkIn = new Date(booking.ngayBatDau);
    const status = booking.trangThai.toLowerCase();
    
    // Chỉ có thể hủy nếu trạng thái là đang chờ hoặc đã xác nhận
    // và thời gian nhận phòng chưa đến
    return (status === 'đang chờ' || status === 'chờ xác nhận' || status === 'đã xác nhận') 
      && checkIn > now;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Đang tải thông tin đặt phòng...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <p>{error || 'Không tìm thấy thông tin đặt phòng'}</p>
            <div className={styles.actionButtons}>
              <button onClick={fetchBookingDetails} className={styles.retryButton}>
                Thử lại
              </button>
              <button onClick={() => router.push('/users/bookings')} className={styles.backButton}>
                Quay lại danh sách đặt phòng
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1>Chi tiết đặt phòng</h1>
          <div className={styles.bookingId}>
            Mã đặt phòng: <span>{booking.maDatPhong}</span>
          </div>
          <div className={`${styles.bookingStatus} ${getStatusClass(booking.trangThai)}`}>
            {getStatusIcon(booking.trangThai)} {booking.trangThai}
          </div>
        </div>
        
        <div className={styles.bookingDetailContainer}>
          <div className={styles.roomSection}>
            <div className={styles.roomImage}>
              <Image 
                src={booking.anhPhong || '/placeholder-room.jpg'} 
                alt={booking.tenPhong || 'Phòng'} 
                width={500} 
                height={300} 
                className={styles.roomPhoto}
              />
            </div>
            
            <div className={styles.roomInfo}>
              <h2>{booking.tenPhong || `Phòng ${booking.soPhong}`}</h2>
              <p className={styles.roomType}>
                <FaBed /> {booking.loaiPhong}
              </p>
              <p className={styles.roomNumber}>
                <FaMapMarkerAlt /> Phòng số: {booking.soPhong}
              </p>
              
              <div className={styles.stayDetails}>
                <div className={styles.stayItem}>
                  <FaCalendarAlt />
                  <div>
                    <span>Nhận phòng:</span>
                    <strong>{formatDate(booking.ngayBatDau)}</strong>
                    <small>Từ {booking.thoiGianDen || '14:00'}</small>
                  </div>
                </div>
                
                <div className={styles.stayItem}>
                  <FaCalendarAlt />
                  <div>
                    <span>Trả phòng:</span>
                    <strong>{formatDate(booking.ngayKetThuc)}</strong>
                    <small>Trước 12:00</small>
                  </div>
                </div>
                
                <div className={styles.stayItem}>
                  <FaClock />
                  <div>
                    <span>Thời gian lưu trú:</span>
                    <strong>{calculateNights()} đêm</strong>
                  </div>
                </div>
                
                <div className={styles.stayItem}>
                  <FaUsers />
                  <div>
                    <span>Số khách:</span>
                    <strong>{booking.soNguoiLon} người lớn, {booking.soTreEm} trẻ em</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.detailsGrid}>
            <div className={styles.guestSection}>
              <h3>Thông tin khách hàng</h3>
              <div className={styles.guestInfo}>
                <div className={styles.infoItem}>
                  <FaIdCard />
                  <div>
                    <span>Họ tên:</span>
                    <strong>{booking.hoKh} {booking.tenKh}</strong>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaEnvelope />
                  <div>
                    <span>Email:</span>
                    <strong>{booking.email}</strong>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaPhone />
                  <div>
                    <span>Số điện thoại:</span>
                    <strong>{booking.soDienThoai}</strong>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaIdCard />
                  <div>
                    <span>Số CCCD:</span>
                    <strong>{booking.soCccd}</strong>
                  </div>
                </div>
                
                {booking.diaChi && (
                  <div className={styles.infoItem}>
                    <FaMapMarkerAlt />
                    <div>
                      <span>Địa chỉ:</span>
                      <strong>{booking.diaChi}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.paymentSection}>
              <h3>Thông tin thanh toán</h3>
              <div className={styles.paymentInfo}>
                <div className={styles.infoItem}>
                  <FaCalendarAlt />
                  <div>
                    <span>Ngày đặt phòng:</span>
                    <strong>{formatDate(booking.ngayDat)}</strong>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaMoneyBillWave />
                  <div>
                    <span>Tổng tiền:</span>
                    <strong className={styles.totalPrice}>{formatCurrency(booking.tongTien)}</strong>
                  </div>
                </div>
                
                <div className={styles.infoItem}>
                  <FaMoneyBillWave />
                  <div>
                    <span>Phương thức thanh toán:</span>
                    <strong>{booking.phuongThucThanhToan}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {booking.ghiChu && (
            <div className={styles.notesSection}>
              <h3>Ghi chú</h3>
              <div className={styles.noteContent}>
                <FaFileAlt />
                <p>{booking.ghiChu}</p>
              </div>
            </div>
          )}
          
          <div className={styles.actionButtons}>
            <button 
              onClick={() => router.push('/users/bookings')}
              className={styles.backButton}
            >
              Quay lại danh sách đặt phòng
            </button>
            
            {canCancel() && (
              <button 
                onClick={() => setCancelModalOpen(true)}
                className={styles.cancelButton}
              >
                Hủy đặt phòng
              </button>
            )}
          </div>
        </div>
      </main>
      
      {cancelModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Hủy đặt phòng</h3>
            <p>Bạn có chắc chắn muốn hủy đặt phòng này?</p>
            
            <div className={styles.formGroup}>
              <label>Lý do hủy:</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng cho biết lý do hủy đặt phòng"
                rows={4}
              />
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => setCancelModalOpen(false)}
                className={styles.backButton}
                disabled={isCancelling}
              >
                Quay lại
              </button>
              <button 
                onClick={handleCancelBooking}
                className={styles.confirmCancelButton}
                disabled={isCancelling}
              >
                {isCancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}