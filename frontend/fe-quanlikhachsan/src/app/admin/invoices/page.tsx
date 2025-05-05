'use client';
import React, { useState } from "react";
import styles from "./InvoiceManager.module.css";

interface Invoice {
  id: number;
  customer: string;
  amount: number;
  date: string;
  status: string;
}

const initialInvoices: Invoice[] = [
  { id: 1, customer: "Nguyễn Văn A", amount: 3200000, date: "2024-06-03", status: "Đã thanh toán" },
  { id: 2, customer: "Trần Thị B", amount: 1800000, date: "2024-06-07", status: "Chưa thanh toán" },
  { id: 3, customer: "Lê Văn C", amount: 4000000, date: "2024-06-12", status: "Đã thanh toán" },
];

const statusMap: Record<string, { label: string; className: string }> = {
  "Đã thanh toán": { label: "Đã thanh toán", className: styles["status"] + " " + styles["status-paid"] },
  "Chưa thanh toán": { label: "Chưa thanh toán", className: styles["status"] + " " + styles["status-unpaid"] },
};

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<Invoice>({ id: 0, customer: "", amount: 0, date: "", status: "" });
  const [search, setSearch] = useState("");

  // Khi mở modal Thêm mới
  const openAddModal = () => {
    setForm({ id: 0, customer: "", amount: 0, date: "", status: "" });
    setShowAddModal(true);
  };

  // Khi mở modal Sửa
  const openEditModal = (invoice: Invoice) => {
    setForm(invoice);
    setEditInvoice(invoice);
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'amount' ? Number(value) : value });
  };

  // Xử lý submit Thêm mới
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoices([...invoices, { ...form, id: invoices.length + 1 }]);
    setShowAddModal(false);
  };

  // Xử lý submit Sửa
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setInvoices(invoices.map(inv => inv.id === form.id ? form : inv));
    setEditInvoice(null);
  };

  // Lọc theo search
  const filtered = invoices.filter(inv =>
    inv.customer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý hóa đơn</h2>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:'1rem', background:'#f9fafb', minWidth:180}}
          />
          <button className={styles.addBtn} onClick={openAddModal}>+ Thêm hóa đơn</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Số tiền (VNĐ)</th>
            <th>Ngày lập</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign:'center', color:'#888', fontStyle:'italic'}}>Không có dữ liệu</td></tr>
          ) : filtered.map(invoice => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.customer}</td>
              <td>{invoice.amount.toLocaleString()}</td>
              <td>{invoice.date}</td>
              <td><span className={statusMap[invoice.status]?.className}>{statusMap[invoice.status]?.label || invoice.status}</span></td>
              <td style={{whiteSpace:'nowrap'}}>
                <button className={styles.viewBtn}>Xem</button>
                <button className={styles.editBtn} onClick={() => openEditModal(invoice)}>Sửa</button>
                <button className={styles.pdfBtn}>Xuất PDF</button>
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
            <h3>Thêm hóa đơn</h3>
            <form onSubmit={handleAdd} autoComplete="off">
              <input name="customer" value={form.customer} onChange={handleChange} placeholder="Khách hàng" required />
              <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Số tiền" required min={0} />
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="">Chọn trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
              </select>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.pdfBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa */}
      {editInvoice && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Sửa hóa đơn</h3>
            <form onSubmit={handleEdit} autoComplete="off">
              <input name="customer" value={form.customer} onChange={handleChange} placeholder="Khách hàng" required />
              <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Số tiền" required min={0} />
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
              <select name="status" value={form.status} onChange={handleChange} required>
                <option value="">Chọn trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
              </select>
              <div style={{marginTop: 12, display:'flex', gap:8}}>
                <button type="submit" className={styles.editBtn}>Lưu</button>
                <button type="button" onClick={() => setEditInvoice(null)} className={styles.pdfBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 