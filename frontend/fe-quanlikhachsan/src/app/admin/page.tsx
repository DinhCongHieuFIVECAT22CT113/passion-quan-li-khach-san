'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/rooms");
  }, [router]);
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Passion Admin</h1>
      <p>Đang chuyển hướng đến trang quản lý phòng...</p>
    </div>
  );
}