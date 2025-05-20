'use client';
import React, { useState, useEffect } from "react";
import styles from "./ReviewManager.module.css";
import { getReviews, approveReview } from "../../../lib/api";

interface Review {
  maDG: string;
  maKH: string;
  tenKhachHang?: string;
  danhGia: number;
  noiDung: string;
  ngayTao: string;
  trangThai: string;
  anHien: boolean;
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({
    tenKhachHang: '',
    danhGia: 5,
    noiDung: '',
    trangThai: 'Chưa duyệt',
    anHien: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách đánh giá từ API
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReviews();
        
        // Thêm tên khách hàng nếu không có
        const reviewsWithNames = data.map((review: Review) => {
          if (!review.tenKhachHang) {
            return {
              ...review,
              tenKhachHang: `Khách hàng ${review.maKH}`
            };
          }
          return review;
        });
        
        setReviews(reviewsWithNames);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu đánh giá");
        console.error("Error fetching reviews:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleApprove = async (maDG: string) => {
    try {
      await approveReview(maDG, true);
      setReviews(reviews.map(review => 
        review.maDG === maDG ? { ...review, trangThai: 'Đã duyệt' } : review
      ));
    } catch (err: any) {
      alert(`Lỗi khi duyệt đánh giá: ${err.message}`);
      console.error("Error approving review:", err);
    }
  };

  const handleHide = async (review: Review) => {
    try {
      // Tạo đối tượng để cập nhật trạng thái ẩn/hiện
      const updatedReview = {
        ...review,
        anHien: !review.anHien
      };
      
      // Gọi API cập nhật đánh giá (tùy thuộc vào backend)
      // Điều này sẽ phụ thuộc vào cách API của bạn xử lý việc ẩn/hiện đánh giá
      // await updateReview(updatedReview);
      
      // Cập nhật state
      setReviews(reviews.map(r => 
        r.maDG === review.maDG ? updatedReview : r
      ));
    } catch (err: any) {
      alert(`Lỗi khi thay đổi trạng thái hiển thị: ${err.message}`);
      console.error("Error toggling review visibility:", err);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData(review);
    setShowModal(true);
  };

  const handleDelete = async (maDG: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        // API xóa đánh giá (cần thêm vào API.ts)
        // await deleteReview(maDG);
        
        // Cập nhật state
        setReviews(reviews.filter(review => review.maDG !== maDG));
      } catch (err: any) {
        alert(`Lỗi khi xóa đánh giá: ${err.message}`);
        console.error("Error deleting review:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra tất cả các trường
    const errors: Record<string, string> = {};
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateInput(name, value);
      if (error) errors[name] = error;
    });

    // Nếu có lỗi, hiển thị và không submit
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    try {
      if (editingReview) {
        // Cập nhật đánh giá
        // await updateReview(formData);
        
        setReviews(reviews.map(review => 
          review.maDG === editingReview.maDG ? { ...review, ...formData } : review
        ));
      } else {
        // Thêm đánh giá mới (thường không cần thiết vì đánh giá do khách hàng tạo)
        alert("Chức năng thêm đánh giá không được hỗ trợ. Đánh giá thường do khách hàng tạo.");
      }
      setShowModal(false);
      setEditingReview(null);
      setFormData({
        tenKhachHang: '',
        danhGia: 5,
        noiDung: '',
        trangThai: 'Chưa duyệt',
        anHien: false
      });
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      console.error("Error updating review:", err);
    }
  };

  const validateInput = (name: string, value: any): string | null => {
    switch (name) {
      case 'noiDung':
        if (!value.trim()) return 'Nội dung đánh giá không được để trống';
        if (value.length < 10) return 'Nội dung đánh giá phải có ít nhất 10 ký tự';
        if (value.length > 500) return 'Nội dung đánh giá không được vượt quá 500 ký tự';
        return null;
      case 'danhGia':
        const rating = Number(value);
        if (isNaN(rating) || rating < 1 || rating > 5) return 'Đánh giá phải từ 1 đến 5 sao';
        return null;
      default:
        return null;
    }
  };

  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    // Kiểm tra giá trị nhập vào
    const error = validateInput(name, newValue);
    
    // Cập nhật lỗi
    setInputErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));

    // Chỉ cập nhật giá trị nếu hợp lệ hoặc là checkbox
    if (!error || type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đánh giá</h2>
      </div>

      {isLoading && <div className={styles.loading}>Đang tải dữ liệu đánh giá...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã ĐG</th>
                <th>Khách hàng</th>
                <th>Đánh giá</th>
                <th>Nội dung</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu đánh giá</td>
                </tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.maDG}>
                    <td>{review.maDG}</td>
                    <td>{review.tenKhachHang || `Khách hàng ${review.maKH}`}</td>
                    <td className={styles.rating}>
                      {'★'.repeat(review.danhGia)}{'☆'.repeat(5 - review.danhGia)}
                    </td>
                    <td>{review.noiDung}</td>
                    <td>{new Date(review.ngayTao).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={
                        review.trangThai === 'Đã duyệt' ? styles.approved :
                        review.trangThai === 'Chưa duyệt' ? styles.pending :
                        ''
                      }>
                        {review.trangThai}
                      </span>
                      {review.anHien && <span className={styles.hidden}> (Đã ẩn)</span>}
                    </td>
                    <td>
                      {review.trangThai !== 'Đã duyệt' && (
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(review.maDG)}
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        className={styles.hideBtn}
                        onClick={() => handleHide(review)}
                      >
                        {review.anHien ? 'Hiện' : 'Ẩn'}
                      </button>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(review)}
                      >
                        Sửa
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(review.maDG)}
                      >
                        Xóa
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
            <h3>{editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Khách hàng:</label>
                <input
                  type="text"
                  name="tenKhachHang"
                  value={formData.tenKhachHang || ''}
                  onChange={handleInputChange}
                  required
                  readOnly={true}
                />
              </div>
              <div>
                <label>Đánh giá:</label>
                <select
                  name="danhGia"
                  value={formData.danhGia}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'sao' : 'sao'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Nội dung:</label>
                <textarea
                  name="noiDung"
                  value={formData.noiDung || ''}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  maxLength={500}
                  placeholder="Nhập nội dung đánh giá (tối thiểu 10 ký tự, tối đa 500 ký tự)"
                ></textarea>
                {inputErrors.noiDung && (
                  <p className={styles.error}>{inputErrors.noiDung}</p>
                )}
              </div>
              <div>
                <label>Trạng thái:</label>
                <select
                  name="trangThai"
                  value={formData.trangThai}
                  onChange={handleInputChange}
                >
                  <option value="Chưa duyệt">Chưa duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                </select>
              </div>
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="anHien"
                    checked={formData.anHien}
                    onChange={handleInputChange}
                  />
                  Ẩn đánh giá này
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  {editingReview ? 'Lưu thay đổi' : 'Thêm đánh giá'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowModal(false);
                    setEditingReview(null);
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 