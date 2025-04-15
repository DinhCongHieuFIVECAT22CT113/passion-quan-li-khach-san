'use client';
import React, { useState } from 'react';
import '../../styles/logsing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [showModal, setShowModal] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ. Ví dụ: yourname@example.com';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Mật khẩu phải ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowModal(true); // Hiện modal xác nhận
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Hello New Customer</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Example@email.com" />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
          {errors.password && <p className="error">{errors.password}</p>}

          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="At least 8 characters" />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

          <button type="submit" className="main-btn">Sign up</button>

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
          Already have an account? <a href="/login">Sign in</a>
        </p>

        <footer>© 2025 ALL RIGHTS RESERVED</footer>
      </div>

      <div className="image-section" />

      {/* Modal hiển thị xác nhận */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Thông Báo</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <hr />
            <div className="modal-body">
              <p><strong>Đã Gửi Link Xác Thực Vui Lòng Check Email</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
