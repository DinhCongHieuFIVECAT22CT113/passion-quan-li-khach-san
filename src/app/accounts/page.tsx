'use client';

import React, { useState } from 'react';
import PersonalInfoForm from '../../components/cus_accounts/PersonalInfoForm';
import ChangePasswordModal from '../../components/cus_accounts/ChangePasswordModal';
import PaymentOptionsModal from '../../components/cus_accounts/PaymentOptionsModal';
import AvatarUploadModal from '../../components/cus_accounts/AvatarUploadModal';
import TransactionHistory, { Transaction } from '../../components/cus_accounts/TransactionHistory';
import '../../styles/cus_account.css';

const AccountPage: React.FC = () => {
  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const handleLogout = () => {
    // Xóa dữ liệu đăng nhập nếu cần, ví dụ:
    localStorage.removeItem('token');
    sessionStorage.clear(); // hoặc bất kỳ logic logout nào bạn cần
  
    // Chuyển hướng về trang login
    window.location.href = '/login';
  };
  // State cho Thông tin cá nhân
  const [name, setName] = useState('Nguyễn Văn A');
  const [email, setEmail] = useState('example@email.com');
  const [phoneCode, setPhoneCode] = useState('+84');
  const [phone, setPhone] = useState('090xxxxxxx');
  const [address, setAddress] = useState('123 Đường ABC, Quận XYZ');
  const [idCard, setIdCard] = useState('');
  const [idCardError, setIdCardError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSaveInfoSuccess, setShowSaveInfoSuccess] = useState(false);

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedInternationalCard, setSelectedInternationalCard] = useState('');
  const [selectedVietnameseBank, setSelectedVietnameseBank] = useState('');
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false);
  const [showPaymentCompleteModal, setShowPaymentCompleteModal] = useState(false);
  const [isPaymentSaveDisabled, setIsPaymentSaveDisabled] = useState(true);

  // Dữ liệu mẫu
  const countryCodes = [{ code: '+84', country: 'Việt Nam' }];
  const internationalCards = ['Visa', 'Mastercard', 'American Express'];
  const vietnameseBanks = ['Vietcombank', 'Techcombank', 'MB Bank'];
  const transactionHistory: Transaction[] = [];

  // Xử lý Thông tin cá nhân
  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdCard(value);
    setIdCardError(value && !/^\d{12}$/.test(value) ? 'CMND/CCCD phải là 12 số.' : '');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(e.target.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? 'Email không đúng định dạng.' : '');
  };

  const handleSaveInfo = () => {
    if (!email || emailError || (idCard && idCardError)) return;
    console.log('Lưu thông tin:', { name, email, phoneCode, phone, address, idCard });
    setShowSaveInfoSuccess(true);
  };

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

  // Xử lý Thanh toán
  const handleConfirmPayment = () => {
    console.log('Đã xác nhận thanh toán');
    setShowPaymentCompleteModal(true);
    setTimeout(() => {
      setShowPaymentCompleteModal(false);
      setShowPaymentConfirmationModal(false);
      setShowPaymentOptionsModal(false);
    }, 3000);
  };

  const handleCloseSaveSuccess = () => {
    setShowSaveInfoSuccess(false);
  };

  return (
    <div className="account-container">
      <div className="account-header">
      <div className="account-actions">
  <button
    className="home-btn"
    onClick={() => window.location.href = '/home'}
  >
    Quay trở lại trang chủ
  </button>

  <button
  className="logout-btn"
  onClick={handleLogout}
>
  <i className="fas fa-sign-out-alt logout-icon"></i> Đăng Xuất
</button>
</div>
        <h2>Tài khoản</h2>
      </div>

      <div className="avatar-section">
  <div className="avatar-placeholder">
    {avatarSrc ? (
      <img src={avatarSrc} alt="Avatar" className="avatar-image" />
    ) : (
      <div className="avatar-icon"></div>
    )}
  </div>
  <button
    className="change-avatar-btn"
    onClick={() => setShowAvatarModal(true)}
  >
    Đổi ảnh
  </button>
</div>

      <PersonalInfoForm />

      <div className="action-card">
        <button className="action-btn" onClick={() => setShowChangePasswordModal(true)}>
          Đổi mật khẩu
        </button>
      </div>

      <TransactionHistory transactions={transactionHistory} />

      <div className="payment-card">
        <button className="payment-options-btn" onClick={() => setShowPaymentOptionsModal(true)}>
          Tùy chọn Thanh Toán
        </button>
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
    </div>
  );
};

export default AccountPage;
