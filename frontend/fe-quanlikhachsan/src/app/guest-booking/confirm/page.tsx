'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { API_BASE_URL } from '@/lib/config';

export default function GuestBookingConfirmPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>(typeof window !== 'undefined' ? localStorage.getItem('pendingGuestBookingId') || '' : '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('maXacNhan', otp);
      
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

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Xác nhận đặt phòng</h1>
          <p>Vui lòng nhập mã xác nhận đã được gửi về email của bạn để hoàn tất đặt phòng.</p>
          <form onSubmit={handleSubmit} className={styles.confirmForm}>
            <label htmlFor="otp">Mã xác nhận (OTP):</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              className={styles.input}
              disabled={isSubmitting || success}
            />
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>Xác nhận thành công! Đang chuyển hướng...</div>}
            <button type="submit" className={styles.submitButton} disabled={isSubmitting || success}>
              {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
