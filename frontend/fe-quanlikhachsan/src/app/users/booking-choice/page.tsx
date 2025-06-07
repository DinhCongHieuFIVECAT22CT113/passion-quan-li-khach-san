'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaUser, FaUserPlus, FaGift, FaStar, FaArrowRight, FaClock, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '@/lib/auth';

interface BookingData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  ghiChu: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  soNguoiLon: number;
  soTreEm: number;
  roomData: {
    maPhong: string;
    tenPhong: string;
    tenLoaiPhong: string;
    giaMoiDem: number;
    thumbnail: string;
  };
}

export default function BookingChoicePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lấy dữ liệu booking từ localStorage
    const savedBookingData = localStorage.getItem('bookingFormData');
    if (savedBookingData) {
      try {
        const parsedData = JSON.parse(savedBookingData);
        setBookingData(parsedData);
      } catch (error) {
        console.error('Lỗi khi parse dữ liệu booking:', error);
        router.push('/users/rooms');
      }
    } else {
      // Không có dữ liệu, chuyển về trang rooms
      router.push('/users/rooms');
    }
    setIsLoading(false);
  }, [router]);

  const handleLoginChoice = () => {
    // Nếu đã đăng nhập, chuyển thẳng đến booking
    if (user) {
      router.push('/users/booking');
    } else {
      // Chưa đăng nhập, chuyển đến trang login với redirect
      router.push('/login?redirect=/users/booking');
    }
  };

  const handleGuestChoice = () => {
    // Chuyển đến trang guest-booking
    router.push('/guest-booking');
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

  const calculateTotalPrice = (): number => {
    const nights = calculateNights();
    return nights * (bookingData?.roomData?.giaMoiDem || 0);
  };

  if (isLoading || authLoading) {
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
            <span onClick={() => router.back()} className={styles.breadcrumbLink}>
              Điền thông tin
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Chọn phương thức đặt phòng</span>
          </div>

          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Chọn cách thức đặt phòng</h1>
            <p className={styles.pageSubtitle}>
              Bạn muốn đặt phòng như thế nào? Chọn phương thức phù hợp với bạn nhất.
            </p>
          </div>

          <div className={styles.contentGrid}>
            {/* Tóm tắt đặt phòng */}
            <div className={styles.bookingSummary}>
              <h2>Tóm tắt đặt phòng</h2>
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
                  <div className={styles.bookingInfo}>
                    <div className={styles.infoItem}>
                      <span>Khách hàng:</span>
                      <span>{bookingData.hoTen}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span>Ngày nhận:</span>
                      <span>{new Date(bookingData.ngayNhanPhong).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span>Ngày trả:</span>
                      <span>{new Date(bookingData.ngayTraPhong).toLocaleDateString('vi-VN')}</span>
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
                  <div className={styles.totalPrice}>
                    <span>Tổng tiền: </span>
                    <span className={styles.price}>{calculateTotalPrice().toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lựa chọn đặt phòng */}
            <div className={styles.choiceSection}>
              <div className={styles.choiceGrid}>
                {/* Tùy chọn 1: Đăng nhập/Đăng ký */}
                <div className={styles.choiceCard + ' ' + styles.recommendedCard}>
                  <div className={styles.recommendedBadge}>
                    <FaStar className={styles.starIcon} />
                    Được khuyến nghị
                  </div>
                  <div className={styles.choiceIcon}>
                    {user ? <FaUser /> : <FaUserPlus />}
                  </div>
                  <h3 className={styles.choiceTitle}>
                    {user ? 'Đặt phòng với tài khoản' : 'Đăng nhập / Đăng ký'}
                  </h3>
                  <p className={styles.choiceDescription}>
                    {user 
                      ? 'Tiếp tục đặt phòng với tài khoản đã đăng nhập của bạn'
                      : 'Tạo tài khoản hoặc đăng nhập để nhận nhiều ưu đãi hấp dẫn'
                    }
                  </p>
                  
                  <div className={styles.benefits}>
                    <div className={styles.benefit}>
                      <FaGift className={styles.benefitIcon} />
                      <span>Nhận mã giảm giá độc quyền</span>
                    </div>
                    <div className={styles.benefit}>
                      <FaClock className={styles.benefitIcon} />
                      <span>Đặt phòng nhanh hơn lần sau</span>
                    </div>
                    <div className={styles.benefit}>
                      <FaShieldAlt className={styles.benefitIcon} />
                      <span>Quản lý lịch sử đặt phòng</span>
                    </div>
                    <div className={styles.benefit}>
                      <FaStar className={styles.benefitIcon} />
                      <span>Tích điểm thành viên VIP</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLoginChoice}
                    className={styles.choiceButton + ' ' + styles.primaryButton}
                  >
                    {user ? 'Tiếp tục đặt phòng' : 'Đăng nhập / Đăng ký'}
                    <FaArrowRight className={styles.buttonIcon} />
                  </button>
                </div>

                {/* Tùy chọn 2: Khách vãng lai */}
                <div className={styles.choiceCard}>
                  <div className={styles.choiceIcon}>
                    <FaClock />
                  </div>
                  <h3 className={styles.choiceTitle}>Đặt phòng nhanh</h3>
                  <p className={styles.choiceDescription}>
                    Tiếp tục đặt phòng mà không cần tạo tài khoản. Nhanh chóng và tiện lợi.
                  </p>
                  
                  <div className={styles.features}>
                    <div className={styles.feature}>
                      ✓ Không cần đăng ký
                    </div>
                    <div className={styles.feature}>
                      ✓ Đặt phòng ngay lập tức
                    </div>
                    <div className={styles.feature}>
                      ✓ Nhận xác nhận qua email
                    </div>
                  </div>

                  <button 
                    onClick={handleGuestChoice}
                    className={styles.choiceButton + ' ' + styles.secondaryButton}
                  >
                    Tiếp tục không cần tài khoản
                    <FaArrowRight className={styles.buttonIcon} />
                  </button>
                </div>
              </div>

              <div className={styles.securityNote}>
                <FaShieldAlt className={styles.securityIcon} />
                <p>
                  Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi cam kết không chia sẻ 
                  dữ liệu cá nhân với bên thứ ba.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}