'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaCheckCircle, FaCalendarAlt, FaUser, FaPhone, FaEnvelope, FaHome, FaUserPlus, FaTimes } from 'react-icons/fa';

interface BookingSuccessData {
  maDatPhong: string;
  hoTen: string;
  soDienThoai: string;
  email: string;
  roomData: {
    tenPhong: string;
    tenLoaiPhong: string;
    thumbnail: string;
  };
  ngayNhanPhong: string;
  ngayTraPhong: string;
  thoiGianDen?: string; // Thêm thời gian đến
  soNguoiLon: number;
  soTreEm: number;
  tongTien: number;
  phuongThucThanhToan: string;
  ngayDat: string;
}

export default function GuestBookingSuccessPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingSuccessData | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu đặt phòng thành công từ localStorage
    const successData = localStorage.getItem('guestBookingSuccess');
    if (successData) {
      try {
        const parsedData = JSON.parse(successData);
        setBookingData(parsedData);
        
        // Hiển thị modal gợi ý tạo tài khoản sau 3 giây
        setTimeout(() => {
          setShowSignupModal(true);
        }, 3000);
      } catch (error) {
        console.error('Lỗi khi parse dữ liệu booking success:', error);
        router.push('/users/rooms');
      }
    } else {
      router.push('/users/rooms');
    }
    setIsLoading(false);
  }, [router]);

  const handleCreateAccount = () => {
    // Lưu thông tin để pre-fill form đăng ký
    if (bookingData) {
      const signupData = {
        hoTen: bookingData.hoTen,
        email: bookingData.email,
        soDienThoai: bookingData.soDienThoai,
        fromGuestBooking: true,
      };
      localStorage.setItem('signupPreFill', JSON.stringify(signupData));
    }
    router.push('/signup');
  };

  const handleCloseModal = () => {
    setShowSignupModal(false);
  };

  const handleGoHome = () => {
    // Xóa dữ liệu tạm thời
    localStorage.removeItem('guestBookingSuccess');
    router.push('/users/home');
  };

  const calculateNights = (): number => {
    if (bookingData?.ngayNhanPhong && bookingData?.ngayTraPhong) {
      const checkIn = new Date(bookingData.ngayNhanPhong);
      const checkOut = new Date(bookingData.ngayTraPhong);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const getPaymentMethodText = (method: string): string => {
    switch (method) {
      case 'cash':
        return 'Thanh toán khi nhận phòng';
      case 'card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'transfer':
        return 'Chuyển khoản ngân hàng';
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Không tìm thấy thông tin đặt phòng</h2>
        <p>Vui lòng quay lại trang chủ.</p>
        <button onClick={() => router.push('/users/home')} className={styles.homeButton}>
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Success Header */}
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <FaCheckCircle />
            </div>
            <h1 className={styles.successTitle}>Đặt phòng thành công!</h1>
            <p className={styles.successSubtitle}>
              Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi. 
              Thông tin xác nhận đã được gửi đến email của bạn.
            </p>
          </div>

          {/* Booking Details */}
          <div className={styles.bookingDetails}>
            <div className={styles.detailsGrid}>
              {/* Thông tin đặt phòng */}
              <div className={styles.detailsCard}>
                <h2>Thông tin đặt phòng</h2>
                <div className={styles.bookingInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Mã đặt phòng:</span>
                    <span className={styles.value + ' ' + styles.bookingCode}>
                      {bookingData.maDatPhong}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Ngày đặt:</span>
                    <span className={styles.value}>
                      {new Date(bookingData.ngayDat).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Phòng:</span>
                    <span className={styles.value}>
                      {bookingData.roomData.tenPhong} ({bookingData.roomData.tenLoaiPhong})
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Ngày nhận phòng:</span>
                    <span className={styles.value}>
                      <FaCalendarAlt className={styles.infoIcon} />
                      {new Date(bookingData.ngayNhanPhong).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Ngày trả phòng:</span>
                    <span className={styles.value}>
                      <FaCalendarAlt className={styles.infoIcon} />
                      {new Date(bookingData.ngayTraPhong).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Số đêm:</span>
                    <span className={styles.value}>{calculateNights()} đêm</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Số khách:</span>
                    <span className={styles.value}>
                      {bookingData.soNguoiLon + bookingData.soTreEm} người
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Phương thức thanh toán:</span>
                    <span className={styles.value}>
                      {getPaymentMethodText(bookingData.phuongThucThanhToan)}
                    </span>
                  </div>
                  <div className={styles.totalRow}>
                    <span className={styles.label}>Tổng tiền:</span>
                    <span className={styles.totalPrice}>
                      {bookingData.tongTien.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className={styles.detailsCard}>
                <h2>Thông tin khách hàng</h2>
                <div className={styles.customerInfo}>
                  <div className={styles.infoRow}>
                    <FaUser className={styles.infoIcon} />
                    <div>
                      <span className={styles.label}>Họ và tên</span>
                      <span className={styles.value}>{bookingData.hoTen}</span>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <FaPhone className={styles.infoIcon} />
                    <div>
                      <span className={styles.label}>Số điện thoại</span>
                      <span className={styles.value}>{bookingData.soDienThoai}</span>
                    </div>
                  </div>
                  <div className={styles.infoRow}>
                    <FaEnvelope className={styles.infoIcon} />
                    <div>
                      <span className={styles.label}>Email</span>
                      <span className={styles.value}>{bookingData.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hình ảnh phòng */}
              <div className={styles.detailsCard + ' ' + styles.roomImageCard}>
                <h2>Phòng đã đặt</h2>
                <div className={styles.roomImage}>
                  <Image
                    src={bookingData.roomData.thumbnail || '/images/room-placeholder.jpg'}
                    alt={bookingData.roomData.tenPhong}
                    width={400}
                    height={250}
                    className={styles.image}
                  />
                </div>
                <div className={styles.roomInfo}>
                  <h3>{bookingData.roomData.tenPhong}</h3>
                  <p>{bookingData.roomData.tenLoaiPhong}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className={styles.importantNotes}>
            <h2>Lưu ý quan trọng</h2>
            <div className={styles.notesList}>
              <div className={styles.note}>
                <strong>Thời gian nhận phòng:</strong> Từ {bookingData.thoiGianDen || '14:00'} ngày {new Date(bookingData.ngayNhanPhong).toLocaleDateString('vi-VN')}
              </div>
              <div className={styles.note}>
                <strong>Thời gian trả phòng:</strong> Trước 12:00 ngày {new Date(bookingData.ngayTraPhong).toLocaleDateString('vi-VN')}
              </div>
              <div className={styles.note}>
                <strong>Giấy tờ cần thiết:</strong> CMND/CCCD hoặc Passport khi nhận phòng
              </div>
              <div className={styles.note}>
                <strong>Liên hệ:</strong> Hotline 1900-xxxx hoặc email support@passionhorizon.com
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button onClick={handleGoHome} className={styles.homeButton}>
              <FaHome />
              Về trang chủ
            </button>
            <button onClick={handleCreateAccount} className={styles.signupButton}>
              <FaUserPlus />
              Tạo tài khoản để nhận ưu đãi
            </button>
          </div>
        </div>
      </main>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button onClick={handleCloseModal} className={styles.closeButton}>
              <FaTimes />
            </button>
            <div className={styles.modalContent}>
              <div className={styles.modalIcon}>
                <FaUserPlus />
              </div>
              <h3>Tạo tài khoản để nhận nhiều ưu đãi hơn!</h3>
              <p>
                Bạn muốn lưu lịch sử đặt phòng, nhận khuyến mãi độc quyền và đặt phòng 
                nhanh hơn lần sau? Tạo tài khoản chỉ trong 30 giây!
              </p>
              <div className={styles.modalBenefits}>
                <div className={styles.benefit}>✓ Lưu lịch sử đặt phòng</div>
                <div className={styles.benefit}>✓ Nhận mã giảm giá độc quyền</div>
                <div className={styles.benefit}>✓ Đặt phòng nhanh hơn</div>
                <div className={styles.benefit}>✓ Tích điểm thành viên VIP</div>
              </div>
              <div className={styles.modalActions}>
                <button onClick={handleCloseModal} className={styles.laterButton}>
                  Để sau
                </button>
                <button onClick={handleCreateAccount} className={styles.createAccountButton}>
                  Tạo tài khoản ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}