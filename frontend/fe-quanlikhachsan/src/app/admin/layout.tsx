'use client';

import React from 'react';
import Sidebar from './components/Sidebar';
import { withAuth, ROLES } from '@/lib/auth';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adminContainer">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

export default withAuth(AdminLayout, [ROLES.ADMIN, ROLES.MANAGER]);
