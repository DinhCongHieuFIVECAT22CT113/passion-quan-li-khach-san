'use client';
import React, { useState } from "react";
import styles from "./ServiceManager.module.css";

interface Service {
  id: number;
  name: string;
  type: string;
  price: number;
}

const initialServices: Service[] = [
  { id: 1, name: "Ăn sáng buffet", type: "Ăn uống", price: 150000 },
  { id: 2, name: "Giặt là", type: "Giặt là", price: 50000 },
  { id: 3, name: "Phòng gym", type: "Thể thao", price: 0 },
];

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Service>({ id: 0, name: "", type: "", price: 0 });

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ id: 0, name: "", type: "", price: 0 });
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
    setForm({ id: 0, name: "", type: "", price: 0 });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' ? Number(value) : value });
  };

  // Xác nhận xóa dịch vụ
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  // Xử lý submit Thêm/Sửa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices(services.map(s => s.id === form.id ? form : s));
    } else {
      setServices([...services, { ...form, id: services.length + 1 }]);
    }
    closeModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý dịch vụ</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm dịch vụ</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên dịch vụ</th>
              <th>Loại</th>
              <th>Giá (VNĐ)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td>{service.id}</td>
                <td>{service.name}</td>
                <td>{service.type}</td>
                <td>{service.price === 0 ? <span className={styles.priceFree}>Miễn phí</span> : service.price.toLocaleString()}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEditModal(service)}>Sửa</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(service.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Tên dịch vụ:</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Tên dịch vụ" required />
              </div>
              <div>
                <label>Loại:</label>
                <input name="type" value={form.type} onChange={handleChange} placeholder="Loại" required />
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Giá" required min={0} />
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