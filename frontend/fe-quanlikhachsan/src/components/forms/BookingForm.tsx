'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DatePicker } from '../ui/DatePicker';
import { api } from '@/lib/api';
import styles from './BookingForm.module.css';
import { formatCurrency } from '@/lib/utils';

interface BookingFormProps {
  minDate?: Date;
  maxDate?: Date;
}

export default function BookingForm({ minDate = new Date(), maxDate }: BookingFormProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkIn || !checkOut) {
      setError('Vui lòng chọn ngày check-in và check-out');
      return;
    }

    if (checkIn >= checkOut) {
      setError('Ngày check-out phải sau ngày check-in');
      return;
    }

    if (adults + children > 4) {
      setError('Tổng số khách không được vượt quá 4 người');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.rooms.search({
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        guests: adults + children
      });

      if (response.error) {
        throw new Error(response.error);
      }

      router.push(`/rooms/search?checkIn=${checkIn.toISOString()}&checkOut=${checkOut.toISOString()}&adults=${adults}&children=${children}`);
    } catch (err) {
      setError('Có lỗi xảy ra khi tìm phòng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.dates}>
        <div className={styles.dateField}>
          <label htmlFor="checkIn">Ngày nhận phòng</label>
          <DatePicker
            id="checkIn"
            selected={checkIn}
            onChange={(date: Date | null) => setCheckIn(date)}
            minDate={minDate}
            maxDate={maxDate}
            placeholderText="Chọn ngày nhận phòng"
            dateFormat="dd/MM/yyyy"
            required
          />
        </div>

        <div className={styles.dateField}>
          <label htmlFor="checkOut">Ngày trả phòng</label>
          <DatePicker
            id="checkOut"
            selected={checkOut}
            onChange={(date: Date | null) => setCheckOut(date)}
            minDate={checkIn || minDate}
            maxDate={maxDate}
            placeholderText="Chọn ngày trả phòng"
            dateFormat="dd/MM/yyyy"
            required
          />
        </div>
      </div>

      <div className={styles.guests}>
        <div className={styles.guestField}>
          <label htmlFor="adults">Người lớn</label>
          <div className={styles.counter}>
            <button
              type="button"
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className={styles.counterBtn}
            >
              -
            </button>
            <span>{adults}</span>
            <button
              type="button"
              onClick={() => setAdults(Math.min(4, adults + 1))}
              className={styles.counterBtn}
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.guestField}>
          <label htmlFor="children">Trẻ em</label>
          <div className={styles.counter}>
            <button
              type="button"
              onClick={() => setChildren(Math.max(0, children - 1))}
              className={styles.counterBtn}
            >
              -
            </button>
            <span>{children}</span>
            <button
              type="button"
              onClick={() => setChildren(Math.min(3, children + 1))}
              className={styles.counterBtn}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Đang tìm phòng...' : 'Tìm phòng trống'}
      </button>
    </form>
  );
} 