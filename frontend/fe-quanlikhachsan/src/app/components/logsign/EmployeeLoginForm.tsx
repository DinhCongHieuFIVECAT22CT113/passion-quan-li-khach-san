'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './logsign.css';

const EmployeeLoginForm: React.FC = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    employeeName?: string; 
    employeeId?: string; 
    password?: string 
  }>({});

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const validateEmployeeId = (id: string) => /^[A-Za-z0-9]{6,}$/.test(id);
  const validatePassword = (password: string) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!employeeName.trim()) {
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    }

    if (!validateEmployeeId(employeeId)) {
      newErrors.employeeId = 'Mã số nhân viên phải có ít nhất 6 ký tự';
    }

    if (!validatePassword(password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự gồm chữ, số và ký tự đặc biệt';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Đăng nhập nhân viên thành công', { employeeName, employeeId });
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="form-section">
      <h2>Nhân Viên</h2>

      <form onSubmit={handleSubmit}>
        <label>Tên Nhân Viên</label>
        <input
          type="text"
          placeholder="Nhập tên nhân viên"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
        />
        {errors.employeeName && <p className="error">{errors.employeeName}</p>}

        <label>Mã Số Nhân Viên</label>
        <input
          type="text"
          placeholder="Nhập mã số nhân viên"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        {errors.employeeId && <p className="error">{errors.employeeId}</p>}

        <label>Mật Khẩu</label>
        <input
          type="password"
          placeholder="Ít nhất 8 ký tự"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}

        <div className="options">
          <label>
            <input type="checkbox" /> Ghi nhớ đăng nhập
          </label>
        </div>

        <button type="submit" className="main-btn">Đăng nhập</button>

        <p className="footer-text">
          <a href="/login">← Đăng nhập với tư cách khách hàng</a>
        </p>


      </form>

      <footer>© 2025 ALL RIGHTS RESERVED</footer>
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Thông Báo</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/dashboard');
                }}
              >
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
              <p><strong>Đăng nhập thành công!</strong></p>
              <p style={{ color: '#102c3e', fontWeight: 'bold' }}>Chào mừng {employeeName}</p>
              <p>Đang chuyển hướng đến trang quản lý</p>
              <div style={{ marginTop: '20px' }}>
                <button
                  className="main-btn"
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/dashboard');
                  }}
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

export default EmployeeLoginForm;