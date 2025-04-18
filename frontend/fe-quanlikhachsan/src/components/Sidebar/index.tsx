'use client';

import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      background: '#1a1f36',
      padding: '20px',
      color: 'white',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>PASSION</h1>
      </div>
      
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🏠 Dashboard
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/account" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              👤 Tài khoản
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link href="/language" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🌐 Ngôn ngữ
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 