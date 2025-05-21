'use client';
import React, { useState, useEffect } from "react";
import styles from "./ServiceManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';

interface Service {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  price: number;
  description?: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Service>({ serviceId: "", serviceName: "", serviceType: "", price: 0, description: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách dịch vụ từ API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để xem dữ liệu");
        
        const response = await fetch(`${API_BASE_URL}/DichVu`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        const data = await handleResponse(response);
        setServices(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ serviceId: "", serviceName: "", serviceType: "", price: 0, description: "" });
    setEditingService(null);
    setShowModal(true);
  };

  // Mở modal Sửa
  const openEditModal = (service: Service) => {
    setForm(service);
    setEditingService(service);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setForm({ serviceId: "", serviceName: "", serviceType: "", price: 0, description: "" });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' ? Number(value) : value });
  };

  // Xác nhận xóa dịch vụ
  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
        
        const response = await fetch(`${API_BASE_URL}/DichVu/${serviceId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Không thể xóa dịch vụ");
        }
        
        // Cập nhật danh sách dịch vụ sau khi xóa
        setServices(services.filter(service => service.serviceId !== serviceId));
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi: ${error.message}`);
        console.error("Error deleting service:", error);
      }
    }
  };

  // Xử lý submit Thêm/Sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      // Đảm bảo price là số
      const normalizedForm = {
        ...form,
        price: Number(form.price) || 0
      };
      
      const formData = new FormData();
      for (const key in normalizedForm) {
        formData.append(key, String(normalizedForm[key as keyof typeof normalizedForm]));
      }
      
      let response;
      
      if (editingService) {
        // Cập nhật dịch vụ
        response = await fetch(`${API_BASE_URL}/DichVu/${editingService.serviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
          credentials: 'include',
        });
      } else {
        // Thêm dịch vụ mới
        response = await fetch(`${API_BASE_URL}/DichVu`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
          credentials: 'include',
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lưu thông tin dịch vụ");
      }
      
      // Lấy lại danh sách dịch vụ
      const updatedServices = await fetch(`${API_BASE_URL}/DichVu`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      const data = await handleResponse(updatedServices);
      setServices(data);
      closeModal();
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error saving service:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý dịch vụ</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm dịch vụ</button>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã dịch vụ</th>
                <th>Tên dịch vụ</th>
                <th>Loại</th>
                <th>Giá (VNĐ)</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu dịch vụ</td>
                </tr>
              ) : (
                services.map(service => (
                  <tr key={`service-${service.serviceId}`}>
                    <td>{service.serviceId}</td>
                    <td>{service.serviceName}</td>
                    <td>{service.serviceType}</td>
                    <td>{service.price === 0 ? <span className={styles.priceFree}>Miễn phí</span> : (service.price || 0).toLocaleString()}</td>
                    <td>{service.description || "-"}</td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEditModal(service)}>Sửa</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(service.serviceId)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Tên dịch vụ:</label>
                <input name="serviceName" value={form.serviceName} onChange={handleChange} placeholder="Tên dịch vụ" required />
              </div>
              <div>
                <label>Loại:</label>
                <input name="serviceType" value={form.serviceType} onChange={handleChange} placeholder="Loại dịch vụ" required />
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Giá" required min={0} />
              </div>
              <div>
                <label>Mô tả:</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả dịch vụ" rows={3} />
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>{editingService ? 'Lưu' : 'Thêm'}</button>
                <button type="button" onClick={closeModal} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 