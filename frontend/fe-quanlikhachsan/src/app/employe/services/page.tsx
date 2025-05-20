"use client";
import React, { useState, useEffect } from "react";
import { getServices, getEmployeeBookings, getEmployeeRooms } from '../../../lib/api';

interface Service {
  maDv: string;
  tenDv: string;
  loaiDv: string;
  giaTien: number;
  moTa: string;
}
interface UsedService {
  id: number;
  customerId: string;
  customerName: string;
  roomId: string;
  roomName: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  total: number;
  date: string;
}

interface Room {
  id: string;
  name: string;
  status: string;
}

interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  roomId: string;
  roomName: string;
  status?: string;
}

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [usedServices, setUsedServices] = useState<UsedService[]>([]);
  const [form, setForm] = useState({ 
    customerId: "", 
    customerName: "", 
    roomId: "", 
    roomName: "",
    serviceId: "", 
    quantity: 1 
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy danh sách dịch vụ
        const servicesData = await getServices();
        setServices(servicesData);
        
        // Lấy danh sách đặt phòng
        const bookingsData = await getEmployeeBookings();
        // Chỉ lấy các đặt phòng đang ở
        const activeBookings = bookingsData.filter(
          (b: Booking) => b.status === 'Đang ở' || b.status === 'Đã xác nhận'
        );
        setBookings(activeBookings);
        
        // Lấy danh sách phòng
        const roomsData = await getEmployeeRooms();
        setRooms(roomsData);
        
        setError(null);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError(error.message || "Không thể lấy dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = () => {
    setForm({ 
      customerId: "", 
      customerName: "", 
      roomId: "", 
      roomName: "",
      serviceId: "", 
      quantity: 1 
    });
    setShowModal(true);
  };
  
  const closeModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Nếu đang thay đổi booking, cập nhật roomId và customerId
    if (name === 'roomId') {
      const selectedBooking = bookings.find(b => b.roomId === value);
      if (selectedBooking) {
        setForm({
          ...form,
          roomId: selectedBooking.roomId,
          roomName: selectedBooking.roomName,
          customerId: selectedBooking.customerId,
          customerName: selectedBooking.customerName,
        });
      } else {
        setForm({
          ...form,
          roomId: value,
          roomName: rooms.find(r => r.id === value)?.name || "",
          customerId: "",
          customerName: ""
        });
      }
    } else if (name === 'customerId') {
      const selectedBooking = bookings.find(b => b.customerId === value);
      if (selectedBooking) {
        setForm({
          ...form,
          customerId: selectedBooking.customerId,
          customerName: selectedBooking.customerName,
          roomId: selectedBooking.roomId,
          roomName: selectedBooking.roomName
        });
      } else {
        setForm({
          ...form,
          customerId: value,
          customerName: "",
        });
      }
    } else if (name === "quantity") {
      setForm({ 
        ...form, 
        [name]: parseInt(value) || 1 
      });
    } else if (name === "serviceId") {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceObj = services.find(s => s.maDv === form.serviceId);
    if (!serviceObj) return;
    
    // Trong triển khai thực tế, bạn sẽ gọi API để lưu dịch vụ sử dụng
    // Ở đây chúng ta chỉ lưu vào state
    setUsedServices([
      ...usedServices,
      {
        id: usedServices.length ? Math.max(...usedServices.map(u => u.id)) + 1 : 1,
        customerId: form.customerId,
        customerName: form.customerName,
        roomId: form.roomId,
        roomName: form.roomName,
        serviceId: form.serviceId,
        serviceName: serviceObj.tenDv,
        quantity: form.quantity,
        total: form.quantity * serviceObj.giaTien,
        date: new Date().toISOString()
      }
    ]);
    closeModal();
  };

  // Format tiền theo định dạng VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && services.length === 0) {
    return <div style={{padding:'24px', textAlign:'center'}}>Đang tải dữ liệu...</div>;
  }

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý dịch vụ</h2>
        <button style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}} onClick={openModal}>+ Gọi dịch vụ</button>
      </div>
      
      {error && <div style={{color:'red', marginBottom:'16px'}}>Lỗi: {error}</div>}
      
      <div style={{overflowX:'auto', marginBottom:32}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Mã dịch vụ</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tên dịch vụ</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Loại</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Giá (VNĐ)</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.maDv} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{s.maDv}</td>
                <td style={{padding:'12px 10px'}}>{s.tenDv}</td>
                <td style={{padding:'12px 10px'}}>{s.loaiDv || 'Không xác định'}</td>
                <td style={{padding:'12px 10px'}}>{formatCurrency(s.giaTien)}</td>
                <td style={{padding:'12px 10px'}}>{s.moTa || '-'}</td>
              </tr>
            ))}
            
            {services.length === 0 && (
              <tr>
                <td colSpan={5} style={{textAlign:'center', padding:'20px', color:'#6b7280'}}>Không có dịch vụ nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <h3 style={{margin:'18px 0 10px 0', fontWeight:600, color:'#232946'}}>Dịch vụ đã sử dụng</h3>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Khách hàng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Dịch vụ</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Số lượng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Thành tiền (VNĐ)</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Ngày gọi</th>
            </tr>
          </thead>
          <tbody>
            {usedServices.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{u.customerName}</td>
                <td style={{padding:'12px 10px'}}>{u.roomName}</td>
                <td style={{padding:'12px 10px'}}>{u.serviceName}</td>
                <td style={{padding:'12px 10px'}}>{u.quantity}</td>
                <td style={{padding:'12px 10px'}}>{formatCurrency(u.total)}</td>
                <td style={{padding:'12px 10px'}}>{new Date(u.date).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {usedServices.length === 0 && (
              <tr><td colSpan={6} style={{textAlign:'center', color:'#a0aec0', padding:'18px'}}>Chưa có dịch vụ nào được sử dụng</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {showModal && (
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw',width:'600px'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>Gọi dịch vụ cho khách</h3>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Phòng</label>
                <select 
                  name="roomId" 
                  value={form.roomId} 
                  onChange={handleChange} 
                  required 
                  style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                >
                  <option value="">Chọn phòng</option>
                  {bookings.map(booking => (
                    <option key={booking.roomId} value={booking.roomId}>
                      {booking.roomName} - {booking.customerName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{display:'flex',gap:12}}>
                <div style={{flex:2,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Dịch vụ</label>
                  <select 
                    name="serviceId" 
                    value={form.serviceId} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {services.map(s => (
                      <option key={s.maDv} value={s.maDv}>
                        {s.tenDv} ({formatCurrency(s.giaTien)})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Số lượng</label>
                  <input 
                    name="quantity" 
                    type="number" 
                    min={1} 
                    value={form.quantity} 
                    onChange={handleChange} 
                    required 
                    style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}
                  />
                </div>
              </div>
              
              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',marginRight:8,cursor:'pointer'}}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}
                >
                  Ghi nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 