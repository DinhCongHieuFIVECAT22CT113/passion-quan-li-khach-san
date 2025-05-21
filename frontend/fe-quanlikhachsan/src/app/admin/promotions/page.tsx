'use client';
import React, { useState, useEffect } from "react";
import styles from "./PromotionManager.module.css";
import { getPromotions, getAuthHeaders, getFormDataHeaders, handleResponse } from "../../../lib/api";
import { API_BASE_URL } from '../../../lib/config';

interface Promotion {
  maKM: string;
  tenKM: string;
  phanTramGiam: number;
  loaiKhuyenMai: string;
  doiTuongApDung: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  moTa?: string;
  trangThai: 'Đang áp dụng' | 'Đã hết hạn' | 'Sắp diễn ra';
}

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Promotion>({ 
    maKM: "", 
    tenKM: "", 
    phanTramGiam: 0, 
    loaiKhuyenMai: "", 
    doiTuongApDung: "", 
    ngayBatDau: "", 
    ngayKetThuc: "",
    moTa: "",
    trangThai: 'Đang áp dụng'
  });

  // Lấy danh sách khuyến mãi từ API
  useEffect(() => {
    const fetchPromotions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Bạn cần đăng nhập để xem dữ liệu");
        
        const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
          method: 'GET',
          headers: getAuthHeaders('GET'),
          credentials: 'include'
        });
        
        const data = await handleResponse(response);
        setPromotions(data);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

    const filtered = promotions.filter(p =>    (p.tenKM || '').toLowerCase().includes(search.toLowerCase()) ||    (p.loaiKhuyenMai || '').toLowerCase().includes(search.toLowerCase()) ||    (p.doiTuongApDung || '').toLowerCase().includes(search.toLowerCase())  );

  const getStatusClass = (status: Promotion['trangThai']) => {
    switch(status) {
      case 'Đang áp dụng': return styles.statusActive;
      case 'Đã hết hạn': return styles.statusExpired;
      case 'Sắp diễn ra': return styles.statusUpcoming;
      default: return '';
    }
  };

  const openAddModal = () => {
    setForm({ 
      maKM: "", 
      tenKM: "", 
      phanTramGiam: 0, 
      loaiKhuyenMai: "", 
      doiTuongApDung: "", 
      ngayBatDau: "", 
      ngayKetThuc: "",
      moTa: "",
      trangThai: 'Đang áp dụng'
    });
    setShowAddModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setForm(promo);
    setEditPromotion(promo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'phanTramGiam' ? Number(value) : value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        if (key !== 'trangThai') { // Bỏ qua trường tính toán
          formData.append(key, String(form[key as keyof typeof form]));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include',
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách khuyến mãi mới nhất
      const updatedPromotions = await getPromotions();
      
      // Cập nhật trạng thái dựa trên ngày
      const formattedData = updatedPromotions.map((promo: Promotion) => {
        const now = new Date();
        const startDate = new Date(promo.ngayBatDau);
        const endDate = new Date(promo.ngayKetThuc);
        
        let trangThai: 'Đang áp dụng' | 'Đã hết hạn' | 'Sắp diễn ra' = 'Đang áp dụng';
        if (now < startDate) {
          trangThai = 'Sắp diễn ra';
        } else if (now > endDate) {
          trangThai = 'Đã hết hạn';
        }
        
        return {
          ...promo,
          trangThai
        };
      });
      
      setPromotions(formattedData);
      setShowAddModal(false);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error adding promotion:", error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      for (const key in form) {
        if (key !== 'trangThai') { // Bỏ qua trường tính toán
          formData.append(key, String(form[key as keyof typeof form]));
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include',
      });
      
      await handleResponse(response);
      
      // Lấy lại danh sách khuyến mãi mới nhất
      const updatedPromotions = await getPromotions();
      
      // Cập nhật trạng thái dựa trên ngày
      const formattedData = updatedPromotions.map((promo: Promotion) => {
        const now = new Date();
        const startDate = new Date(promo.ngayBatDau);
        const endDate = new Date(promo.ngayKetThuc);
        
        let trangThai: 'Đang áp dụng' | 'Đã hết hạn' | 'Sắp diễn ra' = 'Đang áp dụng';
        if (now < startDate) {
          trangThai = 'Sắp diễn ra';
        } else if (now > endDate) {
          trangThai = 'Đã hết hạn';
        }
        
        return {
          ...promo,
          trangThai
        };
      });
      
      setPromotions(formattedData);
      setEditPromotion(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error updating promotion:", error);
    }
  };

  const handleDelete = async (maKM: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const response = await fetch(`${API_BASE_URL}/KhuyenMai/${maKM}`, {
        method: 'DELETE',
        headers: getAuthHeaders('DELETE'),
        credentials: 'include',
      });
      
      await handleResponse(response);
      
      setPromotions(promotions.filter(p => p.maKM !== maKM));
      setShowDeleteConfirm(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error deleting promotion:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý chương trình khuyến mãi</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            className={styles.search}
            type="text"
            placeholder="Tìm kiếm tên, loại, đối tượng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm khuyến mãi</button>
        </div>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu khuyến mãi...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{overflowX:'auto'}}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã KM</th>
                <th>Tên chương trình</th>
                <th>Loại</th>
                <th>Áp dụng cho</th>
                <th>Giảm (%)</th>
                <th>Hiệu lực từ</th>
                <th>Đến</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
              ) : filtered.map(promo => (
                <tr key={promo.maKM}>
                  <td>{promo.maKM}</td>
                  <td>{promo.tenKM}</td>
                  <td>{promo.loaiKhuyenMai}</td>
                  <td>{promo.doiTuongApDung}</td>
                  <td className={styles.discount}>{promo.phanTramGiam}%</td>
                  <td>{new Date(promo.ngayBatDau).toLocaleDateString('vi-VN')}</td>
                  <td>{new Date(promo.ngayKetThuc).toLocaleDateString('vi-VN')}</td>
                  <td><span className={getStatusClass(promo.trangThai)}>{promo.trangThai}</span></td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.editBtn} onClick={() => openEditModal(promo)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(promo.maKM)}>Xóa</button>
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
            <h3>Thêm khuyến mãi</h3>
            <form onSubmit={handleAdd}>
              <input name="tenKM" value={form.tenKM} onChange={handleChange} placeholder="Tên chương trình" required />
              <input name="phanTramGiam" type="number" value={form.phanTramGiam} onChange={handleChange} placeholder="Giảm (%)" required min={0} max={100} />
              <select name="loaiKhuyenMai" value={form.loaiKhuyenMai} onChange={handleChange} required>
                <option key="loai-default" value="">Chọn loại</option>
                <option key="loai-phong" value="Phòng">Phòng</option>
                <option key="loai-dichvu" value="Dịch vụ">Dịch vụ</option>
                <option key="loai-hoadon" value="Tổng hóa đơn">Tổng hóa đơn</option>
              </select>
              <input name="doiTuongApDung" value={form.doiTuongApDung} onChange={handleChange} placeholder="Áp dụng cho" required />
              <input name="ngayBatDau" type="date" value={form.ngayBatDau} onChange={handleChange} required />
              <input name="ngayKetThuc" type="date" value={form.ngayKetThuc} onChange={handleChange} required />
              <textarea name="moTa" value={form.moTa} onChange={handleChange} placeholder="Mô tả" rows={3} />
              <div style={{marginTop: 20, display:'flex', gap:8}}>
                <button type="submit" className={styles.addBtn}>Thêm mới</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editPromotion && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa khuyến mãi</h3>
            <form onSubmit={handleEdit}>
              <input name="tenKM" value={form.tenKM} onChange={handleChange} placeholder="Tên chương trình" required />
              <input name="phanTramGiam" type="number" value={form.phanTramGiam} onChange={handleChange} placeholder="Giảm (%)" required min={0} max={100} />
              <select name="loaiKhuyenMai" value={form.loaiKhuyenMai} onChange={handleChange} required>
                <option key="edit-loai-default" value="">Chọn loại</option>
                <option key="edit-loai-phong" value="Phòng">Phòng</option>
                <option key="edit-loai-dichvu" value="Dịch vụ">Dịch vụ</option>
                <option key="edit-loai-hoadon" value="Tổng hóa đơn">Tổng hóa đơn</option>
              </select>
              <input name="doiTuongApDung" value={form.doiTuongApDung} onChange={handleChange} placeholder="Áp dụng cho" required />
              <input name="ngayBatDau" type="date" value={form.ngayBatDau} onChange={handleChange} required />
              <input name="ngayKetThuc" type="date" value={form.ngayKetThuc} onChange={handleChange} required />
              <textarea name="moTa" value={form.moTa} onChange={handleChange} placeholder="Mô tả" rows={3} />
              <div style={{marginTop: 20, display:'flex', gap:8}}>
                <button type="submit" className={styles.addBtn}>Lưu thay đổi</button>
                <button type="button" onClick={() => setEditPromotion(null)} className={styles.deleteBtn}>Hủy</button>
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
            <p>Bạn có chắc chắn muốn xóa khuyến mãi này?</p>
            <div style={{marginTop: 20, display:'flex', gap:8}}>
              <button onClick={() => handleDelete(showDeleteConfirm)} className={styles.deleteBtn}>Xóa</button>
              <button onClick={() => setShowDeleteConfirm(null)} className={styles.addBtn}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 