import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';

interface PaymentOptionsModalProps {
  onClose: () => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ onClose }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const internationalCards = ['Visa', 'Mastercard', 'American Express'];
  const vietnameseBanks = ['Vietcombank', 'Techcombank', 'MB Bank'];

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const { data } = await response.json();
          const paymentMethod = data.paymentMethod;

          if (paymentMethod) {
            if (paymentMethod === 'cash') {
              setSelectedPaymentMethod('cash');
            } else {
              setSelectedPaymentMethod('bank_transfer');
              setSelectedCard(paymentMethod);
            }
          }
        } else {
          const errorData = await response.json();
          console.error('Error fetching payment method:', errorData.message);
        }
      } catch (error) {
        console.error('Error fetching payment method:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethod();
  }, []);

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPaymentMethod(value);
    setSelectedCard('');
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCard(e.target.value);
  };

  useEffect(() => {
    if (selectedPaymentMethod === 'cash') {
      setIsSaveDisabled(false);
    } else if (selectedPaymentMethod === 'bank_transfer' && selectedCard) {
      setIsSaveDisabled(false);
    } else {
      setIsSaveDisabled(true);
    }
  }, [selectedPaymentMethod, selectedCard]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePaymentMethod',
          paymentMethod: selectedPaymentMethod,
          selectedCard: selectedCard || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowConfirmationModal(true);
      } else {
        window.alert(data.message || 'Cập nhật phương thức thanh toán thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật phương thức thanh toán:', error);
      window.alert('Có lỗi xảy ra khi cập nhật phương thức thanh toán. Vui lòng thử lại sau.');
    }
  };

  const handleConfirm = () => {
    setShowConfirmationModal(false);
    setShowCompleteModal(true);
  };

  const handleCloseComplete = () => {
    setShowCompleteModal(false);
    onClose();
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>Chọn phương thức thanh toán</h3>

        <div className={styles.formGroup}>
          <label htmlFor="payment-method">Phương thức</label>
          <select id="payment-method" value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
            <option value="">-- Chọn phương thức --</option>
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
          </select>
        </div>

        {selectedPaymentMethod === 'bank_transfer' && (
          <div className={styles.formGroup}>
            <label htmlFor="card-type">Chọn loại thẻ</label>
            <select id="card-type" value={selectedCard} onChange={handleCardChange}>
              <option value="">-- Chọn thẻ --</option>
              <optgroup label="Thẻ quốc tế">
                {internationalCards.map((card) => (
                  <option key={card} value={card}>{card}</option>
                ))}
              </optgroup>
              <optgroup label="Ngân hàng Việt Nam">
                {vietnameseBanks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        <div className={styles.modalActions}>
          <button className={styles.modalSaveBtn} onClick={handleSave} disabled={isSaveDisabled}>
            Lưu
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>

      {showConfirmationModal && (
        <div className={`${styles.modalOverlay} ${styles.paymentConfirmationModal}`}>
          <div className={styles.modalBox}>
            <h3>Xác nhận phương thức thanh toán ?</h3>
            <div className={styles.modalActions}>
              <button className={`${styles.modalConfirmBtn} ${styles.largeButton}`} onClick={handleConfirm}>
                Xác nhận
              </button>
              <button
                className={`${styles.modalCancelBtn} ${styles.largeButton}`}
                onClick={() => setShowConfirmationModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className={`${styles.modalOverlay} ${styles.paymentCompleteModal}`}>
          <div className={styles.modalBox}>
            <h3>Hoàn tất!</h3>
            <button className={styles.modalOkBtn} onClick={handleCloseComplete}>
              Thoát
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionsModal;