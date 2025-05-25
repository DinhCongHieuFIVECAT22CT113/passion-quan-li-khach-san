"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, ROLES, type Role } from '../../lib/auth';
import { useLogout } from '../../lib/hooks';

// Danh sách tất cả các mục menu có thể có
const allNavItems = [
  { href: "/employe/dashboard", label: "Tổng quan", roles: ["R01"] }, // Chỉ quản lý
  { href: "/employe/bookings", label: "Đặt phòng", roles: ["R01", "R02"] }, // Quản lý và nhân viên
  { href: "/employe/rooms", label: "Phòng", roles: ["R01", "R02"] }, // Quản lý và nhân viên
  { href: "/employe/services", label: "Dịch vụ", roles: ["R01", "R02"] }, // Quản lý và nhân viên 
  { href: "/employe/invoices", label: "Hóa đơn", roles: ["R01", "R03"] }, // Quản lý và kế toán
  { href: "/employe/reports", label: "Báo cáo", roles: ["R01", "R03"] }, // Quản lý và kế toán
  { href: "/employe/staff", label: "Nhân viên", roles: ["R01"] }, // Chỉ quản lý
];

export default function NhanVienSidebarClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);
  const [navItems, setNavItems] = useState<typeof allNavItems>([]);
  const handleLogout = useLogout();

  useEffect(() => {
    if (authLoading) return;
      
    if (user && user.role) {
      const currentRole = user.role;
        
        const filteredNavs = allNavItems.filter(item => 
        item.roles.includes(currentRole) || 
        ((currentRole as string) === 'CRW' && item.roles.includes(ROLES.STAFF))
        );
        setNavItems(filteredNavs);
        
        setProfile({
        name: user.hoTen || user.maNguoiDung || 'Nhân viên',
        role: getRoleName(currentRole)
        });
    } else {
      setNavItems([]);
      setProfile(null);
    }
  }, [user, authLoading]);

  // Hàm lấy tên vai trò dựa vào mã vai trò
  const getRoleName = (roleCode: Role | "CRW") => {
    if (roleCode === 'CRW') {
      return 'Nhân viên (Legacy)';
    }
    // Tại điểm này, roleCode chắc chắn là kiểu Role
    switch(roleCode) {
      case ROLES.ADMIN: return 'Admin';
      case ROLES.MANAGER: return 'Quản lý';
      case ROLES.STAFF: return 'Nhân viên';
      case ROLES.ACCOUNTANT: return 'Kế toán';
      case ROLES.CUSTOMER: return 'Khách hàng';
      default: 
        // Trường hợp này không nên xảy ra nếu roleCode là một trong các giá trị của ROLES
        // và đã được kiểm tra bởi if (roleCode === 'CRW')
        return `Role (${roleCode}) không xác định`; 
    }
  };

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f6f8fa'}}>
      <aside style={{width:240, background:'#232946', color:'#fff', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'32px 0 24px 0', boxShadow:'2px 0 16px #0002'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:'1.3rem', margin:'0 0 32px 32px'}}>
            <span role="img" aria-label="staff">🧑‍💼</span> 
            {profile?.role || 'Nhân viên'}
          </div>
          <nav style={{display:'flex', flexDirection:'column', gap:6}}>
            {navItems.map(nav => (
              <Link
                key={nav.href}
                href={nav.href}
                style={{
                  color: pathname === nav.href ? '#232946' : '#e0e0e0',
                  background: pathname === nav.href ? 'linear-gradient(90deg,#eebbc3 60%,#b8c1ec 100%)' : 'none',
                  fontWeight: pathname === nav.href ? 700 : 500,
                  borderRadius: 8,
                  padding: '12px 24px',
                  margin: '0 12px',
                  textDecoration: 'none',
                  transition: 'background 0.18s,color 0.18s',
                  marginBottom: 2,
                  display: 'block'
                }}
              >
                {nav.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{margin:'0 18px 0 18px', borderTop:'1px solid #4a5568', paddingTop:18, display:'flex', flexDirection:'column', gap:8}}>
          {profile && (
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{background:'#eebbc3', color:'#232946', borderRadius:'50%', width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem'}}>
                {profile.name.split(' ').slice(-1)[0][0]}
              </div>
              <div>
                <div style={{fontWeight:600}}>{profile.name}</div>
                <div style={{fontSize:'0.97em', color:'#b8c1ec'}}>{profile.role}</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{marginTop:8, background:'#e5e7eb', color:'#232946', border:'none', borderRadius:6, padding:'7px 16px', fontWeight:500, fontSize:'0.97em', cursor:'pointer', transition:'background 0.2s'}}>Đăng xuất</button>
        </div>
      </aside>
      <main style={{flex:1, minHeight:'100vh'}}>{children}</main>
    </div>
  );
}