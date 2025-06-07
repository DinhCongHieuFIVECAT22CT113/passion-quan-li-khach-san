'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './styles.module.css';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaCalendarAlt, FaUsers, FaUser, FaPhone, FaEnvelope, FaStickyNote } from 'react-icons/fa';

interface RoomData {
  maPhong: string;
  tenPhong: string;
  maLoaiPhong: string;
  tenLoaiPhong: string;
  giaMoiDem?: number;
  giaMoiGio?: number;
  thumbnail: string;
  moTa?: string;
  sucChua?: number;
  kichThuocPhong?: number;
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
}

interface BookingFormErrors {
  hoTen?: string;
  soDienThoai?: string;
  email?: string;
  ghiChu?: string;
  ngayNhanPhong?: string;
  ngayTraPhong?: string;
  soNguoiLon?: string;
  soTreEm?: string;
}

export default function BookingFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    hoTen: '',
    soDienThoai: '',
    email: '',
    ghiChu: '',
    ngayNhanPhong: '',
    ngayTraPhong: '',
    soNguoiLon: 1,
    soTreEm: 0,
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});

  useEffect(() => {
    // Lấy thông tin phòng từ localStorage
    const savedRoomData = localStorage.getItem('selectedRoomData');
    if (savedRoomData) {
      try {
        const parsedData = JSON.parse(savedRoomData);
        setRoomData(parsedData);
      } catch (error) {
        console.error('Lỗi khi parse dữ liệu phòng:', error);
      }
    }

    // Thiết lập ngày mặc định (hôm nay và ngày mai)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData(prev => ({
      ...prev,
      ngayNhanPhong: today.toISOString().split('T')[0],
      ngayTraPhong: tomorrow.toISOString().split('T')[0],
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'soNguoiLon' || name === 'soTreEm' ? parseInt(value) || 0 : value,
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name as keyof BookingFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: BookingFormErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Lưu thông tin form vào localStorage
    const bookingData = {
      ...formData,
      roomData,
    };
    localStorage.setItem('bookingFormData', JSON.stringify(bookingData));

    // Chuyển đến trang booking-choice
    router.push('/users/booking-choice');
  };

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
    return nights * (roomData?.giaMoiDem || 0);
  };

  if (!roomData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải thông tin phòng...</p>
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
              Danh sách phòng
            </span>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Điền thông tin đặt phòng</span>
          </div>

          <h1 className={styles.pageTitle}>Điền thông tin đặt phòng</h1>

          <div className={styles.contentGrid}>
            {/* Thông tin phòng */}
            <div className={styles.roomSummary}>
              <h2>Thông tin phòng đã chọn</h2>
              <div className={styles.roomCard}>
                <div className={styles.roomImage}>
                  <Image
                    src={roomData.thumbnail || '/images/room-placeholder.jpg'}
                    alt={roomData.tenPhong}
                    width={300}
                    height={200}
                    className={styles.image}
                  />
                </div>
                <div className={styles.roomDetails}>
                  <h3>{roomData.tenPhong}</h3>
                  <p className={styles.roomType}>{roomData.tenLoaiPhong}</p>
                  <p className={styles.roomDescription}>{roomData.moTa}</p>
                  <div className={styles.roomSpecs}>
                    <span>Sức chứa: {roomData.sucChua} người</span>
                    <span>Diện tích: {roomData.kichThuocPhong}m²</span>
                  </div>
                  <div className={styles.priceInfo}>
                    <span className={styles.price}>
                      {roomData.giaMoiDem?.toLocaleString()}đ/đêm
                    </span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt đặt phòng */}
              <div className={styles.bookingSummary}>
                <h3>Tóm tắt đặt phòng</h3>
                <div className={styles.summaryItem}>
                  <span>Ngày nhận phòng:</span>
                  <span>{formData.ngayNhanPhong || 'Chưa chọn'}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Ngày trả phòng:</span>
                  <span>{formData.ngayTraPhong || 'Chưa chọn'}</span>
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
                  <span className={styles.totalPrice}>
                    {calculateTotalPrice().toLocaleString()}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Form điền thông tin */}
            <div className={styles.bookingForm}>
              <h2>Thông tin khách hàng</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="hoTen">
                      <FaUser className={styles.inputIcon} />
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="hoTen"
                      name="hoTen"
                      value={formData.hoTen}
                      onChange={handleInputChange}
                      className={errors.hoTen ? styles.inputError : ''}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                    {errors.hoTen && <span className={styles.errorText}>{errors.hoTen}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="soDienThoai">
                      <FaPhone className={styles.inputIcon} />
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="soDienThoai"
                      name="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={handleInputChange}
                      className={errors.soDienThoai ? styles.inputError : ''}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.soDienThoai && <span className={styles.errorText}>{errors.soDienThoai}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email">
                      <FaEnvelope className={styles.inputIcon} />
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? styles.inputError : ''}
                      placeholder="Nhập địa chỉ email"
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ngayNhanPhong">
                      <FaCalendarAlt className={styles.inputIcon} />
                      Ngày nhận phòng *
                    </label>
                    <input
                      type="date"
                      id="ngayNhanPhong"
                      name="ngayNhanPhong"
                      value={formData.ngayNhanPhong}
                      onChange={handleInputChange}
                      className={errors.ngayNhanPhong ? styles.inputError : ''}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.ngayNhanPhong && <span className={styles.errorText}>{errors.ngayNhanPhong}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="ngayTraPhong">
                      <FaCalendarAlt className={styles.inputIcon} />
                      Ngày trả phòng *
                    </label>
                    <input
                      type="date"
                      id="ngayTraPhong"
                      name="ngayTraPhong"
                      value={formData.ngayTraPhong}
                      onChange={handleInputChange}
                      className={errors.ngayTraPhong ? styles.inputError : ''}
                      min={formData.ngayNhanPhong || new Date().toISOString().split('T')[0]}
                    />
                    {errors.ngayTraPhong && <span className={styles.errorText}>{errors.ngayTraPhong}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="soNguoiLon">
                      <FaUsers className={styles.inputIcon} />
                      Số người lớn *
                    </label>
                    <input
                      type="number"
                      id="soNguoiLon"
                      name="soNguoiLon"
                      value={formData.soNguoiLon}
                      onChange={handleInputChange}
                      className={errors.soNguoiLon ? styles.inputError : ''}
                      min="1"
                      max={roomData.sucChua || 10}
                    />
                    {errors.soNguoiLon && <span className={styles.errorText}>{errors.soNguoiLon}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="soTreEm">
                      <FaUsers className={styles.inputIcon} />
                      Số trẻ em
                    </label>
                    <input
                      type="number"
                      id="soTreEm"
                      name="soTreEm"
                      value={formData.soTreEm}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                    />
                  </div>

                  <div className={styles.formGroup + ' ' + styles.fullWidth}>
                    <label htmlFor="ghiChu">
                      <FaStickyNote className={styles.inputIcon} />
                      Ghi chú đặc biệt
                    </label>
                    <textarea
                      id="ghiChu"
                      name="ghiChu"
                      value={formData.ghiChu}
                      onChange={handleInputChange}
                      placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                      rows={4}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className={styles.backButton}
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className={styles.continueButton}
                  >
                    Tiếp tục
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