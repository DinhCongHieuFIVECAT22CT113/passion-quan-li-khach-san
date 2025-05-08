import { redirect } from "next/navigation";
import Image from 'next/image';
import Header from '../app/components/layout/Header';
import BookingForm from '../app/components/forms/BookingForm';
import styles from './page.module.css';

export default function HomePage() {
  // Redirect to welcome page if not authenticated
  redirect('/welcome');

  return (
    <main>
      <Header />
      
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Khách sạn Passion</h1>
          <p>Trải nghiệm đẳng cấp - Dịch vụ hoàn hảo</p>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/images/hero.jpg"
            alt="Khách sạn Passion"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </section>

      <section className={styles.booking}>
        <div className={styles.container}>
          <h2>Đặt phòng ngay</h2>
          <p>Tìm phòng phù hợp cho kỳ nghỉ của bạn</p>
          <BookingForm />
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Image
                  src="/icons/location.svg"
                  alt="Vị trí"
                  width={32}
                  height={32}
                />
              </div>
              <h3>Vị trí đắc địa</h3>
              <p>Nằm tại trung tâm thành phố, thuận tiện di chuyển</p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Image
                  src="/icons/room.svg"
                  alt="Phòng"
                  width={32}
                  height={32}
                />
              </div>
              <h3>Phòng sang trọng</h3>
              <p>Thiết kế hiện đại, đầy đủ tiện nghi cao cấp</p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Image
                  src="/icons/service.svg"
                  alt="Dịch vụ"
                  width={32}
                  height={32}
                />
              </div>
              <h3>Dịch vụ 5 sao</h3>
              <p>Đội ngũ nhân viên chuyên nghiệp, tận tâm</p>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Image
                  src="/icons/food.svg"
                  alt="Ẩm thực"
                  width={32}
                  height={32}
                />
              </div>
              <h3>Ẩm thực đa dạng</h3>
              <p>Nhà hàng với các món ăn Á - Âu đặc sắc</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}