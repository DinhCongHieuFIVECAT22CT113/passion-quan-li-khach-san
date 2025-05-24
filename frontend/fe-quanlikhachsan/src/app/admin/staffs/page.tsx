"use client";
import React, { useState, useEffect } from "react";
import styles from "./Staffs.module.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getStaffs, createStaff, updateStaff, deleteStaff } from "../../../lib/api";

interface Staff {
  maNV: string;
  hoTen: string;
  chucVu: string;
  soDienThoai: string;
  email?: string;
  trangThai?: string;
}

export default function StaffManager() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<Staff>({ maNV: "", hoTen: "", chucVu: "", soDienThoai: "", email: "", trangThai: "Hoạt động" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách nhân viên từ API
  useEffect(() => {
    const fetchStaffs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStaffs();
        setStaffs(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu nhân viên");
        console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  const openAddModal = () => {
    setForm({ maNV: "", hoTen: "", chucVu: "", soDienThoai: "", email: "", trangThai: "Hoạt động" });
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
    setForm({ maNV: "", hoTen: "", chucVu: "", soDienThoai: "", email: "", trangThai: "Hoạt động" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDelete = async (maNV: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteStaff(maNV);
        setStaffs(staffs.filter((s) => s.maNV !== maNV));
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi khi xóa nhân viên: ${error.message}`);
        console.error("Lỗi xóa nhân viên:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Cập nhật nhân viên
        await updateStaff(form);
        setStaffs(staffs.map((s) => (s.maNV === form.maNV ? form : s)));
      } else {
        // Thêm nhân viên mới
        const newStaff = await createStaff(form);
        setStaffs([...staffs, newStaff]);
      }
      closeModal();
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Lỗi khi lưu nhân viên:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý nhân viên</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          <FaPlus style={{marginRight:8}}/> Thêm nhân viên
        </button>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã NV</th><th>Họ tên</th><th>Chức vụ</th><th>Số điện thoại</th><th>Email</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu nhân viên</td>
                </tr>
              ) : (
                staffs.map((staff) => (
                  <tr key={staff.maNV}>
                    <td>{staff.maNV}</td>
                    <td>{staff.hoTen}</td>
                    <td>{staff.chucVu}</td>
                    <td>{staff.soDienThoai}</td>
                    <td>{staff.email || "N/A"}</td>
                    <td>{staff.trangThai || "Hoạt động"}</td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEditModal(staff)} title="Sửa">
                        <FaEdit style={{marginRight:4}}/> Sửa
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(staff.maNV)} title="Xóa">
                        <FaTrash style={{marginRight:4}}/> Xóa
                      </button>
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
            <h3>{editingStaff ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              {!editingStaff && (
                <div className={styles.formGroup}>
                  <label>Mã nhân viên</label>
                  <input name="maNV" value={form.maNV} onChange={handleChange} placeholder="Mã nhân viên (NV001)" className={styles.input}/>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Họ tên</label>
                <input name="hoTen" value={form.hoTen} onChange={handleChange} required placeholder="Họ tên nhân viên" className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Chức vụ</label>
                <select name="chucVu" value={form.chucVu} onChange={handleChange} required className={styles.input}>
                  <option value="">Chọn chức vụ</option>
                  <option value="Quản lý">Quản lý</option>
                  <option value="Lễ tân">Lễ tân</option>
                  <option value="Buồng phòng">Buồng phòng</option>
                  <option value="Kế toán">Kế toán</option>
                  <option value="Bảo vệ">Bảo vệ</option>
                  <option value="Nhân viên khác">Nhân viên khác</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input 
                  name="soDienThoai" 
                  value={form.soDienThoai} 
                  onChange={handleChange} 
                  required 
                  placeholder="Số điện thoại" 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="Email" 
                  className={styles.input}
                  type="email" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select 
                  name="trangThai" 
                  value={form.trangThai} 
                  onChange={handleChange} 
                  className={styles.input}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
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