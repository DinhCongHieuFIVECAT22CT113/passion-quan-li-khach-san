'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { registerUser } from '../../../lib/api';
import './logsign.css';

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    hoKh: '',
    tenKh: '',
    email: '',
    soCccd: '',
    soDienThoai: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Kiểm tra các trường bắt buộc
    if (!formData.userName.trim()) {
      newErrors.userName = 'Tên tài khoản không được để trống';
    } else if (formData.userName.length < 6) {
      newErrors.userName = 'Tên tài khoản phải có ít nhất 6 ký tự';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.userName)) {
      newErrors.userName = 'Tên tài khoản phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số hoặc dấu gạch dưới';
    }

    // Kiểm tra mật khẩu
    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Kiểm tra họ
    if (!formData.hoKh.trim()) {
      newErrors.hoKh = 'Họ không được để trống';
    } else if (formData.hoKh.length < 2) {
      newErrors.hoKh = 'Họ phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.hoKh)) {
      newErrors.hoKh = 'Họ chỉ được chứa chữ cái và khoảng trắng';
    }

    // Kiểm tra tên
    if (!formData.tenKh.trim()) {
      newErrors.tenKh = 'Tên không được để trống';
    } else if (formData.tenKh.length < 2) {
      newErrors.tenKh = 'Tên phải có ít nhất 2 ký tự';
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.tenKh)) {
      newErrors.tenKh = 'Tên chỉ được chứa chữ cái và khoảng trắng';
    }

    // Kiểm tra email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Kiểm tra CCCD
    if (!formData.soCccd.trim()) {
      newErrors.soCccd = 'Số CCCD/CMND không được để trống';
    } else if (!/^\d{12}$/.test(formData.soCccd)) {
      newErrors.soCccd = 'Số CCCD phải có đúng 12 chữ số';
    }

    // Kiểm tra số điện thoại
    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Số điện thoại không được để trống';
    } else if (!/^0\d{9}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ (phải bắt đầu bằng số 0 và có 10 chữ số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSuccessMessage('');

    if (validateForm()) {
      setIsLoading(true);
      try {
        // Gọi API đăng ký từ backend thực
        await registerUser(formData);
        
        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
        
        // Reset form sau khi đăng ký thành công
        setFormData({
          userName: '',
          password: '',
          confirmPassword: '',
          hoKh: '',
          tenKh: '',
          email: '',
          soCccd: '',
          soDienThoai: '',
        });
        
        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        setSignupError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="form-section">
      <button 
        className="back-btn" 
        onClick={() => router.push('/home')}
      >
        ×
      </button>
      <h2>Đăng Ký</h2>
      
      {signupError && (
        <div className="error-message alert">{signupError}</div>
      )}
      
      {successMessage && (
        <div className="success-message alert">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="name-group">
          <div className="form-group">
            <label>Họ</label>
            <input
              type="text"
              name="hoKh"
              placeholder="Họ"
              value={formData.hoKh}
              onChange={handleChange}
            />
            {errors.hoKh && <p className="error">{errors.hoKh}</p>}
          </div>
          
          <div className="form-group">
            <label>Tên</label>
            <input
              type="text"
              name="tenKh"
              placeholder="Tên"
              value={formData.tenKh}
              onChange={handleChange}
            />
            {errors.tenKh && <p className="error">{errors.tenKh}</p>}
          </div>
        </div>

        <label>Tên tài khoản</label>
        <input
          type="text"
          name="userName"
          placeholder="Tạo tên tài khoản"
          value={formData.userName}
          onChange={handleChange}
        />
        {errors.userName && <p className="error">{errors.userName}</p>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Email của bạn"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Số CCCD/CMND</label>
        <input
          type="text"
          name="soCccd"
          placeholder="Nhập số CCCD/CMND"
          value={formData.soCccd}
          onChange={handleChange}
        />
        {errors.soCccd && <p className="error">{errors.soCccd}</p>}

        <label>Số điện thoại</label>
        <input
          type="tel"
          name="soDienThoai"
          placeholder="Nhập số điện thoại"
          value={formData.soDienThoai}
          onChange={handleChange}
        />
        {errors.soDienThoai && <p className="error">{errors.soDienThoai}</p>}

        <label>Mật khẩu</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Tạo mật khẩu"
            value={formData.password}
            onChange={handleChange}
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

        <label>Xác nhận mật khẩu</label>
        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
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

        <button 
          type="submit" 
          className="main-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>
      </form>

      <p className="footer-text">
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>

      <footer>© 2025 PASSION HORIZON</footer>
    </div>
  );
};

export default SignupForm;