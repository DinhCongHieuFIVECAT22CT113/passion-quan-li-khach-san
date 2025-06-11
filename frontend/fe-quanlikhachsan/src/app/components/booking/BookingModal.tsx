'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PhongDTO, LoaiPhongDTO } from '../../../lib/DTOs';
import { useAuth } from '../../../lib/auth';
import { API_BASE_URL } from '../../../lib/config';
import { createDatPhong, getActivePromotions, getAvailableServices, applyPromotionToBooking, addServiceToBooking } from '../../../lib/api';
import { FaTimes, FaUser, FaUserPlus, FaClock, FaCalendarAlt, FaUsers, FaPhone, FaEnvelope, FaStickyNote, FaCreditCard, FaMoneyBillWave, FaUniversity, FaTag, FaServicestack, FaPlus, FaMinus, FaPercent } from 'react-icons/fa';
import styles from './BookingModal.module.css';

interface BookingModalProps {
  selectedRoom?: PhongDTO;
  loaiPhong: LoaiPhongDTO | null;
  onClose: () => void;
  open?: boolean;
}

interface Promotion {
  maKm: string;
  tenKhuyenMai: string;
  moTa: string;
  maGiamGia: string;
  phanTramGiam: number;
  soTienGiam: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  thumbnail?: string;
}

interface Service {
  maDichVu: string;
  tenDichVu: string;
  moTa: string;
  donGia: number;
  thumbnail?: string;
}

interface SelectedService {
  service: Service;
  quantity: number;
}

interface BookingFormData {
  hoTen: string;
  soDienThoai: string;
  email: string;
  ghiChu: string;
  ngayNhanPhong: string;
  ngayTraPhong: string;
  thoiGianDen: string; // Thêm field thời gian đến
  soNguoiLon: number;
  soTreEm: number;
  phuongThucThanhToan: string;
  loaiThe?: string;
  tenNganHang?: string; // Add this new field
}

interface BookingErrors {
  [key: string]: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ selectedRoom, loaiPhong, onClose, open = true }) => {
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
    thoiGianDen: '14:00', // Mặc định 14:00 (2:00 PM)
    soNguoiLon: 1,
    soTreEm: 0,
    phuongThucThanhToan: '',
    loaiThe: '',
    tenNganHang: '', // Initialize new field
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [bookingResult, setBookingResult] = useState<any>(null);

  // State cho khuyến mãi và dịch vụ
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showServices, setShowServices] = useState(false);



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

  // Load khuyến mãi và dịch vụ khi component mount
  useEffect(() => {
    const loadPromotionsAndServices = async () => {
      try {
        // Load khuyến mãi đang hoạt động
        const promotions = await getActivePromotions();
        setAvailablePromotions(promotions);
        console.log('Loaded promotions:', promotions);

        // Load dịch vụ có sẵn
        const services = await getAvailableServices();
        setAvailableServices(services);
        console.log('Loaded services:', services);
      } catch (error) {
        console.error('Error loading promotions and services:', error);
      }
    };

    loadPromotionsAndServices();
  }, []);

  // Load dữ liệu đã lưu khi modal mở (để chỉnh sửa từ guest-booking)
  useEffect(() => {
    if (open) {
      const savedBookingData = localStorage.getItem('bookingFormData');
      if (savedBookingData) {
        try {
          const bookingData = JSON.parse(savedBookingData);

          // Chỉ load nếu có dữ liệu form (tức là đang chỉnh sửa)
          if (bookingData.hoTen) {
            setFormData(prev => ({
              ...prev,
              hoTen: bookingData.hoTen || '',
              soDienThoai: bookingData.soDienThoai || '',
              email: bookingData.email || '',
              ghiChu: bookingData.ghiChu || '',
              ngayNhanPhong: bookingData.ngayNhanPhong || '',
              ngayTraPhong: bookingData.ngayTraPhong || '',
              thoiGianDen: bookingData.thoiGianDen || '14:00',
              soNguoiLon: bookingData.soNguoiLon || 1,
              soTreEm: bookingData.soTreEm || 0,
              phuongThucThanhToan: bookingData.phuongThucThanhToan || 'cash'
            }));

            // Load lại khuyến mãi đã chọn
            if (bookingData.selectedPromotion) {
              setSelectedPromotion(bookingData.selectedPromotion);
            }

            // Load lại dịch vụ đã chọn
            if (bookingData.selectedServices && Array.isArray(bookingData.selectedServices)) {
              setSelectedServices(bookingData.selectedServices);
            }

            // Chuyển đến step form để chỉnh sửa
            setStep('form');

            console.log('Đã load lại dữ liệu booking để chỉnh sửa:', bookingData);
          }
        } catch (error) {
          console.error('Lỗi khi load dữ liệu booking đã lưu:', error);
        }
      }
    }
  }, [open]);

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
    const roomPrice = nights * (loaiPhong?.giaMoiDem || 0);

    // Tính tổng tiền dịch vụ
    const servicesTotal = selectedServices.reduce((total, selectedService) => {
      return total + (selectedService.service.donGia * selectedService.quantity);
    }, 0);

    // Tính tổng trước khi áp dụng khuyến mãi
    const subtotal = roomPrice + servicesTotal;

    // Áp dụng khuyến mãi
    let discount = 0;
    if (selectedPromotion) {
      if (selectedPromotion.phanTramGiam > 0) {
        // Giảm theo phần trăm
        discount = (subtotal * selectedPromotion.phanTramGiam) / 100;
      } else if (selectedPromotion.soTienGiam > 0) {
        // Giảm theo số tiền cố định
        discount = selectedPromotion.soTienGiam;
      }
    }

    return Math.max(0, subtotal - discount);
  };

  // Hàm tính chi tiết giá
  const calculatePriceBreakdown = () => {
    const nights = calculateNights();
    const roomPrice = nights * (loaiPhong?.giaMoiDem || 0);
    const servicesTotal = selectedServices.reduce((total, selectedService) => {
      return total + (selectedService.service.donGia * selectedService.quantity);
    }, 0);
    const subtotal = roomPrice + servicesTotal;

    let discount = 0;
    if (selectedPromotion) {
      if (selectedPromotion.phanTramGiam > 0) {
        discount = (subtotal * selectedPromotion.phanTramGiam) / 100;
      } else if (selectedPromotion.soTienGiam > 0) {
        discount = selectedPromotion.soTienGiam;
      }
    }

    return {
      nights,
      roomPrice,
      servicesTotal,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount)
    };
  };

  // Hàm xử lý chọn khuyến mãi
  const handleSelectPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setShowPromotions(false);
  };

  // Hàm xử lý bỏ chọn khuyến mãi
  const handleRemovePromotion = () => {
    setSelectedPromotion(null);
  };

  // Hàm xử lý thêm dịch vụ
  const handleAddService = (service: Service) => {
    const existingService = selectedServices.find(s => s.service.maDichVu === service.maDichVu);
    if (existingService) {
      setSelectedServices(prev =>
        prev.map(s =>
          s.service.maDichVu === service.maDichVu
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      );
    } else {
      setSelectedServices(prev => [...prev, { service, quantity: 1 }]);
    }
  };

  // Hàm xử lý cập nhật số lượng dịch vụ
  const handleUpdateServiceQuantity = (maDichVu: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedServices(prev => prev.filter(s => s.service.maDichVu !== maDichVu));
    } else {
      setSelectedServices(prev =>
        prev.map(s =>
          s.service.maDichVu === maDichVu
            ? { ...s, quantity }
            : s
        )
      );
    }
  };

  // Hàm xử lý xóa dịch vụ
  const handleRemoveService = (maDichVu: string) => {
    setSelectedServices(prev => prev.filter(s => s.service.maDichVu !== maDichVu));
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

    // Validation cho thời gian đến (tùy chọn, có thể bỏ qua nếu không bắt buộc)
    if (formData.thoiGianDen && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.thoiGianDen)) {
      newErrors.thoiGianDen = 'Thời gian không hợp lệ (định dạng HH:MM)';
    }

    if (step === 'payment' && !formData.phuongThucThanhToan) {
      newErrors.phuongThucThanhToan = 'Vui lòng chọn phương thức thanh toán';
    }

    if (step === 'payment' && formData.phuongThucThanhToan === 'card' && !formData.loaiThe) {
      newErrors.loaiThe = 'Vui lòng chọn loại thẻ';
    }

    if (step === 'payment' && formData.phuongThucThanhToan === 'transfer' && !formData.tenNganHang) {
      newErrors.tenNganHang = 'Vui lòng chọn ngân hàng';
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
      // Chuẩn bị dữ liệu đặt phòng
      const bookingPayload: any = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai,
        email: formData.email,
        maPhong: selectedRoom?.maPhong || '',
        ngayNhanPhong: formData.ngayNhanPhong,
        ngayTraPhong: formData.ngayTraPhong,
        thoiGianDen: formData.thoiGianDen,
        soNguoiLon: formData.soNguoiLon,
        soTreEm: formData.soTreEm,
        phuongThucThanhToan: formData.phuongThucThanhToan,
        loaiThe: formData.loaiThe,
        tenNganHang: formData.tenNganHang, // Include bank name
        ghiChu: formData.ghiChu,
        tongTien: calculateTotalPrice(),
        isGuestBooking: bookingType === 'guest',
      };

      // Nếu là khách vãng lai, lưu dữ liệu vào localStorage và chuyển đến trang thanh toán
      if (bookingType === 'guest') {
        const guestBookingData = {
          ...bookingPayload,
          roomData: {
            maPhong: selectedRoom?.maPhong || '',
            maLoaiPhong: loaiPhong?.maLoaiPhong || '',
            tenPhong: selectedRoom?.soPhong || `Phòng ${selectedRoom?.maPhong}`,
            tenLoaiPhong: loaiPhong?.tenLoaiPhong || '',
            giaMoiDem: loaiPhong?.giaMoiDem || 0,
            thumbnail: selectedRoom?.thumbnail || loaiPhong?.thumbnail || '',
            moTa: loaiPhong?.moTa || '',
          },
          // Thêm thông tin khuyến mãi và dịch vụ
          selectedPromotion: selectedPromotion,
          selectedServices: selectedServices,
          priceBreakdown: calculatePriceBreakdown(),
          // Thêm phương thức thanh toán đã chọn
          phuongThucThanhToan: formData.phuongThucThanhToan
        };
        
        // Lưu dữ liệu vào localStorage để trang guest-booking sử dụng
        localStorage.setItem('bookingFormData', JSON.stringify(guestBookingData));
        
        // Đóng modal và chuyển đến trang thanh toán khách vãng lai
        onClose();
        router.push('/guest-booking');
        return;
      }

      // Xử lý đặt phòng cho user đã đăng nhập
      const bookingData = {
        maKH: user?.maNguoiDung || '',
        maPhong: selectedRoom?.maPhong || '',
        treEm: formData.soTreEm || 0,
        nguoiLon: formData.soNguoiLon || 1,
        ghiChu: formData.ghiChu || 'Đặt phòng qua website',
        soLuongPhong: 1,
        thoiGianDen: formData.thoiGianDen || '14:00',
        ngayNhanPhong: formData.ngayNhanPhong,
        ngayTraPhong: formData.ngayTraPhong,
        phuongThucThanhToan: formData.phuongThucThanhToan,
        loaiThe: formData.loaiThe,
        tenNganHang: formData.tenNganHang,
      };

      console.log('Booking data being sent:', bookingData);

      const result = await createDatPhong(bookingData);
      console.log('Booking result:', result);

      // Lưu ID đặt phòng mới để highlight trong trang bookings
      if (result && (result.datPhong || result.maDatPhong)) {
        const newBookingId = result.datPhong || result.maDatPhong;
        localStorage.setItem('newBookingId', newBookingId);
      }

      // Nếu đặt phòng thành công và có khuyến mãi hoặc dịch vụ
      if (result && result.datPhong) {
        const maDatPhong = result.datPhong;

        try {
          // Áp dụng khuyến mãi nếu có
          if (selectedPromotion) {
            const discountAmount = calculatePriceBreakdown().discount;
            await applyPromotionToBooking(maDatPhong, selectedPromotion.maKm, discountAmount);
            console.log('Applied promotion:', selectedPromotion.tenKhuyenMai);
          }

          // Thêm dịch vụ nếu có
          if (selectedServices.length > 0) {
            for (const selectedService of selectedServices) {
              await addServiceToBooking(maDatPhong, selectedService.service.maDichVu, selectedService.quantity);
              console.log('Added service:', selectedService.service.tenDichVu, 'x', selectedService.quantity);
            }
          }
        } catch (serviceError) {
          console.error('Error adding services/promotions:', serviceError);
          // Không throw error vì đặt phòng đã thành công
        }
      }

      setBookingResult(result);
      setStep('success');
      
      // Sau 2 giây, chuyển hướng đến trang xem đặt phòng
      setTimeout(() => {
        onClose();
        router.push('/users/bookings');
      }, 2000);

    } catch (error) {
      console.error('Lỗi khi đặt phòng:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đặt phòng' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm hàm lưu thông tin đặt phòng trước khi chuyển đến trang đăng nhập
  const saveBookingDataAndRedirect = () => {
    // Lưu thông tin đặt phòng hiện tại vào localStorage
    const dataToSave = {
      roomId: selectedRoom?.maPhong,
      roomName: selectedRoom?.soPhong,
      checkIn: formData.ngayNhanPhong,
      checkOut: formData.ngayTraPhong,
      adults: formData.soNguoiLon,
      children: formData.soTreEm,
      // Thêm các thông tin khác nếu cần
    };
    
    localStorage.setItem('tempBookingData', JSON.stringify(dataToSave));
    
    // Chuyển hướng đến trang đăng nhập với redirectUrl là URL hiện tại
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/login?redirectUrl=${encodeURIComponent(currentUrl)}`);
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
            <div className={styles.authSection}>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  saveBookingDataAndRedirect();
                }}
                className={styles.loginButton}
              >
                Đăng nhập
              </button>
              <p className={styles.signupText}>
                Chưa có tài khoản? 
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push('/signup'); }}
                  className={styles.signupLink}
                >
                  Đăng ký ngay
                </button>
              </p>
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
          onClick={!user && bookingType === 'user' ? saveBookingDataAndRedirect : handleNextStep}
          className={styles.nextButton}
        >
          {!user && bookingType === 'user' ? 'Đăng nhập để tiếp tục' : 'Tiếp tục đặt phòng'}
        </button>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <div className={styles.stepContent}>
      <h2>Thông tin đặt phòng</h2>
      
      {/* Chi tiết phòng */}
      <div className={styles.roomSummary}>
        <h3>Chi tiết phòng đã chọn</h3>
        <div className={styles.roomCard}>
          <div className={styles.roomImage}>
            <img
              src={selectedRoom?.thumbnail || loaiPhong?.thumbnail || '/images/room-placeholder.jpg'}
              alt={selectedRoom?.soPhong || loaiPhong?.tenLoaiPhong}
              className={styles.image}
            />
          </div>
          <div className={styles.roomDetails}>
            <h4>{selectedRoom?.soPhong || `Phòng ${selectedRoom?.maPhong}`}</h4>
            <p className={styles.roomType}>{loaiPhong?.tenLoaiPhong}</p>
            <div className={styles.roomSpecs}>
              <div className={styles.specItem}>
                <span>Diện tích:</span>
                <span>{loaiPhong?.kichThuocPhong || 0}m²</span>
              </div>
              <div className={styles.specItem}>
                <span>Sức chứa:</span>
                <span>{loaiPhong?.sucChua || 0} người</span>
              </div>
              <div className={styles.specItem}>
                <span>Giá mỗi đêm:</span>
                <span className={styles.price}>{loaiPhong?.giaMoiDem?.toLocaleString() || 0}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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

          <div className={styles.formGroup}>
            <label>
              <FaClock className={styles.inputIcon} />
              Thời gian đến dự kiến
            </label>
            <input
              type="time"
              name="thoiGianDen"
              value={formData.thoiGianDen}
              onChange={handleInputChange}
              className={`${styles.timeInput} ${errors.thoiGianDen ? styles.inputError : ''}`}
            />
            {errors.thoiGianDen && <span className={styles.errorText}>{errors.thoiGianDen}</span>}
            <small className={styles.helpText}>
              Thời gian check-in tiêu chuẩn: 14:00. Vui lòng liên hệ trước nếu đến sớm hơn 12:00.
            </small>
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

      {/* Phần khuyến mãi và dịch vụ */}
      <div className={styles.extrasSection}>
        <h3>Khuyến mãi & Dịch vụ</h3>

        {/* Khuyến mãi */}
        <div className={styles.promotionSection}>
          <div className={styles.sectionHeader}>
            <h4>
              <FaTag className={styles.sectionIcon} />
              Khuyến mãi
            </h4>
            <button
              type="button"
              onClick={() => setShowPromotions(!showPromotions)}
              className={styles.toggleButton}
            >
              {showPromotions ? 'Ẩn' : 'Xem khuyến mãi'}
            </button>
          </div>

          {selectedPromotion && (
            <div className={styles.selectedPromotion}>
              <div className={styles.promotionCard}>
                <div className={styles.promotionInfo}>
                  <h5>{selectedPromotion.tenKhuyenMai}</h5>
                  <p>{selectedPromotion.moTa}</p>
                  <div className={styles.promotionDiscount}>
                    {selectedPromotion.phanTramGiam > 0
                      ? `Giảm ${selectedPromotion.phanTramGiam}%`
                      : `Giảm ${selectedPromotion.soTienGiam.toLocaleString()}đ`
                    }
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromotion}
                  className={styles.removeButton}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {showPromotions && (
            <div className={styles.promotionsList}>
              {availablePromotions.length > 0 ? (
                availablePromotions.map(promotion => (
                  <div
                    key={promotion.maKm}
                    className={`${styles.promotionOption} ${selectedPromotion?.maKm === promotion.maKm ? styles.selected : ''}`}
                    onClick={() => handleSelectPromotion(promotion)}
                  >
                    <div className={styles.promotionContent}>
                      <h5>{promotion.tenKhuyenMai}</h5>
                      <p>{promotion.moTa}</p>
                      <div className={styles.promotionValue}>
                        <FaPercent />
                        {promotion.phanTramGiam > 0
                          ? `${promotion.phanTramGiam}% OFF`
                          : `${promotion.soTienGiam.toLocaleString()}đ OFF`
                        }
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noItems}>Hiện tại không có khuyến mãi nào</p>
              )}
            </div>
          )}
        </div>

        {/* Dịch vụ */}
        <div className={styles.servicesSection}>
          <div className={styles.sectionHeader}>
            <h4>
              <FaServicestack className={styles.sectionIcon} />
              Dịch vụ thêm
            </h4>
            <button
              type="button"
              onClick={() => setShowServices(!showServices)}
              className={styles.toggleButton}
            >
              {showServices ? 'Ẩn' : 'Xem dịch vụ'}
            </button>
          </div>

          {selectedServices.length > 0 && (
            <div className={styles.selectedServices}>
              {selectedServices.map(selectedService => (
                <div key={selectedService.service.maDichVu} className={styles.serviceItem}>
                  <div className={styles.serviceInfo}>
                    <h5>{selectedService.service.tenDichVu}</h5>
                    <p className={styles.servicePrice}>
                      {selectedService.service.donGia.toLocaleString()}đ/lần
                    </p>
                  </div>
                  <div className={styles.serviceControls}>
                    <button
                      type="button"
                      onClick={() => handleUpdateServiceQuantity(selectedService.service.maDichVu, selectedService.quantity - 1)}
                      className={styles.quantityButton}
                    >
                      <FaMinus />
                    </button>
                    <span className={styles.quantity}>{selectedService.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateServiceQuantity(selectedService.service.maDichVu, selectedService.quantity + 1)}
                      className={styles.quantityButton}
                    >
                      <FaPlus />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(selectedService.service.maDichVu)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showServices && (
            <div className={styles.servicesList}>
              {availableServices.length > 0 ? (
                availableServices.map(service => (
                  <div
                    key={service.maDichVu}
                    className={styles.serviceOption}
                    onClick={() => handleAddService(service)}
                  >
                    <div className={styles.serviceContent}>
                      <h5>{service.tenDichVu}</h5>
                      <p>{service.moTa}</p>
                      <div className={styles.servicePrice}>
                        {service.donGia.toLocaleString()}đ
                      </div>
                    </div>
                    <button type="button" className={styles.addButton}>
                      <FaPlus />
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noItems}>Hiện tại không có dịch vụ nào</p>
              )}
            </div>
          )}
        </div>

        {/* Tóm tắt giá */}
        <div className={styles.priceBreakdown}>
          <h4>Chi tiết giá</h4>
          <div className={styles.priceItem}>
            <span>Phòng ({calculateNights()} đêm):</span>
            <span>{(calculateNights() * (loaiPhong?.giaMoiDem || 0)).toLocaleString()}đ</span>
          </div>
          {selectedServices.length > 0 && (
            <div className={styles.priceItem}>
              <span>Dịch vụ:</span>
              <span>{selectedServices.reduce((total, s) => total + (s.service.donGia * s.quantity), 0).toLocaleString()}đ</span>
            </div>
          )}
          {selectedPromotion && (
            <div className={styles.priceItem} style={{color: '#e74c3c'}}>
              <span>Khuyến mãi:</span>
              <span>-{calculatePriceBreakdown().discount.toLocaleString()}đ</span>
            </div>
          )}
          <div className={styles.priceTotal}>
            <span>Tổng cộng:</span>
            <span>{calculateTotalPrice().toLocaleString()}đ</span>
          </div>
        </div>
      </div>

    <div className={styles.stepActions}>
      {bookingType === 'user' && user ? ( // Kiểm tra nếu là người dùng đã đăng nhập
        <button onClick={onClose} className={styles.backButton}>
          Hủy
        </button>
      ) : (
        <button onClick={() => setStep('choice')} className={styles.backButton}>
          Quay lại
        </button>
      )}
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
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'cash', loaiThe: '', tenNganHang: '' }))} // Clear other payment specific fields
          >
            <FaMoneyBillWave className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Thanh toán khi nhận phòng</h4>
              <p>Thanh toán bằng tiền mặt tại quầy lễ tân</p>
            </div>
          </div>

          <div 
            className={`${styles.paymentMethod} ${formData.phuongThucThanhToan === 'card' ? styles.selected : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'card', tenNganHang: '' }))} // Clear bank name
          >
            <FaCreditCard className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Thẻ tín dụng/Ghi nợ</h4>
              <p>Thanh toán an toàn với thẻ Visa, MasterCard</p>
            </div>
          </div>

          <div 
            className={`${styles.paymentMethod} ${formData.phuongThucThanhToan === 'transfer' ? styles.selected : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, phuongThucThanhToan: 'transfer', loaiThe: '' }))} // Clear card type
          >
            <FaUniversity className={styles.paymentIcon} />
            <div className={styles.paymentInfo}>
              <h4>Chuyển khoản ngân hàng</h4>
              <p>Chuyển khoản qua Internet Banking</p>
            </div>
          </div>

          {formData.phuongThucThanhToan === 'card' && ( // Only show for card
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

          {formData.phuongThucThanhToan === 'transfer' && ( // Only show for bank transfer
            <div className={styles.cardTypes}> {/* Reusing cardTypes class, consider renaming for clarity if more distinct styles are needed */}
              <h4>Chọn ngân hàng</h4>
              <div className={styles.cardTypeGrid}>
                {['MB Bank', 'VietcomBank', 'TechcomBank'].map((bank) => (
                  <label key={bank} className={styles.cardTypeOption}>
                    <input
                      type="radio"
                      name="tenNganHang"
                      value={bank}
                      checked={formData.tenNganHang === bank}
                      onChange={handleInputChange}
                    />
                    <span>{bank}</span>
                  </label>
                ))}
              </div>
              {errors.tenNganHang && <span className={styles.errorText}>{errors.tenNganHang}</span>}
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
            <span>Thời gian đến:</span>
            <span>{formData.thoiGianDen}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Số đêm:</span>
            <span>{calculateNights()} đêm</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Số khách:</span>
            <span>{formData.soNguoiLon + formData.soTreEm} người</span>
          </div>

          {/* Chi tiết giá */}
          <div style={{borderTop: '1px solid #dee2e6', paddingTop: '1rem', marginTop: '1rem'}}>
            <div className={styles.summaryItem}>
              <span>Phòng ({calculateNights()} đêm):</span>
              <span>{(calculateNights() * (loaiPhong?.giaMoiDem || 0)).toLocaleString()}đ</span>
            </div>

            {selectedServices.length > 0 && (
              <>
                <div className={styles.summaryItem} style={{fontWeight: '600', color: '#2c3e50', marginTop: '0.5rem'}}>
                  <span>Dịch vụ:</span>
                  <span></span>
                </div>
                {selectedServices.map(selectedService => (
                  <div key={selectedService.service.maDichVu} className={styles.summaryItem} style={{fontSize: '0.9rem', paddingLeft: '1rem'}}>
                    <span>{selectedService.service.tenDichVu} x{selectedService.quantity}:</span>
                    <span>{(selectedService.service.donGia * selectedService.quantity).toLocaleString()}đ</span>
                  </div>
                ))}
              </>
            )}

            {selectedPromotion && (
              <div className={styles.summaryItem} style={{color: '#e74c3c'}}>
                <span>Khuyến mãi ({selectedPromotion.tenKhuyenMai}):</span>
                <span>-{calculatePriceBreakdown().discount.toLocaleString()}đ</span>
              </div>
            )}
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
        <div className={styles.successIcon}>🎉</div>
        <h2>Đặt phòng thành công!</h2>
        <p>Cảm ơn bạn đã đặt phòng. Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.</p>

        <div className={styles.bookingInfo}>
          <div className={styles.infoItem}>
            <span>Mã đặt phòng:</span>
            <span className={styles.bookingCode}>{bookingResult?.maDatPhong || 'BP' + Date.now()}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Phòng:</span>
            <span>{selectedRoom?.soPhong} - {loaiPhong?.tenLoaiPhong}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Ngày nhận phòng:</span>
            <span>{new Date(formData.ngayNhanPhong).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Ngày trả phòng:</span>
            <span>{new Date(formData.ngayTraPhong).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className={styles.infoItem}>
            <span>Tổng tiền:</span>
            <span className={styles.totalPrice}>{calculateTotalPrice().toLocaleString()}đ</span>
          </div>
          <div className={styles.infoItem}>
            <span>Trạng thái:</span>
            <span className={styles.statusPending}>Chờ xác nhận</span>
          </div>
        </div>

        <div className={styles.successNote}>
          <div className={styles.noteIcon}>ℹ️</div>
          <div className={styles.noteContent}>
            <h4>Lưu ý quan trọng:</h4>
            <ul>
              <li>Đặt phòng của bạn đang <strong>chờ xác nhận</strong> từ khách sạn</li>
              <li>Bạn sẽ nhận được email/SMS thông báo khi đặt phòng được xác nhận</li>
              <li>Vui lòng mang theo CCCD/Passport khi check-in</li>
              <li>Check-in: 14:00 | Check-out: 12:00</li>
            </ul>
          </div>
        </div>

        <div className={styles.successActions}>
          <button
            onClick={() => {
              onClose();
              // Reset form để có thể đặt phòng mới
              setStep('choice');
              setFormData({
                hoTen: user?.hoTen || '',
                soDienThoai: user?.soDienThoai || '',
                email: user?.email || '',
                ghiChu: '',
                ngayNhanPhong: '',
                ngayTraPhong: '',
                thoiGianDen: '14:00',
                soNguoiLon: 1,
                soTreEm: 0,
                phuongThucThanhToan: 'cash'
              });
              setSelectedPromotion(null);
              setSelectedServices([]);
              setBookingResult(null);
            }}
            className={styles.continueBookingButton}
          >
            Đặt phòng khác
          </button>

          {user && (
            <button
              onClick={() => {
                onClose();
                router.push('/users/bookings');
              }}
              className={styles.viewBookingsButton}
            >
              Xem đặt phòng của tôi
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              router.push('/users/home');
            }}
            className={styles.backHomeButton}
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h1>Đặt phòng {selectedRoom?.soPhong}</h1>
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
