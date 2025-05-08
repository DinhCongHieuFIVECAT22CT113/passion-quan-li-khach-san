'use client';
import React, { useState } from "react";
import styles from "./RoomManager.module.css";

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  status: string;
}

const initialRooms: Room[] = [
  { id: 1, name: "Phòng 101", type: "Deluxe", price: 1200000, status: "Trống" },
  { id: 2, name: "Phòng 102", type: "Standard", price: 900000, status: "Đã đặt" },
  { id: 3, name: "Phòng 201", type: "Suite", price: 2000000, status: "Đang dọn" },
];

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<Room>({ id: 0, name: "", type: "", price: 0, status: "" });

  // Mở modal Thêm mới
  const openAddModal = () => {
    setForm({ id: 0, name: "", type: "", price: 0, status: "" });
    setEditingRoom(null);
    setShowModal(true);
  };

  // Mở modal Sửa
  const openEditModal = (room: Room) => {
    setForm(room);
    setEditingRoom(room);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setForm({ id: 0, name: "", type: "", price: 0, status: "" });
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' ? Number(value) : value });
  };

  // Xác nhận xóa phòng
  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      setRooms(rooms.filter(room => room.id !== id));
    }
  };

  // Xử lý submit Thêm/Sửa
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === form.id ? form : r));
    } else {
      setRooms([...rooms, { ...form, id: rooms.length + 1 }]);
    }
    closeModal();
  };

  // Hàm render trạng thái với màu sắc
  const renderStatus = (status: string) => {
    if (status === 'Trống') return <span className={`${styles.status} ${styles['status-empty']}`}>Trống</span>;
    if (status === 'Đã đặt') return <span className={`${styles.status} ${styles['status-booked']}`}>Đã đặt</span>;
    if (status === 'Đang dọn') return <span className={`${styles.status} ${styles['status-cleaning']}`}>Đang dọn</span>;
    return <span className={styles.status}>{status}</span>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý phòng</h2>
        <button className={styles.addBtn} onClick={openAddModal}>+ Thêm phòng</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên phòng</th>
              <th>Loại</th>
              <th>Giá (VNĐ)</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.name}</td>
                <td>{room.type}</td>
                <td>{room.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</td>
                <td>{renderStatus(room.status)}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEditModal(room)}>Sửa</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(room.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingRoom ? 'Sửa phòng' : 'Thêm phòng'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Tên phòng:</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Tên phòng" required />
              </div>
              <div>
                <label>Loại phòng:</label>
                <input name="type" value={form.type} onChange={handleChange} placeholder="Loại phòng" required />
              </div>
              <div>
                <label>Giá (VNĐ):</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Giá" required min={0} />
              </div>
              <div>
                <label>Trạng thái:</label>
                <select name="status" value={form.status} onChange={handleChange} required>
                  <option value="">Chọn trạng thái</option>
                  <option value="Trống">Trống</option>
                  <option value="Đã đặt">Đã đặt</option>
                  <option value="Đang dọn">Đang dọn</option>
                </select>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>{editingRoom ? 'Lưu' : 'Thêm'}</button>
                <button type="button" onClick={closeModal} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 