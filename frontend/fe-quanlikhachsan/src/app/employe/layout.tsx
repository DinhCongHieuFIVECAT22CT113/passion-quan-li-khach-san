'use client';

import React, { useEffect } from 'react';
import NhanVienSidebarClient from "./NhanVienSidebarClient";
import AuthCheck from '../components/auth/AuthCheck';
import { APP_CONFIG } from '../../lib/config';
import { useAuth } from '../../lib/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  startSignalRConnection, 
  joinGroup, 
  subscribeToNotifications, 
  unsubscribeFromNotifications, 
  stopSignalRConnection 
} from '../../lib/signalr';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Cho phép tất cả nhân viên (R01, R02, R03) truy cập vào phần "employe"
  const staffRoles = [
    APP_CONFIG.roles.manager,    // R01
    APP_CONFIG.roles.employee,   // R02
    APP_CONFIG.roles.accountant, // R03
    'CRW'  // Legacy code nếu có
  ];
  
  const { user } = useAuth();
  
  useEffect(() => {
    // Kết nối SignalR khi component mount
    const connectSignalR = async () => {
      if (!user) return;
      
      const connected = await startSignalRConnection();
      if (connected) {
        // Tham gia nhóm theo vai trò
        if (user.role === 'R01' || user.role === 'R02') {
          await joinGroup('staff');
        } else if (user.role === 'R03') {
          await joinGroup('accountant');
        }
        
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
            case 'invoice_status_changed':
              toast.info(`Trạng thái hóa đơn ${notification.data.maHoaDon} đã thay đổi thành ${notification.data.trangThaiMoi}`);
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
  }, [user]);
  
  return (
    <AuthCheck requireAuth={true} requiredRoles={staffRoles}>
      <NhanVienSidebarClient>{children}</NhanVienSidebarClient>
      <ToastContainer position="top-right" autoClose={5000} />
    </AuthCheck>
  );
}