'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { FaUser } from 'react-icons/fa';

export default function AboutPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      role: 'Quản lý',
      image: '/images/manager.jpg',
      description: `Khách sạn chúng tôi được thành lập vào năm 2010, là một trong những khách sạn hàng đầu tại Việt Nam về chất lượng dịch vụ và sự sang trọng.

Với đội ngũ nhân viên chuyên nghiệp và tận tâm, chúng tôi luôn nỗ lực mang đến cho quý khách những trải nghiệm tuyệt vời nhất. Từ thiết kế nội thất tinh tế đến dịch vụ chu đáo, mọi chi tiết đều được chăm chút kỹ lưỡng.

Sứ mệnh của chúng tôi là tạo ra không gian nghỉ dưỡng hoàn hảo, nơi mỗi vị khách đều cảm thấy như đang ở nhà. Chúng tôi cam kết mang đến những dịch vụ tốt nhất và những kỷ niệm đáng nhớ cho mọi du khách.`
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
          <h1>Về chúng tôi</h1>
          <p>
            Khám phá không gian sang trọng và đẳng cấp của chúng tôi, nơi mỗi chi tiết đều được chăm chút tỉ mỉ để mang đến trải nghiệm hoàn hảo nhất cho quý khách.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        {teamMembers.map((member) => (
          <div key={member.id} className={styles.teamMember}>
            <div className={styles.memberImage}>
              <Image
                src={member.image}
                alt={member.name}
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.memberInfo}>
              <h2>{member.name} ({member.role})</h2>
              <div className={styles.memberDescription}>
                {member.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Clients Section */}
      <section className={styles.clientsSection}>
        <h2>Đối tác</h2>
        <div className={styles.clientsGrid}>
          {/* Add client logos here */}
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