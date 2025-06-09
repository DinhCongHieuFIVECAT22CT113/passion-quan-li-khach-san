'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PhongDTO, LoaiPhongDTO } from '../../../lib/DTOs';
import { useAuth } from '../../../lib/auth';
import { API_BASE_URL } from '../../../lib/config';
import { FaTimes, FaUser, FaUserPlus, FaClock, FaCalendarAlt, FaUsers, FaPhone, FaEnvelope, FaStickyNote, FaCreditCard, FaMoneyBillWave, FaUniversity, FaGoogle, FaFacebook } from 'react-icons/fa';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  selectedRoom?: PhongDTO;
  loaiPhong: LoaiPhongDTO | null;
  onClose: () => void;
}

interface BookingFormData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  ghiChu: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  soNguoiLon: number;
  soTreEm: number;
  phuongThucThanhToan: string;
  loaiThe?: string;
}

interface BookingErrors {
  [key: string]: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ selectedRoom, loaiPhong, onClose }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<'choice' | 'form' | 'payment' | 'success'>('choice');
  const [bookingType, setBookingType] = useState<'user' | 'guest'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    hoTen: '',
    soDienThoai: '',
    email: '',
    ghiChu: '',
    ngayNhanPhong: '',
    ngayTraPhong: '',
    soNguoiLon: 1,
    soTreEm: 0,
    phuongThucThanhToan: '',
    loaiThe: '',
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [bookingResult, setBookingResult] = useState<any>(null);

  useEffect(() => {
    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      ngayNhanPhong: today.toISOString().split('T')[0],
      ngayTraPhong: tomorrow.toISOString().split('T')[0],
      hoTen: user?.hoTen || '',
      email: user?.email || '',
      soDienThoai: user?.soDienThoai || '',
    }));
  }, [user]);

  // Auto-skip choice step if user is logged in
  useEffect(() => {
    if (!authLoading && user && step === 'choice') {
      setBookingType('user');
      setStep('form');
    }
  }, [user, authLoading, step]);

  const calculateNights = (): number => {
    if (formData.ngayNhanPhong && formData.ngayTraPhong) {
      const checkIn = new Date(formData.ngayNhanPhong);
      const checkOut = new Date(formData.ngayTraPhong);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const calculateTotalPrice = (): number => {
    const nights = calculateNights();
    return nights * (loaiPhong?.giaMoiDem || 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'soNguoiLon' || name === 'soTreEm' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: BookingErrors = {};

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ tên';
    }

    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.ngayNhanPhong) {
      newErrors.ngayNhanPhong = 'Vui lòng chọn ngày nhận phòng';
    }

    if (!formData.ngayTraPhong) {
      newErrors.ngayTraPhong = 'Vui lòng chọn ngày trả phòng';
    }

    if (formData.ngayNhanPhong && formData.ngayTraPhong) {
      const checkIn = new Date(formData.ngayNhanPhong);
      const checkOut = new Date(formData.ngayTraPhong);
      if (checkOut <= checkIn) {
        newErrors.ngayTraPhong = 'Ngày trả phòng phải sau ngày nhận phòng';
      }
    }

    if (formData.soNguoiLon < 1) {
      newErrors.soNguoiLon = 'Phải có ít nhất 1 người lớn';
    }

    if (step === 'payment' && !formData.phuongThucThanhToan) {
      newErrors.phuongThucThanhToan = 'Vui lòng chọn phương thức thanh toán';
    }

    if (step === 'payment' && formData.phuongThucThanhToan !== 'cash' && !formData.loaiThe) {
      newErrors.loaiThe = 'Vui lòng chọn loại thẻ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 'choice') {
      setStep('form');
    } else if (step === 'form') {
      if (validateForm()) {
        setStep('payment');
      }
    } else if (step === 'payment') {
      if (validateForm()) {
        handleSubmitBooking();
      }
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      const bookingPayload: any = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        maPhong: selectedRoom?.maPhong || loaiPhong?.maLoaiPhong || '',
        ngayNhanPhong: formData.ngayNhanPhong,
        ngayTraPhong: formData.ngayTraPhong,
        soNguoiLon: formData.soNguoiLon,
        soTreEm: formData.soTreEm,
        phuongThucThanhToan: formData.phuongThucThanhToan,
        loaiThe: formData.loaiThe,
        ghiChu: formData.ghiChu,
        tongTien: calculateTotalPrice(),
        isGuestBooking: bookingType === 'guest',
      };

      const endpoint = bookingType === 'guest' 
        ? `${API_BASE_URL}/Booking/CreateGuestBooking`
        : `${API_BASE_URL}/PhieuDatPhong`;

      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (bookingType === 'user' && user) {
        const token = localStorage.getItem('token');
        headers['Authorization'] = `Bearer ${token}`;
        bookingPayload.maNguoiDung = user.maNguoiDung;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Có lỗi xảy ra khi đặt phòng');
      }

      const result = await response.json();
      setBookingResult(result);
      setStep('success');

    } catch (error) {
      console.error('Lỗi khi đặt phòng:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt phòng' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // Implement social login logic here
    console.log(`Login with ${provider}`);
  };

  const renderChoiceStep = () => (
    <div className={styles.stepContent}>
      <h2>Chọn cách thức đặt phòng</h2>
      <p className={styles.stepDescription}>
        Bạn muốn đặt phòng như thế nào? Chọn phương thức phù hợp với bạn nhất.
      </p>

      <div className={styles.choiceGrid}>
        {/* User Account Option */}
        <div 
          className={`${styles.choiceCard} ${bookingType === 'user' ? styles.selected : ''} ${user ? styles.recommended : ''}`}
          onClick={() => setBookingType('user')}
        >
          {user && <div className={styles.recommendedBadge}>Được khuyến nghị</div>}
          <div className={styles.choiceIcon}>
            {user ? <FaUser /> : <FaUserPlus />}
          </div>
          <h3>{user ? 'Đặt với tài khoản' : 'Đăng nhập để nhận ưu đãi'}</h3>
          <p>
            {user 
              ? `Xin chào ${user.hoTen}! Tiếp tục đặt phòng với tài khoản của bạn`
              : 'Đăng nhập để nhận nhiều ưu đãi hấp dẫn và trải nghiệm tốt hơn'
            }
          </p>
          
          <div className={styles.benefits}>
            <div className={styles.benefit}>✓ Nhận mã giảm giá độc quyền</div>
            <div className={styles.benefit}>✓ Đặt phòng nhanh hơn lần sau</div>
            <div className={styles.benefit}>✓ Quản lý lịch sử đặt phòng</div>
            <div className={styles.benefit}>✓ Tích điểm thành viên VIP</div>
          </div>

          {!user && (
            <div className={styles.socialLogin}>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSocialLogin('google'); }}
                className={styles.socialButton}
              >
                <FaGoogle /> Google
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSocialLogin('facebook'); }}
                className={styles.socialButton}
              >
                <FaFacebook /> Facebook
              </button>
            </div>
          )}
        </div>

        {/* Guest Option */}
        <div 
          className={`${styles.choiceCard} ${bookingType === 'guest' ? styles.selected : ''}`}
          onClick={() => setBookingType('guest')}
        >
          <div className={styles.choiceIcon}>
            <FaClock />
          </div>
          <h3>Đặt phòng khách</h3>
          <p>Đặt phòng nhanh chóng mà không cần tạo tài khoản. Phù hợp cho những lần đặt phòng đơn lẻ.</p>
          
          <div className={styles.features}>
            <div className={styles.feature}>✓ Không cần đăng ký tài khoản</div>
            <div className={styles.feature}>✓ Đặt phòng ngay lập tức</div>
            <div className={styles.feature}>✓ Nhận xác nhận qua email/SMS</div>
            <div className={styles.feature}>✓ Thanh toán linh hoạt</div>
          </div>
        </div>
      </div>

      <div className={styles.stepActions}>
        <button 
          onClick={onClose}
          className={styles.backButton}
        >
          Hủy
        </button>
        <button 
          onClick={handleNextStep}
          className={styles.nextButton}
          disabled={!user && bookingType === 'user'}
        >
          {!user && bookingType === 'user' ? 'Đăng nhập để tiếp tục' : 'Tiếp tục đặt phòng'}
        </button>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <div className={styles.stepContent}>
      <h2>Thông tin đặt phòng</h2>
      
      {user && bookingType === 'user' && (
        <div className={styles.userWelcome}>
          <div className={styles.welcomeIcon}>
            <FaUser />
          </div>
          <div className={styles.welcomeText}>
            <h4>Xin chào, {user.hoTen}!</h4>
            <p>Chúng tôi đã điền sẵn thông tin của bạn. Vui lòng kiểm tra và cập nhật nếu cần.</p>
          </div>
        </div>
      )}
      
      <div className={styles.formGrid}>
        <div className={styles.formSection}>
          <h3>Thông tin khách hàng</h3>
          
          <div className={styles.formGroup}>
            <label>
              <FaUser className={styles.inputIcon} />
              Họ và tên *
            </label>
            <input
              type="text"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleInputChange}
              placeholder="Nhập họ và tên đầy đủ"
              className={errors.hoTen ? styles.inputError : ''}
            />
            {errors.hoTen && <span className={styles.errorText}>{errors.hoTen}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaPhone className={styles.inputIcon} />
              Số điện thoại *
            </label>
            <input
              type="tel"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleInputChange}
              placeholder="Nhập số điện thoại"
              className={errors.soDienThoai ? styles.inputError : ''}
            />
            {errors.soDienThoai && <span className={styles.errorText}>{errors.soDienThoai}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaEnvelope className={styles.inputIcon} />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập địa chỉ email"
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Chi tiết đặt phòng</h3>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                <FaCalendarAlt className={styles.inputIcon} />
                Ngày nhận phòng *
              </label>
              <input
                type="date"
                name="ngayNhanPhong"
                value={formData.ngayNhanPhong}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={errors.ngayNhanPhong ? styles.inputError : ''}
              />
              {errors.ngayNhanPhong && <span className={styles.errorText}>{errors.ngayNhanPhong}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>
                <FaCalendarAlt className={styles.inputIcon} />
                Ngày trả phòng *
              </label>
              <input
                type="date"
                name="ngayTraPhong"
                value={formData.ngayTraPhong}
                onChange={handleInputChange}
                min={formData.ngayNhanPhong || new Date().toISOString().split('T')[0]}
                className={errors.ngayTraPhong ? styles.inputError : ''}
              />
              {errors.ngayTraPhong && <span className={styles.errorText}>{errors.ngayTraPhong}</span>}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>
                <FaUsers className={styles.inputIcon} />
                Số người lớn *
              </label>
              <input
                type="number"
                name="soNguoiLon"
                value={formData.soNguoiLon}
                onChange={handleInputChange}
                min="1"
                max={loaiPhong?.sucChua || 10}
                className={errors.soNguoiLon ? styles.inputError : ''}
              />
              {errors.soNguoiLon && <span className={styles.errorText}>{errors.soNguoiLon}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>
                <FaUsers className={styles.inputIcon} />
                Số trẻ em
              </label>
              <input
                type="number"
                name="soTreEm"
                value={formData.soTreEm}
                onChange={handleInputChange}
                min="0"
                max="5"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FaStickyNote className={styles.inputIcon} />
              Ghi chú
            </label>
            <textarea
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleInputChange}
              placeholder="Yêu cầu đặc biệt (tùy chọn)"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className={styles.stepActions}>
        <button onClick={() => setStep('choice')} className={styles.backButton}>
          Quay lại
        </button>
        <button onClick={handleNextStep} className={styles.nextButton}>
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className={styles.stepContent}>
      <h2>Phương thức thanh toán</h2>
      
      <div className={styles.paymentGrid}>
        <div className={styles.paymentMethods}>
          <div 
            className={`${styles.paymentMethod} ${formData.phuongThucThanhToan === 'cash' ? styles.selected : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'cash' }))}
          >
            <FaMoneyBillWave className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Thanh toán khi nhận phòng</h4>
              <p>Thanh toán bằng tiền mặt tại quầy lễ tân</p>
            </div>
          </div>

          <div 
            className={`${styles.paymentMethod} ${formData.phuongThucThanhToan === 'card' ? styles.selected : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'card' }))}
          >
            <FaCreditCard className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Thẻ tín dụng/Ghi nợ</h4>
              <p>Thanh toán an toàn với thẻ Visa, MasterCard</p>
            </div>
          </div>

          <div 
            className={`${styles.paymentMethod} ${formData.phuongThucThanhToan === 'transfer' ? styles.selected : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'transfer' }))}
          >
            <FaUniversity className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Chuyển khoản ngân hàng</h4>
              <p>Chuyển khoản qua Internet Banking</p>
            </div>
          </div>

          {formData.phuongThucThanhToan !== 'cash' && (
            <div className={styles.cardTypes}>
              <h4>Chọn loại thẻ</h4>
              <div className={styles.cardTypeGrid}>
                {['visa', 'mastercard', 'jcb', 'amex'].map((type) => (
                  <label key={type} className={styles.cardTypeOption}>
                    <input
                      type="radio"
                      name="loaiThe"
                      value={type}
                      checked={formData.loaiThe === type}
                      onChange={handleInputChange}
                    />
                    <span>{type.toUpperCase()}</span>
                  </label>
                ))}
              </div>
              {errors.loaiThe && <span className={styles.errorText}>{errors.loaiThe}</span>}
            </div>
          )}
        </div>

        <div className={styles.bookingSummary}>
          <h3>Tóm tắt đặt phòng</h3>
          <div className={styles.summaryItem}>
            <span>Phòng:</span>
            <span>{selectedRoom?.soPhong}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Loại phòng:</span>
            <span>{loaiPhong?.tenLoaiPhong}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Ngày nhận:</span>
            <span>{new Date(formData.ngayNhanPhong).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Ngày trả:</span>
            <span>{new Date(formData.ngayTraPhong).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Số đêm:</span>
            <span>{calculateNights()} đêm</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Số khách:</span>
            <span>{formData.soNguoiLon + formData.soTreEm} người</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Tổng tiền:</span>
            <span className={styles.totalPrice}>{calculateTotalPrice().toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {errors.phuongThucThanhToan && (
        <div className={styles.errorMessage}>{errors.phuongThucThanhToan}</div>
      )}

      <div className={styles.stepActions}>
        <button onClick={() => setStep('form')} className={styles.backButton}>
          Quay lại
        </button>
        <button 
          onClick={handleNextStep} 
          className={styles.nextButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className={styles.stepContent}>
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>✓</div>
        <h2>Đặt phòng thành công!</h2>
        <p>Cảm ơn bạn đã đặt phòng. Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.</p>
        
        <div className={styles.bookingInfo}>
          <div className={styles.infoItem}>
            <span>Mã đặt phòng:</span>
            <span className={styles.bookingCode}>{bookingResult?.maDatPhong || 'BP' + Date.now()}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Phòng:</span>
            <span>{selectedRoom?.soPhong}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Tổng tiền:</span>
            <span className={styles.totalPrice}>{calculateTotalPrice().toLocaleString()}đ</span>
          </div>
        </div>

        <div className={styles.successActions}>
          <button onClick={onClose} className={styles.closeButton}>
            Đóng
          </button>
          {user && (
            <button 
              onClick={() => router.push('/users/profile?tab=bookings')}
              className={styles.viewBookingsButton}
            >
              Xem đặt phòng của tôi
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h1>Đặt phòng {selectedRoom?.soPhong}</h1>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.stepIndicator}>
          {/* Only show choice step if user is not logged in */}
          {!user && (
            <div className={`${styles.step} ${step === 'choice' ? styles.active : ['form', 'payment', 'success'].includes(step) ? styles.completed : ''}`}>
              <span>1</span>
              <label>Chọn phương thức</label>
            </div>
          )}
          <div className={`${styles.step} ${step === 'form' ? styles.active : ['payment', 'success'].includes(step) ? styles.completed : ''}`}>
            <span>{user ? '1' : '2'}</span>
            <label>Thông tin</label>
          </div>
          <div className={`${styles.step} ${step === 'payment' ? styles.active : step === 'success' ? styles.completed : ''}`}>
            <span>{user ? '2' : '3'}</span>
            <label>Thanh toán</label>
          </div>
          <div className={`${styles.step} ${step === 'success' ? styles.active : ''}`}>
            <span>{user ? '3' : '4'}</span>
            <label>Hoàn thành</label>
          </div>
        </div>

        <div className={styles.modalBody}>
          {authLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Đang kiểm tra thông tin đăng nhập...</p>
            </div>
          ) : (
            <>
              {step === 'choice' && renderChoiceStep()}
              {step === 'form' && renderFormStep()}
              {step === 'payment' && renderPaymentStep()}
              {step === 'success' && renderSuccessStep()}
            </>
          )}
        </div>

        {errors.submit && (
          <div className={styles.errorMessage}>{errors.submit}</div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;