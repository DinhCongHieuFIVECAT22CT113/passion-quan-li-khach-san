'use client';
import React, { useState, useEffect } from 'react';
import { useAuth, ROLES } from '../../../lib/auth'; // Đảm bảo ROLES được import nếu sử dụng
import { APP_CONFIG } from '../../../lib/config';
import AuthCheck from '../../components/auth/AuthCheck';
import styles from './Permissions.module.css'; // Giữ lại từ FE-Fix

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
  'R01': [ 
    'user_view', 'user_create', 'user_edit',
    'room_view', 'room_create', 'room_edit', 'room_delete',
    'booking_view', 'booking_create', 'booking_edit', 'booking_cancel',
    'invoice_view', 'invoice_create', 'invoice_edit',
    'report_view', 'report_create',
  ],
  'R02': [ 
    'room_view',
    'booking_view', 'booking_create', 'booking_edit', 'booking_cancel',
  ],
  'R03': [ 
    'invoice_view', 'invoice_create', 'invoice_edit', 'invoice_delete',
    'report_view', 'report_create',
  ],
  'R04': [],
};

function PermissionsPageContent() {
  const [selectedRole, setSelectedRole] = useState('R00');
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // Thêm state cho isAdmin

  useEffect(() => {
    if (!authLoading && user) {
      setIsAdmin(user.role === ROLES.ADMIN);
    } else if (!authLoading && !user) {
      setIsAdmin(false);
    }
    // Cập nhật rolePerms khi selectedRole hoặc user thay đổi (để disabled checkbox cho admin)
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
    // setRolePerms đã được xử lý trong useEffect
  };
  
  const handlePermissionChange = (permId: string, checked: boolean) => {
    // Chỉ cho phép thay đổi nếu là admin và không phải đang sửa quyền của Admin
    if (isAdmin && selectedRole !== ROLES.ADMIN) {
      setRolePerms(prev => {
        const newPerms = checked ? [...prev, permId] : prev.filter(id => id !== permId);
        // Cập nhật rolePermissions (đây là phần quan trọng để lưu thay đổi thực sự)
        // Tuy nhiên, ví dụ này chỉ cập nhật state, chưa có logic lưu vào backend
        // rolePermissions[selectedRole as keyof typeof rolePermissions] = newPerms; 
        console.log(`Cập nhật quyền ${permId} cho vai trò ${selectedRole}: ${checked ? 'Thêm' : 'Xóa'}. RolePerms mới:`, newPerms);
        return newPerms;
      });
    }
  };
  
  // AuthCheck ở ngoài sẽ xử lý việc loading và user không phải admin
  // Nên không cần hiển thị loading hoặc thông báo lỗi ở đây nữa nếu đã được bọc bởi AuthCheck
  // Tuy nhiên, logic của FE-Fix có kiểm tra isAdmin, nên ta giữ lại để tương thích với CSS của nó

  if (authLoading) { // Giữ lại từ FE-Fix để styles.loading có tác dụng
    return <div className={styles.loading}>Đang kiểm tra quyền truy cập...</div>;
  }

  // AuthCheck đã kiểm tra user.role === APP_CONFIG.roles.admin
  // Biến isAdmin ở đây là để disable các checkbox nếu người dùng không phải admin (dù đã vào được trang)
  // hoặc đang xem quyền của chính Admin (R00)
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản lý phân quyền</h1>
      {/* 
        Nếu AuthCheck đã xử lý việc user không phải admin bị redirect, 
        thì đoạn check !isAdmin ở đây có thể không cần thiết để hiển thị lỗi nữa.
        Tuy nhiên, nó vẫn dùng để disable các input.
      */}
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
                          // Disable nếu không phải admin, hoặc đang xem quyền của Admin (R00),
                          // hoặc user không tồn tại (mặc dù AuthCheck nên xử lý trường hợp này)
                          disabled={!isAdmin || selectedRole === ROLES.ADMIN || !user }
                        />
                        <label htmlFor={perm.id} className={styles.label}>{perm.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Nút lưu chỉ hiển thị cho Admin và khi không xem vai trò Admin */}
              {isAdmin && selectedRole !== ROLES.ADMIN && (
                <button className={styles.saveButton}
                  onClick={() => {
                    // TODO: Implement logic to save updated rolePermissions to backend
                    alert('Đã lưu cấu hình phân quyền! (Cần implement lưu vào backend)');
                    console.log('Cấu hình phân quyền mới cần lưu:', rolePermissions);
                  }}
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