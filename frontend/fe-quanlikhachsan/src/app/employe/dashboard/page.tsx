'use client';
import React, { useEffect, useState } from 'react';
import { useAuth, ROLES } from '../../../lib/auth';
import { getDashboardStats } from '../../../lib/api';
import styles from './Dashboard.module.css';

interface RoomStats { total: number; available: number; occupied: number; maintenance: number }
interface BookingStats { today: number; pending: number; completed: number; cancelled: number }
interface RevenueStats { today: number; week: number; month: number; average: number }
interface StaffStats { total: number; onDuty: number; managers: number; employees: number; accountants: number }
interface RecentBooking {
  maDatPhong: string;
  customerName?: string;
  maKh: string;
  roomName?: string;
  maPhong: string;
  ngayDen: string;
  ngayDi: string;
  trangThai: string;
}
interface DashboardData {
  rooms: RoomStats;
  bookings: BookingStats;
  revenue: RevenueStats;
  staff: StaffStats;
  recentBookings: RecentBooking[];
}

const initialStats: DashboardData = {
  rooms: { total: 0, available: 0, occupied: 0, maintenance: 0 },
  bookings: { today: 0, pending: 0, completed: 0, cancelled: 0 },
  revenue: { today: 0, week: 0, month: 0, average: 0 },
  staff: { total: 0, onDuty: 0, managers: 0, employees: 0, accountants: 0 },
  recentBookings: []
};

export default function ManagerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardData>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data as DashboardData);
        setError(null);
      } catch (err) {
        const error = err as Error;
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        setError(error.message || "Không thể lấy dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
      return dateString; // Trả về chuỗi gốc nếu không parse được
    }
  };

  if (authLoading || loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (!user || (user.role !== ROLES.MANAGER && user.role !== ROLES.ADMIN)) {
    return <div className={styles.noAccess}>Bạn không có quyền truy cập trang này. Chỉ dành cho Quản lý.</div>;
  }

  if (error) {
    return <div className={styles.error}>Lỗi: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard Quản lý</h1>
        <div className={styles.welcomeText}>
          Xin chào, {user?.hoTen || user?.maNguoiDung || 'Quản lý'}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.rooms}`}>
          <h3 className={styles.statTitle}>Phòng có sẵn</h3>
          <div className={styles.statValue}>{stats.rooms.available}</div>
          <div className={styles.statSubtext}>Tổng số: {stats.rooms.total} phòng</div>
        </div>

        <div className={`${styles.statCard} ${styles.bookings}`}>
          <h3 className={styles.statTitle}>Đặt phòng hôm nay</h3>
          <div className={styles.statValue}>{stats.bookings.today}</div>
          <div className={styles.statSubtext}>Đang xử lý: {stats.bookings.pending}</div>
        </div>

        <div className={`${styles.statCard} ${styles.revenue}`}>
          <h3 className={styles.statTitle}>Doanh thu hôm nay</h3>
          <div className={styles.statValue}>{formatCurrency(stats.revenue.today)}</div>
          <div className={styles.statSubtext}>TB ngày: {formatCurrency(stats.revenue.average)}</div>
        </div>

        <div className={`${styles.statCard} ${styles.staff}`}>
          <h3 className={styles.statTitle}>Nhân viên trực</h3>
          <div className={styles.statValue}>{stats.staff.onDuty}</div>
          <div className={styles.statSubtext}>Tổng NV: {stats.staff.total}</div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.recentBookings}>
          <h2 className={styles.sectionTitle}>Đặt phòng gần đây</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đặt phòng</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking) => (
                  <tr key={booking.maDatPhong}>
                    <td>{booking.maDatPhong}</td>
                    <td>{booking.customerName || booking.maKh}</td>
                    <td>{booking.roomName || booking.maPhong}</td>
                    <td>{formatDate(booking.ngayDen)}</td>
                    <td>{formatDate(booking.ngayDi)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        booking.trangThai === 'Đã xác nhận' ? styles.statusConfirmed :
                        booking.trangThai === 'Đang xử lý' || booking.trangThai === 'Đã đặt' ? styles.statusPending :
                        booking.trangThai === 'Đã thanh toán' || booking.trangThai === 'Đã trả phòng' ? styles.statusCompleted :
                        styles.statusCancelled
                      }`}>
                        {booking.trangThai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>Không có đặt phòng gần đây.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Trạng thái phòng</h2>
            <div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tổng số phòng</span>
                <span className={styles.infoValue}>{stats.rooms.total}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phòng trống</span>
                <span className={`${styles.infoValue} ${styles.available}`}>{stats.rooms.available}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phòng đã đặt</span>
                <span className={`${styles.infoValue} ${styles.occupied}`}>{stats.rooms.occupied}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phòng đang bảo trì</span>
                <span className={`${styles.infoValue} ${styles.maintenance}`}>{stats.rooms.maintenance}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Doanh thu</h2>
            <div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Hôm nay</span>
                <span className={styles.infoValue}>{formatCurrency(stats.revenue.today)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tuần này</span>
                <span className={styles.infoValue}>{formatCurrency(stats.revenue.week)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tháng này</span>
                <span className={styles.infoValue}>{formatCurrency(stats.revenue.month)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
