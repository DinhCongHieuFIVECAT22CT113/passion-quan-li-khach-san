'use client';
import React from 'react';
import '../../styles/cus_account.css';

// Export để sử dụng ngoài file
export interface Transaction {
  room: string; // phòng
  price: number; // giá
  time: string; // thời gian
  guests: number; // số khách
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="history-card">
      <h3>Lịch sử giao dịch</h3>
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
        <p style={{ fontStyle: 'italic', color: '#777', marginTop: '10px' }}>
          Chưa có lịch sử giao dịch.
        </p>
      )}
    </div>
  );
};

export default TransactionHistory;
