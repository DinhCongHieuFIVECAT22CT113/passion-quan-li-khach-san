'use client';
import React, { useState, useEffect } from "react";
import styles from "./ServiceManager.module.css";
import { getServices } from "../../../lib/api";
import { API_BASE_URL } from '../../../lib/config';

interface Service {
  maDichVu: string;
  tenDichVu: string;
  loaiDichVu: string;
  giaTien: number;
  moTa?: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Service>({ maDichVu: "", tenDichVu: "", loaiDichVu: "", giaTien: 0, moTa: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách dịch vụ từ API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Lấy danh sách dịch vụ
        const data = await getServices();
        // Đảm bảo giaTien luôn là số
        const servicesWithSafePrice = data.map((service: Service) => ({
          ...service,
          giaTien: service.giaTien || 0
        }));
        setServices(servicesWithSafePrice);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching services:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ maDichVu: "", tenDichVu: "", loaiDichVu: "", giaTien: 0, moTa: "" });
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
    setForm({ maDichVu: "", tenDichVu: "", loaiDichVu: "", giaTien: 0, moTa: "" });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'giaTien' ? Number(value) : value });
  };

  // Xác nhận xóa dịch vụ
  const handleDelete = async (maDichVu: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
        
        const response = await fetch(`${API_BASE_URL}/DichVu/Xóa dịch vụ?id=${maDichVu}`, {
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
        setServices(services.filter(service => service.maDichVu !== maDichVu));
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        console.error("Error deleting service:", err);
      }
    }
  };

  // Xử lý submit Thêm/Sửa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      // Đảm bảo giaTien là số
      const normalizedForm = {
        ...form,
        giaTien: Number(form.giaTien) || 0
      };
      
      const formData = new FormData();
      for (const key in normalizedForm) {
        formData.append(key, String(normalizedForm[key as keyof typeof normalizedForm]));
      }
      
      let response;
      
      if (editingService) {
        // Cập nhật dịch vụ
        response = await fetch(`${API_BASE_URL}/DichVu/Cập nhật dịch vụ`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
          credentials: 'include',
        });
      } else {
        // Thêm dịch vụ mới
        response = await fetch(`${API_BASE_URL}/DichVu/Tạo dịch vụ mới`, {
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
      const updatedServices = await getServices();
      const servicesWithSafePrice = updatedServices.map((service: Service) => ({
        ...service,
        giaTien: service.giaTien || 0
      }));
      
      setServices(servicesWithSafePrice);
      closeModal();
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error("Error saving service:", err);
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
                  <tr key={service.maDichVu}>
                    <td>{service.maDichVu}</td>
                    <td>{service.tenDichVu}</td>
                    <td>{service.loaiDichVu}</td>
                    <td>{service.giaTien === 0 ? <span className={styles.priceFree}>Miễn phí</span> : (service.giaTien || 0).toLocaleString()}</td>
                    <td>{service.moTa || "-"}</td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEditModal(service)}>Sửa</button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(service.maDichVu)}>Xóa</button>
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
                <input name="tenDichVu" value={form.tenDichVu} onChange={handleChange} placeholder="Tên dịch vụ" required />
              </div>
              <div>
                <label>Loại:</label>
                <input name="loaiDichVu" value={form.loaiDichVu} onChange={handleChange} placeholder="Loại dịch vụ" required />
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input name="giaTien" type="number" value={form.giaTien} onChange={handleChange} placeholder="Giá" required min={0} />
              </div>
              <div>
                <label>Mô tả:</label>
                <textarea name="moTa" value={form.moTa} onChange={handleChange} placeholder="Mô tả dịch vụ" rows={3} />
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