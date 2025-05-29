"use client";
import React, { useState, useEffect } from "react";
import { getStaffs } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './StaffDirectory.module.css';

interface Staff {
  maNV: string;
  hoTen: string;
  chucVu: string;
  soDienThoai: string;
  email?: string;
  trangThai?: string;
}

export default function StaffDirectory() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [profile, setProfile] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth(); // Sử dụng useAuth

  // Lấy danh sách nhân viên từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Lấy danh sách nhân viên
        const staffData = await getStaffs();

        // Lọc nhân viên đang hoạt động
        const activeStaffs = staffData.filter((staff: Staff) =>
          staff.trangThai === 'Hoạt động' || !staff.trangThai
        );

        setStaffs(activeStaffs);

        // Lấy thông tin người dùng từ useAuth
        if (!authLoading && user) { // Kiểm tra authLoading và user
          // Tìm thông tin nhân viên tương ứng với người dùng hiện tại
          const currentUserStaff = staffData.find((staff: Staff) =>
            staff.hoTen?.toLowerCase().includes(user.hoTen?.toLowerCase() || '') // Sử dụng user.hoTen
          );

          setProfile(currentUserStaff || {
            hoTen: user.hoTen || 'Unknown User', // Sử dụng user.hoTen
            chucVu: user.role === 'R01' ? 'Quản lý' :
                   user.role === 'R02' ? 'Nhân viên' :
                   'Nhân viên', // Mặc định là Nhân viên
            maNV: user.maNguoiDung || 'N/A', // Sử dụng user.maNguoiDung nếu có
            email: 'N/A', // Cần xem xét lại cách lấy email nếu cần
            soDienThoai: 'N/A', // Cần xem xét lại cách lấy SĐT nếu cần
            trangThai: 'Hoạt động'
          } as Staff);
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu nhân viên");
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading]); // Thêm user, authLoading vào dependencies

  // Dùng CSS class cho các vai trò
  const getRoleBadgeClass = (role: string) => {
    switch(role) {
      case 'Quản lý':
        return `${styles.roleBadge} ${styles.roleManager}`;
      case 'Lễ tân':
        return `${styles.roleBadge} ${styles.roleReceptionist}`;
      case 'Buồng phòng':
        return `${styles.roleBadge} ${styles.roleHousekeeping}`;
      case 'Kế toán':
        return `${styles.roleBadge} ${styles.roleAccountant}`;
      default:
        return `${styles.roleBadge} ${styles.roleEmployee}`;
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Đang tải dữ liệu nhân viên...</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Danh mục nhân viên</h2>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>Hồ sơ của bạn</h3>
        {profile ? (
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>
                {profile.hoTen?.charAt(0) || 'N'}
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.profileName}>{profile.hoTen}</div>
                <div className={getRoleBadgeClass(profile.chucVu || 'Nhân viên')}>
                  {profile.chucVu || 'Nhân viên'}
                </div>
              </div>
            </div>
            <div className={styles.profileDetails}>
              <div className={styles.profileDetail}>
                <strong>Mã nhân viên:</strong> {profile.maNV}
              </div>
              <div className={styles.profileDetail}>
                <strong>Email:</strong> {profile.email || 'Chưa cập nhật'}
              </div>
              <div className={styles.profileDetail}>
                <strong>Số điện thoại:</strong> {profile.soDienThoai || 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.noProfile}>Không có thông tin hồ sơ</div>
        )}
      </div>

      <h3 className={styles.sectionTitle}>Danh sách nhân viên</h3>
      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.maNV}>
                <td className={styles.staffName}>{staff.hoTen}</td>
                <td>
                  <span className={getRoleBadgeClass(staff.chucVu)}>
                    {staff.chucVu}
                  </span>
                </td>
                <td className={styles.contactInfo}>{staff.soDienThoai || 'Chưa cập nhật'}</td>
                <td className={styles.contactInfo}>{staff.email || 'Chưa cập nhật'}</td>
              </tr>
            ))}
            {staffs.length === 0 && (
              <tr key="no-data">
                <td colSpan={4} className={styles.emptyState}>
                  Không có dữ liệu nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}