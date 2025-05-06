'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser } from 'react-icons/fa';
import styles from './styles.module.css';

export default function BookingPage() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: ''
  });

  const roomImages = [
    '/images/room1.jpg',
    '/images/room2.jpg',
    '/images/room3.jpg',
    '/images/room4.jpg',
  ];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Tại đây bạn có thể thêm logic gửi data lên server
    console.log('Form submitted:', formData);
    setShowNotification(true);
    
    // Reset form
    setFormData({
      fullname: '',
      email: '',
      phone: '',
      message: ''
    });

    // Ẩn notification sau 5 giây
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link href="/">
          <Image src="/images/logo.png" alt="Logo Khách sạn" width={120} height={40} />
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

      {showNotification && (
        <div className={styles.notification}>
          <p>Cảm ơn quý khách đã đặt phòng! Thông tin chi tiết về phòng sẽ được gửi đến email của quý khách.</p>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Đặt Phòng</h1>
          <p>Các phòng ngủ sang trọng và tinh tế trong bộ sưu tập này thể hiện thiết kế nội thất & ý tưởng trang trí độc đáo. Xem hình ảnh và tìm thiết kế phòng ngủ sang trọng hoàn hảo của bạn.</p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className={styles.bookingSection}>
        <div className={styles.formContainer}>
          <div className={styles.imageGallery}>
            <div className={styles.mainImage}>
              <Image 
                src={roomImages[activeImageIndex]} 
                alt="Room View"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.thumbnails}>
              {roomImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`${styles.thumbnail} ${index === activeImageIndex ? styles.active : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <Image 
                    src={image} 
                    alt={`Room ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <form className={styles.bookingForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Họ và tên</label>
              <input 
                type="text" 
                name="fullname"
                placeholder="VD: Nguyễn Văn A" 
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                placeholder="nguyenvana@gmail.com" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input 
                type="tel" 
                name="phone"
                placeholder="09xxxxxxxx" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Lời nhắn</label>
              <textarea 
                name="message"
                placeholder="Nhập lời nhắn của bạn" 
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <button type="submit" className={styles.bookNowBtn}>
              Đặt ngay
            </button>
          </form>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6763231438226!2d105.84125361476292!3d21.007025386010126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac428c3336e5%3A0x384d11d7f7f3b4a8!2zQ29wYWNhYmFuYSBNYXJrZXQgLSBUaOG7jyBMw6A!5e0!3m2!1svi!2s!4v1647901645957!5m2!1svi!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        ></iframe>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.newsletter}>
            <h3>Đăng ký nhận tin & Ưu đãi</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder="Nhập email của bạn" />
              <button type="submit">Đăng ký</button>
            </div>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <Link href="/about">Về chúng tôi</Link>
              <Link href="/contact">Liên hệ</Link>
              <Link href="/location">Vị trí</Link>
            </div>
            <div className={styles.linkColumn}>
              <Link href="/faq">Câu hỏi thường gặp</Link>
              <Link href="/terms">Điều khoản sử dụng</Link>
              <Link href="/privacy">Chính sách bảo mật</Link>
            </div>
            <div className={styles.linkColumn}>
              <Link href="/services">Dịch vụ & Tiện ích</Link>
              <Link href="/careers">Tuyển dụng</Link>
              <Link href="/how-to-book">Hướng dẫn đặt phòng</Link>
            </div>
          </div>
          <div className={styles.logo}>
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={150} height={50} />
          </div>
        </div>
      </footer>
    </div>
  );
} 