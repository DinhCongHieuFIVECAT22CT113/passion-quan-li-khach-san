"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navs = [
  { href: "/employe/bookings", label: "Đặt phòng" },
  { href: "/employe/rooms", label: "Phòng" },
  { href: "/employe/services", label: "Dịch vụ" },
  { href: "/employe/invoices", label: "Hóa đơn" },
];

export default function NhanVienSidebarClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const info = localStorage.getItem("staffInfo");
      if (info) setProfile(JSON.parse(info));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("staffInfo");
    router.push("/login");
  };

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f6f8fa'}}>
      <aside style={{width:240, background:'#232946', color:'#fff', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'32px 0 24px 0', boxShadow:'2px 0 16px #0002'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:10, fontWeight:700, fontSize:'1.3rem', margin:'0 0 32px 32px'}}>
            <span role="img" aria-label="staff">🧑‍💼</span> Nhân viên
          </div>
          <nav style={{display:'flex', flexDirection:'column', gap:6}}>
            {navs.map(nav => (
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