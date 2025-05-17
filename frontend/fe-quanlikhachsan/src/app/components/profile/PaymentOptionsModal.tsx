import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import { useTranslation } from 'react-i18next';

interface PaymentOptionsModalProps {
  onClose: () => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
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
        window.alert(data.message || t('profile.paymentUpdateFailed'));
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật phương thức thanh toán:', error);
      window.alert(t('profile.paymentUpdateError'));
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
    return <div>{t('profile.loading')}</div>;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>{t('profile.paymentOptions')}</h3>

        <div className={styles.formGroup}>
          <label htmlFor="payment-method">{t('profile.paymentMethod')}</label>
          <select id="payment-method" value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
            <option value="">{t('profile.chooseMethod')}</option>
            <option value="cash">{t('profile.cash')}</option>
            <option value="bank_transfer">{t('profile.bankTransfer')}</option>
          </select>
        </div>

        {selectedPaymentMethod === 'bank_transfer' && (
          <div className={styles.formGroup}>
            <label htmlFor="card-type">{t('profile.chooseCard')}</label>
            <select id="card-type" value={selectedCard} onChange={handleCardChange}>
              <option value="">{t('profile.chooseCard')}</option>
              <optgroup label={t('profile.internationalCards')}>
                {internationalCards.map((card) => (
                  <option key={card} value={card}>{card}</option>
                ))}
              </optgroup>
              <optgroup label={t('profile.vietnameseBanks')}>
                {vietnameseBanks.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </optgroup>
            </select>
          </div>
        )}

        <div className={styles.modalActions}>
          <button className={styles.modalSaveBtn} onClick={handleSave} disabled={isSaveDisabled}>
            {t('profile.save')}
          </button>
          <button className={styles.modalCancelBtn} onClick={onClose}>
            {t('profile.cancel')}
          </button>
        </div>
      </div>

      {showConfirmationModal && (
        <div className={`${styles.modalOverlay} ${styles.paymentConfirmationModal}`}>
          <div className={styles.modalBox}>
            <h3>{t('profile.confirmPayment')}</h3>
            <div className={styles.modalActions}>
              <button className={`${styles.modalConfirmBtn} ${styles.largeButton}`} onClick={handleConfirm}>
                {t('profile.confirm')}
              </button>
              <button
                className={`${styles.modalCancelBtn} ${styles.largeButton}`}
                onClick={() => setShowConfirmationModal(false)}
              >
                {t('profile.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className={`${styles.modalOverlay} ${styles.paymentCompleteModal}`}>
          <div className={styles.modalBox}>
            <h3>{t('profile.complete')}</h3>
            <button className={styles.modalOkBtn} onClick={handleCloseComplete}>
              {t('profile.exit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionsModal;