'use client';
import React, { useState } from 'react';
import styles from '../AdminLayout.module.css';
import '../../../styles/admin-common.css';

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

  // State cho modal và form
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language | null>(null);
  const [formData, setFormData] = useState<LanguageForm>({
    name: '',
    code: '',
    status: 'Đang sử dụng',
  });

  // Mở modal để thêm ngôn ngữ mới
  const openAddModal = () => {
    setIsEditMode(false);
    setCurrentLang(null);
    setFormData({
      name: '',
      code: '',
      status: 'Đang sử dụng',
    });
    setShowModal(true);
  };

  // Mở modal để sửa ngôn ngữ
  const openModal = (lang: Language) => {
    setIsEditMode(true);
    setCurrentLang(lang);
    setFormData({
      name: lang.name,
      code: lang.code,
      status: lang.status,
    });
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Cập nhật dữ liệu form khi người dùng nhập
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <h2>Quản lý ngôn ngữ</h2>
        <div className="admin-tools">
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            Thêm ngôn ngữ mới
          </button>
        </div>
      </div>

      {/* Bảng danh sách ngôn ngữ */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên ngôn ngữ</th>
              <th>Mã ngôn ngữ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {languages.map((lang) => (
              <tr key={lang.id}>
                <td>{lang.id}</td>
                <td>{lang.name}</td>
                <td>{lang.code}</td>
                <td>
                  <span className={`admin-badge ${lang.status === 'Đang sử dụng' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                    {lang.status}
                  </span>
                </td>
                <td>
                  <button
                    className="admin-btn admin-btn-warning admin-btn-icon"
                    onClick={() => openModal(lang)}
                    style={{ marginRight: '8px' }}
                  >
                    Sửa
                  </button>
                  <button
                    className="admin-btn admin-btn-danger admin-btn-icon"
                    onClick={() => handleDelete(lang.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa ngôn ngữ */}
      {showModal && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>{isEditMode ? 'Sửa ngôn ngữ' : 'Thêm ngôn ngữ mới'}</h3>
              <button className="admin-modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label className="admin-form-label">Tên ngôn ngữ:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="admin-form-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Mã ngôn ngữ:</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="admin-form-input"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Trạng thái:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="admin-form-select"
                >
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                </select>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
