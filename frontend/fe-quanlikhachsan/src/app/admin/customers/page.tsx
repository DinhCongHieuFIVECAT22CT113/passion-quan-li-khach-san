'use client';
import React, { useState, useEffect } from "react";
import styles from "./CustomerManager.module.css";
import { API_BASE_URL } from '../../../lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '../../../lib/api';

interface Customer {
  maKh: string;
  hoKh: string;
  tenKh: string;
  email: string;
  soDienThoai: string;
  soCccd: string;
  diaChi?: string;
  ghiChu?: string;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Customer>({ 
    maKh: "", 
    hoKh: "",
    tenKh: "", 
    email: "", 
    soDienThoai: "", 
    soCccd: "",
    diaChi: "",
    ghiChu: ""
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách khách hàng từ API
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để xem dữ liệu");
        
        const response = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        // Sử dụng hàm handleResponse để xử lý phản hồi
        let data = await handleResponse(response);
        
        // Đảm bảo data là mảng
        if (!Array.isArray(data)) {
          console.warn("API did not return an array:", data);
          data = [];
        }
        
        // Đảm bảo các trường không null
        const safeData = data.map((customer: Customer) => ({
          ...customer,
          hoKh: customer.hoKh || '',
          tenKh: customer.tenKh || '',
          email: customer.email || '',
          soDienThoai: customer.soDienThoai || '',
          soCccd: customer.soCccd || '',
          diaChi: customer.diaChi || '',
          ghiChu: customer.ghiChu || ''
        }));
        setCustomers(safeData);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu");
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    (c.hoKh + ' ' + c.tenKh).toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.soDienThoai.includes(search) ||
    c.soCccd.includes(search)
  );

  const openAddModal = () => {
    setForm({ 
      maKh: "", 
      hoKh: "",
      tenKh: "", 
      email: "", 
      soDienThoai: "", 
      soCccd: "",
      diaChi: "",
      ghiChu: ""
    });
    setShowAddModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setForm(customer);
    setEditCustomer(customer);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        if (key !== 'maKh') { // Không gửi mã KH khi tạo mới
          formData.append(key, String(form[key as keyof Customer] || ''));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/KhachHang/Tạo khách hàng mới`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách khách hàng
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      
      const data = await handleResponse(customersResponse);
      setCustomers(Array.isArray(data) ? data : []);
      setShowAddModal(false);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error adding customer:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        formData.append(key, String(form[key as keyof Customer] || ''));
      }
      
      const response = await fetch(`${API_BASE_URL}/KhachHang/Cập nhật khách hàng?maKh=${form.maKh}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách khách hàng
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang/Lấy danh sách tất cả khách hàng`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      
      const data = await handleResponse(customersResponse);
      setCustomers(Array.isArray(data) ? data : []);
      setEditCustomer(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error updating customer:", error);
    }
  };

  const handleDelete = async (maKh: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const response = await fetch(`${API_BASE_URL}/KhachHang/Xóa khách hàng?maKh=${maKh}`, {
        method: 'DELETE',
        headers: getAuthHeaders('DELETE'),
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Cập nhật state
      setCustomers(customers.filter(c => c.maKh !== maKh));
      setShowDeleteConfirm(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error deleting customer:", error);
    }
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
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{overflowX:'auto'}}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã KH</th>
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
                <tr key={customer.maKh}>
                  <td>{customer.maKh}</td>
                  <td>{customer.hoKh} {customer.tenKh}</td>
                  <td>{customer.email}</td>
                  <td>{customer.soDienThoai}</td>
                  <td>{customer.soCccd}</td>
                  <td>{customer.diaChi}</td>
                  <td>{customer.ghiChu}</td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.editBtn} onClick={() => openEditModal(customer)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(customer.maKh)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm mới */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm khách hàng</h3>
            <form onSubmit={handleAdd}>
              <input name="hoKh" value={form.hoKh} onChange={handleChange} placeholder="Họ" required />
              <input name="tenKh" value={form.tenKh} onChange={handleChange} placeholder="Tên" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="soDienThoai" value={form.soDienThoai} onChange={handleChange} placeholder="Số điện thoại" required />
              <input name="soCccd" value={form.soCccd} onChange={handleChange} placeholder="CCCD" required />
              <input name="diaChi" value={form.diaChi} onChange={handleChange} placeholder="Địa chỉ" />
              <textarea name="ghiChu" value={form.ghiChu} onChange={handleChange} placeholder="Ghi chú" rows={3} />
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
              <input name="hoKh" value={form.hoKh} onChange={handleChange} placeholder="Họ" required />
              <input name="tenKh" value={form.tenKh} onChange={handleChange} placeholder="Tên" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
              <input name="soDienThoai" value={form.soDienThoai} onChange={handleChange} placeholder="Số điện thoại" required />
              <input name="soCccd" value={form.soCccd} onChange={handleChange} placeholder="CCCD" required />
              <input name="diaChi" value={form.diaChi} onChange={handleChange} placeholder="Địa chỉ" />
              <textarea name="ghiChu" value={form.ghiChu} onChange={handleChange} placeholder="Ghi chú" rows={3} />
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