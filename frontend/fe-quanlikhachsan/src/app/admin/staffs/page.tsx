"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
// import Link from 'next/link'; // Xóa import Link không sử dụng
import styles from './Staffs.module.css';
import { API_BASE_URL } from '@/lib/config'; 
import { getAuthHeaders, handleResponse } from '@/lib/api'; 
// import Image from 'next/image'; // Xóa import Image không sử dụng
import { withAuth, ROLES, useAuth } from '@/lib/auth'; // Import HOC và ROLES
// import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // Xóa import icons không sử dụng

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
  tenRole?: string;
}

interface Role {
  maRole: string;
  tenRole: string;
}

interface StaffFormState {
  maNV?: string;
  hoNv: string;
  tenNv: string;
  userName: string;
  chucVu: string;
  soDienThoai: string;
  email: string;
  ngayVaoLam: string;
  luongCoBan: number;
  maRole: string;
  trangThai: string;
}

function StaffPage() {
  const { user, loading: authLoading } = useAuth();
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formState, setFormState] = useState<StaffFormState>({
    hoNv: "", 
    tenNv: "", 
    userName: "",
    chucVu: "", 
    soDienThoai: "", 
    email: "", 
    ngayVaoLam: new Date().toISOString().split('T')[0],
    luongCoBan: 0,
    maRole: "",
    trangThai: "Hoạt động",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

    const fetchStaffs = async () => {
      setIsLoading(true);
      setError(null);
      try {
      const response = await fetch(`${API_BASE_URL}/NhanVien`, { 
        method: 'GET', 
        headers: getAuthHeaders('GET'), 
        credentials: 'include' 
      });
      const data = await handleResponse(response);
      
      // Lấy tên Role cho từng nhân viên
      const staffsWithRoles = await Promise.all(data.map(async (staff: Staff) => {
        if (staff.maRole) {
          try {
            const roleResponse = await fetch(`${API_BASE_URL}/Role/${staff.maRole}`, {
              method: 'GET',
              headers: getAuthHeaders('GET'),
              credentials: 'include'
            });
            const roleData = await handleResponse(roleResponse);
            return { ...staff, tenRole: roleData.tenRole };
          } catch (roleError) {
            console.error(`Error fetching role ${staff.maRole}:`, roleError);
            return { ...staff, tenRole: 'N/A' }; // Hoặc giá trị mặc định khác
          }
        }
        return { ...staff, tenRole: 'N/A' }; 
      }));
      setStaffs(staffsWithRoles);

    } catch (err: any) {
      setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

  const fetchAllRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Role`, {
        method: 'GET',
        headers: getAuthHeaders('GET'),
        credentials: 'include'
      });
      const rolesData = await handleResponse(response);
      if (rolesData && Array.isArray(rolesData)) {
        setRoles(rolesData.map((r: any) => ({ maRole: r.maRole, tenRole: r.tenRole })));
      } else {
        console.error("Lỗi: Dữ liệu Role không hợp lệ", rolesData);
        setRoles([]); 
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách Role:", error);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchAllRoles();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'luongCoBan' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const url = editingStaff 
        ? `${API_BASE_URL}/NhanVien/${editingStaff.maNV}` 
        : `${API_BASE_URL}/NhanVien`;
      const method = editingStaff ? 'PUT' : 'POST';
      
      const payload: any = { ...formState };
      // Server có thể tự sinh MaNV nếu là POST và không có maNV
      if (!editingStaff && !payload.maNV) {
        // Không gửi maNV rỗng nếu đang thêm mới, server sẽ tự tạo nếu cần
        // Hoặc bạn có thể tạo mã NV ở client nếu logic yêu cầu
      }

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(method),
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      await handleResponse(response);
      fetchStaffs(); 
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingStaff(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Submit error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setFormState({
      hoNv: "", 
      tenNv: "", 
      userName: "",
      chucVu: "", 
      soDienThoai: "", 
      email: "", 
      ngayVaoLam: new Date().toISOString().split('T')[0],
      luongCoBan: 0,
      maRole: roles.length > 0 ? roles[0].maRole : "", // Chọn role đầu tiên làm mặc định
      trangThai: "Hoạt động",
    });
    setError(null);
    setShowAddModal(true);
    setShowEditModal(false);
    setEditingStaff(null);
  };

  const openEditModal = (staff: Staff) => {
    setFormState({
      maNV: staff.maNV, // Cần thiết để PUT đúng đối tượng
      hoNv: staff.hoNv || "",
      tenNv: staff.tenNv || "",
      userName: staff.userName || "",
      chucVu: staff.chucVu || "",
      soDienThoai: staff.soDienThoai || "",
      email: staff.email || "",
      ngayVaoLam: staff.ngayVaoLam ? new Date(staff.ngayVaoLam).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      luongCoBan: staff.luongCoBan || 0,
      maRole: staff.maRole || "",
      trangThai: staff.trangThai || "Hoạt động",
    });
    setError(null);
    setShowAddModal(false);
    setShowEditModal(true);
    setEditingStaff(staff);
  };

  const handleDelete = async (maNV: string | undefined) => {
    if (!maNV) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/NhanVien/${maNV}`, {
          method: 'DELETE',
          headers: getAuthHeaders('DELETE'),
          credentials: 'include'
        });
        await handleResponse(response);
        fetchStaffs(); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredStaffs = staffs.filter(staff => 
    (`${staff.hoNv || ''} ${staff.tenNv || ''}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (staff.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (staff.soDienThoai || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return <p>Đang tải dữ liệu trang nhân viên...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Nhân Viên</h1>

      {error && <p className={styles.errorText}>Lỗi: {error}</p>}

      <div className={styles.toolbar}>
        <input 
          type="text" 
          placeholder="Tìm kiếm nhân viên..." 
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {user && user.permissions.canManageStaff && (
          <button onClick={openAddModal} className={styles.addBtn}>Thêm Nhân Viên</button>
        )}
      </div>
      
          <table className={styles.table}>
            <thead>
              <tr>
            <th>Mã NV</th>
            <th>Họ tên</th>
            <th>Username</th>
            <th>Chức vụ</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>Ngày vào làm</th>
            <th>Lương cơ bản</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
          {filteredStaffs.length === 0 ? (
                <tr>
              <td colSpan={11} style={{textAlign: 'center', padding: '16px'}}>Không có dữ liệu nhân viên</td>
                </tr>
              ) : (
            filteredStaffs.map((staff) => (
                  <tr key={staff.maNV}>
                    <td>{staff.maNV}</td>
                    <td>{`${staff.hoNv || ''} ${staff.tenNv || ''}`.trim()}</td>
                <td>{staff.userName || 'N/A'}</td>
                    <td>{staff.chucVu}</td>
                    <td>{staff.soDienThoai}</td>
                <td>{staff.email}</td>
                <td>{staff.ngayVaoLam ? new Date(staff.ngayVaoLam).toLocaleDateString() : 'N/A'}</td>
                <td>{staff.luongCoBan?.toLocaleString()}</td>
                <td>{staff.tenRole || staff.maRole || 'N/A'}</td> 
                <td>{staff.trangThai}</td>
                <td>
                  <button onClick={() => openEditModal(staff)} className={styles.editBtn}>Sửa</button>
                  <button onClick={() => handleDelete(staff.maNV)} className={styles.deleteBtn}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      
      {(showAddModal || showEditModal) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingStaff ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="hoNv">Họ</label>
                <input type="text" id="hoNv" name="hoNv" value={formState.hoNv} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="tenNv">Tên</label>
                <input type="text" id="tenNv" name="tenNv" value={formState.tenNv} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="userName">Username</label>
                <input type="text" id="userName" name="userName" value={formState.userName} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="chucVu">Chức vụ</label>
                <input type="text" id="chucVu" name="chucVu" value={formState.chucVu} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="soDienThoai">Số điện thoại</label>
                <input type="tel" id="soDienThoai" name="soDienThoai" value={formState.soDienThoai} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="ngayVaoLam">Ngày vào làm</label>
                <input type="date" id="ngayVaoLam" name="ngayVaoLam" value={formState.ngayVaoLam} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="luongCoBan">Lương cơ bản</label>
                <input type="number" id="luongCoBan" name="luongCoBan" value={formState.luongCoBan} onChange={handleInputChange} required min="0" className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="maRole">Vai trò</label>
                {/* <select id="maRole" name="maRole" value={formState.maRole} onChange={handleInputChange} required> */}
                {/* <option value="" disabled>Chọn vai trò</option> */}
                {/* {roles.map(role => ( */}
                {/* <option key={role.maRole} value={role.maRole}>{role.tenRole}</option> */}
                {/* ))} */}
                {/* </select> */}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="trangThai">Trạng thái</label>
                <select id="trangThai" name="trangThai" value={formState.trangThai} onChange={handleInputChange} required className={styles.input}>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              {error && <p className={styles.errorTextModal}>{error}</p>}

              <div className={styles.formActions}>
                <button type="submit" className={styles.addBtn} disabled={isLoading}>
                  {isLoading ? (editingStaff ? 'Đang cập nhật...' : 'Đang lưu...') : (editingStaff ? "Lưu thay đổi" : "Thêm mới")}
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingStaff(null); }} className={styles.cancelBtn}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(StaffPage, [ROLES.ADMIN]);