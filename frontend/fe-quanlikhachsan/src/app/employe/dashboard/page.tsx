'use client';
import React, { useEffect, useState } from 'react';
import { getUserInfo } from '../../../lib/config';
import { getDashboardStats } from '../../../lib/api';

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
  const [userInfo, setUserInfo] = useState<{ userName?: string } | null>(null);
  const [stats, setStats] = useState<DashboardData>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info as { userName?: string } | null); // Type assertion
    
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
  
  if (loading) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu...</div>;
  }
  
  if (error) {
    return <div style={{padding:'24px', color:'red', textAlign:'center'}}>Lỗi: {error}</div>;
  }
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Dashboard</h1>
        <div>
          <span>Xin chào, {userInfo?.userName || 'Quản lý'}</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%)', padding: '20px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Phòng có sẵn</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.rooms.available}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>Tổng số: {stats.rooms.total} phòng</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Đặt phòng hôm nay</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.bookings.today}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>Đang xử lý: {stats.bookings.pending}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)', padding: '20px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Doanh thu hôm nay</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{formatCurrency(stats.revenue.today)}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>TB ngày: {formatCurrency(stats.revenue.average)}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', padding: '20px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>Nhân viên trực</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.staff.onDuty}</div>
          <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>Tổng NV: {stats.staff.total}</div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Đặt phòng gần đây</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Mã đặt phòng</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Khách hàng</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Phòng</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Check-in</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Check-out</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.map((booking, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 8px' }}>{booking.maDatPhong}</td>
                    <td style={{ padding: '12px 8px' }}>{booking.customerName || booking.maKh}</td>
                    <td style={{ padding: '12px 8px' }}>{booking.roomName || booking.maPhong}</td>
                    <td style={{ padding: '12px 8px' }}>{formatDate(booking.ngayDen)}</td>
                    <td style={{ padding: '12px 8px' }}>{formatDate(booking.ngayDi)}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        backgroundColor:
                          booking.trangThai === 'Đã xác nhận' ? '#9ae6b4' :
                          booking.trangThai === 'Đang xử lý' || booking.trangThai === 'Đã đặt' ? '#fbd38d' :
                          booking.trangThai === 'Đã thanh toán' || booking.trangThai === 'Đã trả phòng' ? '#90cdf4' :
                          '#e9d8fd'
                      }}>
                        {booking.trangThai}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic', color: '#666' }}>Không có đặt phòng gần đây.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Trạng thái phòng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng số phòng</span>
                <span style={{ fontWeight: 'bold' }}>{stats.rooms.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phòng trống</span>
                <span style={{ color: 'green', fontWeight: 'bold' }}>{stats.rooms.available}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phòng đã đặt</span>
                <span style={{ color: 'blue', fontWeight: 'bold' }}>{stats.rooms.occupied}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phòng đang bảo trì</span>
                <span style={{ color: 'orange', fontWeight: 'bold' }}>{stats.rooms.maintenance}</span>
              </div>
            </div>
          </div>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem' }}>Doanh thu</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hôm nay</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(stats.revenue.today)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tuần này</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(stats.revenue.week)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tháng này</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(stats.revenue.month)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
