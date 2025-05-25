"use client";
import React, { useState, useEffect } from "react";
import styles from "./Staffs.module.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getStaffs, createStaff, updateStaff, deleteStaff } from "../../../lib/api";

interface Staff {
  maNV: string;
  hoNv: string;
  tenNv: string;
  userName?: string;
  chucVu: string;
  soDienThoai: string;
  email?: string;
  ngayVaoLam?: string;
  luongCoBan?: number;
  maRole?: string;
  trangThai?: string;
}

export default function StaffManager() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState<Staff>({ 
    maNV: "", 
    hoNv: "", 
    tenNv: "", 
    userName: "",
    chucVu: "", 
    soDienThoai: "", 
    email: "", 
    ngayVaoLam: "",
    luongCoBan: 0,
    maRole: "",
    trangThai: "Hoạt động" 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách nhân viên từ API
  useEffect(() => {
    const fetchStaffs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const dataFromApi = await getStaffs();
        // Log dữ liệu gốc từ API
        console.log("Raw data from getStaffs():", JSON.stringify(dataFromApi, null, 2));

        const processedStaffs = dataFromApi.map((item: any) => ({
          maNV: item.maNv, // API trả về maNv
          hoNv: item.hoNv,
          tenNv: item.tenNv,
          userName: item.userName,
          chucVu: item.chucVu,
          soDienThoai: item.sdt, // API trả về sdt
          email: item.email,
          ngayVaoLam: item.ngayVaoLam,
          luongCoBan: item.luongCoBan,
          maRole: item.maRole,
          trangThai: item.trangThai || "Hoạt động", // Giả sử có trường trangThai hoặc mặc định
        }));
        
        // Log dữ liệu đã xử lý
        console.log("Processed staffs data:", JSON.stringify(processedStaffs, null, 2));
        setStaffs(processedStaffs);
      } catch (err) {
        const error = err as Error;
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu nhân viên");
        console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffs();
  }, []);

  const openAddModal = () => {
    setForm({ 
      maNV: "", 
      hoNv: "", 
      tenNv: "", 
      userName: "",
      chucVu: "", 
      soDienThoai: "", 
      email: "", 
      ngayVaoLam: "",
      luongCoBan: 0,
      maRole: "",
      trangThai: "Hoạt động" 
    });
    setEditingStaff(null);
    setShowModal(true);
  };

  const openEditModal = (staff: Staff) => {
    setForm(staff);
    setEditingStaff(staff);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setForm({ 
      maNV: "", 
      hoNv: "", 
      tenNv: "", 
      userName: "",
      chucVu: "", 
      soDienThoai: "", 
      email: "", 
      ngayVaoLam: "",
      luongCoBan: 0,
      maRole: "",
      trangThai: "Hoạt động" 
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDelete = async (maNV: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteStaff(maNV);
        setStaffs(staffs.filter((s) => s.maNV !== maNV));
      } catch (err) {
        const error = err as Error;
        alert(`Lỗi khi xóa nhân viên: ${error.message}`);
        console.error("Lỗi xóa nhân viên:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Cập nhật nhân viên
        await updateStaff(form);
        setStaffs(staffs.map((s) => (s.maNV === form.maNV ? { ...s, ...form } : s)));
      } else {
        // Thêm nhân viên mới
        const newStaffData = { ...form };
        // Nếu API createStaff cần một trường hoTen ghép lại, bạn có thể tạo nó ở đây
        // ví dụ: newStaffData.hoTen = `${form.hoNv} ${form.tenNv}`.trim();
        const newStaff = await createStaff(newStaffData); 
        // Giả sử createStaff trả về nhân viên đã được tạo với cấu trúc đầy đủ
        // Nếu không, bạn cần map lại tương tự như lúc fetchStaffs
        setStaffs([...staffs, {
          ...newStaff, // Giả sử newStaff trả về từ API đã có hoNv, tenNv,...
          hoNv: form.hoNv, // Hoặc lấy từ form nếu API không trả về đầy đủ
          tenNv: form.tenNv,
          // ... các trường khác từ form nếu cần
        }]);
      }
      closeModal();
    } catch (err) {
      const error = err as Error;
      alert(`Lỗi: ${error.message}`);
      console.error("Lỗi khi lưu nhân viên:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý nhân viên</h2>
        <button className={styles.addBtn} onClick={openAddModal}>
          <FaPlus style={{marginRight:8}}/> Thêm nhân viên
        </button>
      </div>
      
      {isLoading && <div className={styles.loading}>Đang tải dữ liệu...</div>}
      {error && <div className={styles.error}>Lỗi: {error}</div>}
      
      {!isLoading && !error && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã NV</th><th>Họ tên</th><th>Username</th><th>Chức vụ</th><th>Số điện thoại</th><th>Email</th><th>Trạng thái</th><th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {staffs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu nhân viên</td>
                </tr>
              ) : (
                staffs.map((staff) => (
                  <tr key={staff.maNV}>
                    <td>{staff.maNV}</td>
                    <td>{`${staff.hoNv || ''} ${staff.tenNv || ''}`.trim()}</td>
                    <td>{staff.userName || "N/A"}</td>
                    <td>{staff.chucVu}</td>
                    <td>{staff.soDienThoai}</td>
                    <td>{staff.email || "N/A"}</td>
                    <td>{staff.trangThai || "Hoạt động"}</td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEditModal(staff)} title="Sửa">
                        <FaEdit style={{marginRight:4}}/> Sửa
                      </button>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(staff.maNV)} title="Xóa">
                        <FaTrash style={{marginRight:4}}/> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingStaff ? "Sửa nhân viên" : "Thêm nhân viên"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              {!editingStaff && (
                <div className={styles.formGroup}>
                  <label>Mã nhân viên</label>
                  <input name="maNV" value={form.maNV} onChange={handleChange} placeholder="Mã nhân viên (NV001)" className={styles.input}/>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Họ nhân viên</label>
                <input name="hoNv" value={form.hoNv} onChange={handleChange} required placeholder="Họ nhân viên" className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Tên nhân viên</label>
                <input name="tenNv" value={form.tenNv} onChange={handleChange} required placeholder="Tên nhân viên" className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input name="userName" value={form.userName || ''} onChange={handleChange} placeholder="Username" className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label>Chức vụ</label>
                <select name="chucVu" value={form.chucVu} onChange={handleChange} required className={styles.input}>
                  <option value="">Chọn chức vụ</option>
                  <option value="Quản lý">Quản lý</option>
                  <option value="Lễ tân">Lễ tân</option>
                  <option value="Buồng phòng">Buồng phòng</option>
                  <option value="Kế toán">Kế toán</option>
                  <option value="Bảo vệ">Bảo vệ</option>
                  <option value="Nhân viên khác">Nhân viên khác</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input 
                  name="soDienThoai" 
                  value={form.soDienThoai} 
                  onChange={handleChange} 
                  required 
                  placeholder="Số điện thoại" 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  name="email" 
                  value={form.email || ''} 
                  onChange={handleChange} 
                  placeholder="Email" 
                  className={styles.input}
                  type="email" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ngày vào làm</label>
                <input 
                  name="ngayVaoLam" 
                  value={form.ngayVaoLam ? new Date(form.ngayVaoLam).toISOString().split('T')[0] : ''} 
                  onChange={handleChange} 
                  placeholder="Ngày vào làm" 
                  className={styles.input}
                  type="date" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Lương cơ bản</label>
                <input 
                  name="luongCoBan" 
                  value={form.luongCoBan || 0} 
                  onChange={handleChange} 
                  placeholder="Lương cơ bản" 
                  className={styles.input}
                  type="number" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Mã Role</label>
                <input 
                  name="maRole" 
                  value={form.maRole || ''} 
                  onChange={handleChange} 
                  placeholder="Mã Role (R01, R02,...)" 
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Trạng thái</label>
                <select 
                  name="trangThai" 
                  value={form.trangThai} 
                  onChange={handleChange} 
                  className={styles.input}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>Hủy</button>
                <button type="submit" className={styles.addBtn}>{editingStaff ? "Lưu" : <><FaPlus style={{marginRight:4}}/>Thêm</>}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}