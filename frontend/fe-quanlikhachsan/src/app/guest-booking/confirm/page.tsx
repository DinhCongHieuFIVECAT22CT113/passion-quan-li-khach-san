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
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Xác nhận thất bại');
      }
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
