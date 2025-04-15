'use client';
import React, { useState } from 'react';
import '../../styles/logsing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  // State cho form đăng nhập
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // State cho chức năng quên mật khẩu
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const router = useRouter();

  // Hàm validate
  const validateEmail = (email: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => 
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

  // Xử lý submit form đăng nhập
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

  // Xử lý quên mật khẩu
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
    setShowSuccessModal(false);
    setForgotEmail('');
    setForgotEmailError('');
  };

  // Gửi email xác thực
  const handleSendVerification = async () => {
    if (!validateEmail(forgotEmail)) {
      setForgotEmailError('Vui lòng nhập email hợp lệ');
      return;
    }

    setForgotEmailError('');
    setIsSending(true);
    
    try {
      // Giả lập gửi email (thay bằng API call thực tế)
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
    <div className="container">
      {/* Phần form đăng nhập */}
      <div className="form-section">
        <h2>Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="text"
            placeholder="Example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <div className="options">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <a href="#" onClick={handleForgotPassword}>Forgot Password?</a>
          </div>

          <button type="submit" className="main-btn">Sign in</button>

          <div className="divider">Or</div>

          <button type="button" className="google-btn" onClick={() => window.location.href = 'https://accounts.google.com/signin'}>
            <FontAwesomeIcon icon={faGoogle} className="social-icon" />
            Sign in with Google
          </button>

          <button type="button" className="facebook-btn" onClick={() => window.location.href = 'https://www.facebook.com/login'}>
            <FontAwesomeIcon icon={faFacebookF} className="social-icon" />
            Sign in with Facebook
          </button>
        </form>

        <p className="footer-text">
          Don't you have an account? <a href="/signup">Sign up</a>
        </p>

        <footer>© 2025 ALL RIGHTS RESERVED</footer>
      </div>
      
      <div className="image-section" />

      {/* Modal nhập email quên mật khẩu */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Khôi Phục Mật Khẩu</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowForgotModal(false)}
                disabled={isSending}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p>Nhập Email Của Bạn</p>
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
                {isSending ? 'Đang gửi...' : 'Gửi Email Xác Thực'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Thông Báo</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowSuccessModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ textAlign: 'center' }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  fill="#4CAF50"
                  style={{ marginBottom: '15px' }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                
                <p style={{ marginBottom: '10px' }}>
                  <strong>Email khôi phục mật khẩu đã được gửi đến:</strong>
                </p>
                
                <p style={{ 
                  color: '#102c3e', 
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}>
                  {forgotEmail}
                </p>
                
                <p>Xin vui lòng kiểm tra hộp thư của bạn</p>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
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

export default LoginPage;