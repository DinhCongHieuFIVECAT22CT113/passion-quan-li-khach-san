// WelcomeForm.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Welcome.module.css';

const WelcomeForm: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.formSection}>
      <div className={styles.titleContainer}>
        <h1 className={styles.mainTitle}>PASSION HORIZON</h1>
        <p className={styles.subTitle}>Luxury Resort</p>
      </div>
      
      <div className={styles.buttonGroup}>
        <button 
          className={styles.mainBtn}
          onClick={() => router.push('/login')}
        >
          Đăng Nhập
        </button>
        
        <button 
          className={`${styles.mainBtn} ${styles.signupBtn}`}
          onClick={() => router.push('/signup')}
        >
          Đăng Ký
        </button>
      </div>

      <footer className={styles.footer}>© 2025 PASSION HORIZON</footer>
    </div>
  );
};

export default WelcomeForm;