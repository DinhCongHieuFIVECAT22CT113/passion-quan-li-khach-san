'use client';

import React from 'react';

const LanguageSelector: React.FC = () => {
  return (
    <div>
      <select>
        <option value="vi">Tiếng Việt</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSelector; 