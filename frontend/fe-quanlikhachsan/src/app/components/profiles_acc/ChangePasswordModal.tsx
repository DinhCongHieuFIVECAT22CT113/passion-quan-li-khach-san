'use client';
import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Đổi mật khẩu</h3>

        <div className="form-group">
          <label>Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={onCurrentPasswordChange}
          />
          {passwordErrors.current && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>{passwordErrors.current}</p>
          )}
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={onNewPasswordChange}
          />
          {passwordErrors.new && (
            <p style={{ color: 'red', fontSize: '0.9rem' }}>{passwordErrors.new}</p>
          )}
        </div>

        <div className="form-group">
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={onConfirmNewPasswordChange}
          />
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
