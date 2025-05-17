"use client";
import React, { useState } from "react";

interface Service {
  id: number;
  name: string;
  type: string;
  price: number;
}
interface UsedService {
  id: number;
  customer: string;
  room: string;
  service: string;
  quantity: number;
  total: number;
}

const services: Service[] = [
  { id: 1, name: "Ăn sáng buffet", type: "Ăn uống", price: 150000 },
  { id: 2, name: "Nước suối", type: "Đồ uống", price: 20000 },
  { id: 3, name: "Spa thư giãn", type: "Spa", price: 500000 },
  { id: 4, name: "Giặt là", type: "Dịch vụ phòng", price: 50000 },
];
const customers = [
  { name: "Nguyễn Văn A", room: "101" },
  { name: "Trần Thị B", room: "102" },
  { name: "Lê Văn C", room: "201" },
];

export default function ServiceManager() {
  const [usedServices, setUsedServices] = useState<UsedService[]>([]);
  const [form, setForm] = useState({ customer: "", room: "", service: "", quantity: 1 });
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setForm({ customer: "", room: "", service: "", quantity: 1 });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "quantity" ? Number(value) : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceObj = services.find(s => s.name === form.service);
    if (!serviceObj) return;
    setUsedServices([
      ...usedServices,
      {
        id: usedServices.length ? Math.max(...usedServices.map(u => u.id)) + 1 : 1,
        customer: form.customer,
        room: form.room,
        service: form.service,
        quantity: form.quantity,
        total: form.quantity * serviceObj.price
      }
    ]);
    closeModal();
  };

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý dịch vụ</h2>
        <button style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}} onClick={openModal}>+ Gọi dịch vụ</button>
      </div>
      <div style={{overflowX:'auto', marginBottom:32}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tên dịch vụ</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Loại</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Giá (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{s.name}</td>
                <td style={{padding:'12px 10px'}}>{s.type}</td>
                <td style={{padding:'12px 10px'}}>{s.price.toLocaleString()}</td>
              </tr>
            ))}
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
            </tr>
          </thead>
          <tbody>
            {usedServices.map(u => (
              <tr key={u.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{u.customer}</td>
                <td style={{padding:'12px 10px'}}>{u.room}</td>
                <td style={{padding:'12px 10px'}}>{u.service}</td>
                <td style={{padding:'12px 10px'}}>{u.quantity}</td>
                <td style={{padding:'12px 10px'}}>{u.total.toLocaleString()}</td>
              </tr>
            ))}
            {usedServices.length === 0 && (
              <tr><td colSpan={5} style={{textAlign:'center', color:'#a0aec0', padding:'18px'}}>Chưa có dịch vụ nào được sử dụng</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>Gọi dịch vụ cho khách</h3>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',gap:12}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Khách hàng</label>
                  <select name="customer" value={form.customer} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}>
                    <option value="">Chọn khách hàng</option>
                    {customers.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Phòng</label>
                  <select name="room" value={form.room} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}>
                    <option value="">Chọn phòng</option>
                    {customers.map(c => <option key={c.room} value={c.room}>{c.room}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',gap:12}}>
                <div style={{flex:2,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Dịch vụ</label>
                  <select name="service" value={form.service} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}>
                    <option value="">Chọn dịch vụ</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Số lượng</label>
                  <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}/>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button type="button" onClick={closeModal} style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',marginRight:8,cursor:'pointer'}}>Hủy</button>
                <button type="submit" style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}>Ghi nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 