"use client";
import React, { useState, useEffect } from "react";
import { getEmployeeBookings, getEmployeeRooms, bookRoom, updateBookingStatus } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './BookingManager.module.css';

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  roomId: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  note: string;
  totalPrice: number;
  phoneNumber: string;
  email: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: string;
}

export default function BookingManager() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<{
    customerId: string;
    customerName: string;
    phoneNumber: string;
    email: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    note: string;
  }>({
    customerId: '',
    customerName: '',
    phoneNumber: '',
    email: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    note: ''
  });

  // Lấy danh sách đặt phòng và phòng từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy danh sách đặt phòng
        const bookingsData = await getEmployeeBookings();
        
        // Lấy trạng thái đặt phòng từ localStorage nếu có
        let savedBookingStatuses: Record<string, string> = {};
        if (typeof window !== 'undefined') {
          try {
            const savedData = localStorage.getItem('bookingStatuses');
            if (savedData) {
              savedBookingStatuses = JSON.parse(savedData);
            }
          } catch (e) {
            console.error('Lỗi khi parse trạng thái đặt phòng từ localStorage:', e);
          }
        }
        
        // Áp dụng trạng thái đã lưu
        const updatedBookings = bookingsData.map(booking => {
          const savedStatus = savedBookingStatuses[booking.id];
          return savedStatus ? { ...booking, status: savedStatus } : booking;
        });
        
        setBookings(updatedBookings);

        // Lấy danh sách phòng
        const roomsData = await getEmployeeRooms();
        setRooms(roomsData);

        setError(null);
      } catch (err) {
        const error = err as Error;
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError(error.message || "Không thể lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date để hiển thị
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format date để nhập vào input
  // const formatDateForInput = (dateString: string) => { // Hàm này không được sử dụng
  //   const date = new Date(dateString);
  //   return date.toISOString().split('T')[0];
  // };

  // Xử lý modal thêm mới
  const openAddModal = () => {
    setForm({
      customerId: '',
      customerName: '',
      phoneNumber: '',
      email: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      note: ''
    });
    setFormError(null);
    setShowModal(true);
  };

  // Đóng modal
  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  // Xử lý thay đổi trạng thái đặt phòng
  const handleStatusChange = async (id: string, status: string) => {
    try {
      setLoading(true);
      // Gọi API để cập nhật trạng thái đặt phòng
      await updateBookingStatus(id, status);

      // Cập nhật trạng thái trong state
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      setError(null);
    } catch (err) {
      const error = err as Error;
      console.error("Lỗi khi cập nhật trạng thái đặt phòng:", error);
      setError(error.message || "Không thể cập nhật trạng thái đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // Xử lý gửi form đặt phòng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form
      if (!form.customerName || !form.roomId || !form.checkInDate || !form.checkOutDate) {
        setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Kiểm tra ngày nhận phòng không được là ngày trong quá khứ
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
      const checkInDate = new Date(form.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        setFormError("Ngày nhận phòng không thể là ngày trong quá khứ");
        return;
      }

      // Kiểm tra ngày trả phòng phải sau ngày nhận phòng
      const checkOutDate = new Date(form.checkOutDate);
      if (checkOutDate <= checkInDate) {
        setFormError("Ngày trả phòng phải sau ngày nhận phòng");
        return;
      }

      setLoading(true);
      setFormError(null);

      // Chuẩn bị dữ liệu để gửi đi
      const bookingData = {
        maKH: form.customerId || "KH" + Math.floor(Math.random() * 10000),
        maPhong: form.roomId,
        ngayNhanPhong: form.checkInDate,
        ngayTraPhong: form.checkOutDate,
        trangThai: "Đã đặt",
        ghiChu: form.note || "",
        treEm: 0,
        nguoiLon: 1,
        soLuongPhong: 1,
        thoiGianDen: "14:00"
      };

      // Gọi API để tạo đặt phòng mới
      await bookRoom(bookingData);

      // Làm mới danh sách đặt phòng
      const newBookings = await getEmployeeBookings();
      setBookings(newBookings);

      // Đóng modal
      closeModal();

    } catch (err) {
      const error = err as Error;
      console.error("Lỗi khi tạo đặt phòng:", error);
      setFormError(error.message || "Không thể tạo đặt phòng mới");
    } finally {
      setLoading(false);
    }
  };

  // Status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Đã đặt':
        return `${styles.status} ${styles.statusBooked}`;
      case 'Đã xác nhận':
        return `${styles.status} ${styles.statusConfirmed}`;
      case 'Đang ở':
        return `${styles.status} ${styles.statusCheckedIn}`;
      case 'Đã trả phòng':
        return `${styles.status} ${styles.statusCheckedOut}`;
      case 'Đã hủy':
        return `${styles.status} ${styles.statusCancelled}`;
      default:
        return styles.status;
    }
  };

  if (authLoading || (loading && bookings.length === 0)) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  const availableRooms = rooms.filter(room => room.status === 'Trống');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đặt phòng</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          + Thêm đặt phòng
        </button>
      </div>

      {error && <div className={styles.error}>Lỗi: {error}</div>}

      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đặt phòng</th>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Nhận phòng</th>
              <th>Trả phòng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{fontWeight: '600', color: '#7c3aed'}}>{booking.id}</td>
                <td>{booking.customerName}</td>
                <td>{booking.roomName}</td>
                <td>{formatDate(booking.checkInDate)}</td>
                <td>{formatDate(booking.checkOutDate)}</td>
                <td>
                  <span className={getStatusClass(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <select
                    value={booking.status}
                    onChange={e => handleStatusChange(booking.id, e.target.value)}
                    className={styles.select}
                    disabled={loading}
                  >
                    <option value="Đã đặt">Đã đặt</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đang ở">Đang ở</option>
                    <option value="Đã trả phòng">Đã trả phòng</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm đặt phòng */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Thêm đặt phòng mới</h3>

            {formError && (
              <div className={styles.error}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Tên khách hàng <span className={styles.required}>*</span>
                </label>
                <input
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>

              <div style={{display:'flex',gap:12}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Số điện thoại</label>
                  <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  />
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  />
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Phòng <span style={{color:'red'}}>*</span></label>
                <select
                  name="roomId"
                  value={form.roomId}
                  onChange={handleInputChange}
                  required
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                >
                  <option value="">Chọn phòng</option>
                  {availableRooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name} - {room.type}</option>
                  ))}
                </select>
              </div>

              <div style={{display:'flex',gap:12}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Ngày nhận phòng <span style={{color:'red'}}>*</span></label>
                  <input
                    name="checkInDate"
                    type="date"
                    value={form.checkInDate}
                    onChange={handleInputChange}
                    required
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  />
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Ngày trả phòng <span style={{color:'red'}}>*</span></label>
                  <input
                    name="checkOutDate"
                    type="date"
                    value={form.checkOutDate}
                    onChange={handleInputChange}
                    required
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  />
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleInputChange}
                  rows={3}
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                ></textarea>
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',cursor:'pointer'}}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}
                >
                  {loading ? 'Đang xử lý...' : 'Thêm đặt phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}