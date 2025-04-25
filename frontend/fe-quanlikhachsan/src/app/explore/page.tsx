'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaPlay, FaUser } from 'react-icons/fa';
import styles from './styles.module.css';

export default function ExplorePage() {
  const features = [
    {
      id: 1,
      title: 'Phòng Sang Trọng',
      description: 'Trải nghiệm sự thoải mái tuyệt đối trong những căn phòng được thiết kế tỉ mỉ với tiện nghi cao cấp và tầm nhìn tuyệt đẹp.',
      image: '/images/luxurious-room.jpg'
    },
    {
      id: 2,
      title: 'Phòng Tập Hiện Đại',
      description: 'Duy trì sức khỏe trong kỳ nghỉ của bạn với các thiết bị tập luyện hiện đại và cơ sở vật chất chuyên nghiệp.',
      image: '/images/gym.jpg'
    },
    {
      id: 3,
      title: 'Nhà Hàng Cao Cấp',
      description: 'Thưởng thức ẩm thực tinh tế do các đầu bếp hàng đầu chế biến trong không gian sang trọng với dịch vụ hoàn hảo.',
      image: '/images/restaurant.jpg'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={120} height={40} />
          </Link>
        </div>
        <div className={styles.navCenter}>
          <Link href="/">Trang chủ</Link>
          <Link href="/about">Giới thiệu</Link>
          <Link href="/explore">Khám phá</Link>
          <Link href="/rooms">Phòng</Link>
        </div>
        <div className={styles.navRight}>
          <Link href="/profile" className={styles.profileIcon}><FaUser /></Link>
          <Link href="/booking" className={styles.bookNowBtn}>
            Đặt ngay
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Khám Phá Khách Sạn</h1>
          <p>Tham quan trực tuyến các tiện nghi đẳng cấp của chúng tôi</p>
          <button className={styles.playButton}>
            <FaPlay />
            <span>Xem Video</span>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Tiện Nghi</h2>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.featureCard}>
              <div className={styles.featureImage}>
                <Image 
                  src={feature.image} 
                  alt={feature.title} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <div className={styles.featureContent}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href="/rooms" className={styles.learnMore}>
                  Xem thêm
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.newsletter}>
            <h3>Đăng ký nhận tin & Ưu đãi</h3>
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
              <h4>Hỗ trợ</h4>
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