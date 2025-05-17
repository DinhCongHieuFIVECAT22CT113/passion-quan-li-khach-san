'use client';
import React, { useState } from 'react';
import styles from './profile.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>{t('profile.changePassword')}</h3>

        <div className={styles.formGroup}>
          <label>{t('profile.currentPassword')}</label>
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
              <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {passwordErrors.current && (
            <p className={styles.error}>{passwordErrors.current}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t('profile.newPassword')}</label>
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
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {passwordErrors.new && (
            <p className={styles.error}>{passwordErrors.new}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t('profile.confirmPassword')}</label>
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
              <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {passwordErrors.confirm && (
            <p className={styles.error}>{passwordErrors.confirm}</p>
          )}
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalSaveBtn} onClick={onChangePassword}>
            {t('profile.save')}
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            {t('profile.close')}
          </button>
        </div>

        {showSuccess && <p className={styles.successMessage}>{t('profile.passwordSuccess')}</p>}
      </div>
    </div>
  );
};

export default ChangePasswordModal;