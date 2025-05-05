"use client";
import React, { useRef, useState } from "react";

interface Invoice {
  id: number;
  customer: string;
  room: string;
  total: number;
  services: { name: string; quantity: number; price: number }[];
  status: "Đã thanh toán" | "Chưa thanh toán";
}

// Hàm định dạng số tùy chỉnh để tránh lỗi hydration
const formatNumber = (number: number): string => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const initialInvoices: Invoice[] = [
  {
    id: 1,
    customer: "Nguyễn Văn A",
    room: "101",
    total: 3200000,
    services: [
      { name: "Ăn sáng buffet", quantity: 2, price: 150000 },
      { name: "Nước suối", quantity: 3, price: 20000 }
    ],
    status: "Đã thanh toán"
  },
  {
    id: 2,
    customer: "Trần Thị B",
    room: "102",
    total: 1800000,
    services: [
      { name: "Spa thư giãn", quantity: 1, price: 500000 }
    ],
    status: "Chưa thanh toán"
  }
];
const services = [
  { name: "Ăn sáng buffet", price: 150000 },
  { name: "Nước suối", price: 20000 },
  { name: "Spa thư giãn", price: 500000 },
  { name: "Giặt là", price: 50000 }
];
const customers = [
  { name: "Nguyễn Văn A", room: "101" },
  { name: "Trần Thị B", room: "102" },
  { name: "Lê Văn C", room: "201" },
];

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ customer: "", room: "", services: [] as { name: string; quantity: number; price: number }[] });
  const [serviceInput, setServiceInput] = useState({ name: "", quantity: 1 });
  const printRef = useRef<HTMLDivElement>(null);

  const openAdd = () => {
    setForm({ customer: "", room: "", services: [] });
    setEditing(null);
    setShowModal(true);
  };
  const openEdit = (inv: Invoice) => {
    setForm({ customer: inv.customer, room: inv.room, services: inv.services });
    setEditing(inv);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm({ customer: "", room: "", services: [] });
    setServiceInput({ name: "", quantity: 1 });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceInput({ ...serviceInput, [name]: name === "quantity" ? Number(value) : value });
  };
  const addService = () => {
    const s = services.find(sv => sv.name === serviceInput.name);
    if (!s) return;
    setForm({
      ...form,
      services: [...form.services, { name: s.name, quantity: serviceInput.quantity, price: s.price }]
    });
    setServiceInput({ name: "", quantity: 1 });
  };
  const removeService = (idx: number) => {
    setForm({ ...form, services: form.services.filter((_, i) => i !== idx) });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = form.services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    if (editing) {
      setInvoices(invoices.map(inv => inv.id === editing.id ? { ...editing, customer: form.customer, room: form.room, services: form.services, total } : inv));
    } else {
      setInvoices([
        ...invoices,
        {
          id: invoices.length ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
          customer: form.customer,
          room: form.room,
          services: form.services,
          total,
          status: "Chưa thanh toán"
        }
      ]);
    }
    closeModal();
  };
  const handlePrint = (inv: Invoice) => {
    const printContent = document.getElementById(`invoice-print-${inv.id}`);
    if (!printContent) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    printWindow.document.write('<html><head><title>Hóa đơn</title></head><body>' + printContent.innerHTML + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div style={{maxWidth:1100, margin:'32px auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 16px #0001', padding:'32px 18px 32px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18}}>
        <h2 style={{fontSize:'1.7rem', fontWeight:'bold', color:'#232a35'}}>Quản lý hóa đơn</h2>
        <button style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontSize:'1rem', cursor:'pointer'}} onClick={openAdd}>+ Tạo hóa đơn</button>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', background:'#fff', fontSize:'1rem', minWidth:700}}>
          <thead>
            <tr>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Khách hàng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Phòng</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Tổng tiền (VNĐ)</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Trạng thái</th>
              <th style={{padding:'12px 10px', background:'#f3f4f6', fontWeight:600}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} style={{borderBottom:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 10px'}}>{inv.customer}</td>
                <td style={{padding:'12px 10px'}}>{inv.room}</td>
                <td style={{padding:'12px 10px'}}>{formatNumber(inv.total)}</td>
                <td style={{padding:'12px 10px'}}>{inv.status}</td>
                <td style={{padding:'12px 10px'}}>
                  <button style={{background:'#fbbf24', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', marginRight:4, cursor:'pointer'}} onClick={()=>openEdit(inv)}>Sửa</button>
                  <button style={{background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'6px 12px', marginRight:4, cursor:'pointer'}} onClick={()=>handlePrint(inv)}>In</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invoices.map(inv => (
        <div key={inv.id} id={`invoice-print-${inv.id}`} style={{display:'none'}}>
          <div style={{padding:32, fontFamily:'Arial'}}>
            <h2 style={{textAlign:'center', marginBottom:24}}>HÓA ĐƠN THANH TOÁN</h2>
            <div>Khách hàng: <b>{inv.customer}</b></div>
            <div>Phòng: <b>{inv.room}</b></div>
            <div style={{margin:'18px 0'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:'1rem'}}>
                <thead>
                  <tr>
                    <th style={{border:'1px solid #e5e7eb', padding:8}}>Dịch vụ</th>
                    <th style={{border:'1px solid #e5e7eb', padding:8}}>Số lượng</th>
                    <th style={{border:'1px solid #e5e7eb', padding:8}}>Đơn giá</th>
                    <th style={{border:'1px solid #e5e7eb', padding:8}}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.services.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{border:'1px solid #e5e7eb', padding:8}}>{s.name}</td>
                      <td style={{border:'1px solid #e5e7eb', padding:8}}>{s.quantity}</td>
                      <td style={{border:'1px solid #e5e7eb', padding:8}}>{formatNumber(s.price)}</td>
                      <td style={{border:'1px solid #e5e7eb', padding:8}}>{formatNumber(s.price * s.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{textAlign:'right', fontWeight:700, fontSize:'1.1rem'}}>Tổng tiền: {formatNumber(inv.total)} VNĐ</div>
            <div style={{marginTop:32, textAlign:'center'}}>Cảm ơn quý khách đã sử dụng dịch vụ!</div>
          </div>
        </div>
      ))}
      {showModal && (
        <div style={{position:'fixed',zIndex:1000,top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,boxShadow:'0 8px 32px #23294622',padding:'32px 28px 24px 28px',minWidth:340,maxWidth:'95vw'}}>
            <h3 style={{marginTop:0,marginBottom:18,fontSize:'1.3rem',color:'#232946',fontWeight:700}}>{editing ? 'Sửa hóa đơn' : 'Tạo hóa đơn'}</h3>
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
              <div style={{margin:'10px 0 0 0'}}>
                <label style={{fontWeight:500, color:'#232946'}}>Dịch vụ đã dùng</label>
                <div style={{display:'flex',gap:12,marginTop:6}}>
                  <select name="name" value={serviceInput.name} onChange={handleServiceChange} style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc',flex:2}}>
                    <option value="">Chọn dịch vụ</option>
                    {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                  <input name="quantity" type="number" min={1} value={serviceInput.quantity} onChange={handleServiceChange} style={{padding:'10px 12px',borderRadius:8,border:'1.5px solid #e5e7eb',fontSize:'1rem',background:'#f7fafc',flex:1}}/>
                  <button type="button" onClick={addService} style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}>Thêm</button>
                </div>
                <ul style={{margin:'10px 0 0 0',padding:0,listStyle:'none'}}>
                  {form.services.map((s, idx) => (
                    <li key={idx} style={{display:'flex',alignItems:'center',gap:8,margin:'6px 0'}}>
                      <span>{s.name} x{s.quantity} ({formatNumber(s.price * s.quantity)}đ)</span>
                      <button type="button" onClick={()=>removeService(idx)} style={{background:'#f87171',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',fontWeight:500,fontSize:'0.97em',cursor:'pointer'}}>X</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:12,marginTop:10}}>
                <button type="button" onClick={closeModal} style={{background:'#e5e7eb',color:'#232946',border:'none',borderRadius:6,padding:'7px 16px',fontWeight:500,fontSize:'0.97em',marginRight:8,cursor:'pointer'}}>Hủy</button>
                <button type="submit" style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:600,fontSize:'1.08rem',cursor:'pointer'}}>{editing ? 'Lưu' : 'Tạo hóa đơn'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}