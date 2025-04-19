'use client';
import React from 'react';
import SignupForm from '../../app/components/logsign/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <div className="container">
      <SignupForm />
      <div className="image-section" />
    </div>
  );
};

export default SignupPage;
