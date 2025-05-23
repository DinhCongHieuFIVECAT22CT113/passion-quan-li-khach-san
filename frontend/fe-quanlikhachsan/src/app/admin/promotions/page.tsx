'use client';
import React, { useState, useEffect } from "react";
import styles from "./PromotionManager.module.css";
import { getPromotions, getAuthHeaders, getFormDataHeaders, handleResponse } from "../../../lib/api";
import { API_BASE_URL } from "../../../lib/config";

interface PromotionFE {
  MaKm: string;
  TenKhuyenMai: string;
  PhanTramGiam: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  MoTa?: string;
  Thumbnail?: string;
  MaGiamGia?: string;
  SoTienGiam?: number;
  trangThaiDisplay: 'Đang áp dụng' | 'Đã hết hạn' | 'Sắp diễn ra';
}

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<PromotionFE[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<PromotionFE | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  type PromotionFormState = {
    MaKm?: string;
    TenKhuyenMai: string;
    PhanTramGiam: number;
    NgayBatDau: string;
    NgayKetThuc: string;
    MoTa?: string;
    Thumbnail?: string;
    MaGiamGia?: string;
    SoTienGiam?: number;
  };

  const [form, setForm] = useState<PromotionFormState>({ 
    TenKhuyenMai: "", 
    PhanTramGiam: 0, 
    NgayBatDau: "", 
    NgayKetThuc: "",
    MoTa: "",
    Thumbnail: "",
    MaGiamGia: "",
    SoTienGiam: 0,
  });

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const calculateDisplayStatus = (startDateStr: string, endDateStr: string): PromotionFE['trangThaiDisplay'] => {
    const now = new Date();
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (now < startDate) return 'Sắp diễn ra';
    if (now > endDate) return 'Đã hết hạn';
    return 'Đang áp dụng';
  };

  useEffect(() => {
    const fetchAndSetPromotions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data: any[] = await getPromotions();
        const formattedData: PromotionFE[] = data.map(promo => ({
          MaKm: promo.MaKm,
          TenKhuyenMai: promo.TenKhuyenMai,
          PhanTramGiam: promo.PhanTramGiam,
          NgayBatDau: formatDateForInput(promo.NgayBatDau),
          NgayKetThuc: formatDateForInput(promo.NgayKetThuc),
          MoTa: promo.MoTa,
          Thumbnail: promo.Thumbnail,
          MaGiamGia: promo.MaGiamGia,
          SoTienGiam: promo.SoTienGiam,
          trangThaiDisplay: calculateDisplayStatus(promo.NgayBatDau, promo.NgayKetThuc),
        }));
        setPromotions(formattedData);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách khuyến mãi:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetPromotions();
  }, []);

  const filtered = promotions.filter(p =>
    (p.TenKhuyenMai || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.MaGiamGia || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusClass = (status: PromotionFE['trangThaiDisplay']) => {
    switch(status) {
      case 'Đang áp dụng': return styles.statusActive;
      case 'Đã hết hạn': return styles.statusExpired;
      case 'Sắp diễn ra': return styles.statusUpcoming;
      default: return '';
    }
  };

  const openAddModal = () => {
    setForm({ 
      TenKhuyenMai: "", 
      PhanTramGiam: 0, 
      NgayBatDau: "", 
      NgayKetThuc: "",
      MoTa: "",
      Thumbnail: "",
      MaGiamGia: "",
      SoTienGiam: 0,
    });
    setEditPromotion(null);
    setShowAddModal(true);
  };

  const openEditModal = (promo: PromotionFE) => {
    setForm({
      MaKm: promo.MaKm,
      TenKhuyenMai: promo.TenKhuyenMai,
      PhanTramGiam: promo.PhanTramGiam,
      NgayBatDau: promo.NgayBatDau,
      NgayKetThuc: promo.NgayKetThuc,
      MoTa: promo.MoTa,
      Thumbnail: promo.Thumbnail,
      MaGiamGia: promo.MaGiamGia,
      SoTienGiam: promo.SoTienGiam,
    });
    setEditPromotion(promo);
    setShowAddModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ 
        ...prevForm, 
        [name]: (name === 'PhanTramGiam' || name === 'SoTienGiam') ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const formData = new FormData();
      formData.append('TenKhuyenMai', form.TenKhuyenMai);
      formData.append('PhanTramGiam', String(form.PhanTramGiam || 0));
      formData.append('NgayBatDau', form.NgayBatDau);
      formData.append('NgayKetThuc', form.NgayKetThuc);
      if (form.MoTa) formData.append('MoTa', form.MoTa);
      if (form.Thumbnail) formData.append('Thumbnail', form.Thumbnail);
      if (form.MaGiamGia) formData.append('MaGiamGia', form.MaGiamGia);
      formData.append('SoTienGiam', String(form.SoTienGiam || 0));

      let response;
      if (editPromotion && editPromotion.MaKm) {
        response = await fetch(`${API_BASE_URL}/KhuyenMai/${editPromotion.MaKm}`, {
          method: 'PUT',
          headers: getFormDataHeaders(),
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formData,
        credentials: 'include',
      });
      }
      
      await handleResponse(response);
      
      const updatedData: any[] = await getPromotions();
      const formattedData: PromotionFE[] = updatedData.map(promo => ({
        MaKm: promo.MaKm,
        TenKhuyenMai: promo.TenKhuyenMai,
        PhanTramGiam: promo.PhanTramGiam,
        NgayBatDau: formatDateForInput(promo.NgayBatDau),
        NgayKetThuc: formatDateForInput(promo.NgayKetThuc),
        MoTa: promo.MoTa,
        Thumbnail: promo.Thumbnail,
        MaGiamGia: promo.MaGiamGia,
        SoTienGiam: promo.SoTienGiam,
        trangThaiDisplay: calculateDisplayStatus(promo.NgayBatDau, promo.NgayKetThuc),
      }));
      setPromotions(formattedData);
      setShowAddModal(false);
      setEditPromotion(null);
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Error submitting promotion:", error);
    }
  };

  const handleDelete = async (MaKm: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      const response = await fetch(`${API_BASE_URL}/KhuyenMai/${MaKm}`, {
        method: 'DELETE',
        headers: getAuthHeaders('DELETE'),
        credentials: 'include',
      });
      
      await handleResponse(response);
      
      setPromotions(promotions.filter(p => p.MaKm !== MaKm));
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
                <th>Giảm (%)</th>
                <th>Số tiền giảm (VND)</th>
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
                <tr key={promo.MaKm}>
                  <td>{promo.MaKm}</td>
                  <td>{promo.TenKhuyenMai}</td>
                  <td>{promo.MaGiamGia}</td>
                  <td>{promo.PhanTramGiam}%</td>
                  <td>{promo.SoTienGiam ? promo.SoTienGiam.toLocaleString() : '0'} VND</td>
                  <td>{new Date(promo.NgayBatDau).toLocaleDateString('vi-VN')}</td>
                  <td>{new Date(promo.NgayKetThuc).toLocaleDateString('vi-VN')}</td>
                  <td><span className={getStatusClass(promo.trangThaiDisplay)}>{promo.trangThaiDisplay}</span></td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className={styles.editBtn} onClick={() => openEditModal(promo)}>Sửa</button>
                    <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(promo.MaKm)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}</h3>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label htmlFor="TenKhuyenMai">Tên khuyến mãi*</label>
                <input type="text" id="TenKhuyenMai" name="TenKhuyenMai" value={form.TenKhuyenMai} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="MaGiamGia">Mã giảm giá (Loại KM)*</label>
                <input type="text" id="MaGiamGia" name="MaGiamGia" value={form.MaGiamGia || ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="PhanTramGiam">Phần trăm giảm (%)*</label>
                <input type="number" id="PhanTramGiam" name="PhanTramGiam" value={form.PhanTramGiam} onChange={handleChange} required min="0" max="100"/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="SoTienGiam">Số tiền giảm (VND)*</label>
                <input type="number" id="SoTienGiam" name="SoTienGiam" value={form.SoTienGiam || 0} onChange={handleChange} required min="0" />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NgayBatDau">Ngày bắt đầu*</label>
                <input type="date" id="NgayBatDau" name="NgayBatDau" value={form.NgayBatDau} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="NgayKetThuc">Ngày kết thúc*</label>
                <input type="date" id="NgayKetThuc" name="NgayKetThuc" value={form.NgayKetThuc} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="Thumbnail">URL Hình ảnh thumbnail</label>
                <input type="text" id="Thumbnail" name="Thumbnail" value={form.Thumbnail || ''} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="MoTa">Mô tả</label>
                <textarea id="MoTa" name="MoTa" value={form.MoTa || ''} onChange={handleChange} rows={3}></textarea>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>{editPromotion ? "Lưu thay đổi" : "Thêm mới"}</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.deleteBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

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