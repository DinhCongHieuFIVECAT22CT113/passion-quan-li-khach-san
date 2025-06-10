'use client';

import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { withAuth, ROLES } from '@/lib/auth';
import { startSignalRConnection, joinGroup, subscribeToNotifications, unsubscribeFromNotifications, stopSignalRConnection } from '@/lib/signalr';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Kết nối SignalR khi component mount
    const connectSignalR = async () => {
      const connected = await startSignalRConnection();
      if (connected) {
        // Tham gia nhóm admin để nhận thông báo
        await joinGroup('admin');
        
        // Đăng ký nhận thông báo
        subscribeToNotifications((notification) => {
          console.log('Received notification:', notification);
          
          // Xử lý thông báo dựa trên loại
          switch (notification.type) {
            case 'booking_created':
              toast.info(`Đặt phòng mới: ${notification.data.tenKhachHang} đã đặt phòng ${notification.data.soPhong}`);
              break;
            case 'booking_updated':
              toast.info(`Cập nhật đặt phòng: ${notification.data.maDatPhong}`);
              break;
            case 'booking_status_changed':
              toast.info(`Trạng thái đặt phòng ${notification.data.maDatPhong} đã thay đổi thành ${notification.data.trangThaiMoi}`);
              break;
            case 'room_status_changed':
              toast.info(`Trạng thái phòng ${notification.data.soPhong} đã thay đổi thành ${notification.data.trangThaiMoi}`);
              break;
            default:
              toast.info('Có thông báo mới');
          }
        });
      }
    };
    
    connectSignalR();
    
    // Cleanup khi component unmount
    return () => {
      unsubscribeFromNotifications();
      stopSignalRConnection();
    };
  }, []);

  return (
    <div className="adminContainer">
      <Sidebar />
      <main>{children}</main>
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

export default withAuth(AdminLayout, [ROLES.ADMIN, ROLES.MANAGER]);
