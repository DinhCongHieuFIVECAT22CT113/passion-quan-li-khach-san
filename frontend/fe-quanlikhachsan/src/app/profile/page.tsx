'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface UserData {
  avatar: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData({
          avatar: data.avatar || '/default-avatar.jpg',
          name: data.fullName || data.name,
          email: data.email,
          phone: data.phone || 'Chưa cập nhật',
          address: data.address || 'Chưa cập nhật'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!userData) {
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
            <Image src="/logo.png" alt="Logo" width={120} height={40} />
          </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/">Trang chủ</Link>
          <Link href="/about">Giới thiệu</Link>
          <Link href="/explore">Khám phá</Link>
          <Link href="/rooms">Phòng</Link>
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
            <Link href="/profile/edit" className={styles.editButton}>
              Chỉnh sửa thông tin
            </Link>
          </div>

          <div className={styles.profileContent}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                <Image
                  src={userData.avatar}
                  alt="Ảnh đại diện"
                  className={styles.avatar}
                  width={150}
                  height={150}
                />
              </div>
            </div>

            <div className={styles.infoSection}>
              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>
                  <FaUser />
                  <span>Họ và tên</span>
                </div>
                <div className={styles.infoValue}>{userData.name}</div>
              </div>

              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>
                  <FaEnvelope />
                  <span>Email</span>
                </div>
                <div className={styles.infoValue}>{userData.email}</div>
              </div>

              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>
                  <FaPhone />
                  <span>Số điện thoại</span>
                </div>
                <div className={styles.infoValue}>{userData.phone}</div>
              </div>

              <div className={styles.infoGroup}>
                <div className={styles.infoLabel}>
                  <FaMapMarkerAlt />
                  <span>Địa chỉ</span>
                </div>
                <div className={styles.infoValue}>{userData.address}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 