'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLogo}>
          <Image src="/images/logo.png" alt="Logo" width={150} height={50} />
          <p>Trải nghiệm lưu trú đẳng cấp và sang trọng</p>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.linkGroup}>
            <h4>Liên kết</h4>
            <Link href="/users/home">Trang chủ</Link>
            <Link href="/users/about">Giới thiệu</Link>
            <Link href="/users/rooms">Phòng</Link>
            <Link href="/users/explore">Khám phá</Link>
            <Link href="/users/services">Dịch Vụ</Link>
            <Link href="/users/promotions">Khuyến Mãi</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Chính sách</h4>
            <Link href="/privacy">Bảo mật</Link>
            <Link href="/terms">Điều khoản</Link>
            <Link href="/faq">FAQ</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>Liên hệ</h4>
            <p>Email: info@hotel.com</p>
            <p>Phone: +84 123 456 789</p>
            <p>Address: 123 Street, City</p>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Luxury Hotel. All rights reserved.</p>
      </div>
    </footer>
  );
}