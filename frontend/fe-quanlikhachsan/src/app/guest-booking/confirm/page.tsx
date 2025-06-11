'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { API_BASE_URL } from '@/lib/config';

export default function GuestBookingConfirmPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>(typeof window !== 'undefined' ? localStorage.getItem('pendingGuestBookingId') || '' : '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingInfo, setBookingInfo] = useState({
    hoTen: '',
    email: '',
    roomName: '',
    paymentMethod: ''
  });
  
  // Lấy thông tin đặt phòng từ localStorage để hiển thị
  useState(() => {
    if (typeof window !== 'undefined') {
      setBookingInfo({
        hoTen: localStorage.getItem('guestName') || '',
        email: localStorage.getItem('guestEmail') || '',
        roomName: localStorage.getItem('roomName') || '',
        paymentMethod: localStorage.getItem('paymentMethod') || 'cash'
      });
    }
  });

  // Xử lý input OTP
  const handleOtpChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Tự động focus vào ô tiếp theo
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Xử lý khi nhấn phím
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Nếu nhấn Backspace và ô hiện tại trống, focus vào ô trước đó
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Xử lý paste OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Nếu dữ liệu dán vào là 6 ký tự số
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      
      // Focus vào ô cuối cùng
      const lastInput = document.getElementById('otp-5');
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra OTP đã nhập đủ chưa
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số của mã OTP');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('maXacNhan', otpValue);
      
      const response = await fetch(`${API_BASE_URL}/DatPhong/GuestConfirm`, {
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
        
        const err = await response.text();
        throw new Error(err || 'Xác nhận thất bại');
      }
      
      // Lấy dữ liệu đặt phòng từ response
      const responseData = await response.json();
      console.log('Dữ liệu đặt phòng thành công:', responseData);
      
      // Tạo dữ liệu đặt phòng thành công để hiển thị ở trang success
      const successData = {
        maDatPhong: responseData.datPhong?.maDatPhong || 'DP' + Math.floor(Math.random() * 1000000),
        hoTen: responseData.datPhong?.hoTen || localStorage.getItem('guestName') || '',
        soDienThoai: responseData.datPhong?.soDienThoai || localStorage.getItem('guestPhone') || '',
        email: responseData.datPhong?.email || localStorage.getItem('guestEmail') || '',
        roomData: {
          tenPhong: responseData.datPhong?.tenPhong || localStorage.getItem('roomName') || 'Phòng đã đặt',
          tenLoaiPhong: responseData.datPhong?.tenLoaiPhong || localStorage.getItem('roomType') || 'Loại phòng',
          thumbnail: responseData.datPhong?.thumbnail || localStorage.getItem('roomThumbnail') || '/images/rooms/room1.jpg',
        },
        ngayNhanPhong: responseData.datPhong?.ngayNhanPhong || localStorage.getItem('checkInDate') || new Date().toISOString(),
        ngayTraPhong: responseData.datPhong?.ngayTraPhong || localStorage.getItem('checkOutDate') || new Date(Date.now() + 86400000).toISOString(),
        soNguoiLon: responseData.datPhong?.soNguoiLon || parseInt(localStorage.getItem('adultCount') || '1'),
        soTreEm: responseData.datPhong?.soTreEm || parseInt(localStorage.getItem('childCount') || '0'),
        tongTien: responseData.datPhong?.tongTien || parseInt(localStorage.getItem('totalPrice') || '1000000'),
        phuongThucThanhToan: responseData.datPhong?.phuongThucThanhToan || localStorage.getItem('paymentMethod') || 'cash',
        ngayDat: responseData.datPhong?.ngayDat || new Date().toISOString(),
      };
      
      // Lưu dữ liệu đặt phòng thành công vào localStorage
      localStorage.setItem('guestBookingSuccess', JSON.stringify(successData));
      
      setSuccess(true);
      // Xóa bookingId tạm
      localStorage.removeItem('pendingGuestBookingId');
      setTimeout(() => {
        router.push('/guest-booking/success');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Xác nhận thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hiển thị phương thức thanh toán
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Thanh toán khi nhận phòng';
      case 'card': return 'Thẻ tín dụng/Ghi nợ';
      case 'banking': return 'Chuyển khoản ngân hàng';
      default: return 'Thanh toán khi nhận phòng';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.confirmHeader}>
            <h1 className={styles.pageTitle}>Xác nhận đặt phòng</h1>
            <div className={styles.bookingInfo}>
              <p className={styles.bookingDetail}>
                <span>Khách hàng:</span> {bookingInfo.hoTen}
              </p>
              <p className={styles.bookingDetail}>
                <span>Email:</span> {bookingInfo.email}
              </p>
              <p className={styles.bookingDetail}>
                <span>Phòng:</span> {bookingInfo.roomName}
              </p>
              <p className={styles.bookingDetail}>
                <span>Thanh toán:</span> {getPaymentMethodText(bookingInfo.paymentMethod)}
              </p>
            </div>
          </div>
          
          <div className={styles.otpSection}>
            <p className={styles.otpInstructions}>
              Vui lòng nhập mã xác nhận 6 chữ số đã được gửi về email của bạn để hoàn tất đặt phòng.
            </p>
            
            <form onSubmit={handleSubmit} className={styles.confirmForm}>
              <div className={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    required
                    className={styles.otpInput}
                    disabled={isSubmitting || success}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              {success && <div className={styles.successMessage}>
                <span className={styles.successIcon}>✓</span>
                Xác nhận thành công! Đang chuyển hướng...
              </div>}
              
              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.resendButton} 
                  disabled={isSubmitting || success}
                  onClick={() => alert('Mã xác nhận mới đã được gửi đến email của bạn.')}
                >
                  Gửi lại mã
                </button>
                
                <button 
                  type="submit" 
                  className={styles.submitButton} 
                  disabled={isSubmitting || success || otp.join('').length !== 6}
                >
                  {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận đặt phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
