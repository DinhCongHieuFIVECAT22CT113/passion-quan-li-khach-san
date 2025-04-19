'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <Image src="/images/logo.png" alt="Logo" width={30} height={30} />
          <span className="ml-2 text-xl font-semibold">PASSION</span>
        </div>

        <div className="mb-4">
          <h2 className="text-gray-500 text-sm">Menu</h2>
        </div>

        <nav>
          <Link 
            href="/"
            className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
              pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl mr-3">🏠</span>
            <span>Trang chủ</span>
          </Link>

          <Link 
            href="/account"
            className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
              pathname === '/account' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl mr-3">👤</span>
            <span>Tài Khoản</span>
          </Link>

          <Link 
            href="/permissions"
            className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
              pathname === '/permissions' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl mr-3">🔑</span>
            <span>Phân Quyền</span>
          </Link>

          <Link 
            href="/language"
            className={`flex items-center p-3 mb-2 rounded-lg transition-colors ${
              pathname === '/language' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-xl mr-3">🌐</span>
            <span>Đa Ngôn Ngữ</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 