'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser } from 'react-icons/fa';

export default function RoomsPage() {
  const rooms = [
    {
      id: 1,
      name: 'Phòng Gần Hồ',
      price: '4.500.000đ',
      image: '/images/pool-room.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    },
    {
      id: 2,
      name: 'Căn Hộ Áp Mái',
      price: '10.500.000đ',
      image: '/images/penthouse.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    },
    {
      id: 3,
      name: 'Phòng Quý Tộc',
      price: '5.500.000đ',
      image: '/images/noble-room.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    },
    {
      id: 4,
      name: 'Căn Hộ Xanh',
      price: '8.500.000đ',
      image: '/images/green-apartment.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    },
    {
      id: 5,
      name: 'Phòng Đơn Giản',
      price: '2.500.000đ',
      image: '/images/simp-room.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    },
    {
      id: 6,
      name: 'Phòng Hoàng Gia',
      price: '7.500.000đ',
      image: '/images/royal-room.jpg',
      availability: 'Có',
      amenities: ['TV', 'WiFi', 'Điều hòa']
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
        </Link>
        <div className={styles.navLinks}>
        <Link href="/users/home">Trang chủ</Link>
          <Link href="/users/about">Giới thiệu</Link>
          <Link href="/users/explore">Khám phá</Link>
          <Link href="/users/rooms">Phòng</Link>
        </div>
        <div className={styles.navRight}>
          <Link href="/users/profile" className={styles.profileIcon}><FaUser /></Link>
          <Link href="/users/booking" className={styles.bookNowBtn}>
            Đặt ngay
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Phòng và Căn hộ</h1>
          <p>Các phòng ngủ sang trọng và tinh tế trong bộ sưu tập này thể hiện thiết kế nội thất & ý tưởng trang trí độc đáo. Xem hình ảnh và tìm thiết kế phòng ngủ sang trọng hoàn hảo của bạn.</p>
          <div className={styles.scrollIndicator}>
            <span>Cuộn xuống</span>
            <div className={styles.scrollArrow}></div>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className={styles.roomsGrid}>
        {rooms.map((room) => (
          <div key={room.id} className={styles.roomCard}>
            <div className={styles.roomImage}>
              <Image src={room.image} alt={room.name} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.roomInfo}>
              <div className={styles.roomHeader}>
                <h3>{room.name}</h3>
                <span className={styles.availability}>Trạng thái: {room.availability}</span>
              </div>
              <div className={styles.price}>{room.price}</div>
              <div className={styles.amenities}>
                {room.amenities.map((amenity, index) => (
                  <span key={index} className={styles.amenity}>
                    <Image 
                      src={`/images/${amenity.toLowerCase()}-icon.png`} 
                      alt={amenity} 
                      width={20} 
                      height={20} 
                    />
                    {amenity}
                  </span>
                ))}
              </div>
              <Link href="/users/booking" className={styles.bookNowLink}>
                Đặt ngay
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.newsletter}>
            <h3>Đăng ký nhận tin & Khuyến mãi</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder="Nhập email của bạn..." />
              <button>Đăng ký</button>
            </div>
          </div>
          <div className={styles.footerLogo}>
            <Image src="/images/hotel-logo.png" alt="Logo Khách sạn" width={150} height={60} />
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h4>Về chúng tôi</h4>
              <Link href="/location">Vị trí</Link>
            </div>
            <div>
              <h4>Trợ giúp</h4>
              <Link href="/faq">Câu hỏi thường gặp</Link>
              <Link href="/terms">Điều khoản sử dụng</Link>
              <Link href="/privacy">Chính sách bảo mật</Link>
            </div>
            <div>
              <h4>Tải ứng dụng</h4>
              <Link href="/services">Dịch vụ & Tiện ích</Link>
              <Link href="/careers">Tuyển dụng</Link>
              <Link href="/book">Hướng dẫn đặt phòng</Link>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          © Bản quyền thuộc về Booking Hotels. Đã đăng ký bản quyền.
        </div>
      </footer>
    </div>
  );
} 