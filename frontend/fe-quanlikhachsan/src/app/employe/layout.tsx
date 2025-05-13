'use client';
import NhanVienSidebarClient from "./NhanVienSidebarClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NhanVienSidebarClient>{children}</NhanVienSidebarClient>;
} 