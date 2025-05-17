'use client';
import React from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <div className={styles.historyCard}>
      {transactions.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>{t('profile.roomName')}</th>
              <th>{t('profile.price')}</th>
              <th>{t('profile.time')}</th>
              <th>{t('profile.guests')}</th>
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
        <p className={styles.noTransactions}>{t('profile.noTransactions')}</p>
      )}
    </div>
  );
};

export default TransactionHistory;