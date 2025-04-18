'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { LineChart, BarChart } from '@/components/Charts';

const staffMembers = [
  {
    id: 1,
    name: 'Công Hiếu',
    role: 'Admin',
    avatar: '/images/avatars/1.png'
  },
  {
    id: 2,
    name: 'Chí Tường',
    role: 'Kế Toán',
    avatar: '/images/avatars/2.png'
  },
  {
    id: 3,
    name: 'Giang Trường',
    role: 'Nhân Viên',
    avatar: '/images/avatars/3.png'
  }
];

const transactions = [
  {
    id: 1,
    type: 'Chi Phí',
    amount: -1850000,
    date: '28 January 2025',
    icon: '📋'
  },
  {
    id: 2,
    type: 'Dịch Vụ',
    amount: 2500000,
    date: '25 January 2025',
    icon: '📄'
  },
  {
    id: 3,
    type: 'Thu Nhập',
    amount: 5400000,
    date: '21 January 2025',
    icon: '💰'
  }
];

const bookingData = {
  labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
  data: [150, 300, 250, 700, 250, 500, 600]
};

const revenueData = {
  labels: ['Trả Phòng', 'Thuê Phòng', 'Dịch Vụ', 'Ăn Uống'],
  data: [300, 500, 400, 350]
};

export default function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nhân Viên</h1>
      </div>

      <div className={styles.staffSection}>
        <div className={styles.staffGrid}>
          {staffMembers.map((staff) => (
            <div key={staff.id} className={styles.staffCard}>
              <Image
                src={staff.avatar}
                alt={staff.name}
                width={80}
                height={80}
                className={styles.avatar}
              />
              <h3>{staff.name}</h3>
              <p>{staff.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <section className={styles.bookingHistory}>
          <h2>Lịch Sử Đặt Phòng</h2>
          <div className={styles.chart}>
            <LineChart data={bookingData} />
          </div>
        </section>

        <section className={styles.revenueChart}>
          <h2>Biểu Đồ Doanh Thu</h2>
          <div className={styles.chart}>
            <BarChart data={revenueData} />
          </div>
        </section>
      </div>

      <section className={styles.transactions}>
        <h2>Thu/Chi</h2>
        <div className={styles.transactionList}>
          {transactions.map((transaction) => (
            <div key={transaction.id} className={styles.transactionItem}>
              <div className={`${styles.transactionIcon} ${
                transaction.type === 'Chi Phí' ? styles.expense :
                transaction.type === 'Dịch Vụ' ? styles.service :
                styles.income
              }`}>
                {transaction.icon}
              </div>
              <div className={styles.transactionInfo}>
                <h3>{transaction.type}</h3>
                <p>{transaction.date}</p>
              </div>
              <div className={`${styles.transactionAmount} ${
                transaction.amount > 0 ? styles.positive : styles.negative
              }`}>
                {transaction.amount > 0 ? '+' : ''}{Math.abs(transaction.amount).toLocaleString('vi-VN')}₫
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 