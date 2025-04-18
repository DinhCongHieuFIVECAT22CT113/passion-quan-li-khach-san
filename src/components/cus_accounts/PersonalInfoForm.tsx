'use client';
import React, { useState } from 'react';
import '../../styles/cus_account.css';

const PersonalInfoForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+84');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [idCard, setIdCard] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idCard: '',
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const countryCodes = [{ code: '+84', country: 'Việt Nam' }];

  const validateFields = () => {
    const newErrors = {
      name: name.trim() === '' ? 'Họ tên không được để trống.' : '',
      email:
        email.trim() === ''
          ? 'Email không được để trống.'
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? 'Email không đúng định dạng.'
          : '',
      phone: phone.trim() === '' ? 'Số điện thoại không được để trống.' : '',
      address: address.trim() === '' ? 'Địa chỉ không được để trống.' : '',
      idCard:
        idCard.trim() === ''
          ? 'CMND/CCCD không được để trống.'
          : !/^\d{12}$/.test(idCard)
          ? 'CMND/CCCD phải có đúng 12 chữ số.'
          : '',
    };
    setErrors(newErrors);

    // Kiểm tra có lỗi nào không
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSaveInfo = () => {
    if (!validateFields()) return;

    console.log('Lưu thông tin:', {
      name,
      email,
      phoneCode,
      phone,
      address,
      idCard,
    });

    setShowSaveSuccess(true);
  };

  const handleCloseSuccessModal = () => {
    setShowSaveSuccess(false);
  };

  return (
    <div className="info-card">
      <h3>Thông tin cá nhân</h3>

      <div className="form-group">
        <label>Họ tên:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="error">{errors.name}</p>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="error">{errors.email}</p>}
      </div>

      <div className="form-group">
  <label>Số điện thoại:</label>
  <div className="phone-input-group">
    <select
      value={phoneCode}
      onChange={(e) => setPhoneCode(e.target.value)}
      className="phone-select"
    >
      {countryCodes.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} ({c.country})
        </option>
      ))}
    </select>
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="phone-number-input"
    />
  </div>
  {errors.phone && <p className="error">{errors.phone}</p>}
</div>


      <div className="form-group">
        <label>Địa chỉ:</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        {errors.address && <p className="error">{errors.address}</p>}
      </div>

      <div className="form-group">
        <label>CMND/CCCD:</label>
        <input type="text" value={idCard} onChange={(e) => setIdCard(e.target.value)} />
        {errors.idCard && <p className="error">{errors.idCard}</p>}
      </div>

      <button className="save-info-btn" onClick={handleSaveInfo}>
        Lưu thay đổi
      </button>

      {showSaveSuccess && (
        <div className="modal-overlay payment-complete-modal">
          <div className="modal-box">
            <h3>Đã lưu thay đổi!</h3>
            <button className="modal-ok-btn" onClick={handleCloseSuccessModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoForm;
