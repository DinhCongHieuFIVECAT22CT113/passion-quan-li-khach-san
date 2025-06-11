"use client";
import React, { useState, useEffect } from "react";
import { getServices, getEmployeeBookings, getEmployeeRooms, saveServiceUsage } from '../../../lib/api';
import styles from './ServiceManager.module.css';

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
        console.log("Raw services data:", servicesData);
        console.log("First service sample:", servicesData[0]);
        console.log("All service keys:", servicesData[0] ? Object.keys(servicesData[0]) : 'No data');

        // Map dữ liệu services đúng format
        const mappedServices = Array.isArray(servicesData) ? servicesData.map((service: any, index: number) => {
          console.log(`Processing service ${index}:`, service);
          console.log(`Service keys:`, Object.keys(service));

          // Thử tất cả các field có thể có
          const maDv = service.maDv || service.MaDv || service.maDichVu || service.MaDichVu || service.serviceId || service.id || `DV${String(index + 1).padStart(3, '0')}`;
          const tenDv = service.tenDv || service.TenDv || service.tenDichVu || service.TenDichVu || service.ten || service.Ten || service.name || service.serviceName || service.title || 'Không xác định';
          const loaiDv = service.loaiDv || service.LoaiDv || service.loaiDichVu || service.LoaiDichVu || service.loai || service.Loai || service.type || service.category || 'Dịch vụ';
          const giaTien = parseFloat(service.giaTien || service.GiaTien || service.gia || service.Gia || service.donGia || service.DonGia || service.price || service.cost || service.amount || 0);
          const moTa = service.moTa || service.MoTa || service.ghiChu || service.GhiChu || service.description || service.desc || service.details || '';

          console.log(`Mapped: maDv=${maDv}, tenDv=${tenDv}, loaiDv=${loaiDv}, giaTien=${giaTien}`);

          return {
            maDv,
            tenDv,
            loaiDv,
            giaTien,
            moTa
          };
        }) : [];

        console.log("Mapped services:", mappedServices);
        setServices(mappedServices);

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

        // Lấy dịch vụ đã sử dụng từ localStorage
        if (typeof window !== 'undefined') {
          const savedServices = localStorage.getItem('usedServices');
          if (savedServices) {
            try {
              const parsedServices = JSON.parse(savedServices);
              if (Array.isArray(parsedServices)) {
                setUsedServices(parsedServices);
              }
            } catch (e) {
              console.error('Lỗi khi parse dịch vụ từ localStorage:', e);
              localStorage.removeItem('usedServices');
            }
          }
        }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const serviceObj = services.find(s => s.maDv === form.serviceId);
    if (!serviceObj) return;

    try {
      setLoading(true);
      
      // Tạo đối tượng dịch vụ sử dụng
      const usedService = {
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
      };
      
      // Lưu vào localStorage để duy trì dữ liệu khi tải lại trang
      const savedServices = JSON.parse(localStorage.getItem('usedServices') || '[]');
      savedServices.push(usedService);
      localStorage.setItem('usedServices', JSON.stringify(savedServices));
      
      // Cập nhật state
      setUsedServices([...usedServices, usedService]);
      
      // Gọi API để lưu dịch vụ sử dụng
      try {
        await saveServiceUsage(usedService);
        console.log('Đã lưu dịch vụ sử dụng thành công');
      } catch (apiError) {
        console.error('Lỗi khi gọi API lưu dịch vụ:', apiError);
        // Vẫn tiếp tục vì đã lưu vào localStorage
      }
      
      closeModal();
    } catch (err) {
      const error = err as Error;
      console.error("Lỗi khi gọi dịch vụ:", error);
      setError(error.message || "Không thể gọi dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  // Format tiền theo định dạng VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading && services.length === 0) {
    return <div className={styles.loading}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý dịch vụ</h2>
        <button className={styles.addBtn} onClick={openModal}>+ Gọi dịch vụ</button>
      </div>

      {error && <div className={styles.error}>Lỗi: {error}</div>}

      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã dịch vụ</th>
              <th>Tên dịch vụ</th>
              <th>Loại</th>
              <th>Giá (VNĐ)</th>
              <th>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, index) => (
              <tr key={s.maDv || `service-${index}`}>
                <td className={styles.serviceId}>{s.maDv}</td>
                <td className={styles.serviceName}>{s.tenDv}</td>
                <td><span className={styles.serviceType}>{s.loaiDv || 'Dịch vụ'}</span></td>
                <td className={styles.price}>{formatCurrency(s.giaTien)}</td>
                <td>{s.moTa || '-'}</td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>Không có dịch vụ nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Dịch vụ đã sử dụng</h3>
      <div style={{overflowX:'auto'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Dịch vụ</th>
              <th>Số lượng</th>
              <th>Thành tiền (VNĐ)</th>
              <th>Ngày gọi</th>
            </tr>
          </thead>
          <tbody>
            {usedServices.map(u => (
              <tr key={u.id}>
                <td>{u.customerName}</td>
                <td>{u.roomName}</td>
                <td className={styles.serviceName}>{u.serviceName}</td>
                <td>{u.quantity}</td>
                <td className={styles.price}>{formatCurrency(u.total)}</td>
                <td>{new Date(u.date).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {usedServices.length === 0 && (
              <tr><td colSpan={6} className={styles.emptyState}>Chưa có dịch vụ nào được sử dụng</td></tr>
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