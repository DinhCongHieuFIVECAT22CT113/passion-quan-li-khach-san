'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, ROLES } from '../../../lib/auth'; // Bỏ APP_CONFIG khỏi đây
import { APP_CONFIG } from '../../../lib/config'; // Import APP_CONFIG từ đúng tệp
import AuthCheck from '../../components/auth/AuthCheck'; // Thêm AuthCheck
// import { getUserInfo } from '../../../lib/config'; // Xóa import này
<<<<<<< HEAD
// import styles from '../AdminLayout.module.css'; // Không sử dụng
=======
import { useAuth } from '../../../lib/auth'; // Thêm import useAuth
import styles from './Permissions.module.css';
>>>>>>> origin/FE-Fix

// Định nghĩa danh sách vai trò
const roleDefinitions = [
  { id: 'R00', name: 'Admin', description: 'Toàn quyền: quản lý hệ thống, người dùng, phân quyền, dữ liệu, cấu hình.' },
  { id: 'R01', name: 'Quản lý', description: 'Quản lý nhân sự, báo cáo, phòng, dịch vụ. Không can thiệp cấp hệ thống.' },
  { id: 'R02', name: 'Nhân viên', description: 'Xử lý nghiệp vụ thường ngày: đặt phòng, check-in/out, hỗ trợ khách hàng.' },
  { id: 'R03', name: 'Kế toán', description: 'Quản lý hóa đơn, thanh toán, báo cáo tài chính.' },
  { id: 'R04', name: 'Khách hàng', description: 'Không có quyền trong hệ thống quản trị. Chỉ dùng để lưu thông tin khách đặt phòng.' },
];

// Danh sách các quyền chi tiết
const permissions = [
  { id: 'user_view', name: 'Xem người dùng', module: 'Người dùng' },
  { id: 'user_create', name: 'Tạo người dùng', module: 'Người dùng' },
  { id: 'user_edit', name: 'Sửa người dùng', module: 'Người dùng' },
  { id: 'user_delete', name: 'Xóa người dùng', module: 'Người dùng' },
  
  { id: 'room_view', name: 'Xem phòng', module: 'Phòng' },
  { id: 'room_create', name: 'Tạo phòng', module: 'Phòng' },
  { id: 'room_edit', name: 'Sửa phòng', module: 'Phòng' },
  { id: 'room_delete', name: 'Xóa phòng', module: 'Phòng' },
  
  { id: 'booking_view', name: 'Xem đặt phòng', module: 'Đặt phòng' },
  { id: 'booking_create', name: 'Tạo đặt phòng', module: 'Đặt phòng' },
  { id: 'booking_edit', name: 'Sửa đặt phòng', module: 'Đặt phòng' },
  { id: 'booking_cancel', name: 'Hủy đặt phòng', module: 'Đặt phòng' },
  
  { id: 'invoice_view', name: 'Xem hóa đơn', module: 'Hóa đơn' },
  { id: 'invoice_create', name: 'Tạo hóa đơn', module: 'Hóa đơn' },
  { id: 'invoice_edit', name: 'Sửa hóa đơn', module: 'Hóa đơn' },
  { id: 'invoice_delete', name: 'Xóa hóa đơn', module: 'Hóa đơn' },
  
  { id: 'report_view', name: 'Xem báo cáo', module: 'Báo cáo' },
  { id: 'report_create', name: 'Tạo báo cáo', module: 'Báo cáo' },
];

// Ánh xạ quyền cho mỗi vai trò
const rolePermissions = {
  'R00': permissions.map(p => p.id), // Admin có tất cả quyền
  'R01': [ // Quản lý có hầu hết quyền trừ những quyền hệ thống
    'user_view', 'user_create', 'user_edit',
    'room_view', 'room_create', 'room_edit', 'room_delete',
    'booking_view', 'booking_create', 'booking_edit', 'booking_cancel',
    'invoice_view', 'invoice_create', 'invoice_edit',
    'report_view', 'report_create',
  ],
  'R02': [ // Nhân viên chỉ có quyền liên quan đến phòng và đặt phòng
    'room_view',
    'booking_view', 'booking_create', 'booking_edit', 'booking_cancel',
  ],
  'R03': [ // Kế toán chỉ có quyền liên quan đến hóa đơn và báo cáo
    'invoice_view', 'invoice_create', 'invoice_edit', 'invoice_delete',
    'report_view', 'report_create',
  ],
  'R04': [], // Khách hàng không có quyền trong hệ thống quản trị
};

function PermissionsPageContent() { // Đổi tên component để bọc bởi AuthCheck
  const [selectedRole, setSelectedRole] = useState('R00');
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  // const [isAdmin, setIsAdmin] = useState(false); // Sẽ không cần nữa nếu dùng AuthCheck
  const { user, loading: authLoading } = useAuth(); 
  
  useEffect(() => {
    // if (!authLoading) { 
    //   if (user) {
    //     // setIsAdmin(user.role === ROLES.ADMIN); // Sử dụng ROLES.ADMIN
    //   } else {
    //     // setIsAdmin(false); 
    //   }
    // }
    
    setRolePerms(rolePermissions[selectedRole as keyof typeof rolePermissions] || []);
  }, [selectedRole, user, authLoading]); 
  
  const modulePermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>);
  
  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId);
    setRolePerms(rolePermissions[roleId as keyof typeof rolePermissions] || []);
  };
  
  const handlePermissionChange = (permId: string, checked: boolean) => {
    if (checked) {
      setRolePerms(prev => [...prev, permId]);
    } else {
      setRolePerms(prev => prev.filter(id => id !== permId));
    }
    console.log(`Cập nhật quyền ${permId} cho vai trò ${selectedRole}: ${checked ? 'Thêm' : 'Xóa'}`);
  };
  
  // authLoading đã được AuthCheck xử lý ở trên
  // if (authLoading) {
  //   return <div>Đang tải dữ liệu người dùng...</div>;
  // }

  // Việc kiểm tra user có phải admin không cũng do AuthCheck xử lý
  // if (!user || user.role !== ROLES.ADMIN) { // Giả sử chỉ admin được vào
  //   return (
  //     <div style={{background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '4px', marginBottom: '20px'}}>
  //       Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý phân quyền.
  //     </div>
  //   );
  // }
  
  return (
<<<<<<< HEAD
    <div className="permissions-container" style={{padding: '24px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1>Quản lý phân quyền</h1>
      {/* Phần kiểm tra isAdmin và authLoading sẽ được AuthCheck xử lý */}
      {/* {authLoading ? ( ... ) : !isAdmin ? ( ... ) : ( ... ) } */}
      <>
        <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
          <div style={{width: '300px'}}>
            <h2 style={{marginBottom: '16px', fontSize: '18px'}}>Vai trò</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {roleDefinitions.map(role => (
                <div 
                  key={role.id} 
                  style={{
                    padding: '12px', 
                    border: `1px solid ${selectedRole === role.id ? '#3182ce' : '#e2e8f0'}`,
                    borderRadius: '4px',
                    background: selectedRole === role.id ? '#ebf8ff' : '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRoleChange(role.id)}
=======
    <div className={styles.container}>
      <h1 className={styles.title}>Quản lý phân quyền</h1>
      
      {authLoading ? (
        <div className={styles.loading}>Đang kiểm tra quyền truy cập...</div>
      ) : !isAdmin ? (
        <div className={styles.error}>
          Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý phân quyền.
        </div>
      ) : (
        <>
          <div className={styles.content}>
            <div className={styles.rolesList}>
              <h2 className={styles.sectionTitle}>Vai trò</h2>
              <div>
                {roleDefinitions.map(role => (
                  <div 
                    key={role.id} 
                    className={selectedRole === role.id ? styles.roleCardSelected : styles.roleCard}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <h3 className={styles.roleName}>{role.name} ({role.id})</h3>
                    <p className={styles.roleDescription}>{role.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.permissionsSection}>
              <h2 className={styles.sectionTitle}>Quyền hạn cho {roleDefinitions.find(r => r.id === selectedRole)?.name}</h2>
              
              {Object.entries(modulePermissions).map(([module, perms]) => (
                <div key={module} className={styles.moduleSection}>
                  <h3 className={styles.moduleTitle}>{module}</h3>
                  <div className={styles.permissionsGrid}>
                    {perms.map(perm => (
                      <div key={perm.id} className={styles.permissionItem}>
                        <input 
                          type="checkbox" 
                          id={perm.id}
                          className={styles.checkbox}
                          checked={rolePerms.includes(perm.id)}
                          onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                          disabled={!isAdmin || selectedRole === 'R00'} // Admin (R00) luôn có tất cả quyền
                        />
                        <label htmlFor={perm.id} className={styles.label}>{perm.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {isAdmin && selectedRole !== 'R00' && (
                <button className={styles.saveButton}
                  onClick={() => alert('Đã lưu cấu hình phân quyền!')}
>>>>>>> origin/FE-Fix
                >
                  <h3 style={{fontWeight: 'bold'}}>{role.name} ({role.id})</h3>
                  <p style={{fontSize: '14px', color: '#4a5568', marginTop: '4px'}}>{role.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{flex: 1}}>
            <h2 style={{marginBottom: '16px', fontSize: '18px'}}>Quyền hạn cho {roleDefinitions.find(r => r.id === selectedRole)?.name}</h2>
            
            {Object.entries(modulePermissions).map(([module, perms]) => (
              <div key={module} style={{marginBottom: '24px'}}>
                <h3 style={{borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px'}}>{module}</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px'}}>
                  {perms.map(perm => (
                    <div key={perm.id} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <input 
                        type="checkbox" 
                        id={perm.id} 
                        checked={rolePerms.includes(perm.id)}
                        onChange={(e) => handlePermissionChange(perm.id, e.target.checked)}
                        disabled={user?.role !== ROLES.ADMIN || selectedRole === ROLES.ADMIN} // Chỉ admin mới sửa được và ko sửa quyền admin
                      />
                      <label htmlFor={perm.id}>{perm.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {user?.role === ROLES.ADMIN && selectedRole !== ROLES.ADMIN && (
              <button 
                style={{
                  background: '#3182ce', 
                  color: 'white', 
                  padding: '10px 16px', 
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => alert('Đã lưu cấu hình phân quyền!')}
              >
                Lưu thay đổi
              </button>
            )}
          </div>
        </div>
      </>
    </div>
  );
}

// Bọc PermissionsPageContent bằng AuthCheck
export default function PermissionsPage() {
  return (
    <AuthCheck requireAuth={true} requiredRoles={[APP_CONFIG.roles.admin]}>
      <PermissionsPageContent />
    </AuthCheck>
  );
}