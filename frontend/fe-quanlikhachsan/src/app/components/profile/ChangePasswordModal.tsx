'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  passwordErrors: {
    current?: string;
    new?: string;
    confirm?: string;
  };
  onCurrentPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmNewPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: () => void;
  showSuccess: boolean;
};

const ChangePasswordModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentPassword,
  newPassword,
  confirmNewPassword,
  passwordErrors,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onChangePassword,
  showSuccess,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>Đổi mật khẩu</h3>

        <div className={styles.formGroup}>
          <label>Mật khẩu hiện tại</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={onCurrentPasswordChange}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <i className={showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.current && (
            <p className={styles.error}>{passwordErrors.current}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu mới</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={onNewPasswordChange}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <i className={showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.new && (
            <p className={styles.error}>{passwordErrors.new}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={onConfirmNewPasswordChange}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.confirm && (
            <p className={styles.error}>{passwordErrors.confirm}</p>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalSaveBtn} onClick={onChangePassword}>
            Lưu
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            Đóng
          </button>
        </div>

        {showSuccess && <p className={styles.successMessage}>Đổi mật khẩu thành công!</p>}
      </div>
    </div>
  );
};

export default ChangePasswordModal;