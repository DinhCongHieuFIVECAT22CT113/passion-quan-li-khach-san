import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Quản Lý Khách Sạn
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`${router.pathname === "/" ? "text-blue-600" : "text-gray-600"} hover:text-blue-500`}
            >
              Trang chủ
            </Link>
            <Link 
              href="/phong" 
              className={`${router.pathname.startsWith("/phong") ? "text-blue-600" : "text-gray-600"} hover:text-blue-500`}
            >
              Phòng
            </Link>
            <Link 
              href="/dich-vu" 
              className={`${router.pathname.startsWith("/dich-vu") ? "text-blue-600" : "text-gray-600"} hover:text-blue-500`}
            >
              Dịch vụ
            </Link>
            <Link 
              href="/gioi-thieu" 
              className={`${router.pathname === "/gioi-thieu" ? "text-blue-600" : "text-gray-600"} hover:text-blue-500`}
            >
              Giới thiệu
            </Link>
            <Link 
              href="/lien-he" 
              className={`${router.pathname === "/lien-he" ? "text-blue-600" : "text-gray-600"} hover:text-blue-500`}
            >
              Liên hệ
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/dang-nhap" 
              className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quản Lý Khách Sạn</h3>
              <p className="text-gray-300">
                Cung cấp dịch vụ lưu trú chất lượng và trải nghiệm đẳng cấp.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Trang chủ</Link></li>
                <li><Link href="/phong" className="text-gray-300 hover:text-white">Phòng</Link></li>
                <li><Link href="/dich-vu" className="text-gray-300 hover:text-white">Dịch vụ</Link></li>
                <li><Link href="/gioi-thieu" className="text-gray-300 hover:text-white">Giới thiệu</Link></li>
                <li><Link href="/lien-he" className="text-gray-300 hover:text-white">Liên hệ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
              <p className="text-gray-300">123 Đường Khách Sạn, Thành phố</p>
              <p className="text-gray-300">Điện thoại: (123) 456-7890</p>
              <p className="text-gray-300">Email: info@quanlykhachsan.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">© 2024 Quản Lý Khách Sạn. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;