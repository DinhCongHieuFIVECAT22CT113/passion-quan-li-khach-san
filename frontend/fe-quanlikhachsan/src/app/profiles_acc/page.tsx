'use client';

import React, { useState } from 'react';
import PersonalInfoForm from '../../app/components/profiles_acc/PersonalInfoForm';
import ChangePasswordModal from '../../app/components/profiles_acc/ChangePasswordModal';
import PaymentOptionsModal from '../../app/components/profiles_acc/PaymentOptionsModal';
import AvatarUploadModal from '../../app/components/profiles_acc/AvatarUploadModal';
import TransactionHistory, { Transaction } from '../../app/components/profiles_acc/TransactionHistory';

const AccountPage: React.FC = () => {
  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Cover Photo
  const [coverPhotoSrc, setCoverPhotoSrc] = useState<string | null>(null);
  const [showCoverPhotoModal, setShowCoverPhotoModal] = useState(false);

  // User Info
  const [userName, setUserName] = useState('Nguyễn Văn A');
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    address: 'Hà Nội, Việt Nam'
  });
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  // State cho Modal Đổi mật khẩu
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});
  const [showChangePasswordSuccess, setShowChangePasswordSuccess] = useState(false);

  // State cho Modal Tùy chọn Thanh Toán
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);

  // Dữ liệu mẫu
  const transactionHistory: Transaction[] = [];

  // Xử lý Đổi mật khẩu
  const handleChangePassword = () => {
    const errors: typeof passwordErrors = {};
    if (!currentPassword) errors.current = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!newPassword) {
      errors.new = 'Vui lòng nhập mật khẩu mới.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(newPassword)) {
      errors.new = 'Mật khẩu phải có ít nhất 8 ký tự gồm chữ, số và ký tự đặc biệt.';
    }
    if (newPassword !== confirmNewPassword) errors.confirm = 'Mật khẩu xác nhận không khớp.';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    console.log('Đổi mật khẩu thành công');
    setShowChangePasswordSuccess(true);
    setTimeout(() => {
      setShowChangePasswordSuccess(false);
      setShowChangePasswordModal(false);
    }, 3000);
  };

  return (
    <div className="account-container">
      {/* Header với nút Home và Logout */}
      <div className="account-header">
        <div className="account-actions">
          <button className="home-btn" onClick={() => (window.location.href = '/home')}>
            Quay trở lại trang chủ
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt logout-icon"></i> Đăng Xuất
          </button>
        </div>
      </div>

      {/* Phần thông tin người dùng */}
      <div className="profile-header">
        {/* Ảnh bìa với layout giống Facebook */}
        <div className="cover-photo-section">
          {coverPhotoSrc ? (
            <img src={coverPhotoSrc} alt="Cover Photo" className="cover-photo" />
          ) : (
            <div className="cover-photo-placeholder"></div>
          )}
          <button
            className="edit-cover-btn"
            onClick={() => setShowCoverPhotoModal(true)}
          >
            <i className="fas fa-camera"></i> Chỉnh sửa ảnh bìa
          </button>
          {/* Avatar được đặt chồng lên ảnh bìa */}
          <div className="avatar-section">
            <div className="avatar-placeholder">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-icon"></div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-content">
        <div className="profile-info">
          <h2>{userInfo.name}</h2>
          <p className="location">{userInfo.address}</p> {/* Hiển thị địa chỉ từ state */}
          <p className="role">Khách hàng</p>
            <div className="profile-actions">
              <button className="action-btn" onClick={() => setShowAvatarModal(true)}>
                Đổi ảnh
              </button>
              <button className="action-btn" onClick={() => setShowChangePasswordModal(true)}>
                Đổi mật khẩu
              </button>
              <button className="action-btn" onClick={() => setShowPaymentOptionsModal(true)}>
                Tùy chọn Thanh Toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bố cục 2 cột */}
      <div className="content-section">
        {/* Cột trái: Lịch sử giao dịch */}
        <div className="left-column">
          <TransactionHistory transactions={transactionHistory} />
        </div>

        {/* Cột phải: Thông tin cá nhân */}
        <div className="right-column">
        <PersonalInfoForm 
          onSave={(data) => setUserInfo(prev => ({
            ...prev,
            name: data.name,
            address: data.address
          }))} 
        />
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmNewPassword={confirmNewPassword}
        passwordErrors={passwordErrors}
        onCurrentPasswordChange={(e) => setCurrentPassword(e.target.value)}
        onNewPasswordChange={(e) => setNewPassword(e.target.value)}
        onConfirmNewPasswordChange={(e) => setConfirmNewPassword(e.target.value)}
        onChangePassword={handleChangePassword}
        showSuccess={showChangePasswordSuccess}
      />
      {showPaymentOptionsModal && (
        <PaymentOptionsModal onClose={() => setShowPaymentOptionsModal(false)} />
      )}
      {showAvatarModal && (
        <AvatarUploadModal
          onClose={() => setShowAvatarModal(false)}
          onAvatarSelected={(src) => setAvatarSrc(src)}
        />
      )}
      {showCoverPhotoModal && (
        <AvatarUploadModal
          onClose={() => setShowCoverPhotoModal(false)}
          onAvatarSelected={(src) => setCoverPhotoSrc(src)}
        />
      )}
    </div>
  );
};

export default AccountPage;