"use client";
import React, { useState } from "react";
import styles from "./Staffs.module.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface Staff {
  id: number;
  name: string;
  position: string;
  phone: string;
}

const initialStaffs: Staff[] = [
  { id: 1, name: "Nguyễn Văn A", position: "Lễ tân", phone: "0901234567" },
  { id: 2, name: "Trần Thị B", position: "Buồng phòng", phone: "0912345678" },
  { id: 3, name: "Lê Văn C", position: "Quản lý", phone: "0987654321" },
];

export default function StaffManager() {
  const [staffs, setStaffs] = useState<Staff[]>(initialStaffs);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<Staff>({ id: 0, name: "", position: "", phone: "" });

  const openAddModal = () => {
    setForm({ id: 0, name: "", position: "", phone: "" });
    setEditingStaff(null);
    setShowModal(true);
  };

  const openEditModal = (staff: Staff) => {
    setForm(staff);
    setEditingStaff(staff);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setForm({ id: 0, name: "", position: "", phone: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      setStaffs(staffs.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaff) {
      setStaffs(staffs.map((s) => (s.id === form.id ? form : s)));
    } else {
      setStaffs([...staffs, { ...form, id: staffs.length ? Math.max(...staffs.map(s => s.id)) + 1 : 1 }]);
    }
    closeModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý nhân viên</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          <FaPlus style={{marginRight:8}}/> Thêm nhân viên
        </button>
      </div>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.id}>
                <td>{staff.id}</td>
                <td>{staff.name}</td>
                <td>{staff.position}</td>
                <td>{staff.phone}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => openEditModal(staff)} title="Sửa">
                    <FaEdit style={{marginRight:4}}/> Sửa
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(staff.id)} title="Xóa">
                    <FaTrash style={{marginRight:4}}/> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingStaff ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Họ tên</label>
                <input name="name" value={form.name} onChange={handleChange} required className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Chức vụ</label>
                <input name="position" value={form.position} onChange={handleChange} required className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className={styles.input}/>
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>Hủy</button>
                <button type="submit" className={styles.addBtn}>{editingStaff ? "Lưu" : <><FaPlus style={{marginRight:4}}/>Thêm</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 