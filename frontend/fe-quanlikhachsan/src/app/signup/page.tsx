'use client';
import React from 'react';
import SignupForm from '../../app/components/logsign/SignupForm';
import './page.css';

const SignupPage: React.FC = () => {
  return (
    <div className="signup-container">
      <div className="form-wrapper">
        <SignupForm />
      </div>
      <div className="image-section">
        <h2>Chào mừng bạn đến với Passion Horizon</h2>
        <p>Đăng ký để trải nghiệm quản lý khách sạn chuyên nghiệp và tiện lợi.</p>
      </div>
    </div>
  );
};

export default SignupPage;
