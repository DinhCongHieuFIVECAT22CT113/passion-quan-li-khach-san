'use client';
import React, { useState } from 'react';
import './logsign.css';

const SignupForm: React.FC = () => {
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
    <div className="form-section">
      <h2>Xin chào Bạn</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Example@email.com"
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <label>Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ít nhất 8 ký tự"
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <label>Xác nhận mật khẩu</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ít nhất 8 ký tự"
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

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

      <footer>© 2025 BẢN QUYỀN ĐƯỢC BẢO LƯU</footer>

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
