'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import PersonalInfoForm from '../../../app/components/profile/PersonalInfoForm';
import ChangePasswordModal from '../../../app/components/profile/ChangePasswordModal';
import PaymentOptionsModal from '../../../app/components/profile/PaymentOptionsModal';
import AvatarUploadModal from '../../../app/components/profile/AvatarUploadModal';
import TransactionHistory, { Transaction } from '../../../app/components/profile/TransactionHistory';

const ProfilePage: React.FC = () => {
  const router = useRouter();

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className={styles.loadingContainer}>
        <p>Không thể tải thông tin người dùng. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={120} height={40} />
          </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/users/home">Trang chủ</Link>
          <Link href="/users/about">Giới thiệu</Link>
          <Link href="/users/explore">Khám phá</Link>
          <Link href="/users/rooms">Phòng</Link>
        </div>
        <div className={styles.navRight}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <h1>Thông tin cá nhân</h1>
            <button
              onClick={() => setShowAvatarModal(true)}
              className={styles.editButton}
            >
              Đổi ảnh đại diện
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
  <h2 className={styles.sectionTitle}>Lịch sử giao dịch</h2>
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
      {showPaymentOptionsModal && (
        <PaymentOptionsModal onClose={() => setShowPaymentOptionsModal(false)} />
      )}
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
  );
};

export default ProfilePage;