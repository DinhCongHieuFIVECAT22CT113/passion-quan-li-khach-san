'use client';

import React, { useState, useEffect, FC } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';
import PersonalInfoForm from '../../../app/components/profile/PersonalInfoForm';
import ChangePasswordModal from '../../../app/components/profile/ChangePasswordModal';
import PaymentOptionsModal from '../../../app/components/profile/PaymentOptionsModal';
import AvatarUploadModal from '../../../app/components/profile/AvatarUploadModal';
import TransactionHistory, { Transaction } from '../../../app/components/profile/TransactionHistory';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../../app/i18n';
import Header from '../../components/layout/Header';
import { useLogout } from '../../../lib/hooks';
import { useAuth, ROLES } from '../../../lib/auth';
import AuthCheck from '../../components/auth/AuthCheck';

const ProfilePageContent: FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { languages, selectedLanguage, setSelectedLanguage } = useLanguage();
  const handleLogout = useLogout();
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // User Info
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
  });

  // Transaction History
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for Change Password
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

  // Modal state for Payment Options
  const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState(false);

  // Đồng bộ hóa ngôn ngữ chỉ trên client
  useEffect(() => {
    setIsClient(true);
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'vi';
    if (selectedLanguage !== savedLanguage) {
      setSelectedLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [selectedLanguage, setSelectedLanguage]);

  // Handle Language Change
  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
    localStorage.setItem('selectedLanguage', code);
    setIsLanguageDropdownOpen(false);
  };

  // Toggle Language Dropdown
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  // Fetch user profile and transaction history on page load
  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.hoTen || '',
        address: user.diaChi || '',
      });
      setAvatarSrc(user.avatarUrl || null);
    }

    const fetchData = async () => {
      if (!user?.maNguoiDung) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const transactionsResponse = await fetch(`/api/transactions?userId=${user.maNguoiDung}`);
        if (transactionsResponse.ok) {
          const { data } = await transactionsResponse.json();
          setTransactionHistory(data || []);
        } else {
          console.error('Error fetching transactions:', await transactionsResponse.text());
          setTransactionHistory([]);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    const errors: typeof passwordErrors = {};
    if (!currentPassword) errors.current = t('profile.currentPasswordRequired');
    if (!newPassword) {
      errors.new = t('profile.newPasswordRequired');
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(newPassword)) {
      errors.new = t('profile.newPasswordInvalid');
    }
    if (newPassword !== confirmNewPassword) errors.confirm = t('profile.confirmPasswordMismatch');

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
        console.log('Password changed successfully:', data);
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
          window.alert(data.message || t('profile.changePasswordFailed'));
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      window.alert(t('profile.changePasswordError'));
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (data: any) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateProfile',
          hokh: data.hokh,
          tenkh: data.tenkh,
          email: data.email,
          soDienThoai: data.soDienThoai,
          soCccd: data.soCccd,
        }),
      });

      if (response.ok) {
        setUserInfo((prev) => ({
          ...prev,
          name: `${data.hokh} ${data.tenkh}`,
          hokh: data.hokh,
          tenkh: data.tenkh,
          email: data.email,
          phone: data.soDienThoai,
          idNumber: data.soCccd
        }));
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        console.error('Error updating profile:', errorData.message);
        window.alert(errorData.message || t('profile.updateProfileFailed'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      window.alert(t('profile.updateProfileError'));
    }
  };

  // Hàm cập nhật avatar
  const handleAvatarUpdated = (newAvatarUrl: string) => {
    setAvatarSrc(newAvatarUrl);
    // TODO: Gọi API để lưu newAvatarUrl cho user trên server
    console.log("Avatar updated to:", newAvatarUrl);
    // Cập nhật user context nếu cần thiết, hoặc fetch lại user
  };

  // Tránh render nội dung phụ thuộc vào ngôn ngữ trước khi client mount
  if (!isClient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>{t('profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Header />

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <h1>{t('profile.title')}</h1>
            <div className={styles.actionsContainer}>
              <div className={styles.languageSelectorContainer}>
                <button onClick={toggleLanguageDropdown} className={styles.languageButton}>
                  {selectedLanguage.toUpperCase()} <span className={styles.dropdownArrow}>▼</span>
                </button>
                {isLanguageDropdownOpen && (
                  <div className={styles.languageDropdown}>
                    {languages.map((lang) => (
                      <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                {t('profile.logout')}
              </button>
            </div>
          </div>

          <div className={styles.profileBody}>
            <div className={styles.avatarSection}>
              <Image
                src={avatarSrc || '/default-avatar.png'}
                alt={t('profile.avatarAlt')}
                width={150}
                height={150}
                className={styles.avatarImage}
                onClick={() => setShowAvatarModal(true)}
              />
              <button onClick={() => setShowAvatarModal(true)} className={styles.editAvatarButton}>
                {t('profile.editAvatar')}
              </button>
            </div>

            <div className={styles.infoSection}>
              {isEditing ? (
                <PersonalInfoForm
                  initialValues={{
                    hokh: user.hoKh || '',
                    tenkh: user.tenKh || '',
                    email: user.email || '',
                    soDienThoai: user.soDienThoai || '',
                    soCccd: user.soCccd || '',
                  }}
                  onSave={handleSaveProfile} 
                  onCancel={() => setIsEditing(false)} 
                />
              ) : (
                <div className={styles.infoDisplay}>
                  <h2>{user.hoTen || t('profile.noName')}</h2>
                  <p>{t('profile.emailLabel')}: {user.email || t('profile.noEmail')}</p>
                  <p>{t('profile.phoneLabel')}: {user.soDienThoai || t('profile.noPhone')}</p>
                  <p>{t('profile.idNumberLabel')}: {user.soCccd || t('profile.noIdNumber')}</p>
                  <p>{t('profile.addressLabel')}: {user.diaChi || t('profile.noAddress')}</p>
                  <div className={styles.profileActionsRow}>
                    <button onClick={toggleEditMode} className={styles.editButton}>
                      {t('profile.editInfo')}
                    </button>
                    <button onClick={() => setShowChangePasswordModal(true)} className={styles.actionButton}>
                      {t('profile.changePassword')}
                    </button>
                    <button onClick={() => setShowPaymentOptionsModal(true)} className={styles.actionButton}>
                      {t('profile.paymentOptions')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <TransactionHistory transactions={transactionHistory} />
        </div>

        {showChangePasswordModal && (
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
        )}

        {showPaymentOptionsModal && (
          <PaymentOptionsModal onClose={() => setShowPaymentOptionsModal(false)} />
        )}

        {showAvatarModal && (
          <AvatarUploadModal 
            onClose={() => setShowAvatarModal(false)} 
            onAvatarSelected={handleAvatarUpdated}
          />
        )}
      </main>
    </div>
  );
};

// Tạo một component mới để bọc ProfilePageContent với AuthCheck
const UserProfilePage: FC = () => {
  return (
    <AuthCheck requireAuth={true} requiredRoles={[ROLES.CUSTOMER, ROLES.ADMIN]}>
      <ProfilePageContent />
    </AuthCheck>
  );
};

export default UserProfilePage; // Export component đã được bọc
