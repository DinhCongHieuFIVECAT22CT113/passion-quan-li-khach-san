'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaCheckCircle, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from '@/lib/config';

interface BookingData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  roomData: {
    maPhong: string;
    tenPhong: string;
    tenLoaiPhong: string;
    giaMoiDem: number;
    thumbnail: string;
  };
  ngayNhanPhong: string;
  ngayTraPhong: string;
  thoiGianDen: string;
  soNguoiLon: number;
  soTreEm: number;
  ghiChu: string;
  selectedServices?: any[];
  selectedPromotion?: any;
  priceBreakdown?: any;
}

interface PaymentData {
  phuongThucThanhToan: string;
  loaiThe: string;
  tenNganHang: string;
  ghiChuThanhToan: string;
}

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const bookingInfo = localStorage.getItem('guestBookingData');
    const paymentInfo = localStorage.getItem('guestPaymentData');

    if (bookingInfo && paymentInfo) {
      try {
        setBookingData(JSON.parse(bookingInfo));
        setPaymentData(JSON.parse(paymentInfo));
      } catch (error) {
        console.error('Lỗi khi parse dữ liệu:', error);
        router.push('/users/rooms');
      }
    } else {
      router.push('/users/rooms');
    }
    setIsLoading(false);
  }, [router]);

  const calculateNights = () => {
    if (!bookingData) return 0;
    const checkIn = new Date(bookingData.ngayNhanPhong);
    const checkOut = new Date(bookingData.ngayTraPhong);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = () => {
    if (!bookingData) return 0;
    return bookingData.priceBreakdown?.total || (calculateNights() * (bookingData.roomData.giaMoiDem || 0));
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return '💵 Thanh toán khi nhận phòng';
      case 'card': return '💳 Thẻ tín dụng/Ghi nợ';
      case 'transfer': return '🏦 Chuyển khoản ngân hàng';
      case 'momo': return '📱 Ví MoMo';
      case 'zalopay': return '💙 ZaloPay';
      default: return '💵 Thanh toán khi nhận phòng';
    }
  };

  const handleConfirmPayment = async () => {
    if (!bookingData || !paymentData) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Chuẩn bị dữ liệu gửi API
      const bookingPayload = {
        // Thông tin khách hàng
        hoTen: bookingData.hoTen,
        soDienThoai: bookingData.soDienThoai,
        email: bookingData.email,
        soCccd: '', // Khách vãng lai có thể không có CCCD

        // Thông tin đặt phòng
        maPhong: bookingData.roomData.maPhong,
        ngayNhanPhong: bookingData.ngayNhanPhong,
        ngayTraPhong: bookingData.ngayTraPhong,
        thoiGianDen: bookingData.thoiGianDen || '14:00',
        soNguoiLon: bookingData.soNguoiLon,
        soTreEm: bookingData.soTreEm,
        
        // Thông tin thanh toán
        phuongThucThanhToan: paymentData.phuongThucThanhToan,
        loaiThe: paymentData.loaiThe,
        tenNganHang: paymentData.tenNganHang,
        
        // Ghi chú
        ghiChu: bookingData.ghiChu,
        ghiChuThanhToan: paymentData.ghiChuThanhToan,
        
        // Tổng tiền
        tongTien: calculateTotalPrice(),
        
        // Đánh dấu là khách vãng lai
        isGuestBooking: true,
      };

      console.log('Gửi yêu cầu đặt phòng cho khách vãng lai:', bookingPayload);

      // Gọi API tạo booking tạm cho khách vãng lai với OTP (public)
      const formData = new FormData();
      Object.entries(bookingPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });

      const response = await fetch(`${API_BASE_URL}/DatPhong/GuestPending`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'omit'
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API yêu cầu xác thực. Vui lòng liên hệ quản trị viên.');
        }

        const errorData = await response.text();
        throw new Error(errorData || 'Có lỗi xảy ra khi đặt phòng');
      }

      const result = await response.json();
      console.log('Kết quả tạo booking tạm:', result);

      // Lưu thông tin cần thiết để hiển thị ở trang confirm
      localStorage.setItem('pendingGuestBookingId', result.bookingId);
      localStorage.setItem('guestName', bookingData.hoTen);
      localStorage.setItem('guestEmail', bookingData.email);
      localStorage.setItem('guestPhone', bookingData.soDienThoai);
      localStorage.setItem('roomName', bookingData.roomData.tenPhong);
      localStorage.setItem('roomType', bookingData.roomData.tenLoaiPhong);
      localStorage.setItem('roomThumbnail', bookingData.roomData.thumbnail || '/images/rooms/room1.jpg');
      localStorage.setItem('checkInDate', bookingData.ngayNhanPhong);
      localStorage.setItem('checkOutDate', bookingData.ngayTraPhong);
      localStorage.setItem('adultCount', bookingData.soNguoiLon.toString());
      localStorage.setItem('childCount', bookingData.soTreEm.toString());
      localStorage.setItem('totalPrice', calculateTotalPrice().toString());
      localStorage.setItem('paymentMethod', paymentData.phuongThucThanhToan);

      // Chuyển đến trang xác nhận OTP
      router.push('/guest-booking/confirm');

    } catch (error) {
      console.error('Lỗi khi đặt phòng:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!bookingData || !paymentData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy thông tin đặt phòng</h2>
        <p>Vui lòng quay lại và điền thông tin đặt phòng.</p>
        <button onClick={() => router.push('/users/rooms')} className={styles.backButton}>
          Quay lại danh sách phòng
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <span onClick={() => router.push('/users/rooms')} className={styles.breadcrumbLink}>
              Danh sách phòng
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span onClick={handleBackToEdit} className={styles.breadcrumbLink}>
              Thông tin đặt phòng
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Xác nhận thanh toán</span>
          </div>

          <h1 className={styles.pageTitle}>Xác nhận thanh toán</h1>

          <div className={styles.contentGrid}>
            {/* Tóm tắt đặt phòng */}
            <div className={styles.bookingSummary}>
              <h2>Thông tin đặt phòng</h2>
              <div className={styles.roomCard}>
                <div className={styles.roomImage}>
                  <Image
                    src={bookingData.roomData.thumbnail || '/images/room-placeholder.jpg'}
                    alt={bookingData.roomData.tenPhong}
                    width={300}
                    height={200}
                    className={styles.image}
                  />
                </div>
                <div className={styles.roomDetails}>
                  <h3>{bookingData.roomData.tenPhong}</h3>
                  <p className={styles.roomType}>{bookingData.roomData.tenLoaiPhong}</p>
                </div>
              </div>

              <div className={styles.customerInfo}>
                <h3>Thông tin khách hàng</h3>
                <div className={styles.infoItem}>
                  <span>Họ tên:</span>
                  <span>{bookingData.hoTen}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Điện thoại:</span>
                  <span>{bookingData.soDienThoai}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Email:</span>
                  <span>{bookingData.email}</span>
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <h3>Chi tiết đặt phòng</h3>
                <div className={styles.infoItem}>
                  <span>Ngày nhận:</span>
                  <span>{new Date(bookingData.ngayNhanPhong).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Ngày trả:</span>
                  <span>{new Date(bookingData.ngayTraPhong).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Thời gian đến:</span>
                  <span>{bookingData.thoiGianDen || '14:00'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Số đêm:</span>
                  <span>{calculateNights()} đêm</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Số khách:</span>
                  <span>{bookingData.soNguoiLon + bookingData.soTreEm} người</span>
                </div>
              </div>

              {/* Hiển thị phương thức thanh toán đã chọn */}
              <div className={styles.paymentInfo}>
                <h3>Phương thức thanh toán</h3>
                <div className={styles.paymentMethodSelected}>
                  <span className={styles.paymentIcon}>
                    {getPaymentMethodText(paymentData.phuongThucThanhToan)}
                  </span>
                  {paymentData.loaiThe && (
                    <div className={styles.paymentDetail}>
                      <span>Loại thẻ: {paymentData.loaiThe.toUpperCase()}</span>
                    </div>
                  )}
                  {paymentData.tenNganHang && (
                    <div className={styles.paymentDetail}>
                      <span>Ngân hàng: {paymentData.tenNganHang}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.priceBreakdown}>
                <h3>Chi tiết giá</h3>
                <div className={styles.infoItem}>
                  <span>Phòng ({calculateNights()} đêm):</span>
                  <span>{(calculateNights() * (bookingData.roomData.giaMoiDem || 0)).toLocaleString()}đ</span>
                </div>

                <div className={styles.totalPrice}>
                  <span>Tổng cộng:</span>
                  <span className={styles.price}>
                    {calculateTotalPrice().toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Form xác nhận thanh toán */}
            <div className={styles.confirmationForm}>
              <h2>Xác nhận thanh toán</h2>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.confirmationSummary}>
                <div className={styles.summarySection}>
                  <h3>📋 Tóm tắt đặt phòng</h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <span>Khách hàng:</span>
                      <span>{bookingData.hoTen}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Phòng:</span>
                      <span>{bookingData.roomData.tenPhong} ({bookingData.roomData.tenLoaiPhong})</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Thời gian:</span>
                      <span>
                        {new Date(bookingData.ngayNhanPhong).toLocaleDateString('vi-VN')} - {' '}
                        {new Date(bookingData.ngayTraPhong).toLocaleDateString('vi-VN')} ({calculateNights()} đêm)
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Thanh toán:</span>
                      <span>{getPaymentMethodText(paymentData.phuongThucThanhToan)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Tổng tiền:</span>
                      <span className={styles.totalAmount}>
                        {calculateTotalPrice().toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Điều khoản */}
                <div className={styles.termsSection}>
                  <div className={styles.termsBox}>
                    <FaShieldAlt className={styles.securityIcon} />
                    <div className={styles.termsContent}>
                      <h4>Điều khoản đặt phòng</h4>
                      <ul>
                        <li>Thông tin đặt phòng sẽ được xác nhận qua email và SMS</li>
                        <li>Vui lòng mang theo CCCD/Passport khi check-in</li>
                        <li>Check-in: 14:00 | Check-out: 12:00</li>
                        <li>Hủy phòng miễn phí trước 24h</li>
                        {paymentData.phuongThucThanhToan === 'cash' && (
                          <li>Thanh toán bằng tiền mặt tại quầy lễ tân khi nhận phòng</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleBackToEdit}
                  className={styles.backButton}
                  disabled={isSubmitting}
                >
                  <FaArrowLeft />
                  Quay lại chỉnh sửa
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.buttonSpinner}></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Xác nhận và tiếp tục
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
