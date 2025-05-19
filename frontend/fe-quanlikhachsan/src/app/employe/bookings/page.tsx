"use client";
import React, { useState, useEffect } from "react";
import { getEmployeeBookings, updateBookingStatus, createEmployeeBooking, getEmployeeRooms } from '../../../lib/api';

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
        setBookings(bookingsData);
        
        // Lấy danh sách phòng
        const roomsData = await getEmployeeRooms();
        setRooms(roomsData);
        
        setError(null);
      } catch (err: any) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError(err.message || "Không thể lấy dữ liệu");
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
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

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
      await updateBookingStatus(id, status);
      
      // Cập nhật trạng thái trong state
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái đặt phòng:", err);
      setError(err.message || "Không thể cập nhật trạng thái đặt phòng");
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
      
      setLoading(true);
      setFormError(null);
      
      // Chuẩn bị dữ liệu để gửi đi
      const bookingData = {
        maKh: form.customerId || "KH" + Math.floor(Math.random() * 10000), // Tạo fake ID nếu không có
        maPhong: form.roomId,
        ngayDen: form.checkInDate,
        ngayDi: form.checkOutDate,
        trangThai: "Đã đặt",
        ghiChu: form.note || ""
      };
      
      // Gọi API để tạo đặt phòng mới
      const result = await createEmployeeBooking(bookingData);
      
      // Làm mới danh sách đặt phòng
      const newBookings = await getEmployeeBookings();
      setBookings(newBookings);
      
      // Đóng modal
      closeModal();
      
    } catch (err: any) {
      console.error("Lỗi khi tạo đặt phòng:", err);
      setFormError(err.message || "Không thể tạo đặt phòng mới");
    } finally {
      setLoading(false);
    }
  };

  // Status badge style
  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '6px',
      fontWeight: 600,
      fontSize: '0.875rem'
    };
    
    switch (status) {
      case 'Đã đặt':
        return { ...baseStyle, background: '#fef3c7', color: '#92400e' };
      case 'Đã xác nhận':
        return { ...baseStyle, background: '#e0f2fe', color: '#0369a1' };
      case 'Đang ở':
        return { ...baseStyle, background: '#dcfce7', color: '#166534' };
      case 'Đã trả phòng':
        return { ...baseStyle, background: '#f3e8ff', color: '#6b21a8' };
      case 'Đã hủy':
        return { ...baseStyle, background: '#fee2e2', color: '#b91c1c' };
      default:
        return { ...baseStyle, background: '#f3f4f6', color: '#1f2937' };
    }
  };

  if (loading && bookings.length === 0) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu đặt phòng...</div>;
  }

  const availableRooms = rooms.filter(room => room.status === 'Trống');

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý đặt phòng</h2>
        <button 
          style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}} 
          onClick={openAddModal}
        >
          + Thêm đặt phòng
        </button>
      </div>
      
      {error && <div style={{color:'red', marginBottom:'16px'}}>Lỗi: {error}</div>}
      
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Mã đặt phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Khách hàng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Nhận phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trả phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trạng thái</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{booking.id}</td>
                <td style={{padding:'12px 10px'}}>{booking.customerName}</td>
                <td style={{padding:'12px 10px'}}>{booking.roomName}</td>
                <td style={{padding:'12px 10px'}}>{formatDate(booking.checkInDate)}</td>
                <td style={{padding:'12px 10px'}}>{formatDate(booking.checkOutDate)}</td>
                <td style={{padding:'12px 10px'}}>
                  <span style={getStatusBadgeStyle(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td style={{padding:'12px 10px'}}>
                  <select 
                    value={booking.status}
                    onChange={e => handleStatusChange(booking.id, e.target.value)}
                    style={{padding:'6px 10px', borderRadius:6, border:'1.5px solid #e5e7eb', fontWeight:500, fontSize:'0.9rem'}}
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
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw',width:'600px'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>Thêm đặt phòng mới</h3>
            
            {formError && (
              <div style={{padding:'10px 16px', backgroundColor:'#fee2e2', color:'#b91c1c', borderRadius:8, marginBottom:16}}>
                {formError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Tên khách hàng <span style={{color:'red'}}>*</span></label>
                <input 
                  name="customerName" 
                  value={form.customerName} 
                  onChange={handleInputChange} 
                  required 
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
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