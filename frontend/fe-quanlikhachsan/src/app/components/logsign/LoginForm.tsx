'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './logsign.css';

const LoginForm: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ userName?: string; password?: string }>({});
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [forgotUserName, setForgotUserName] = useState('');
  const [forgotUserNameError, setForgotUserNameError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ Thêm

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirectUrl');

  useEffect(() => {
    setIsClient(true); // ✅ Đảm bảo đang ở phía client
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!userName.trim()) {
      newErrors.userName = 'Tên tài khoản không được để trống';
    }

    if (!password.trim()) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Đăng nhập thành công', data);
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/users/home');
          }
        } else {
          const errorData = await response.json();
          if (isClient) window.alert(errorData.message || 'Đăng nhập thất bại'); // ✅ Fix
        }
      } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        if (isClient) window.alert('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.'); // ✅ Fix
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setShowSuccessModal(false);
    setForgotUserName('');
    setForgotUserNameError('');
  };

  const handleSendVerification = async () => {
    if (!forgotUserName.trim()) {
      setForgotUserNameError('Vui lòng nhập tên tài khoản');
      return;
    }

    setForgotUserNameError('');
    setIsSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Email khôi phục đã gửi đến tài khoản:', forgotUserName);
      setShowForgotModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu khôi phục:', error);
      if (isClient) window.alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.'); // ✅ Fix
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="form-section">
      <button 
        className="back-btn" 
        onClick={() => router.push('/users/home')}
      >
        ×
      </button>
      <h2>Đăng Nhập</h2>

      <form onSubmit={handleSubmit}>
        <label>Tên tài khoản</label>
        <input
          type="text"
          placeholder="Nhập tên tài khoản của bạn"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        {errors.userName && <p className="error">{errors.userName}</p>}

        <label>Mật khẩu</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            /> Ghi nhớ tôi
          </label>
          <a href="#" onClick={handleForgotPassword}>Quên mật khẩu?</a>
        </div>

        <button 
          type="submit" 
          className="main-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>

        <div className="divider">Hoặc</div>

        <button
          type="button"
          className="google-btn"
          onClick={() => {
            if (isClient) window.open("https://accounts.google.com/signin", "_blank"); // ✅ Fix
          }}
        >
          Đăng nhập với Google
        </button>

        <button
          type="button"
          className="facebook-btn"
          onClick={() => {
            if (isClient) window.open("https://www.facebook.com/login", "_blank"); // ✅ Fix
          }}
        >
          Đăng nhập với Facebook
        </button>
      </form>

      <p className="footer-text">
        Chưa có tài khoản? <a href="/signup">Đăng ký</a>
      </p>

      <footer>© 2025 PASSION HORIZON</footer>

      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Khôi phục mật khẩu</h2>
              <button className="close-btn" onClick={() => setShowForgotModal(false)} disabled={isSending}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Vui lòng nhập tên tài khoản của bạn</p>
              <input
                type="text"
                placeholder="Nhập tên tài khoản"
                value={forgotUserName}
                onChange={(e) => {
                  setForgotUserName(e.target.value);
                  setForgotUserNameError('');
                }}
                disabled={isSending}
              />
              {forgotUserNameError && <p className="error-message">{forgotUserNameError}</p>}

              <button
                className="main-btn"
                onClick={handleSendVerification}
                disabled={isSending}
              >
                {isSending ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Thông báo</h2>
              <button className="close-btn" onClick={() => setShowSuccessModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="#4CAF50"
                style={{ marginBottom: '15px' }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <p><strong>Yêu cầu khôi phục mật khẩu đã được gửi cho tài khoản:</strong></p>
              <p style={{ color: '#102c3e', fontWeight: 'bold' }}>{forgotUserName}</p>
              <p>Vui lòng liên hệ quản trị viên hoặc kiểm tra email liên kết với tài khoản</p>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="main-btn"
                  onClick={() => setShowSuccessModal(false)}
                  style={{ width: '50%' }}
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
