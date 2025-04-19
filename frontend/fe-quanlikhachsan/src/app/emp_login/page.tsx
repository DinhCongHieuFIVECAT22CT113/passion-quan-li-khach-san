'use client';
import React from 'react';
import EmployeeLoginForm from '../../app/components/logsign/EmployeeLoginForm';

const EmployeeLoginPage: React.FC = () => {
  return (
    <div className="container">
      <EmployeeLoginForm />
      <div className="image-section" />
    </div>
  );
};

export default EmployeeLoginPage;