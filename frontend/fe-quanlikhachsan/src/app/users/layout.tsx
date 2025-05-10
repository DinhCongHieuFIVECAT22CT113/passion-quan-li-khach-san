import React from 'react';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="users-layout">
      <header className="bg-blue-600 text-white p-4">Khu vực người dùng</header>
      <main className="p-4">{children}</main>
    </div>
  );
}