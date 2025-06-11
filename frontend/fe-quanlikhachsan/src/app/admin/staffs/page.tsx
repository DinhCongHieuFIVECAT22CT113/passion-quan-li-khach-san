"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
// import Link from 'next/link'; // Xóa import Link không sử dụng
import styles from './Staffs.module.css';
import { API_BASE_URL } from '@/lib/config';
import { getAuthHeaders, getFormDataHeaders, handleResponse } from '@/lib/api';
// import Image from 'next/image'; // Xóa import Image không sử dụng
import { withAuth, ROLES, useAuth } from '@/lib/auth'; // Import HOC và ROLES
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Pagination from "@/components/admin/Pagination";

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
  password?: string;
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

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

    const fetchStaffs = async () => {
      setIsLoading(true);
      setError(null);
      try {
      const headers = await getAuthHeaders('GET');
      const response = await fetch(`${API_BASE_URL}/NhanVien`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      const data = await handleResponse(response);
      console.log('Raw staff data from API:', data);

      // Normalize data và lấy tên Role cho từng nhân viên
      const staffsWithRoles = await Promise.all(data.map(async (apiStaff: any) => {
        // Normalize field names (handle both PascalCase and camelCase)
        const normalizedStaff: Staff = {
          maNV: apiStaff.MaNv || apiStaff.maNV || apiStaff.MaNV || apiStaff.maNv || '',
          hoNv: apiStaff.HoNv || apiStaff.hoNv || '',
          tenNv: apiStaff.TenNv || apiStaff.tenNv || '',
          userName: apiStaff.UserName || apiStaff.userName || '',
          chucVu: apiStaff.ChucVu || apiStaff.chucVu || '',
          soDienThoai: apiStaff.Sdt || apiStaff.sdt || apiStaff.soDienThoai || apiStaff.SoDienThoai || '',
          email: apiStaff.Email || apiStaff.email || '',
          ngayVaoLam: apiStaff.NgayVaoLam || apiStaff.ngayVaoLam || '',
          luongCoBan: apiStaff.LuongCoBan || apiStaff.luongCoBan || 0,
          maRole: apiStaff.MaRole || apiStaff.maRole || '',
          trangThai: apiStaff.TrangThai || apiStaff.trangThai || 'Hoạt động',
        };

        // Lấy tên Role nếu có maRole
        if (normalizedStaff.maRole) {
          try {
            const roleHeaders = await getAuthHeaders('GET');
            const roleResponse = await fetch(`${API_BASE_URL}/Role/${normalizedStaff.maRole}`, {
              method: 'GET',
              headers: roleHeaders,
              credentials: 'include'
            });
            const roleData = await handleResponse(roleResponse);
            return { ...normalizedStaff, tenRole: roleData.tenRole || roleData.TenRole || 'N/A' };
          } catch (roleError) {
            console.error(`Error fetching role ${normalizedStaff.maRole}:`, roleError);
            return { ...normalizedStaff, tenRole: 'N/A' };
          }
        }
        return { ...normalizedStaff, tenRole: 'N/A' };
      }));

      console.log('Processed staffs with roles:', staffsWithRoles);
      setStaffs(staffsWithRoles);

    } catch (err: any) {
      setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

  const fetchAllRoles = async () => {
    try {
      const headers = await getAuthHeaders('GET');
      const response = await fetch(`${API_BASE_URL}/Role`, {
        method: 'GET',
        headers: headers,
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

    // Validation
    if (!editingStaff) {
      if (!formState.password || formState.password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setIsLoading(false);
        return;
      }
    }

    if (!formState.email.includes('@')) {
      setError('Email không hợp lệ');
      setIsLoading(false);
      return;
    }

    if (formState.luongCoBan <= 0) {
      setError('Lương cơ bản phải lớn hơn 0');
      setIsLoading(false);
      return;
    }

    try {
      const url = editingStaff
        ? `${API_BASE_URL}/NhanVien/${editingStaff.maNV}`
        : `${API_BASE_URL}/NhanVien`;
      const method = editingStaff ? 'PUT' : 'POST';

      // Tạo FormData để gửi multipart/form-data như backend expect
      const formData = new FormData();

      // Map frontend field names to backend field names
      if (editingStaff) {
        // For update, only send fields that can be updated
        formData.append('ChucVu', formState.chucVu);
        formData.append('Email', formState.email);
        formData.append('Sdt', formState.soDienThoai);
        formData.append('LuongCoBan', formState.luongCoBan.toString());
        formData.append('MaRole', formState.maRole);
      } else {
        // For create, send all required fields
        formData.append('UserName', formState.userName);
        formData.append('Password', formState.password || 'defaultPassword123');
        formData.append('HoNv', formState.hoNv);
        formData.append('TenNv', formState.tenNv);
        formData.append('ChucVu', formState.chucVu);
        formData.append('Email', formState.email);
        formData.append('Sdt', formState.soDienThoai);
        formData.append('LuongCoBan', formState.luongCoBan.toString());
        formData.append('MaRole', formState.maRole);
        formData.append('NgayVaoLam', formState.ngayVaoLam);
      }

      console.log('Sending form data:', Object.fromEntries(formData.entries()));

      const headers = await getFormDataHeaders(); // Use form data headers instead
      const response = await fetch(url, {
        method: method,
        headers: headers,
        credentials: 'include',
        body: formData,
      });

      await handleResponse(response);
      fetchStaffs();
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingStaff(null);
      alert(editingStaff ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!');
    } catch (err: any) {
      let errorMessage = err.message;

      // Handle specific error cases
      if (err.message.includes('400')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (err.message.includes('409')) {
        errorMessage = 'Username hoặc email đã tồn tại. Vui lòng chọn username/email khác.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Bạn không có quyền thực hiện hành động này.';
      }

      setError(errorMessage);
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
      password: "",
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
      setError(null);
      try {
        const headers = await getAuthHeaders('DELETE');
        const response = await fetch(`${API_BASE_URL}/NhanVien/${maNV}`, {
          method: 'DELETE',
          headers: headers,
          credentials: 'include'
        });

        if (!response.ok) {
          // Handle specific error cases
          if (response.status === 500) {
            throw new Error('Không thể xóa nhân viên này. Nhân viên có thể đang được tham chiếu trong hệ thống (báo cáo, hóa đơn, v.v.)');
          } else if (response.status === 400) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Không thể xóa nhân viên này. Nhân viên đang được tham chiếu trong hệ thống.');
          } else if (response.status === 404) {
            throw new Error('Không tìm thấy nhân viên với mã đã cho');
          } else if (response.status === 403) {
            throw new Error('Bạn không có quyền xóa nhân viên này');
          } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Lỗi khi xóa nhân viên: ${response.status}`);
          }
        }

        await handleResponse(response);
        fetchStaffs();
        alert('Xóa nhân viên thành công!');
      } catch (err: any) {
        setError(err.message);
        console.error('Delete error:', err);
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

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaffs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);

  // Hàm chuyển trang
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Hàm thay đổi số lượng hiển thị
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi số lượng hiển thị
  };

  if (authLoading || isLoading) {
    return <p>Đang tải dữ liệu trang nhân viên...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Nhân Viên</h1>

      {error && <p className={styles.errorText}>Lỗi: {error}</p>}

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {user && user.permissions.canManageStaff && (
          <button onClick={openAddModal} className={styles.addBtn}>
            <FaPlus className={styles.btnIcon} /> Thêm Nhân Viên
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredStaffs.length}
            onPageChange={paginate}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPageOptions={[5, 10, 20, 50]}
          />

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
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className={styles.emptyState}>Không có dữ liệu nhân viên</td>
                </tr>
              ) : (
                currentItems.map((staff, index) => (
                  <tr key={staff.maNV || `staff-${index}`}>
                    <td>{staff.maNV || 'N/A'}</td>
                    <td className={styles.nameCell}>{`${staff.hoNv || ''} ${staff.tenNv || ''}`.trim() || 'N/A'}</td>
                    <td>{staff.userName || 'N/A'}</td>
                    <td>{staff.chucVu || 'N/A'}</td>
                    <td>{staff.soDienThoai || 'N/A'}</td>
                    <td>{staff.email || 'N/A'}</td>
                    <td>{staff.ngayVaoLam ? new Date(staff.ngayVaoLam).toLocaleDateString() : 'N/A'}</td>
                    <td className={styles.salaryCell}>{staff.luongCoBan?.toLocaleString() || '0'} VNĐ</td>
                    <td>
                      <span className={styles.roleBadge}>{staff.tenRole || staff.maRole || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${staff.trangThai === 'Hoạt động' ? styles.statusActive : styles.statusInactive}`}>
                        {staff.trangThai || 'N/A'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button onClick={() => openEditModal(staff)} className={styles.editBtn} title="Sửa">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(staff.maNV)} className={styles.deleteBtn} title="Xóa">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingStaff ? "Sửa Thông Tin Nhân Viên" : "Thêm Nhân Viên Mới"}</h2>
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
              {!editingStaff && (
                <div className={styles.formGroup}>
                  <label htmlFor="password">Mật khẩu</label>
                  <input type="password" id="password" name="password" value={formState.password || ''} onChange={handleInputChange} required={!editingStaff} className={styles.input} />
                </div>
              )}
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
                <input type="number" id="luongCoBan" name="luongCoBan" value={formState.luongCoBan} onChange={handleInputChange} required className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="maRole">Vai trò</label>
                <select id="maRole" name="maRole" value={formState.maRole} onChange={handleInputChange} required className={styles.select}>
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.maRole} value={role.maRole}>{role.tenRole}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="trangThai">Trạng thái</label>
                <select id="trangThai" name="trangThai" value={formState.trangThai} onChange={handleInputChange} required className={styles.select}>
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
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
