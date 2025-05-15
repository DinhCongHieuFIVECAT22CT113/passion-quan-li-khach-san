'use client';
import React, { useState } from "react";
import styles from "./ReviewManager.module.css";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  isApproved: boolean;
  isHidden: boolean;
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      customerName: 'John Doe',
      rating: 5,
      comment: 'Great experience! The staff was very helpful.',
      date: '2024-03-15',
      isApproved: true,
      isHidden: false
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      rating: 4,
      comment: 'Nice hotel but the room was a bit small.',
      date: '2024-03-14',
      isApproved: false,
      isHidden: false
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<Partial<Review>>({
    customerName: '',
    rating: 5,
    comment: '',
    isApproved: false,
    isHidden: false
  });

  const handleApprove = (id: number) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, isApproved: true } : review
    ));
  };

  const handleHide = (id: number) => {
    setReviews(reviews.map(review => 
      review.id === id ? { ...review, isHidden: !review.isHidden } : review
    ));
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData(review);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này không?')) {
      setReviews(reviews.filter(review => review.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      setReviews(reviews.map(review => 
        review.id === editingReview.id ? { ...review, ...formData } : review
      ));
    } else {
      const newReview: Review = {
        id: reviews.length + 1,
        customerName: formData.customerName || '',
        rating: formData.rating || 5,
        comment: formData.comment || '',
        date: new Date().toISOString().split('T')[0],
        isApproved: formData.isApproved || false,
        isHidden: formData.isHidden || false
      };
      setReviews([...reviews, newReview]);
    }
    setShowModal(false);
    setEditingReview(null);
    setFormData({
      customerName: '',
      rating: 5,
      comment: '',
      isApproved: false,
      isHidden: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý Đánh giá</h2>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          Thêm đánh giá mới
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Đánh giá</th>
              <th>Nhận xét</th>
              <th>Ngày</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>{review.customerName}</td>
                <td className={styles.rating}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </td>
                <td>{review.comment}</td>
                <td>{review.date}</td>
                <td>
                  {review.isApproved ? 'Đã phê duyệt' : 'Chờ duyệt'}
                  {review.isHidden && ' (Đã ẩn)'}
                </td>
                <td>
                  {!review.isApproved && (
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(review.id)}
                    >
                      Phê duyệt
                    </button>
                  )}
                  <button
                    className={styles.hideBtn}
                    onClick={() => handleHide(review.id)}
                  >
                    {review.isHidden ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(review)}
                  >
                    sửa
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(review.id)}
                  >
                    xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}</h3>
            <form onSubmit={handleSubmit}>
              <div>
                <label>Tên khách hàng:</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Đánh giá:</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Sao' : 'Sao'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Nhận xét:</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    name="isApproved"
                    checked={formData.isApproved}
                    onChange={handleInputChange}
                  />
                  Đã phê duyệt
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="isHidden"
                    checked={formData.isHidden}
                    onChange={handleInputChange}
                  />
                  Đã ẩn
                </label>
              </div>
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.addBtn}>
                  {editingReview ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  className={styles.hideBtn}
                  onClick={() => {
                    setShowModal(false);
                    setEditingReview(null);
                    setFormData({
                      customerName: '',
                      rating: 5,
                      comment: '',
                      isApproved: false,
                      isHidden: false
                    });
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
