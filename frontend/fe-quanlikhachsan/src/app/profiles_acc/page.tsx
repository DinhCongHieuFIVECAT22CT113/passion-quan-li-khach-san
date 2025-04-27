'use client';

import React, { useState, useEffect } from 'react';
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
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
  });

  // Transaction History
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and transaction history on page load
  useEffect(() => {
    const fetchProfileAndTransactions = async () => {
      try {
        // Fetch profile data
        const profileResponse = await fetch('/api/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (profileResponse.ok) {
          const { data } = await profileResponse.json();
          setUserInfo({
            name: `${data.hokh} ${data.tenkh}`,
          });
          setAvatarSrc(data.avatarSrc);
          setCoverPhotoSrc(data.coverPhotoSrc);
        } else {
          const errorData = await profileResponse.json();
          console.error('Error fetching profile:', errorData.message);
        }

        // Fetch transaction history
        const transactionsResponse = await fetch('/api/transactions', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (transactionsResponse.ok) {
          const { data } = await transactionsResponse.json();
          setTransactionHistory(data);
        } else {
          const errorData = await transactionsResponse.json();
          console.error('Error fetching transactions:', errorData.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndTransactions();
  }, []);

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

  // Xử lý Đổi mật khẩu
  const handleChangePassword = async () => {
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

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePassword',
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Đổi mật khẩu thành công:', data);
        setShowChangePasswordSuccess(true);
        setTimeout(() => {
          setShowChangePasswordSuccess(false);
          setShowChangePasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }, 3000);
      } else {
        if (data.errors) {
          setPasswordErrors(data.errors);
        } else {
          window.alert(data.message || 'Đổi mật khẩu thất bại');
        }
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      window.alert('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.');
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="account-container">
      {/* Header với nút Home */}
      <div className="account-header">
        <div className="account-actions">
          <button className="home-btn" onClick={() => (window.location.href = '/home')}>
            Quay trở lại trang chủ
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
            <i className="fa-solid fa-camera"></i> Chỉnh sửa ảnh bìa
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
            <p className="role">Khách hàng</p>
            <div className="profile-actions">
              <button className="action-btn" onClick={() => setShowAvatarModal(true)}>
                Đổi ảnh
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket logout-icon"></i> Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bố cục: Thông tin cá nhân trên, Lịch sử giao dịch dưới */}
      <div className="content-section">
        {/* Thông tin cá nhân */}
        <PersonalInfoForm 
          onSave={(data) => setUserInfo(prev => ({
            ...prev,
            name: `${data.hokh} ${data.tenkh}`,
          }))} 
          onChangePassword={() => setShowChangePasswordModal(true)}
          onPaymentOptions={() => setShowPaymentOptionsModal(true)}
        />

        {/* Lịch sử giao dịch */}
        <TransactionHistory transactions={transactionHistory} />
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
          onAvatarSelected={(src) => {
            setAvatarSrc(src);
            // Send to backend
            fetch('/api/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'updateAvatar',
                imageUrl: src,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (!data.success) {
                  console.error('Error updating avatar:', data.message);
                  setAvatarSrc(null); // Revert on failure
                }
              })
              .catch((error) => {
                console.error('Error updating avatar:', error);
                setAvatarSrc(null); // Revert on failure
              });
          }}
        />
      )}
      {showCoverPhotoModal && (
        <AvatarUploadModal
          onClose={() => setShowCoverPhotoModal(false)}
          onAvatarSelected={(src) => {
            setCoverPhotoSrc(src);
            // Send to backend
            fetch('/api/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'updateCoverPhoto',
                imageUrl: src,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (!data.success) {
                  console.error('Error updating cover photo:', data.message);
                  setCoverPhotoSrc(null); // Revert on failure
                }
              })
              .catch((error) => {
                console.error('Error updating cover photo:', error);
                setCoverPhotoSrc(null); // Revert on failure
              });
          }}
        />
      )}
    </div>
  );
};

export default AccountPage;