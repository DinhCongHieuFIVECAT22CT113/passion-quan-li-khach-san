'use client';
import React, { useState } from "react";
import styles from "./PromotionManager.module.css";

interface Promotion {
  id: number;
  name: string;
  discount: number;
  type: string;
  target: string;
  validFrom: string;
  validTo: string;
  description?: string;
  status: 'active' | 'expired' | 'upcoming';
}

const initialPromotions: Promotion[] = [
  { 
    id: 1, 
    name: "Giảm 10% phòng Deluxe", 
    discount: 10, 
    type: "Phòng", 
    target: "Deluxe", 
    validFrom: "2024-06-01", 
    validTo: "2024-06-30",
    description: "Áp dụng cho tất cả phòng Deluxe trong tháng 6",
    status: 'active'
  },
  { 
    id: 2, 
    name: "Buffet sáng 50% cho khách mới", 
    discount: 50, 
    type: "Dịch vụ", 
    target: "Ăn sáng buffet", 
    validFrom: "2024-06-10", 
    validTo: "2024-06-20",
    description: "Dành cho khách hàng lần đầu sử dụng dịch vụ",
    status: 'upcoming'
  },
];

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Promotion>({ 
    id: 0, 
    name: "", 
    discount: 0, 
    type: "", 
    target: "", 
    validFrom: "", 
    validTo: "",
    description: "",
    status: 'active'
  });

  const filtered = promotions.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.target.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusClass = (status: Promotion['status']) => {
    switch(status) {
      case 'active': return styles.statusActive;
      case 'expired': return styles.statusExpired;
      case 'upcoming': return styles.statusUpcoming;
      default: return '';
    }
  };

  const getStatusText = (status: Promotion['status']) => {
    switch(status) {
      case 'active': return 'Đang áp dụng';
      case 'expired': return 'Đã hết hạn';
      case 'upcoming': return 'Sắp diễn ra';
      default: return '';
    }
  };

  const openAddModal = () => {
    setForm({ 
      id: 0, 
      name: "", 
      discount: 0, 
      type: "", 
      target: "", 
      validFrom: "", 
      validTo: "",
      description: "",
      status: 'active'
    });
    setShowAddModal(true);
  };

  const openEditModal = (promo: Promotion) => {
    setForm(promo);
    setEditPromotion(promo);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'discount' ? Number(value) : value });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setPromotions([...promotions, { ...form, id: promotions.length + 1 }]);
    setShowAddModal(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromotions(promotions.map(p => p.id === form.id ? form : p));
    setEditPromotion(null);
  };

  const handleDelete = (id: number) => {
    setPromotions(promotions.filter(p => p.id !== id));
    setShowDeleteConfirm(null);
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
      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
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
              <tr key={promo.id}>
                <td>{promo.id}</td>
                <td>{promo.name}</td>
                <td>{promo.type}</td>
                <td>{promo.target}</td>
                <td className={styles.discount}>{promo.discount}%</td>
                <td>{promo.validFrom}</td>
                <td>{promo.validTo}</td>
                <td><span className={getStatusClass(promo.status)}>{getStatusText(promo.status)}</span></td>
                <td style={{whiteSpace:'nowrap'}}>
                  <button className={styles.editBtn} onClick={() => openEditModal(promo)}>Sửa</button>
                  <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(promo.id)}>Xóa</button>
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
            <h3>Thêm khuyến mãi</h3>
            <form onSubmit={handleAdd}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên chương trình" required />
              <input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="Giảm (%)" required min={0} max={100} />
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Chọn loại</option>
                <option value="Phòng">Phòng</option>
                <option value="Dịch vụ">Dịch vụ</option>
              </select>
              <input name="target" value={form.target} onChange={handleChange} placeholder="Áp dụng cho" required />
              <input name="validFrom" type="date" value={form.validFrom} onChange={handleChange} required />
              <input name="validTo" type="date" value={form.validTo} onChange={handleChange} required />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" rows={3} />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="active">Đang áp dụng</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="expired">Đã hết hạn</option>
              </select>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
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
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tên chương trình" required />
              <input name="discount" type="number" value={form.discount} onChange={handleChange} placeholder="Giảm (%)" required min={0} max={100} />
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Chọn loại</option>
                <option value="Phòng">Phòng</option>
                <option value="Dịch vụ">Dịch vụ</option>
              </select>
              <input name="target" value={form.target} onChange={handleChange} placeholder="Áp dụng cho" required />
              <input name="validFrom" type="date" value={form.validFrom} onChange={handleChange} required />
              <input name="validTo" type="date" value={form.validTo} onChange={handleChange} required />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" rows={3} />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="active">Đang áp dụng</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="expired">Đã hết hạn</option>
              </select>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
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
            <p>Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?</p>
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