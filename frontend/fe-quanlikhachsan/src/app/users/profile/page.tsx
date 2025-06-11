'use client';

import React, { useState, useEffect, FC } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import PersonalInfoForm from '../../../app/components/profile/PersonalInfoForm';
import ChangePasswordModal from '../../../app/components/profile/ChangePasswordModal';
import AvatarUploadModal from '../../../app/components/profile/AvatarUploadModal';
//import TransactionHistory, { Transaction } from '../../../app/components/profile/TransactionHistory';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useLogout } from '../../../lib/hooks';
import { useAuth, ROLES } from '../../../lib/auth';
import AuthCheck from '../../components/auth/AuthCheck';
import { API_BASE_URL } from '../../../lib/config';

const ProfilePageContent: FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const handleLogout = useLogout();
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // User Info
  const [userInfo, setUserInfo] = useState({
    name: '',
    address: '',
    hokh: '',
    tenkh: '',
    email: '',
    phone: '',
    idNumber: '',
  });

  // Transaction History
  //const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([]);

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

  // Đánh dấu đã tải client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update user info when user context changes
  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.hoTen || '',
        address: user.diaChi || '',
        hokh: user.hoKh || '',
        tenkh: user.tenKh || '',
        email: user.email || '',
        phone: user.soDienThoai || '',
        idNumber: user.soCccd || '',
      });
      setAvatarSrc(user.anhDaiDien || user.avatarUrl || null);
    }
  }, [user]); // Thêm dependency để re-render khi user thay đổi

  // Fetch user profile and transaction history on page load
  useEffect(() => {

    const fetchData = async () => {
      if (!user?.maNguoiDung) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Lấy thông tin chi tiết khách hàng từ API
        const token = localStorage.getItem('token');
        const userResponse = await fetch(`${API_BASE_URL}/KhachHang/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Thông tin khách hàng từ API:', userData);
          
          // Cập nhật state với dữ liệu từ API
          setUserInfo({
            name: `${userData.hoKh || ''} ${userData.tenKh || ''}`.trim(),
            address: userData.diaChi || '',
            hokh: userData.hoKh || '',
            tenkh: userData.tenKh || '',
            email: userData.email || '',
            phone: userData.soDienThoai || '',
            idNumber: userData.soCccd || '',
          });
          
          // Cập nhật avatar nếu có (backend trả về field anhDaiDien)
          if (userData.anhDaiDien || userData.avatarUrl) {
            setAvatarSrc(userData.anhDaiDien || userData.avatarUrl);
          }
        }

        // Lấy lịch sử giao dịch
        //const transactionsResponse = await fetch(`/api/transactions?userId=${user.maNguoiDung}`);
        //if (transactionsResponse.ok) {
          //const { data } = await transactionsResponse.json();
          //setTransactionHistory(data || []);
        //} else {
          //console.error('Error fetching transactions:', await transactionsResponse.text());
          //setTransactionHistory([]);
       // }
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
    if (!currentPassword) errors.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPassword) {
      errors.new = 'Vui lòng nhập mật khẩu mới';
    }

    if (newPassword !== confirmNewPassword) errors.confirm = 'Mật khẩu xác nhận không khớp';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Gọi API thực tế để đổi mật khẩu
      const token = localStorage.getItem('token');

      // Tạo FormData cho multipart/form-data
      const formData = new FormData();
      formData.append('Password', currentPassword);
      formData.append('NewPassword', newPassword);
      formData.append('ConfirmPassword', confirmNewPassword);

      const response = await fetch(`${API_BASE_URL}/Auth/change-password`, {
        method: 'PUT', // Backend sử dụng PUT
        headers: {
          'Authorization': `Bearer ${token}`
          // Không set Content-Type để browser tự động set cho FormData
        },
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Đổi mật khẩu thành công');
        setShowChangePasswordSuccess(true);
        setTimeout(() => {
          setShowChangePasswordSuccess(false);
          setShowChangePasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        console.error('Response status:', response.status);

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.errors) {
            setPasswordErrors({
              current: errorData.errors.Password || errorData.errors.password,
              new: errorData.errors.NewPassword || errorData.errors.newPassword,
              confirm: errorData.errors.ConfirmPassword || errorData.errors.confirmPassword
            });
          } else {
            window.alert(errorData.message || errorText || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
          }
        } catch (parseError) {
          // Response không phải JSON
          window.alert(errorText || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      window.alert('Đã xảy ra lỗi khi đổi mật khẩu. Vui lòng thử lại sau.');
    }
  };

  // Handle Save Profile
const handleSaveProfile = async (data: any) => {
  try {
    // Gọi API mock để hiển thị thành công trên UI
    const mockResponse = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updatePersonalInfo',
        hokh: data.hokh,
        tenkh: data.tenkh,
        email: data.email,
        soDienThoai: data.soDienThoai,
        soCccd: data.soCccd,
        diaChi: data.diaChi || '',
      }),
    });

    // Gọi API thực tế để cập nhật dữ liệu vào SQL
    const token = localStorage.getItem('token');
    const realApiResponse = await fetch(`${API_BASE_URL}/KhachHang/cap-nhat-thong-tin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        hoKh: data.hokh,
        tenKh: data.tenkh,
        email: data.email,
        sdt: data.soDienThoai, // Backend sử dụng 'sdt' thay vì 'soDienThoai'
        soCccd: data.soCccd,
        diaChi: data.diaChi || '',
      }),
      credentials: 'include'
    });

    if (mockResponse.ok) {
      // Cập nhật state UI
      setUserInfo((prev) => ({
        ...prev,
        name: `${data.hokh} ${data.tenkh}`,
        hokh: data.hokh,
        tenkh: data.tenkh,
        email: data.email,
        phone: data.soDienThoai,
        idNumber: data.soCccd,
        address: data.diaChi || '',
      }));
      setIsEditing(false);

      // Kiểm tra kết quả từ API thực tế
      if (!realApiResponse.ok) {
        console.warn('Cập nhật UI thành công nhưng lưu vào SQL thất bại:', await realApiResponse.text());
      } else {
        console.log('Cập nhật thông tin cá nhân thành công cả UI và SQL');
      }
    } else {
      const errorData = await mockResponse.json();
      console.error('Error response from server:', errorData);
      window.alert(errorData.message || 'Cập nhật thông tin thất bại');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    window.alert('Lỗi khi cập nhật thông tin cá nhân');
  }
};

  // Hàm cập nhật avatar
  const handleAvatarUpdated = async (newAvatarUrl: string) => {
    try {
      setAvatarSrc(newAvatarUrl);
      
      // Không cần gọi API riêng để cập nhật avatarUrl
      // Vì đã được xử lý trong component AvatarUploadModal
      console.log("Avatar đã được cập nhật thành công:", newAvatarUrl);
    } catch (error) {
      console.error("Lỗi khi gọi API cập nhật avatar:", error);
    }
  };

  // Tránh render nội dung trước khi client mount
  if (!isClient) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (authLoading || isLoading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Header />

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <h1>Thông tin cá nhân</h1>
          </div>

          <div className={styles.profileBody}>
            <div className={styles.avatarSection}>
              <Image
                src={avatarSrc || '/default-avatar.png'}
                alt="Ảnh đại diện"
                width={150}
                height={150}
                className={styles.avatarImage}
                onClick={() => setShowAvatarModal(true)}
              />
              <button onClick={() => setShowAvatarModal(true)} className={styles.editAvatarButton}>
                Thay đổi ảnh đại diện
              </button>
            </div>

            <div className={styles.infoSection}>
              {isEditing ? (
<PersonalInfoForm
    initialValues={{
      hokh: userInfo.hokh || '',
      tenkh: userInfo.tenkh || '',
      email: userInfo.email || '',
      soDienThoai: userInfo.phone || '',
      soCccd: userInfo.idNumber || '',
      diaChi: userInfo.address || '',
    }}
    onSave={handleSaveProfile}
    onCancel={() => setIsEditing(false)}
  />
              ) : (
                <div className={styles.infoDisplay}>
                  <h2>{userInfo.name || 'Chưa cập nhật tên'}</h2>
                  <p>Email: {userInfo.email || 'Chưa cập nhật email'}</p>
                  <p>Số điện thoại: {userInfo.phone || 'Chưa cập nhật số điện thoại'}</p>
                  <p>Số CCCD: {userInfo.idNumber || 'Chưa cập nhật số CCCD'}</p>
                  <p>Địa chỉ: {userInfo.address || 'Chưa cập nhật địa chỉ'}</p>
                  <div className={styles.profileActionsRow}>
                    <button onClick={toggleEditMode} className={styles.editButton}>
                      Chỉnh sửa thông tin
                    </button>
                    <button onClick={() => setShowChangePasswordModal(true)} className={styles.actionButton}>
                      Đổi mật khẩu
                    </button>
                    <button onClick={() => router.push('/users/bookings')} className={styles.actionButton}>
                      Xem đặt phòng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*<TransactionHistory transactions={transactionHistory} />*/}
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



        {showAvatarModal && (
          <AvatarUploadModal 
            onClose={() => setShowAvatarModal(false)} 
            onAvatarSelected={handleAvatarUpdated}
          />
        )}
      </main>
      <Footer />
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