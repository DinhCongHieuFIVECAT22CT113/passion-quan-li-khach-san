'use client';
import React, { useEffect, useState } from 'react';
import { getUserInfo } from '../../../lib/config';

export default function ManagerDashboardPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  
  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info);
  }, []);
  
  // Giả lập dữ liệu thống kê
  const stats = {
    rooms: {
      total: 120,
      available: 43,
      occupied: 77,
      maintenance: 0
    },
    bookings: {
      today: 15,
      pending: 8,
      completed: 120,
      cancelled: 5
    },
    revenue: {
      today: 25000000,
      week: 150000000,
      month: 580000000,
      average: 19000000
    },
    staff: {
      total: 45,
      onDuty: 12,
      managers: 3,
      employees: 32,
      accountants: 10
    }
  };
  
  // Format tiền theo định dạng VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
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
              {[
                { id: 'DP001', customer: 'Nguyễn Văn A', room: '101', checkin: '12/05/2025', checkout: '15/05/2025', status: 'Đã xác nhận' },
                { id: 'DP002', customer: 'Trần Thị B', room: '205', checkin: '13/05/2025', checkout: '16/05/2025', status: 'Đang xử lý' },
                { id: 'DP003', customer: 'Lê Văn C', room: '310', checkin: '14/05/2025', checkout: '17/05/2025', status: 'Đã thanh toán' },
                { id: 'DP004', customer: 'Phạm Thị D', room: '402', checkin: '15/05/2025', checkout: '18/05/2025', status: 'Chờ xác nhận' },
                { id: 'DP005', customer: 'Hoàng Văn E', room: '115', checkin: '16/05/2025', checkout: '19/05/2025', status: 'Đã xác nhận' },
              ].map((booking, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 8px' }}>{booking.id}</td>
                  <td style={{ padding: '12px 8px' }}>{booking.customer}</td>
                  <td style={{ padding: '12px 8px' }}>{booking.room}</td>
                  <td style={{ padding: '12px 8px' }}>{booking.checkin}</td>
                  <td style={{ padding: '12px 8px' }}>{booking.checkout}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      backgroundColor: 
                        booking.status === 'Đã xác nhận' ? '#9ae6b4' : 
                        booking.status === 'Đang xử lý' ? '#fbd38d' : 
                        booking.status === 'Đã thanh toán' ? '#90cdf4' : 
                        '#e9d8fd'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
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