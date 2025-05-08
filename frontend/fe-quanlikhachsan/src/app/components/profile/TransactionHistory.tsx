'use client';
import React from 'react';
import styles from './profile.module.css';

export interface Transaction {
  room: string;
  price: number;
  time: string;
  guests: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className={styles.historyCard}>
      {transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Tên phòng</th>
              <th>Giá</th>
              <th>Thời gian</th>
              <th>Số người</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.room}</td>
                <td>{transaction.price.toLocaleString()} VNĐ</td>
                <td>{transaction.time}</td>
                <td>{transaction.guests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.noTransactions}>Chưa có lịch sử giao dịch.</p>
      )}
    </div>
  );
};

export default TransactionHistory;