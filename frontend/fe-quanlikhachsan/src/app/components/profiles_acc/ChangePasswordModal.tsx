'use client';
import React, { useState } from 'react';
import './profiles_acc.css'; 

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
  // States to toggle visibility of each password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Đổi mật khẩu</h3>

        <div className="form-group">
          <label>Mật khẩu hiện tại</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={onCurrentPasswordChange}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <i className={showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.current && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>{passwordErrors.current}</p>
          )}
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={onNewPasswordChange}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <i className={showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.new && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>{passwordErrors.new}</p>
          )}
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={onConfirmNewPasswordChange}
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
          {passwordErrors.confirm && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>{passwordErrors.confirm}</p>
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-save-btn" onClick={onChangePassword}>
            Lưu
          </button>
          <button className="modal-cancel-btn" onClick={onClose}>
            Đóng
          </button>
        </div>

        {showSuccess && <p className="success-message">Đổi mật khẩu thành công!</p>}
      </div>
    </div>
  );
};

export default ChangePasswordModal;