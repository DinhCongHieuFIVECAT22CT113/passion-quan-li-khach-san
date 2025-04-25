'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './Welcome.module.css';

/**
 * WelcomeForm component - The main welcome page with login and signup options
 */
const WelcomeForm: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => router.push('/login');
  const handleSignup = () => router.push('/signup');

  return (
    <div className={styles.formSection}>
      {/* Header Section */}
      <div className={styles.titleContainer}>
        <h1 className={styles.mainTitle}>PASSION HORIZON</h1>
        <p className={styles.subTitle}>Luxury Resort</p>
      </div>

      {/* Welcome Message */}
      <h2 className={styles.title}>Chào Mừng</h2>
      
      {/* Button Group */}
      <div className={styles.buttonGroup}>
        <div className={styles.formWrapper}>
          <button 
            className={styles.mainBtn}
            onClick={handleLogin}
            aria-label="Đăng nhập"
          >
            Đăng Nhập
          </button>
          
          <button 
            className={`${styles.mainBtn} ${styles.signupBtn}`}
            onClick={handleSignup}
            aria-label="Đăng ký"
          >
            Đăng Ký
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>© 2025 PASSION HORIZON</footer>
    </div>
  );
};

export default WelcomeForm;
