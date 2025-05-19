"use client";
import React, { useState, useEffect } from "react";
import { getStaffs } from '../../../lib/api';
import { getUserInfo } from '../../../lib/config';

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
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Lấy thông tin người dùng từ localStorage
        const userInfo = getUserInfo();
        if (userInfo) {
          // Tìm thông tin nhân viên tương ứng với người dùng hiện tại
          const currentUserStaff = staffData.find((staff: Staff) => 
            staff.hoTen?.toLowerCase().includes(userInfo.userName?.toLowerCase())
          );
          
          setProfile(currentUserStaff || {
            hoTen: userInfo.userName,
            chucVu: userInfo.userRole === 'R01' ? 'Quản lý' : 
                   userInfo.userRole === 'R02' ? 'Nhân viên' : 
                   userInfo.userRole === 'R03' ? 'Kế toán' : 'Nhân viên',
            maNV: 'N/A',
            email: 'N/A',
            soDienThoai: 'N/A'
          });
        }
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu nhân viên");
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dùng màu khác nhau cho các vai trò
  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case 'Quản lý':
        return {
          background: '#c6f6d5',
          color: '#22543d'
        };
      case 'Lễ tân':
        return {
          background: '#bee3f8',
          color: '#2a4365'
        };
      case 'Buồng phòng':
        return {
          background: '#fed7d7',
          color: '#742a2a'
        };
      case 'Kế toán':
        return {
          background: '#feebc8',
          color: '#7b341e'
        };
      default:
        return {
          background: '#e9d8fd',
          color: '#44337a'
        };
    }
  };

  if (isLoading) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu nhân viên...</div>;
  }

  if (error) {
    return <div style={{padding:'24px', color:'red', textAlign:'center'}}>Lỗi: {error}</div>;
  }

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 24px'}}>
      <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35', marginBottom:16}}>Danh mục nhân viên</h2>
      
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:'1.2rem', fontWeight:600, marginBottom:16}}>Hồ sơ của bạn</h3>
        {profile ? (
          <div style={{
            display:'flex', 
            flexDirection:'column', 
            gap:8, 
            background:'#f7fafc', 
            padding:16, 
            borderRadius:8, 
            boxShadow:'0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{display:'flex', gap:12}}>
              <div style={{
                background:'#4a5568', 
                color:'white', 
                borderRadius:'50%', 
                width:64, 
                height:64, 
                display:'flex', 
                alignItems:'center', 
                justifyContent:'center', 
                fontWeight:700, 
                fontSize:'1.5rem'
              }}>
                {profile.hoTen?.charAt(0) || 'N'}
              </div>
              <div>
                <div style={{fontSize:'1.25rem', fontWeight:700}}>{profile.hoTen}</div>
                <div style={{
                  display:'inline-block',
                  margin:'6px 0',
                  padding:'4px 8px',
                  borderRadius:4,
                  fontSize:'0.875rem',
                  fontWeight:500,
                  ...getRoleBadgeStyle(profile.chucVu || 'Nhân viên')
                }}>
                  {profile.chucVu || 'Nhân viên'}
                </div>
              </div>
            </div>
            <div style={{marginTop:6}}>
              <div><strong>Mã nhân viên:</strong> {profile.maNV}</div>
              <div><strong>Email:</strong> {profile.email || 'Chưa cập nhật'}</div>
              <div><strong>Số điện thoại:</strong> {profile.soDienThoai || 'Chưa cập nhật'}</div>
            </div>
          </div>
        ) : (
          <div style={{color:'#718096', fontStyle:'italic'}}>Không có thông tin hồ sơ</div>
        )}
      </div>
      
      <h3 style={{fontSize:'1.2rem', fontWeight:600, marginBottom:16}}>Danh sách nhân viên</h3>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem'}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600, textAlign:'left'}}>Họ tên</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600, textAlign:'left'}}>Chức vụ</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600, textAlign:'left'}}>Số điện thoại</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600, textAlign:'left'}}>Email</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.maNV} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{staff.hoTen}</td>
                <td style={{padding:'12px 10px'}}>
                  <span style={{
                    display:'inline-block',
                    padding:'4px 8px',
                    borderRadius:4,
                    fontSize:'0.875rem',
                    fontWeight:500,
                    ...getRoleBadgeStyle(staff.chucVu)
                  }}>
                    {staff.chucVu}
                  </span>
                </td>
                <td style={{padding:'12px 10px'}}>{staff.soDienThoai}</td>
                <td style={{padding:'12px 10px'}}>{staff.email || 'Chưa cập nhật'}</td>
              </tr>
            ))}
            {staffs.length === 0 && (
              <tr key="no-data">
                <td colSpan={4} style={{textAlign:'center', padding:'20px', color:'#6b7280'}}>
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