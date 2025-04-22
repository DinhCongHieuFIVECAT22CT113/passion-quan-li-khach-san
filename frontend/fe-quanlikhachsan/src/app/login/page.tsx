'use client';
import React from 'react';
import LoginForm from '../../app/components/logsign/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="container">
      <LoginForm />
      <div className="image-section" />
    </div>
  );
};

export default LoginPage;
