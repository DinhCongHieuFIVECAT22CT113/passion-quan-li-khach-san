'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export default function AccountPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.formSection}>
          <h1>Tài Khoản</h1>

          <div className={styles.formGroup}>
            <label>Tài khoản</label>
            <input type="text" placeholder="Nhập tài khoản" />
          </div>

          <div className={styles.formGroup}>
            <label>Password</label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className={styles.showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiển thị"} mật khẩu
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>New Password</label>
            <input type="password" placeholder="Nhập mật khẩu mới" />
          </div>

          <button className={styles.saveButton}>Save</button>
        </div>

        <div className={styles.profileSection}>
          <div className={styles.avatarUpload}>
            <div className={styles.avatarPlaceholder}>
              <Image
                src="/default-avatar.png"
                alt="Upload a Photo"
                width={120}
                height={120}
              />
            </div>
            <button className={styles.uploadButton}>Upload a Photo</button>
          </div>

          <div className={styles.identitySection}>
            <h2>Identity Verification</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>

            <div className={styles.userInfo}>
              <h3>John Doe - Host</h3>
              <div className={styles.verificationItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>Email Confirmed</span>
              </div>
              <div className={styles.verificationItem}>
                <span className={styles.checkIcon}>✓</span>
                <span>Mobile Confirmed</span>
              </div>
            </div>

            <button className={styles.editButton}>Edit Profile</button>

            <div className={styles.roleInfo}>
              <span className={styles.roleIcon}>★</span>
              <span>Admin</span>
            </div>

            <div className={styles.reviewInfo}>
              Reviewed By You
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 