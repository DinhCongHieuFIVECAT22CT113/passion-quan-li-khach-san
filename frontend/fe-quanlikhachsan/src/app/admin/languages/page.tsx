'use client';
import React, { useState } from 'react';
import styles from '../AdminLayout.module.css';

// Định nghĩa kiểu dữ liệu cho ngôn ngữ
interface Language {
  id: number;
  name: string;
  code: string;
  status: string;
}

// Định nghĩa kiểu dữ liệu cho form (không bao gồm id)
interface LanguageForm {
  name: string;
  code: string;
  status: string;
}

export default function LanguagesPage() {
  // Dữ liệu mẫu ban đầu
  const [languages, setLanguages] = useState<Language[]>([
    { id: 1, name: 'Tiếng Việt', code: 'vi', status: 'Đang sử dụng' },
    { id: 2, name: 'Tiếng Anh', code: 'en', status: 'Đang sử dụng' },
    { id: 3, name: 'Tiếng Nhật', code: 'ja', status: 'Ngừng sử dụng' },
  ]);

  // Trạng thái modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState<LanguageForm>({ name: '', code: '', status: 'Đang sử dụng' });

  // Mở modal để thêm hoặc sửa
  const openModal = (lang: Language | null = null) => {
    if (lang) {
      setIsEditMode(true);
      setCurrentLang(lang);
      setFormData({ name: lang.name, code: lang.code, status: lang.status });
    } else {
      setIsEditMode(false);
      setFormData({ name: '', code: '', status: 'Đang sử dụng' });
    }
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentLang(null);
    setFormData({ name: '', code: '', status: 'Đang sử dụng' });
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Thêm hoặc sửa ngôn ngữ
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && currentLang) {
      // Sửa ngôn ngữ
      setLanguages((prev) =>
        prev.map((lang) =>
          lang.id === currentLang.id ? { ...lang, ...formData } : lang
        )
      );
    } else {
      // Thêm ngôn ngữ mới
      const newLang = {
        id: languages.length > 0 ? Math.max(...languages.map(l => l.id)) + 1 : 1, // Tạo id mới
        ...formData,
      };
      setLanguages((prev) => [...prev, newLang]);
    }
    closeModal();
  };

  // Xóa ngôn ngữ
  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa ngôn ngữ này không?')) {
      setLanguages((prev) => prev.filter((lang) => lang.id !== id));
    }
  };

  return (
    <div className={styles.mainContent}>
      {/* Tiêu đề và nút Thêm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Quản lý ngôn ngữ</h1>
        <button
          onClick={() => openModal()}
          style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          + Thêm ngôn ngữ
        </button>
      </div>

      {/* Bảng danh sách ngôn ngữ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Tên ngôn ngữ</th>
            <th style={{ padding: '12px' }}>Mã ngôn ngữ</th>
            <th style={{ padding: '12px' }}>Trạng thái</th>
            <th style={{ padding: '12px' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {languages.map((lang) => (
            <tr key={lang.id} style={{ borderBottom: '1px solid #e9ecef' }}>
              <td style={{ padding: '12px' }}>{lang.id}</td>
              <td style={{ padding: '12px' }}>{lang.name}</td>
              <td style={{ padding: '12px' }}>{lang.code}</td>
              <td style={{ padding: '12px', color: lang.status === 'Đang sử dụng' ? 'green' : 'red' }}>{lang.status}</td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => openModal(lang)}
                  style={{ marginRight: '8px', padding: '6px 12px', background: '#ffc107', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(lang.id)}
                  style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal để thêm/sửa ngôn ngữ */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h2>{isEditMode ? 'Sửa ngôn ngữ' : 'Thêm ngôn ngữ'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Tên ngôn ngữ</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Mã ngôn ngữ</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px' }}>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                >
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {isEditMode ? 'Lưu' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}