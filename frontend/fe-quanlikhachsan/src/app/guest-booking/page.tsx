'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './styles.module.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaCreditCard, FaMoneyBillWave, FaUniversity, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '@/lib/config';

interface BookingData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  ghiChu: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  thoiGianDen: string; // Thêm thời gian đến
  soNguoiLon: number;
  soTreEm: number;
  roomData: {
    maPhong: string;
    tenPhong: string;
    tenLoaiPhong: string;
    giaMoiDem: number;
    thumbnail: string;
    moTa?: string;
  };
  // Thêm khuyến mãi và dịch vụ
  selectedPromotion?: {
    maKm: string;
    tenKhuyenMai: string;
    moTa: string;
    phanTramGiam: number;
    soTienGiam: number;
  };
  selectedServices?: Array<{
    service: {
      maDichVu: string;
      tenDichVu: string;
      moTa: string;
      donGia: number;
    };
    quantity: number;
  }>;
  priceBreakdown?: {
    nights: number;
    roomPrice: number;
    servicesTotal: number;
    subtotal: number;
    discount: number;
    total: number;
  };
}

interface PaymentData {
  phuongThucThanhToan: string;
  loaiThe?: string;
  ghiChuThanhToan: string;
}

export default function GuestBookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    phuongThucThanhToan: '',
    loaiThe: '',
    ghiChuThanhToan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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
      router.push('/users/rooms');
    }
    setIsLoading(false);
  }, [router]);

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

  const handlePaymentChange = (field: keyof PaymentData, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const validatePayment = (): boolean => {
    if (!paymentData.phuongThucThanhToan) {
      setError('Vui lòng chọn phương thức thanh toán');
      return false;
    }

    if (paymentData.phuongThucThanhToan !== 'cash' && !paymentData.loaiThe) {
      setError('Vui lòng chọn loại thẻ');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePayment() || !bookingData) {
      return;
    }

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
        
        // Ghi chú
        ghiChu: bookingData.ghiChu,
        ghiChuThanhToan: paymentData.ghiChuThanhToan,
        
        // Tổng tiền
        tongTien: calculateTotalPrice(),
        
        // Đánh dấu là khách vãng lai
        isGuestBooking: true,
      };

      console.log('Gửi yêu cầu đặt phòng cho khách vãng lai:', bookingPayload);

      // Gọi API tạo booking tạm cho khách vãng lai (public)
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
        // Quan trọng: Không gửi credentials để tránh gửi cookie
        credentials: 'omit'
      });

      if (!response.ok) {
        // Xử lý lỗi đặc biệt cho API này, không chuyển hướng đến trang đăng nhập
        if (response.status === 401) {
          throw new Error('API yêu cầu xác thực. Vui lòng liên hệ quản trị viên.');
        }
        
        const errorData = await response.text();
        throw new Error(errorData || 'Có lỗi xảy ra khi đặt phòng');
      }

      const result = await response.json();
      const bookingId = result.bookingId;
      
      // Lưu ID booking tạm thời
      localStorage.setItem('pendingGuestBookingId', bookingId);
      
      // Lưu thông tin đặt phòng để sử dụng sau này
      localStorage.setItem('guestName', bookingData.hoTen);
      localStorage.setItem('guestPhone', bookingData.soDienThoai);
      localStorage.setItem('guestEmail', bookingData.email);
      localStorage.setItem('roomName', bookingData.roomData.tenPhong);
      localStorage.setItem('roomType', bookingData.roomData.tenLoaiPhong);
      localStorage.setItem('roomThumbnail', bookingData.roomData.thumbnail || '');
      localStorage.setItem('checkInDate', bookingData.ngayNhanPhong);
      localStorage.setItem('checkOutDate', bookingData.ngayTraPhong);
      localStorage.setItem('adultCount', bookingData.soNguoiLon.toString());
      localStorage.setItem('childCount', bookingData.soTreEm.toString());
      localStorage.setItem('totalPrice', calculateTotalPrice().toString());
      localStorage.setItem('paymentMethod', paymentData.phuongThucThanhToan);
      
      router.push('/guest-booking/confirm');
      return;

    } catch (error) {
      console.error('Lỗi khi đặt phòng:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
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
              Chọn phương thức
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Thanh toán</span>
          </div>

          <h1 className={styles.pageTitle}>Thanh toán đặt phòng</h1>

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

              <div className={styles.priceBreakdown}>
                <h3>Chi tiết giá</h3>
                <div className={styles.infoItem}>
                  <span>Phòng ({calculateNights()} đêm):</span>
                  <span>{(calculateNights() * (bookingData.roomData.giaMoiDem || 0)).toLocaleString()}đ</span>
                </div>

                {/* Hiển thị dịch vụ nếu có */}
                {bookingData.selectedServices && bookingData.selectedServices.length > 0 && (
                  <>
                    <div className={styles.servicesSection}>
                      <h4 style={{color: '#3498db', margin: '1rem 0 0.5rem 0'}}>🛎️ Dịch vụ đã chọn</h4>
                      {bookingData.selectedServices.map((selectedService: any, index: number) => (
                        <div key={index} className={styles.infoItem}>
                          <span>{selectedService.service.tenDichVu} x{selectedService.quantity}:</span>
                          <span>{(selectedService.service.donGia * selectedService.quantity).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Hiển thị khuyến mãi nếu có */}
                {bookingData.selectedPromotion && (
                  <div className={styles.promotionSection}>
                    <h4 style={{color: '#e74c3c', margin: '1rem 0 0.5rem 0'}}>🏷️ Khuyến mãi</h4>
                    <div className={styles.infoItem}>
                      <span>{bookingData.selectedPromotion.tenKhuyenMai}:</span>
                      <span style={{color: '#e74c3c'}}>
                        -{(bookingData.priceBreakdown?.discount || 0).toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.totalPrice}>
                  <span>Tổng cộng:</span>
                  <span className={styles.price}>
                    {(bookingData.priceBreakdown?.total || calculateTotalPrice()).toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Form thanh toán */}
            <div className={styles.paymentForm}>
              <h2>Phương thức thanh toán</h2>
              
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className={styles.paymentMethods}>
                  <div 
                    className={`${styles.paymentMethod} ${paymentData.phuongThucThanhToan === 'cash' ? styles.selected : ''}`}
                    onClick={() => handlePaymentChange('phuongThucThanhToan', 'cash')}
                  >
                    <FaMoneyBillWave className={styles.paymentIcon} />
                    <div className={styles.paymentInfo}>
                      <h4>Thanh toán khi nhận phòng</h4>
                      <p>Thanh toán bằng tiền mặt tại quầy lễ tân</p>
                    </div>
                    <div className={styles.radioButton}>
                      <input
                        type="radio"
                        name="phuongThucThanhToan"
                        value="cash"
                        checked={paymentData.phuongThucThanhToan === 'cash'}
                        onChange={() => handlePaymentChange('phuongThucThanhToan', 'cash')}
                      />
                    </div>
                  </div>

                  <div 
                    className={`${styles.paymentMethod} ${paymentData.phuongThucThanhToan === 'card' ? styles.selected : ''}`}
                    onClick={() => handlePaymentChange('phuongThucThanhToan', 'card')}
                  >
                    <FaCreditCard className={styles.paymentIcon} />
                    <div className={styles.paymentInfo}>
                      <h4>Thẻ tín dụng/Ghi nợ</h4>
                      <p>Thanh toán an toàn với thẻ Visa, MasterCard</p>
                    </div>
                    <div className={styles.radioButton}>
                      <input
                        type="radio"
                        name="phuongThucThanhToan"
                        value="card"
                        checked={paymentData.phuongThucThanhToan === 'card'}
                        onChange={() => handlePaymentChange('phuongThucThanhToan', 'card')}
                      />
                    </div>
                  </div>

                  <div 
                    className={`${styles.paymentMethod} ${paymentData.phuongThucThanhToan === 'transfer' ? styles.selected : ''}`}
                    onClick={() => handlePaymentChange('phuongThucThanhToan', 'transfer')}
                  >
                    <FaUniversity className={styles.paymentIcon} />
                    <div className={styles.paymentInfo}>
                      <h4>Chuyển khoản ngân hàng</h4>
                      <p>Chuyển khoản qua Internet Banking</p>
                    </div>
                    <div className={styles.radioButton}>
                      <input
                        type="radio"
                        name="phuongThucThanhToan"
                        value="transfer"
                        checked={paymentData.phuongThucThanhToan === 'transfer'}
                        onChange={() => handlePaymentChange('phuongThucThanhToan', 'transfer')}
                      />
                    </div>
                  </div>
                </div>

                {paymentData.phuongThucThanhToan !== 'cash' && (
                  <div className={styles.cardTypeSection}>
                    <h3>Chọn loại thẻ</h3>
                    <div className={styles.cardTypes}>
                      <label className={styles.cardTypeOption}>
                        <input
                          type="radio"
                          name="loaiThe"
                          value="visa"
                          checked={paymentData.loaiThe === 'visa'}
                          onChange={(e) => handlePaymentChange('loaiThe', e.target.value)}
                        />
                        <span>Visa</span>
                      </label>
                      <label className={styles.cardTypeOption}>
                        <input
                          type="radio"
                          name="loaiThe"
                          value="mastercard"
                          checked={paymentData.loaiThe === 'mastercard'}
                          onChange={(e) => handlePaymentChange('loaiThe', e.target.value)}
                        />
                        <span>MasterCard</span>
                      </label>
                      <label className={styles.cardTypeOption}>
                        <input
                          type="radio"
                          name="loaiThe"
                          value="jcb"
                          checked={paymentData.loaiThe === 'jcb'}
                          onChange={(e) => handlePaymentChange('loaiThe', e.target.value)}
                        />
                        <span>JCB</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className={styles.noteSection}>
                  <label htmlFor="ghiChuThanhToan">Ghi chú thanh toán (tùy chọn)</label>
                  <textarea
                    id="ghiChuThanhToan"
                    value={paymentData.ghiChuThanhToan}
                    onChange={(e) => handlePaymentChange('ghiChuThanhToan', e.target.value)}
                    placeholder="Nhập ghi chú về thanh toán nếu có"
                    rows={3}
                  />
                </div>

                <div className={styles.securityNote}>
                  <FaShieldAlt className={styles.securityIcon} />
                  <p>
                    Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối. 
                    Chúng tôi không lưu trữ thông tin thẻ tín dụng.
                  </p>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.backButton}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
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
                        Xác nhận đặt phòng
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}