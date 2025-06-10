'use client';
import React, { useState, useEffect } from 'react';
import { FaUsers, FaBed, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, handleResponse } from '@/lib/api';
import { withAuth, ROLES } from '@/lib/auth';

interface DashboardStats {
  totalCustomers: number;
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  roomOccupancy: any[];
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentBookings: [],
    roomOccupancy: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Gọi song song các API nhỏ để tổng hợp dữ liệu dashboard
        const [roomsRes, bookingsRes, invoicesRes, customersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/Phong`, { headers: await getAuthHeaders() }),
          fetch(`${API_BASE_URL}/DatPhong`, { headers: await getAuthHeaders() }),
          fetch(`${API_BASE_URL}/HoaDon`, { headers: await getAuthHeaders() }),
          fetch(`${API_BASE_URL}/KhachHang`, { headers: await getAuthHeaders() })
        ]);
        const [rooms, bookings, invoices, customers] = await Promise.all([
          handleResponse(roomsRes),
          handleResponse(bookingsRes),
          handleResponse(invoicesRes),
          handleResponse(customersRes)
        ]);

        // Tổng số khách hàng
        const totalCustomers = Array.isArray(customers) ? customers.length : 0;
        // Tổng số phòng
        const totalRooms = Array.isArray(rooms) ? rooms.length : 0;
        // Tổng số đặt phòng
        const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
        // Tổng doanh thu
        const totalRevenue = Array.isArray(invoices)
          ? invoices.reduce((sum, inv) => sum + (parseFloat(inv.TongTien || inv.tongTien || inv.amount || 0)), 0)
          : 0;
        // Đặt phòng gần đây (lấy 3 booking mới nhất theo ngày nhận phòng)
        const recentBookings = Array.isArray(bookings)
          ? bookings
              .sort((a, b) => new Date(b.NgayNhanPhong || b.ngayNhanPhong || b.checkInDate).getTime() - new Date(a.NgayNhanPhong || a.ngayNhanPhong || a.checkInDate).getTime())
              .slice(0, 3)
              .map(b => ({
                id: b.MaDatPhong || b.maDatPhong || b.id,
                customer: (() => {
                  const kh = customers.find((c: any) => (c.MaKh || c.maKh) === (b.MaKH || b.maKH));
                  return kh ? `${kh.HoKh || kh.hoKh || ''} ${kh.TenKh || kh.tenKh || ''}`.trim() : 'Không rõ';
                })(),
                room: (() => {
                  const p = rooms.find((r: any) => (r.MaPhong || r.maPhong) === (b.MaPhong || b.maPhong));
                  return p ? (p.SoPhong || p.soPhong || p.roomNumber || 'N/A') : 'N/A';
                })(),
                checkIn: b.NgayNhanPhong || b.ngayNhanPhong || b.checkInDate,
                checkOut: b.NgayTraPhong || b.ngayTraPhong || b.checkOutDate,
                status: b.TrangThai || b.trangThai || b.status || 'Đã đặt'
              }))
          : [];
        // Tình trạng phòng (group theo loại phòng và trạng thái)
        const roomOccupancy = Array.isArray(rooms)
          ? Object.values(
              rooms.reduce((acc: Record<string, {type: string, total: number, occupied: number}>, r: any) => {
                const type = r.TenLoaiPhong || r.tenLoaiPhong || r.LoaiPhong || r.loaiPhong || r.MaLoaiPhong || r.maLoaiPhong || 'Không rõ';
                if (!acc[type]) acc[type] = { type, total: 0, occupied: 0 };
                acc[type].total += 1;
                if ((r.TrangThai || r.trangThai || r.status) !== 'Trống') acc[type].occupied += 1;
                return acc;
              }, {})
            )
          : [];

        setStats({
          totalCustomers,
          totalRooms,
          totalBookings,
          totalRevenue,
          recentBookings,
          roomOccupancy
        });
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.dashboardTitle}>Dashboard</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUsers /></div>
          <div className={styles.statInfo}>
            <h3>Tổng khách hàng</h3>
            <p>{stats.totalCustomers}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaBed /></div>
          <div className={styles.statInfo}>
            <h3>Tổng số phòng</h3>
            <p>{stats.totalRooms}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaCalendarAlt /></div>
          <div className={styles.statInfo}>
            <h3>Đặt phòng</h3>
            <p>{stats.totalBookings}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaMoneyBillWave /></div>
          <div className={styles.statInfo}>
            <h3>Doanh thu</h3>
            <p>{stats.totalRevenue.toLocaleString('vi-VN')} VNĐ</p>
          </div>
        </div>
      </div>
      
      <div className={styles.dashboardSections}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Đặt phòng gần đây</h2>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Mã đặt phòng</th>
                  <th>Khách hàng</th>
                  <th>Phòng</th>
                  <th>Ngày đến</th>
                  <th>Ngày đi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.customer}</td>
                    <td>{booking.room}</td>
                    <td>{booking.checkIn}</td>
                    <td>{booking.checkOut}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${booking.status.replace(/\s+/g, '')}`]}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Tình trạng phòng</h2>
          <div className={styles.occupancyGrid}>
            {stats.roomOccupancy.map((type, index) => (
              <div key={index} className={styles.occupancyCard}>
                <h3>{type.type}</h3>
                <div className={styles.occupancyBar}>
                  <div 
                    className={styles.occupancyFill} 
                    style={{width: `${(type.occupied / type.total) * 100}%`}}
                  ></div>
                </div>
                <p>{type.occupied}/{type.total} phòng đang sử dụng</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage, [ROLES.ADMIN, ROLES.MANAGER]);