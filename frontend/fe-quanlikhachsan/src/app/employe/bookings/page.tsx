"use client";
import React, { useState } from "react";

interface Booking {
  id: number;
  customer: string;
  room: string;
  checkin: string;
  checkout: string;
}

const initialBookings: Booking[] = [
  { id: 1, customer: "Nguyễn Văn A", room: "101", checkin: "2024-06-01", checkout: "2024-06-03" },
  { id: 2, customer: "Trần Thị B", room: "102", checkin: "2024-06-05", checkout: "2024-06-07" },
];

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState<Booking>({ id: 0, customer: "", room: "", checkin: "", checkout: "" });

  const openAdd = () => {
    setForm({ id: 0, customer: "", room: "", checkin: "", checkout: "" });
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (b: Booking) => {
    setForm(b);
    setEditing(b);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ id: 0, customer: "", room: "", checkin: "", checkout: "" });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này?")) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setBookings(bookings.map(b => b.id === form.id ? form : b));
    } else {
      setBookings([...bookings, { ...form, id: bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1 }]);
    }
    closeModal();
  };

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý đặt phòng</h2>
        <button style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}} onClick={openAdd}>+ Thêm đặt phòng</button>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>ID</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Khách hàng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Nhận phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trả phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{b.id}</td>
                <td style={{padding:'12px 10px'}}>{b.customer}</td>
                <td style={{padding:'12px 10px'}}>{b.room}</td>
                <td style={{padding:'12px 10px'}}>{b.checkin}</td>
                <td style={{padding:'12px 10px'}}>{b.checkout}</td>
                <td style={{padding:'12px 10px'}}>
                  <button style={{background:'#fbbf24', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', marginRight:4, cursor:'pointer'}} onClick={()=>openEdit(b)}>Sửa</button>
                  <button style={{background:'#f87171', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', cursor:'pointer'}} onClick={()=>handleDelete(b.id)}>Hủy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>{editing ? 'Sửa đặt phòng' : 'Thêm đặt phòng'}</h3>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Khách hàng</label>
                <input name="customer" value={form.customer} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}/>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label>Phòng</label>
                <input name="room" value={form.room} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}/>
              </div>
              <div style={{display:'flex',gap:12}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Nhận phòng</label>
                  <input name="checkin" type="date" value={form.checkin} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}/>
                </div>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                  <label>Trả phòng</label>
                  <input name="checkout" type="date" value={form.checkout} onChange={handleChange} required style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc'}}/>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button type="button" onClick={closeModal} style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',marginRight:8,cursor:'pointer'}}>Hủy</button>
                <button type="submit" style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}>{editing ? 'Lưu' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 