import '../../../styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hotel Management System - Home',
  description: 'Welcome to our hotel management system',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}