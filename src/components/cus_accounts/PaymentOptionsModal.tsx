import React, { useState, useEffect } from 'react';
import '../../styles/cus_account.css';

interface PaymentOptionsModalProps {
  onClose: () => void;
}

const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({ onClose }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const internationalCards = ['Visa', 'Mastercard', 'American Express'];
  const vietnameseBanks = ['Vietcombank', 'Techcombank', 'MB Bank'];

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

  const handleSave = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmationModal(false);
    setShowCompleteModal(true);
  };

  const handleCloseComplete = () => {
    setShowCompleteModal(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Chọn phương thức thanh toán</h3>

        <div className="form-group">
          <label htmlFor="payment-method">Phương thức</label>
          <select id="payment-method" value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
            <option value="">-- Chọn phương thức --</option>
            <option value="cash">Tiền mặt</option>
            <option value="bank_transfer">Chuyển khoản</option>
          </select>
        </div>

        {selectedPaymentMethod === 'bank_transfer' && (
          <div className="form-group">
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

        <div className="modal-actions">
          <button className="modal-save-btn" onClick={handleSave} disabled={isSaveDisabled}>
            Lưu
          </button>
          <button className="modal-cancel-btn" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>

      {/* Modal xác nhận */}
      {showConfirmationModal && (
        <div className="modal-overlay payment-confirmation-modal">
          <div className="modal-box">
            <h3>Xác nhận phương thức thanh toán ?</h3>
            <div className="modal-actions">
              <button className="modal-confirm-btn large-button" onClick={handleConfirm}>
                Xác nhận
              </button>
              <button className="modal-cancel-btn large-button" onClick={() => setShowConfirmationModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hoàn tất */}
      {showCompleteModal && (
        <div className="modal-overlay payment-complete-modal">
          <div className="modal-box">
            <h3>Hoàn tất!</h3>
            <button className="modal-ok-btn" onClick={handleCloseComplete}>
              Thoát
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentOptionsModal;
