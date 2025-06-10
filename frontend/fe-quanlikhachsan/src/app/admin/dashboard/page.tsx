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
        // Mô phỏng dữ liệu dashboard vì API chưa có
        // Trong thực tế, bạn sẽ gọi API thực sự
        // const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        //   headers: getAuthHeaders()
        // });
        // const data = await handleResponse(response);
        
        // Dữ liệu mẫu
        const mockData = {
          totalCustomers: 245,
          totalRooms: 50,
          totalBookings: 128,
          totalRevenue: 75000000,
          recentBookings: [
            { id: 'BK001', customer: 'Nguyễn Văn A', room: '101', checkIn: '2023-10-15', checkOut: '2023-10-18', status: 'Đã thanh toán' },
            { id: 'BK002', customer: 'Trần Thị B', room: '205', checkIn: '2023-10-16', checkOut: '2023-10-20', status: 'Đang ở' },
            { id: 'BK003', customer: 'Lê Văn C', room: '302', checkIn: '2023-10-18', checkOut: '2023-10-22', status: 'Đã đặt' },
          ],
          roomOccupancy: [
            { type: 'Standard', total: 20, occupied: 15 },
            { type: 'Deluxe', total: 15, occupied: 10 },
            { type: 'Suite', total: 10, occupied: 5 },
            { type: 'Presidential', total: 5, occupied: 2 },
          ]
        };
        
        // Giả lập delay API
        setTimeout(() => {
          setStats(mockData);
          setLoading(false);
        }, 1000);
        
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