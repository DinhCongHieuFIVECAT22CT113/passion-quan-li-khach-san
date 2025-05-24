'use client';
import React, { useState, useEffect } from "react";
import styles from "./CustomerManager.module.css";
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';

interface Customer {
  MaKh: string;
  userName?: string;
  hoKh: string;
  tenKh: string;
  email: string;
  Sdt: string;
  SoCccd: string;
  diaChi?: string;
}

export default function CustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({ 
    MaKh: "", 
    userName: "",
    hoKh: "",
    tenKh: "", 
    email: "", 
    Sdt: "", 
    SoCccd: "",
    diaChi: "",
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
        
        const response = await fetch(`${API_BASE_URL}/KhachHang`, {
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
        
        // Đảm bảo các trường không null và đúng tên
        const safeData = data.map((customer: any): Customer => ({
          MaKh: customer.MaKh || customer.maKh || '',
          userName: customer.UserName || customer.userName || '',
          hoKh: customer.HoKh || customer.hoKh || '',
          tenKh: customer.TenKh || customer.tenKh || '',
          email: customer.Email || customer.email || '',
          Sdt: customer.Sdt || customer.sdt || customer.soDienThoai || '',
          SoCccd: customer.SoCccd || customer.soCccd || '',
          diaChi: customer.DiaChi || customer.diaChi || '',
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
    c.Sdt.includes(search) ||
    c.SoCccd.includes(search)
  );

  const openAddModal = () => {
    setForm({ 
      MaKh: "", 
      userName: "",
      hoKh: "",
      tenKh: "", 
      email: "", 
      Sdt: "", 
      SoCccd: "",
      diaChi: "",
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

  const handleDelete = async (MaKh: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/KhachHang/${MaKh}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      setCustomers(customers.filter(c => c.MaKh !== MaKh));
      setShowDeleteConfirm(null);
      alert('Xóa khách hàng thành công!');
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi xóa khách hàng: ${error.message}`);
      console.error("Error deleting customer:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      // Các trường gửi đi phải khớp với CreateKhachHangDto của BE
      // Đảm bảo tên trường (ví dụ: 'UserName', 'HoKh') khớp với những gì BE mong đợi cho FormData
      if (form.userName) formData.append('UserName', form.userName);
      if (form.hoKh) formData.append('HoKh', form.hoKh);
      if (form.tenKh) formData.append('TenKh', form.tenKh);
      if (form.email) formData.append('Email', form.email);
      if (form.Sdt) formData.append('Sdt', form.Sdt);
      if (form.SoCccd) formData.append('SoCccd', form.SoCccd);
      if (form.diaChi) formData.append('DiaChi', form.diaChi);
      // MaKh không gửi khi tạo mới, BE tự sinh
      
      const response = await fetch(`${API_BASE_URL}/KhachHang`, {
        method: 'POST',
        headers: getFormDataHeaders(), // Sử dụng getFormDataHeaders cho FormData
        body: formData, // Gửi FormData
        credentials: 'include'
      });
      
      // BE có thể trả về khách hàng vừa tạo hoặc chỉ status. 
      // Nếu trả về khách hàng, bạn có thể dùng newCustomer
      /* const newCustomer = await handleResponse(response); */
      await handleResponse(response); // Nếu BE chỉ trả về status
      
      // Tải lại danh sách khách hàng
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      let data = await handleResponse(customersResponse);
      if (!Array.isArray(data)) data = [];
      const safeData = data.map((customer: any): Customer => ({
        MaKh: customer.MaKh || customer.maKh || '',
        userName: customer.UserName || customer.userName || '',
        hoKh: customer.HoKh || customer.hoKh || '',
        tenKh: customer.TenKh || customer.tenKh || '',
        email: customer.Email || customer.email || '',
        Sdt: customer.Sdt || customer.sdt || customer.soDienThoai || '',
        SoCccd: customer.SoCccd || customer.soCccd || '',
        diaChi: customer.DiaChi || customer.diaChi || '',
      }));
      setCustomers(safeData);
      setShowAddModal(false);
      alert('Thêm khách hàng thành công!');
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi khi thêm khách hàng: ${error.message}`);
      console.error("Error adding customer:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.MaKh) {
      alert("Không tìm thấy mã khách hàng để cập nhật.");
      return;
    }
    if (!editCustomer) {
        alert("Dữ liệu khách hàng gốc không tồn tại để so sánh.");
        return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      let hasChanges = false;

      // Ưu tiên gửi các giá trị từ `form` nếu chúng tồn tại và có thể đã thay đổi
      // Gửi cả những trường có thể không thay đổi, nhưng backend có thể yêu cầu
      // Đảm bảo tên trường (ví dụ: 'Email', 'Sdt') khớp với những gì BE mong đợi

      // Các trường có thể người dùng đã chỉnh sửa trên form
      if (form.email !== undefined) {
        formData.append('Email', form.email);
        if (form.email !== editCustomer.email) hasChanges = true;
      }
      if (form.Sdt !== undefined) {
        formData.append('Sdt', form.Sdt);
        if (form.Sdt !== editCustomer.Sdt) hasChanges = true;
      }
      if (form.diaChi !== undefined) {
        formData.append('DiaChi', form.diaChi);
        if (form.diaChi !== editCustomer.diaChi) hasChanges = true;
      }
      if (form.SoCccd !== undefined) {
        formData.append('SoCccd', form.SoCccd);
        if (form.SoCccd !== editCustomer.SoCccd) hasChanges = true;
      }

      // Đối với các trường bị disabled trên form (HoKh, TenKh, UserName),
      // backend có thể vẫn yêu cầu chúng trong FormData.
      // Nếu vậy, chúng ta nên gửi giá trị gốc từ `editCustomer`
      // **Quan trọng: Điều này phụ thuộc vào DTO của backend.**
      // Nếu backend không muốn các trường này trong FormData khi PUT, hãy xóa chúng.
      if (editCustomer.hoKh) formData.append('HoKh', editCustomer.hoKh);
      if (editCustomer.tenKh) formData.append('TenKh', editCustomer.tenKh);
      if (editCustomer.userName) formData.append('UserName', editCustomer.userName);


      if (!hasChanges) {
        // Kiểm tra xem có trường nào được append vào formData không
        const formDataKeys = formData.keys();
        const firstKey = formDataKeys.next();
        const formDataIsEmpty = firstKey.done; // true nếu không có key nào

        if (formDataIsEmpty) {
             alert("Không có thông tin hợp lệ để cập nhật hoặc không có thay đổi.");
             setEditCustomer(null);
             return;
        }
        // Nếu có dữ liệu trong formData (do các trường cố định được thêm vào)
        // nhưng không có thay đổi ở các trường người dùng có thể sửa,
        // bạn có thể chọn không gửi request hoặc vẫn gửi nếu backend xử lý được.
         alert("Không có thông tin nào được thay đổi ở các trường có thể sửa.");
         setEditCustomer(null);
         return;
      }
      
      const response = await fetch(`${API_BASE_URL}/KhachHang/${form.MaKh}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include'
      });
      
      await handleResponse(response);
      
      // Tải lại danh sách khách hàng
      const customersResponse = await fetch(`${API_BASE_URL}/KhachHang`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      let data = await handleResponse(customersResponse);
      if (!Array.isArray(data)) data = [];
      const safeData = data.map((customer: any): Customer => ({
        MaKh: customer.MaKh || customer.maKh || '',
        userName: customer.UserName || customer.userName || '',
        hoKh: customer.HoKh || customer.hoKh || '',
        tenKh: customer.TenKh || customer.tenKh || '',
        email: customer.Email || customer.email || '',
        Sdt: customer.Sdt || customer.sdt || customer.soDienThoai || '',
        SoCccd: customer.SoCccd || customer.soCccd || '',
        diaChi: customer.DiaChi || customer.diaChi || '',
      }));
      setCustomers(safeData);
      setEditCustomer(null);
      alert('Cập nhật khách hàng thành công!');
    } catch (err) {
      const error = err as Error;
      // Cố gắng hiển thị thông báo lỗi cụ thể hơn từ server nếu có
      let alertMessage = `Lỗi khi cập nhật khách hàng: ${error.message}`;
      if (error.message.includes("One or more validation errors occurred")) {
          // Bạn có thể thử parse error.cause hoặc một thuộc tính khác nếu error.message không đủ chi tiết
          // Ví dụ: error.cause?.errors 
          alertMessage = "Lỗi cập nhật: Backend báo có lỗi validation. Vui lòng kiểm tra lại dữ liệu nhập.";
      }
      alert(alertMessage);
      console.error("Error updating customer:", error);
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
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
              ) : filtered.map(customer => (
                <tr key={customer.MaKh}>
                  <td>{customer.MaKh}</td>
                  <td>{customer.hoKh} {customer.tenKh}</td>
                  <td>{customer.email}</td>
                  <td>{customer.Sdt}</td>
                  <td>{customer.SoCccd}</td>
                  <td>{customer.diaChi}</td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.editBtn} onClick={() => openEditModal(customer)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(customer.MaKh)}>Xóa</button>
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
              <div className={styles.formGroup}>
                <label htmlFor="userName">Tên đăng nhập*</label>
                <input type="text" id="userName" name="userName" value={form.userName || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="hoKh">Họ khách hàng*</label>
                <input type="text" id="hoKh" name="hoKh" value={form.hoKh || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tenKh">Tên khách hàng*</label>
                <input type="text" id="tenKh" name="tenKh" value={form.tenKh || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email*</label>
                <input type="email" id="email" name="email" value={form.email || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="Sdt">Số điện thoại*</label>
                <input type="tel" id="Sdt" name="Sdt" value={form.Sdt || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="SoCccd">Số CCCD*</label>
                <input type="text" id="SoCccd" name="SoCccd" value={form.SoCccd || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="diaChi">Địa chỉ</label>
                <input type="text" id="diaChi" name="diaChi" value={form.diaChi || ''} onChange={handleChange} />
              </div>
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
              <div className={styles.formGroup}>
                <label htmlFor="userName">Tên đăng nhập</label>
                <input type="text" id="userName" name="userName" value={form.userName || ''} onChange={handleChange} disabled />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="hoKh">Họ khách hàng</label>
                <input type="text" id="hoKh" name="hoKh" value={form.hoKh || ''} onChange={handleChange} disabled />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tenKh">Tên khách hàng</label>
                <input type="text" id="tenKh" name="tenKh" value={form.tenKh || ''} onChange={handleChange} disabled />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email*</label>
                <input type="email" id="email" name="email" value={form.email || ''} onChange={handleChange} required disabled={!editCustomer} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="Sdt">Số điện thoại*</label>
                <input type="tel" id="Sdt" name="Sdt" value={form.Sdt || ''} onChange={handleChange} required disabled={!editCustomer} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="SoCccd">Số CCCD*</label>
                <input type="text" id="SoCccd" name="SoCccd" value={form.SoCccd || ''} onChange={handleChange} required disabled={!editCustomer} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="diaChi">Địa chỉ</label>
                <input type="text" id="diaChi" name="diaChi" value={form.diaChi || ''} onChange={handleChange} />
              </div>
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