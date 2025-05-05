"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NhanVienRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/employe/bookings");
  }, [router]);
  return (
    <div style={{ padding: "32px 24px" }}>
      <p>Đang chuyển hướng đến Đặt phòng...</p>
    </div>
  );
}