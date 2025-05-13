'use client';
import React, { useState } from "react";
import styles from "./CustomerManager.module.css";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  cccd: string;
  address?: string;
  note?: string;
}

const initialCustomers: Customer[] = [
  { 
    id: 1, 
    name: "Nguyễn Văn A", 
    email: "a@gmail.com", 
    phone: "0912345678", 
    cccd: "012345678901",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    note: "Khách VIP"
  },
  { 
    id: 2, 
    name: "Trần Thị B", 
    email: "b@gmail.com", 
    phone: "0987654321", 
    cccd: "012345678902",
    address: "456 Đường XYZ, Quận 2, TP.HCM"
  },
  { 
    id: 3, 
    name: "Lê Văn C", 
    email: "c@gmail.com", 
    phone: "0909090909", 
    cccd: "012345678903",
    address: "789 Đường DEF, Quận 3, TP.HCM",
    note: "Khách thường xuyên"
  },
];

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Customer>({ 
    id: 0, 
    name: "", 
    email: "", 
    phone: "", 
    cccd: "",
    address: "",
    note: ""
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.cccd.includes(search)
  );

  const openAddModal = () => {
    setForm({ id: 0, name: "", email: "", phone: "", cccd: "", address: "", note: "" });
    setShowAddModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setForm(customer);
    setEditCustomer(customer);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomers([...customers, { ...form, id: customers.length + 1 }]);
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomers(customers.map(c => c.id === form.id ? form : c));
    setEditCustomer(null);
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
    setShowDeleteConfirm(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý khách hàng</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm tên, email, SĐT, CCCD..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm khách hàng</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>CCCD</th>
              <th>Địa chỉ</th>
              <th>Ghi chú</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
            ) : filtered.map(customer => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.cccd}</td>
                <td>{customer.address}</td>
                <td>{customer.note}</td>
                <td style={{whiteSpace:'nowrap'}}>
                  <button className={styles.editBtn} onClick={() => openEditModal(customer)}>Sửa</button>
                  <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(customer.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm khách hàng</h3>
            <form onSubmit={handleAdd}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" required />
              <input name="cccd" value={form.cccd} onChange={handleChange} placeholder="CCCD" required />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" />
              <textarea name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú" rows={3} />
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editCustomer && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa khách hàng</h3>
            <form onSubmit={handleEdit}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Họ tên" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" required />
              <input name="cccd" value={form.cccd} onChange={handleChange} placeholder="CCCD" required />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" />
              <textarea name="note" value={form.note} onChange={handleChange} placeholder="Ghi chú" rows={3} />
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setEditCustomer(null)} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa */}
      {showDeleteConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa khách hàng này?</p>
            <div className={styles.buttonGroup}>
              <button className={styles.deleteBtn} onClick={() => handleDelete(showDeleteConfirm)}>Xóa</button>
              <button className={styles.editBtn} onClick={() => setShowDeleteConfirm(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 