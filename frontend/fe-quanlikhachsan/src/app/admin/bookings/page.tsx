'use client';
import React, { useState } from "react";
import styles from "./BookingManager.module.css";

interface Booking {
  id: number;
  customer: string;
  room: string;
  checkin: string;
  checkout: string;
  status: string;
}

const initialBookings: Booking[] = [
  { id: 1, customer: "Nguyễn Văn A", room: "Phòng 101", checkin: "2024-06-01", checkout: "2024-06-03", status: "Đã nhận phòng" },
  { id: 2, customer: "Trần Thị B", room: "Phòng 102", checkin: "2024-06-05", checkout: "2024-06-07", status: "Đã đặt" },
  { id: 3, customer: "Lê Văn C", room: "Phòng 201", checkin: "2024-06-10", checkout: "2024-06-12", status: "Đã trả phòng" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã đặt": { label: "Đã đặt", className: styles["status"] + " " + styles["status-booked"] },
  "Đã nhận phòng": { label: "Đã nhận phòng", className: styles["status"] + " " + styles["status-checkedin"] },
  "Đã trả phòng": { label: "Đã trả phòng", className: styles["status"] + " " + styles["status-checkedout"] },
};

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [form, setForm] = useState<Booking>({ id: 0, customer: "", room: "", checkin: "", checkout: "", status: "" });
  const [historyBooking, setHistoryBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");

  // Khi mở modal Thêm mới
  const openAddModal = () => {
    setForm({ id: 0, customer: "", room: "", checkin: "", checkout: "", status: "" });
    setShowAddModal(true);
  };

  // Khi mở modal Sửa
  const openEditModal = (booking: Booking) => {
    setForm(booking);
    setEditBooking(booking);
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý submit Thêm mới
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setBookings([...bookings, { ...form, id: bookings.length + 1 }]);
    setShowAddModal(false);
  };

  // Xử lý submit Sửa
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookings(bookings.map(b => b.id === form.id ? form : b));
    setEditBooking(null);
  };

  // Lọc theo search
  const filtered = bookings.filter(b =>
    b.customer.toLowerCase().includes(search.toLowerCase()) ||
    b.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý đặt phòng</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            type="text"
            placeholder="Tìm kiếm khách/phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:'1rem', background:'#f9fafb', minWidth:180}}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm đặt phòng</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Phòng</th>
            <th>Nhận phòng</th>
            <th>Trả phòng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
          ) : filtered.map(booking => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.customer}</td>
              <td>{booking.room}</td>
              <td>{booking.checkin}</td>
              <td>{booking.checkout}</td>
              <td><span className={statusMap[booking.status]?.className}>{statusMap[booking.status]?.label || booking.status}</span></td>
              <td style={{whiteSpace:'nowrap'}}>
                <button className={styles.editBtn} onClick={() => openEditModal(booking)}>Sửa</button>
                <button className={styles.historyBtn} onClick={() => setHistoryBooking(booking)}>Lịch sử</button>
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
            <h3>Thêm đặt phòng</h3>
            <form onSubmit={handleAdd} autoComplete="off">
              <input name="customer" value={form.customer} onChange={handleChange} placeholder="Khách hàng" required />
              <input name="room" value={form.room} onChange={handleChange} placeholder="Phòng" required />
              <input name="checkin" type="date" value={form.checkin} onChange={handleChange} required />
              <input name="checkout" type="date" value={form.checkout} onChange={handleChange} required />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="">Chọn trạng thái</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đã nhận phòng">Đã nhận phòng</option>
                <option value="Đã trả phòng">Đã trả phòng</option>
              </select>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.historyBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa đặt phòng</h3>
            <form onSubmit={handleEdit} autoComplete="off">
              <input name="customer" value={form.customer} onChange={handleChange} placeholder="Khách hàng" required />
              <input name="room" value={form.room} onChange={handleChange} placeholder="Phòng" required />
              <input name="checkin" type="date" value={form.checkin} onChange={handleChange} required />
              <input name="checkout" type="date" value={form.checkout} onChange={handleChange} required />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="">Chọn trạng thái</option>
                <option value="Đã đặt">Đã đặt</option>
                <option value="Đã nhận phòng">Đã nhận phòng</option>
                <option value="Đã trả phòng">Đã trả phòng</option>
              </select>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setEditBooking(null)} className={styles.historyBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lịch sử */}
      {historyBooking && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Lịch sử đặt phòng</h3>
            <div style={{marginBottom:12}}>
              <b>Khách:</b> {historyBooking.customer}<br/>
              <b>Phòng:</b> {historyBooking.room}<br/>
              <b>Nhận phòng:</b> {historyBooking.checkin}<br/>
              <b>Trả phòng:</b> {historyBooking.checkout}<br/>
              <b>Trạng thái:</b> <span className={statusMap[historyBooking.status]?.className}>{statusMap[historyBooking.status]?.label || historyBooking.status}</span>
            </div>
            <button onClick={() => setHistoryBooking(null)} className={styles.editBtn}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
} 