'use client';

import React, { useState, useEffect, ChangeEvent, FC } from 'react';
import AuthCheck from '../../../app/components/auth/AuthCheck';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import PersonalInfoForm from '../../../app/components/profile/PersonalInfoForm';
import ChangePasswordModal from '../../../app/components/profile/ChangePasswordModal';
import PaymentOptionsModal from '../../../app/components/profile/PaymentOptionsModal';
import AvatarUploadModal from '../../../app/components/profile/AvatarUploadModal';
import TransactionHistory, { Transaction } from '../../../app/components/profile/TransactionHistory';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../../app/i18n';

interface Language {
  id: string;
  code: string;
  name: string;
  status: string;
}

const ProfilePage: FC = () => {
  const router = useRouter();
  const { t, i18n: i18nInstance } = useTranslation();
  const { languages, selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // User Info
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123 456 789',
    address: '123 Đường Láng, Hà Nội',
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
    setSelectedLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, []);

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
            email: data.email || 'nguyenvana@example.com',
            phone: data.soDienThoai || '0123 456 789',
            address: data.address || '123 Đường Láng, Hà Nội',
          });
          setAvatarSrc(data.avatarSrc);
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
    router.push('/login');
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

  // Tránh render nội dung phụ thuộc vào ngôn ngữ trước khi client mount
  if (!isClient) {
    return (
      <AuthCheck>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Loading...</p>
        </div>
      </AuthCheck>
    );
  }

  if (isLoading) {
    return (
      <AuthCheck>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>{t('profile.loading')}</p>
        </div>
      </AuthCheck>
    );
  }

  if (!userInfo) {
    return (
      <AuthCheck>
        <div className={styles.loadingContainer}>
          <p>{t('profile.noUserData')}</p>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.navLeft}>
            <Link href="/">
              <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
            </Link>
          </div>
          <div className={styles.navCenter}>
            <Link href="/users/home">{t('profile.home')}</Link>
            <Link href="/users/about">{t('profile.about')}</Link>
            <Link href="/users/explore">{t('profile.explore')}</Link>
            <Link href="/users/rooms">{t('profile.rooms')}</Link>
          </div>
          <div className={styles.navRight}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              {t('profile.logout')}
            </button>
          </div>
        </nav>

        <main className={styles.main}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <h1>{t('profile.title')}</h1>
              <button onClick={() => setShowAvatarModal(true)} className={styles.editButton}>
                {t('profile.changeAvatar')}
              </button>
            </div>

            <div className={styles.profileContent}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  <Image
                    src={avatarSrc || '/default-avatar.png'}
                    alt="Ảnh đại diện"
                    className={styles.avatar}
                    width={150}
                    height={150}
                  />
                </div>
              </div>

              <div className={styles.infoSection}>
                <div className={styles.infoGroup}>
                  <label>{t('profile.language')}</label>
                  <div className={styles.dropdownContainer}>
                    <button onClick={toggleLanguageDropdown} className={styles.dropdownButton}>
                      {languages.find((lang) => lang.code === selectedLanguage)?.name || t('profile.selectLanguage')}
                      <span className={styles.dropdownArrow}>▼</span>
                    </button>
                    {isLanguageDropdownOpen && (
                      <div className={styles.dropdownMenu}>
                        {languages
                          .filter((lang) => lang.status === 'Đang sử dụng')
                          .map((lang) => (
                            <button
                              key={lang.id}
                              onClick={() => handleLanguageChange(lang.code)}
                              className={styles.dropdownItem}
                            >
                              {lang.name}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <PersonalInfoForm
                  onSave={(data) =>
                    setUserInfo((prev) => ({
                      ...prev,
                      name: `${data.hokh} ${data.tenkh}`,
                    }))
                  }
                  onChangePassword={() => setShowChangePasswordModal(true)}
                  onPaymentOptions={() => setShowPaymentOptionsModal(true)}
                />
              </div>
            </div>

            <div className={styles.transactionSection}>
              <h2 className={styles.sectionTitle}>{t('profile.transactionHistory')}</h2>
              <TransactionHistory transactions={transactionHistory} />
            </div>
          </div>
        </main>

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
        {showPaymentOptionsModal && <PaymentOptionsModal onClose={() => setShowPaymentOptionsModal(false)} />}
        {showAvatarModal && (
          <AvatarUploadModal
            onClose={() => setShowAvatarModal(false)}
            onAvatarSelected={(src) => {
              setAvatarSrc(src);
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
                    setAvatarSrc(null);
                  }
                })
                .catch((error) => {
                  console.error('Error updating avatar:', error);
                  setAvatarSrc(null);
                });
            }}
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default ProfilePage;
