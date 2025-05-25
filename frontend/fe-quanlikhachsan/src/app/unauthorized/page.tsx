import Link from 'next/link';
import React from 'react';

const UnauthorizedPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      textAlign: 'center', 
      padding: '20px',
      backgroundColor: '#f8f9fa' // Một màu nền nhẹ nhàng
    }}>
      <h1 style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }}>🚫 Truy cập bị từ chối</h1>
      <p style={{ fontSize: '1.2rem', color: '#6c757d', marginBottom: '2rem' }}>
        Rất tiếc, bạn không có quyền truy cập vào trang này.
      </p>
      <Link href="/" legacyBehavior>
        <a style={{
          padding: '10px 20px',
          fontSize: '1rem',
          color: '#fff',
          backgroundColor: '#007bff',
          border: 'none',
          borderRadius: '5px',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          Quay về trang chủ
        </a>
      </Link>
    </div>
  );
};

export default UnauthorizedPage; 