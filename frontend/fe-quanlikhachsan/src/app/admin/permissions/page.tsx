'use client';
import React, { useState } from 'react';
import styles from '../AdminLayout.module.css';

// Định nghĩa kiểu dữ liệu cho quyền
interface Permission {
  id: number;
  role: string;
  permissions: string;
  users: number;
  status: string;
}

// Định nghĩa kiểu dữ liệu cho form (không bao gồm id)
interface PermissionForm {
  role: string;
  permissions: string;
  users: number;
  status: string;
}

export default function PermissionsPage() {
  // Dữ liệu mẫu ban đầu
  const [permissions, setPermissions] = useState<Permission[]>([
    { id: 1, role: 'Quản trị viên', permissions: 'Toàn quyền', users: 5, status: 'Hoạt động' },
    { id: 2, role: 'Nhân viên', permissions: 'Xem, sửa', users: 10, status: 'Hoạt động' },
    { id: 3, role: 'Khách', permissions: 'Xem', users: 20, status: 'Ngừng' },
  ]);

  // Trạng thái modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPerm, setCurrentPerm] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<PermissionForm>({ role: '', permissions: '', users: 0, status: 'Hoạt động' });

  // Mở modal để thêm hoặc sửa
  const openModal = (perm: Permission | null = null) => {
    if (perm) {
      setIsEditMode(true);
      setCurrentPerm(perm);
      setFormData({ role: perm.role, permissions: perm.permissions, users: perm.users, status: perm.status });
    } else {
      setIsEditMode(false);
      setFormData({ role: '', permissions: '', users: 0, status: 'Hoạt động' });
    }
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPerm(null);
    setFormData({ role: '', permissions: '', users: 0, status: 'Hoạt động' });
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'users' ? parseInt(value) || 0 : value }));
  };

  // Thêm hoặc sửa vai trò
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && currentPerm) {
      // Sửa vai trò
      setPermissions((prev) =>
        prev.map((perm) =>
          perm.id === currentPerm.id ? { ...perm, ...formData } : perm
        )
      );
    } else {
      // Thêm vai trò mới
      const newPerm = {
        id: permissions.length > 0 ? Math.max(...permissions.map(p => p.id)) + 1 : 1,
        ...formData,
      };
      setPermissions((prev) => [...prev, newPerm]);
    }
    closeModal();
  };

  // Xóa vai trò
  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa vai trò này không?')) {
      setPermissions((prev) => prev.filter((perm) => perm.id !== id));
    }
  };

  return (
    <div className={styles.mainContent}>
      {/* Tiêu đề và nút Thêm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Quản lý phân quyền</h1>
        <button
          onClick={() => openModal()}
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Thêm vai trò
        </button>
      </div>

      {/* Bảng danh sách vai trò */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Vai trò</th>
            <th style={{ padding: '12px' }}>Quyền</th>
            <th style={{ padding: '12px' }}>Số người dùng</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
            <th style={{ padding: '12px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((perm) => (
            <tr key={perm.id} style={{ borderBottom: '1px solid #e9ecef' }}>
              <td style={{ padding: '12px' }}>{perm.id}</td>
              <td style={{ padding: '12px' }}>{perm.role}</td>
              <td style={{ padding: '12px' }}>{perm.permissions}</td>
              <td style={{ padding: '12px' }}>{perm.users}</td>
              <td style={{ padding: '12px', color: perm.status === 'Hoạt động' ? 'green' : 'red' }}>{perm.status}</td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => openModal(perm)}
                  style={{ marginRight: '8px', padding: '6px 12px', background: '#ffc107', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(perm.id)}
                  style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal để thêm/sửa vai trò */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2>{isEditMode ? 'Sửa vai trò' : 'Thêm vai trò'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Vai trò</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Quyền</label>
                <input
                  type="text"
                  name="permissions"
                  value={formData.permissions}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Số người dùng</label>
                <input
                  type="number"
                  name="users"
                  value={formData.users}
                  onChange={handleInputChange}
                  min="0"
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Ngừng">Ngừng</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {isEditMode ? 'Lưu' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}