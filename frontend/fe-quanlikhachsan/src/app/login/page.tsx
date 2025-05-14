'use client';
import React from 'react';
import LoginForm from '../../app/components/logsign/LoginForm';
import './page.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-container">
      <div className="form-wrapper">
        <LoginForm />
      </div>
      <div className="image-section">
        <h2>Chào mừng đến với Passion Horizon</h2>
        <p>Trải nghiệm quản lý khách sạn chuyên nghiệp và tiện lợi nhất.</p>
      </div>
    </div>
  );
};

export default LoginPage;
