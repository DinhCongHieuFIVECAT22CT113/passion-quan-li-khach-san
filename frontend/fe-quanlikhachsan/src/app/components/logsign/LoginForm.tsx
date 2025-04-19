'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './logsign.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const router = useRouter();

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ. Ví dụ: yourname@example.com';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự gồm chữ, số và ký tự đặc biệt';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Đăng nhập thành công', { email });
      alert('Đăng nhập thành công!');
      router.push('/home');
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setShowSuccessModal(false);
    setForgotEmail('');
    setForgotEmailError('');
  };

  const handleSendVerification = async () => {
    if (!validateEmail(forgotEmail)) {
      setForgotEmailError('Vui lòng nhập email hợp lệ');
      return;
    }

    setForgotEmailError('');
    setIsSending(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Email khôi phục đã gửi đến:', forgotEmail);
      setShowForgotModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      alert('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="form-section">
      <h2>Đăng Nhập</h2>

      <form onSubmit={handleSubmit}>
        <label>Địa chỉ Email</label>
        <input
          type="text"
          placeholder="Example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Mật khẩu</label>
        <input
          type="password"
          placeholder="Ít nhất 8 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <div className="options">
          <label>
            <input type="checkbox" /> Ghi nhớ tôi
          </label>
          <a href="#" onClick={handleForgotPassword}>Quên mật khẩu?</a>
        </div>

        <button type="submit" className="main-btn">Đăng nhập</button>

        <div className="divider">Hoặc</div>

        <button
          type="button"
          className="google-btn"
          onClick={() => window.open("https://accounts.google.com/signin", "_blank")}
        >
          Đăng nhập với Google
        </button>

        <button
          type="button"
          className="facebook-btn"
          onClick={() => window.open("https://www.facebook.com/login", "_blank")}
        >
          Đăng nhập với Facebook
        </button>

        <button
          type="button"
          className="employee-btn"
          onClick={() => router.push('/emp_login')}
        >
          Đăng nhập với tư cách nhân viên
        </button>
      </form>

      <p className="footer-text">
        Chưa có tài khoản? <a href="/signup">Đăng ký</a>
      </p>

      <footer>© 2025 BẢN QUYỀN ĐƯỢC BẢO LƯU</footer>

      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Khôi phục mật khẩu</h2>
              <button className="close-btn" onClick={() => setShowForgotModal(false)} disabled={isSending}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Vui lòng nhập địa chỉ email của bạn</p>
              <input
                type="email"
                placeholder="example@email.com"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setForgotEmailError('');
                }}
                disabled={isSending}
              />
              {forgotEmailError && <p className="error-message">{forgotEmailError}</p>}

              <button
                className="main-btn"
                onClick={handleSendVerification}
                disabled={isSending}
              >
                {isSending ? 'Đang gửi...' : 'Gửi email xác thực'}
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
                &times;
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
              <p><strong>Email khôi phục mật khẩu đã được gửi đến:</strong></p>
              <p style={{ color: '#102c3e', fontWeight: 'bold' }}>{forgotEmail}</p>
              <p>Vui lòng kiểm tra hộp thư đến của bạn</p>
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
