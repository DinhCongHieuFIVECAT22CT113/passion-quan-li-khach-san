'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar, FaHotel, FaUtensils, FaUsers, FaSwimmingPool, FaRing, FaUser } from 'react-icons/fa';
import styles from './styles.module.css';

export default function Home() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const router = useRouter();

  const services = [
    {
      title: 'Phòng Sang Trọng',
      description: 'Trải nghiệm sự thoải mái tuyệt đối trong những căn phòng được thiết kế tỉ mỉ',
      icon: <FaHotel />,
      image: '/images/room.jpg',
      link: '/rooms'
    },
    {
      title: 'Ẩm Thực Cao Cấp',
      description: 'Thưởng thức ẩm thực tinh tế trong không gian sang trọng',
      icon: <FaUtensils />,
      image: '/images/dining.jpg',
      link: '/dining'
    },
    {
      title: 'Phòng Hội Nghị',
      description: 'Không gian chuyên nghiệp cho nhu cầu kinh doanh của bạn',
      icon: <FaUsers />,
      image: '/images/conference.jpg',
      link: '/conference'
    },
    {
      title: 'Hồ Bơi',
      description: 'Thư giãn và tận hưởng tại hồ bơi trong xanh của chúng tôi',
      icon: <FaSwimmingPool />,
      image: '/images/pool.jpg',
      link: '/pool'
    },
    {
      title: 'Địa Điểm Cưới',
      description: 'Tạo nên những khoảnh khắc khó quên trong không gian lộng lẫy',
      icon: <FaRing />,
      image: '/images/wedding.jpg',
      link: '/wedding'
    }
  ];

  const offers = [
    {
      type: 'Gói Phòng',
      title: 'Kỳ Nghỉ Cuối Tuần',
      description: 'Lựa chọn hoàn hảo cho các cặp đôi',
      rating: 5,
      price: 4500000,
      image: '/images/weekend.jpg'
    },
    {
      type: 'Ưu Đãi Đặc Biệt',
      title: 'Gói Doanh Nhân',
      description: 'Lý tưởng cho khách công tác',
      rating: 4.5,
      price: 6900000,
      image: '/images/business.jpg'
    },
    {
      type: 'Ưu Đãi Kỳ Nghỉ',
      title: 'Kỳ Nghỉ Gia Đình',
      description: 'Tạo kỷ niệm cùng người thân yêu',
      rating: 4.8,
      price: 9200000,
      image: '/images/family.jpg'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <Link href="/">
            <Image src="/images/logo.png" alt="Hotel Logo" width={120} height={40} />
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
          <h1>Trải Nghiệm Đẳng Cấp Chưa Từng Có</h1>
          <p>Khám phá sự thoải mái, sang trọng và những khoảnh khắc khó quên</p>
          <Link href="/rooms" className={styles.heroButton}>
            Xem Phòng
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/location.jpg" alt="Vị trí" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>Vị trí đắc địa</h3>
              <p>Nằm tại trung tâm thành phố, thuận tiện di chuyển</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/room.jpg" alt="Phòng" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>Phòng sang trọng</h3>
              <p>Thiết kế hiện đại, đầy đủ tiện nghi cao cấp</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/service.jpg" alt="Dịch vụ" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>Dịch vụ 5 sao</h3>
              <p>Đội ngũ nhân viên chuyên nghiệp, tận tâm</p>
            </div>
          </div>

          <div className={styles.serviceCard}>
            <div className={styles.serviceImage}>
              <Image src="/images/dining.jpg" alt="Ẩm thực" fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={styles.serviceContent}>
              <h3>Ẩm thực đa dạng</h3>
              <p>Nhà hàng với các món ăn Á - Âu đặc sắc</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className={styles.bookingForm}>
        <div className={styles.formContent}>
          <div className={styles.formGroup}>
            <label>Ngày nhận phòng</label>
            <input type="date" placeholder="Chọn ngày nhận phòng" />
          </div>

          <div className={styles.formGroup}>
            <label>Ngày trả phòng</label>
            <input type="date" placeholder="Chọn ngày trả phòng" />
          </div>

          <div className={styles.guestGroup}>
            <div className={styles.guestCounter}>
              <label>Người lớn</label>
              <div className={styles.counter}>
                <button onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                <span>{adults}</span>
                <button onClick={() => setAdults(adults + 1)}>+</button>
              </div>
            </div>

            <div className={styles.guestCounter}>
              <label>Trẻ em</label>
              <div className={styles.counter}>
                <button onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                <span>{children}</span>
                <button onClick={() => setChildren(children + 1)}>+</button>
              </div>
            </div>
          </div>

          <button className={styles.searchButton} onClick={() => router.push('/rooms')}>
            Tìm phòng trống
          </button>
        </div>
      </section>

      {/* Special Offers */}
      <section className={styles.specialOffers}>
        <div className={styles.sectionHeader}>
          <h2>Ưu Đãi Đặc Biệt</h2>
          <p>Khám phá những ưu đãi đặc biệt cho kỳ nghỉ đáng nhớ</p>
          <Link href="/offers" className={styles.viewAll}>Xem Tất Cả Ưu Đãi</Link>
        </div>
        <div className={styles.offerGrid}>
          {offers.map((offer, index) => (
            <div key={index} className={styles.offerCard}>
              <div className={styles.offerImage}>
                <Image src={offer.image} alt={offer.title} fill style={{ objectFit: 'cover' }} />
                <div className={styles.offerType}>{offer.type}</div>
              </div>
              <div className={styles.offerContent}>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <div className={styles.offerRating}>
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < Math.floor(offer.rating) ? styles.starActive : styles.star} />
                  ))}
                </div>
                <div className={styles.offerPrice}>
                  <span className={styles.amount}>{offer.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className={styles.perNight}>/ đêm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <h3>Đăng ký nhận tin & Ưu đãi</h3>
            <div className={styles.subscribeForm}>
              <input type="email" placeholder="Nhập email của bạn..." />
              <button className={styles.subscribeButton}>Đăng ký</button>
            </div>
          </div>

          <div className={styles.footerCenter}>
            <Image src="/images/logo.png" alt="Logo Khách sạn" width={150} height={60} />
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>Về chúng tôi</h4>
                <Link href="/location">Vị trí</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>Hỗ trợ</h4>
                <Link href="/faq">Câu hỏi thường gặp</Link>
                <Link href="/terms">Điều khoản sử dụng</Link>
                <Link href="/privacy">Chính sách bảo mật</Link>
              </div>

              <div className={styles.linkGroup}>
                <h4>Tải ứng dụng</h4>
                <Link href="/services">Dịch vụ & Tiện ích</Link>
                <Link href="/careers">Tuyển dụng</Link>
                <Link href="/book">Hướng dẫn đặt phòng</Link>
              </div>
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
