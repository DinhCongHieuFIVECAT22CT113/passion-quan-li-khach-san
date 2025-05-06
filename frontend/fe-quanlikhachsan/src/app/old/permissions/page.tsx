'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

const roles = [
  {
    id: 1,
    title: 'Admin',
    description: 'Quản Lý Phân Quyền',
    icon: '/images/icons/admin-shield.svg'
  },
  {
    id: 2,
    title: 'Nhân Viên',
    description: 'Lễ tân, Dịch Vụ',
    icon: '/images/icons/employee.svg'
  },
  {
    id: 3,
    title: 'Khách Hàng',
    description: 'We are your allies',
    icon: '/images/icons/customer.svg'
  }
];

const bankServices = [
  {
    id: 1,
    title: 'Admin',
    description: 'Quản Lý Phân Quyền',
    permissions: {
      lorem1: 'Lorem Ipsum',
      lorem2: 'Many publishing',
      lorem3: 'Many publishing'
    }
  }
];

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'Nhân Viên',
    phone: '',
    department: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add API call to save employee
    console.log('New employee:', newEmployee);
    setShowAddModal(false);
    setNewEmployee({
      name: '',
      email: '',
      role: 'Nhân Viên',
      phone: '',
      department: ''
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Phân Quyền</h1>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          + Thêm Nhân Viên
        </button>
      </div>

      <div className={styles.rolesGrid}>
        {roles.map((role) => (
          <div key={role.id} className={styles.roleCard}>
            <div className={styles.roleIcon}>
              <Image src={role.icon} alt={role.title} width={32} height={32} />
            </div>
            <div className={styles.roleInfo}>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.servicesSection}>
        <h2>Bank Services List</h2>
        
        <div className={styles.servicesList}>
          {bankServices.map((service) => (
            <div key={service.id} className={styles.serviceItem}>
              <div className={styles.serviceHeader}>
                <div className={styles.serviceIcon}>
                  <Image src="/images/icons/admin-shield.svg" alt="" width={32} height={32} />
                </div>
                <div className={styles.serviceInfo}>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </div>

              <div className={styles.permissionsGrid}>
                {Object.entries(service.permissions).map(([key, value]) => (
                  <div key={key} className={styles.permissionItem}>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <div className={styles.roleSelector}>
                <button 
                  className={styles.roleSelectorButton}
                  onClick={() => setSelectedRole(selectedRole === 'Admin' ? '' : 'Admin')}
                >
                  {selectedRole || 'Select Role'}
                  <svg
                    className={`${styles.arrow} ${selectedRole ? styles.open : ''}`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                {!selectedRole && (
                  <div className={styles.roleDropdown}>
                    <div className={styles.roleOption} onClick={() => setSelectedRole('Admin')}>Admin</div>
                    <div className={styles.roleOption} onClick={() => setSelectedRole('Nhân Viên')}>Nhân Viên</div>
                    <div className={styles.roleOption} onClick={() => setSelectedRole('Khách Hàng')}>Khách Hàng</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Thêm Nhân Viên Mới</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newEmployee.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="department">Phòng ban</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={newEmployee.department}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role">Vai trò</label>
                <select
                  id="role"
                  name="role"
                  value={newEmployee.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Nhân Viên">Nhân Viên</option>
                  <option value="Admin">Admin</option>
                  <option value="Khách Hàng">Khách Hàng</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className={styles.submitButton}>
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 