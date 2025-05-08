'use client';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './logsign.css';

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    hokh: '',
    tenkh: '',
    soCccd: '',
    soDienThoai: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
  const validatePhone = (phone: string) => /^\d+$/.test(phone);
  const validateCCCD = (cccd: string) => /^\d{12}$/.test(cccd);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Bắt buộc';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ.';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'gồm chữ, số, ký tự đặc biệt';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.hokh.trim()) {
      newErrors.hokh = 'Bắt buộc';
    }

    if (!formData.tenkh.trim()) {
      newErrors.tenkh = 'Bắt buộc';
    }

    if (!validateCCCD(formData.soCccd)) {
      newErrors.soCccd = 'Số CCCD phải có 12 chữ số';
    }

    if (!validatePhone(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Bắt buộc';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Gửi dữ liệu đến backend
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });        

        if (response.ok) {
          setShowModal(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Đăng ký thất bại');
        }
      } catch (error) {
        setErrors({ submit: error instanceof Error ? error.message : 'Có lỗi xảy ra' });
      }
    }
  };

  return (
    <div className="form-section">
      <h2>Đăng Ký</h2>
      <form onSubmit={handleSubmit}>
        {/* Tên đăng nhập */}
        <label>Tên Tài Khoản</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          placeholder="Nhập tên tài khoản của bạn"
        />
        {errors.userName && <p className="error">{errors.userName}</p>}

        {/* Email */}
        <label>Email</label>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Ví dụ: yourname@example.com"
        />
        {errors.email && <p className="error">{errors.email}</p>}

        {/* Mật khẩu và Xác nhận mật khẩu - chia đôi */}
        <div className="row-group">
          <div className="half-width">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 8 ký tự"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>
          <div className="half-width">
            <label>Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Họ và Tên - chia đôi */}
        <div className="row-group">
          <div className="half-width">
            <label>Họ</label>
            <input
              type="text"
              name="hokh"
              value={formData.hokh}
              onChange={handleChange}
              placeholder="Nhập họ của bạn"
            />
            {errors.hokh && <p className="error">{errors.hokh}</p>}
          </div>
          <div className="half-width">
            <label>Tên</label>
            <input
              type="text"
              name="tenkh"
              value={formData.tenkh}
              onChange={handleChange}
              placeholder="Nhập tên của bạn"
            />
            {errors.tenkh && <p className="error">{errors.tenkh}</p>}
          </div>
        </div>

        {/* Số CCCD và Số điện thoại - chia đôi */}
        <div className="row-group">
          <div className="half-width">
            <label>Số CCCD/CMND</label>
            <input
              type="text"
              name="soCccd"
              value={formData.soCccd}
              onChange={handleChange}
              placeholder="12 chữ số"
              maxLength={12}
            />
            {errors.soCccd && <p className="error">{errors.soCccd}</p>}
          </div>
          <div className="half-width">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="soDienThoai"
              value={formData.soDienThoai}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
            {errors.soDienThoai && <p className="error">{errors.soDienThoai}</p>}
          </div>
        </div>

        {errors.submit && <p className="error" style={{ textAlign: 'center' }}>{errors.submit}</p>}

        <button type="submit" className="main-btn">Đăng ký</button>

        <div className="divider">Hoặc</div>

        <button
          type="button"
          className="google-btn"
          onClick={() => window.open("https://accounts.google.com/signin", "_blank")}
        >
          Đăng nhập bằng Google
        </button>

        <button
          type="button"
          className="facebook-btn"
          onClick={() => window.open("https://www.facebook.com/login", "_blank")}
        >
          Đăng nhập bằng Facebook
        </button>
      </form>

      <p className="footer-text">
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>

      <footer>© 2025 PASSION HORIZON</footer>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Thông báo</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <hr />
            <div className="modal-body">
              <p><strong>Đã gửi link xác thực, vui lòng kiểm tra email</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;