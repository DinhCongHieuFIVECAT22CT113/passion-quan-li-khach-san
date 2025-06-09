'use client';
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import styles from "./PromotionManager.module.css";
import { getPromotions, getAuthHeaders, getFormDataHeaders, handleResponse } from "../../../lib/api";
import { API_BASE_URL } from "../../../lib/config";
import { KhuyenMaiDTO } from "../../../lib/DTOs";
import Image from 'next/image';

interface PromotionFE {
  MaKm: string;
  TenKhuyenMai: string;
  PhanTramGiam: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  MoTa: string;
  Thumbnail?: string;
  MaGiamGia: string;
  SoTienGiam: number;
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

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      console.warn('[formatDateForInput] Error formatting, returning part:', dateString);
      return dateString.split('T')[0]; 
    }
  };

  const calculateDisplayStatus = (startDateStr: string, endDateStr: string): PromotionFE['trangThaiDisplay'] => {
    console.log('[calculateDisplayStatus] Inputs:', { startDateStr, endDateStr });
    try {
      const now = new Date();
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('[calculateDisplayStatus] Invalid date string received, defaulting status:', { startDateStr, endDateStr });
        return 'Đang áp dụng';
      }

      if (now < startDate) return 'Sắp diễn ra';
      if (now > endDate) return 'Đã hết hạn';
      return 'Đang áp dụng';
    } catch (e) {
      console.error('[calculateDisplayStatus] Error during date calculation:', e, { startDateStr, endDateStr });
      return 'Đang áp dụng';
    }
  };

  useEffect(() => {
    const fetchAndSetPromotions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dataFromApi: any[] = await getPromotions();
        console.log("Raw promotion data from API (useEffect):", dataFromApi); 

        const formattedData: PromotionFE[] = dataFromApi.map((apiPromo, index) => {
          console.log(`[useEffect.map] Processing item ${index} (raw from API):`, JSON.stringify(apiPromo));
          try {
            const apiNgayBatDau = apiPromo.ngayBatDau;
            const apiNgayKetThuc = apiPromo.ngayKetThuc;

            console.log(`[useEffect.map] Item ${index} - API dates:`, { apiNgayBatDau, apiNgayKetThuc });

            const trangThai = calculateDisplayStatus(apiNgayBatDau, apiNgayKetThuc);
            
            return {
              MaKm: apiPromo.maKm,
              TenKhuyenMai: apiPromo.tenKhuyenMai,
              PhanTramGiam: apiPromo.phanTramGiam,
              NgayBatDau: apiNgayBatDau,
              NgayKetThuc: apiNgayKetThuc,
              MoTa: apiPromo.moTa,
              Thumbnail: apiPromo.thumbnail,
              MaGiamGia: apiPromo.maGiamGia,
              SoTienGiam: apiPromo.soTienGiam,
              trangThaiDisplay: trangThai,
            };
          } catch (mapItemError) {
            console.error(`[useEffect.map] Error processing item ${index} in map block:`, mapItemError, JSON.stringify(apiPromo));
            return { 
              MaKm: apiPromo.maKm || `ERROR_ITEM_EFFECT_${index}`,
              TenKhuyenMai: "Lỗi xử lý dữ liệu",
              PhanTramGiam: 0,
              NgayBatDau: new Date(0).toISOString(),
              NgayKetThuc: new Date(0).toISOString(),
              MoTa: "Lỗi",
              Thumbnail: undefined,
              MaGiamGia: "Lỗi",
              SoTienGiam: 0,
              trangThaiDisplay: 'Đã hết hạn'
            } as PromotionFE; 
          }
        });

        console.log("Formatted promotions for state (useEffect):", formattedData); 
        setPromotions(formattedData);
      } catch (err) { 
        console.error('Lỗi trong fetchAndSetPromotions (useEffect):', err); 
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetPromotions();
  }, []);

  const filtered = promotions.filter((p: PromotionFE) =>
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
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setEditPromotion(null);
    setShowAddModal(true);
  };

  const openEditModal = (promo: PromotionFE) => {
    setForm({
      MaKm: promo.MaKm,
      TenKhuyenMai: promo.TenKhuyenMai,
      PhanTramGiam: promo.PhanTramGiam,
      NgayBatDau: formatDateForInput(promo.NgayBatDau),
      NgayKetThuc: formatDateForInput(promo.NgayKetThuc),
      MoTa: promo.MoTa,
      Thumbnail: promo.Thumbnail,
      MaGiamGia: promo.MaGiamGia,
      SoTienGiam: promo.SoTienGiam,
    });
    setThumbnailFile(null);
    setThumbnailPreview(promo.Thumbnail || null);
    setEditPromotion(promo);
    setShowAddModal(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prevForm: PromotionFormState) => ({ 
        ...prevForm, 
        [name]: (name === 'PhanTramGiam' || name === 'SoTienGiam') ? Number(value) : value 
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File không được vượt quá 5MB');
        return;
      }

      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      
      // Validation for new promotion
      if (!editPromotion && !thumbnailFile) {
        alert("Vui lòng chọn hình ảnh cho khuyến mãi");
        return;
      }
      
      const formData = new FormData();
      formData.append('TenKhuyenMai', form.TenKhuyenMai);
      formData.append('PhanTramGiam', String(form.PhanTramGiam || 0));
      formData.append('NgayBatDau', form.NgayBatDau);
      formData.append('NgayKetThuc', form.NgayKetThuc);
      if (form.MoTa) formData.append('MoTa', form.MoTa);
      if (thumbnailFile) formData.append('Thumbnail', thumbnailFile);
      if (form.MaGiamGia) formData.append('MaGiamGia', form.MaGiamGia);
      formData.append('SoTienGiam', String(form.SoTienGiam || 0));

      let response;
      const headers = await getFormDataHeaders();
      if (editPromotion && editPromotion.MaKm) {
        formData.append('MaKm', editPromotion.MaKm);
        response = await fetch(`${API_BASE_URL}/KhuyenMai/${editPromotion.MaKm}`, {
          method: 'PUT',
          headers: headers,
          body: formData,
          credentials: 'include',
        });
      } else {
        response = await fetch(`${API_BASE_URL}/KhuyenMai`, {
        method: 'POST',
        headers: headers,
        body: formData,
        credentials: 'include',
      });
      }
      
      await handleResponse(response);
      
      const updatedDataFromApi: any[] = await getPromotions();
      console.log("Raw promotion data from API (handleSubmit):", updatedDataFromApi);

      const formattedDataAfterSubmit: PromotionFE[] = updatedDataFromApi.map((apiPromo, index) => {
        console.log(`[handleSubmit.map] Processing item ${index} (raw from API):`, JSON.stringify(apiPromo));
        try {
            const apiNgayBatDau = apiPromo.ngayBatDau;
            const apiNgayKetThuc = apiPromo.ngayKetThuc;

            console.log(`[handleSubmit.map] Item ${index} - API dates:`, { apiNgayBatDau, apiNgayKetThuc });
            const trangThai = calculateDisplayStatus(apiNgayBatDau, apiNgayKetThuc);

            return {
              MaKm: apiPromo.maKm,
              TenKhuyenMai: apiPromo.tenKhuyenMai,
              PhanTramGiam: apiPromo.phanTramGiam,
              NgayBatDau: apiNgayBatDau,
              NgayKetThuc: apiNgayKetThuc,
              MoTa: apiPromo.moTa,
              Thumbnail: apiPromo.thumbnail,
              MaGiamGia: apiPromo.maGiamGia,
              SoTienGiam: apiPromo.soTienGiam,
              trangThaiDisplay: trangThai,
            };
        } catch (mapError) {
            console.error(`[handleSubmit.map] Error processing item ${index} in map block:`, mapError, JSON.stringify(apiPromo));
            return { 
              MaKm: apiPromo.maKm || `ERROR_ITEM_SUBMIT_${index}`,
              TenKhuyenMai: "Lỗi xử lý dữ liệu",
              PhanTramGiam: 0,
              NgayBatDau: new Date(0).toISOString(),
              NgayKetThuc: new Date(0).toISOString(),
              MoTa: "Lỗi",
              Thumbnail: undefined,
              MaGiamGia: "Lỗi",
              SoTienGiam: 0,
              trangThaiDisplay: 'Đã hết hạn'
            } as PromotionFE;
        }
      });
      console.log("Formatted promotions for state (handleSubmit):", formattedDataAfterSubmit);
      setPromotions(formattedDataAfterSubmit);
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
      
      const headers = await getAuthHeaders('DELETE');
      const response = await fetch(`${API_BASE_URL}/KhuyenMai/${MaKm}`, {
        method: 'DELETE',
        headers: headers,
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý chương trình khuyến mãi</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <div className={styles.searchContainer}>
            <label className={styles.label}>Tìm kiếm:</label>
          <input
            type="text"
            value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên hoặc mã giảm giá"
              className={styles.searchInput}
          />
          </div>
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
                <th>Hình ảnh</th>
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
                <tr><td colSpan={10} className={styles.noData}>Không có dữ liệu khuyến mãi</td></tr>
              ) : filtered.map(promo => {
                console.log(
                  'Render promo:', 
                  'MaKm:', promo.MaKm, 
                  'TenKhuyenMai:', promo.TenKhuyenMai,
                  'MaGiamGia:', promo.MaGiamGia,
                  'PhanTramGiam:', promo.PhanTramGiam,
                  'SoTienGiam:', promo.SoTienGiam,
                  'NgayBatDau:', promo.NgayBatDau, 
                  'NgayKetThuc:', promo.NgayKetThuc,
                  'TrangThaiDisplay:', promo.trangThaiDisplay
                );
                let ngayBatDauDisplay = 'N/A';
                let ngayKetThucDisplay = 'N/A';
                try {
                  if (promo.NgayBatDau) {
                    ngayBatDauDisplay = new Date(promo.NgayBatDau).toLocaleDateString('vi-VN');
                  }
                } catch (e) { console.error("Error formatting NgayBatDau", promo.NgayBatDau, e); }
                try {
                  if (promo.NgayKetThuc) {
                    ngayKetThucDisplay = new Date(promo.NgayKetThuc).toLocaleDateString('vi-VN');
                  }
                } catch (e) { console.error("Error formatting NgayKetThuc", promo.NgayKetThuc, e); }

                return (
                  <tr key={promo.MaKm}>
                    <td>{promo.MaKm}</td>
                    <td style={{textAlign: 'center'}}>
                      {promo.Thumbnail ? (
                        <Image 
                          src={promo.Thumbnail} 
                          alt={promo.TenKhuyenMai} 
                          width={60}
                          height={40}
                          style={{objectFit: 'cover', borderRadius: '4px'}}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/promotion-placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div style={{width: '60px', height: '40px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontSize: '12px', color: '#666'}}>
                          Không có ảnh
                        </div>
                      )}
                    </td>
                    <td>{promo.TenKhuyenMai}</td>
                    <td>{promo.MaGiamGia}</td>
                    <td>{promo.PhanTramGiam}%</td>
                    <td>{promo.SoTienGiam ? promo.SoTienGiam.toLocaleString('vi-VN') : '0'} VND</td>
                    <td>{ngayBatDauDisplay}</td>
                    <td>{ngayKetThucDisplay}</td>
                    <td><span className={getStatusClass(promo.trangThaiDisplay)}>{promo.trangThaiDisplay}</span></td>
                    <td style={{whiteSpace:'nowrap'}}>
                      <button className={styles.editBtn} onClick={() => openEditModal(promo)}>Sửa</button>
                      <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(promo.MaKm)}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
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
                <label htmlFor="Thumbnail" className={styles.label}>
                  Hình ảnh khuyến mãi{!editPromotion ? '*' : ''}:
                </label>
                <input
                  type="file"
                  name="Thumbnail"
                  id="Thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.input}
                />
                {thumbnailPreview && 
                  <div style={{marginTop: '10px'}}>
                    <Image 
                        src={thumbnailPreview} 
                        alt="Preview Thumbnail" 
                        width={200}
                        height={150}
                        style={{maxWidth: '200px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px'}} 
                    />
                  </div>
                }
                {editPromotion && !thumbnailPreview && form.Thumbnail && (
                  <div style={{marginTop: '10px'}}>
                    <Image 
                        src={form.Thumbnail} 
                        alt="Current Thumbnail" 
                        width={200}
                        height={150}
                        style={{maxWidth: '200px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px'}} 
                    />
                    <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Hình ảnh hiện tại</p>
                  </div>
                )}
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
              <button onClick={() => handleDelete(showDeleteConfirm)} className={styles.deleteBtn}><span>Xóa</span></button>
              <button onClick={() => setShowDeleteConfirm(null)} className={styles.addBtn}><span>Hủy</span></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 