/**
 * Các hàm tiện ích cho toàn bộ ứng dụng
 */

/**
 * Định dạng số thành tiền tệ VND
 * @param value Giá trị số cần định dạng
 * @param defaultValue Giá trị mặc định nếu giá trị đầu vào không hợp lệ
 * @returns Chuỗi đã định dạng tiền tệ
 */
export const formatCurrency = (value: number | string | null | undefined, defaultValue: string = "0 đ"): string => {
  // Xử lý giá trị null hoặc undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  // Chuyển đổi sang kiểu số
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Kiểm tra giá trị NaN
  if (isNaN(numValue)) {
    return defaultValue;
  }
  
  // Định dạng số
  return numValue.toLocaleString('vi-VN') + ' đ';
};

/**
 * Định dạng ngày tháng từ chuỗi ISO hoặc đối tượng Date
 * @param date Ngày tháng cần định dạng
 * @param format Định dạng mong muốn (mặc định: dd/MM/yyyy)
 * @returns Chuỗi ngày đã định dạng
 */
export const formatDate = (date: string | Date | null | undefined, format: string = 'dd/MM/yyyy'): string => {
  // Xử lý giá trị null hoặc undefined
  if (date === null || date === undefined) {
    return '';
  }
  
  let dateObj: Date;
  
  // Chuyển đổi sang đối tượng Date
  try {
    dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Kiểm tra ngày không hợp lệ
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
  } catch (error) {
    console.error('Lỗi khi chuyển đổi ngày tháng:', error);
    return '';
  }
  
  // Định dạng ngày tháng
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  // Thay thế theo định dạng
  let result = format;
  result = result.replace('dd', day);
  result = result.replace('MM', month);
  result = result.replace('yyyy', year.toString());
  result = result.replace('HH', hours);
  result = result.replace('mm', minutes);
  
  return result;
};

/**
 * Xử lý chuỗi an toàn để tránh lỗi null/undefined
 * @param value Chuỗi cần xử lý
 * @param defaultValue Giá trị mặc định nếu chuỗi không hợp lệ
 * @returns Chuỗi đã xử lý an toàn
 */
export const safeString = (value: string | null | undefined, defaultValue: string = ''): string => {
  return value === null || value === undefined ? defaultValue : String(value);
};

/**
 * Làm tròn số thập phân đến số chữ số sau dấu phẩy
 * @param value Giá trị số cần làm tròn
 * @param decimals Số chữ số sau dấu phẩy
 * @returns Số đã được làm tròn
 */
export const roundNumber = (value: number | string | null | undefined, decimals: number = 2): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(numValue)) {
    return 0;
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(numValue * factor) / factor;
};

/**
 * Chuyển đổi giá trị thành boolean an toàn
 * @param value Giá trị cần chuyển đổi
 * @param defaultValue Giá trị mặc định nếu không thể chuyển đổi
 * @returns Giá trị boolean
 */
export const safeBoolean = (value: any, defaultValue: boolean = false): boolean => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    if (lowercased === 'true' || lowercased === '1' || lowercased === 'yes') {
      return true;
    }
    if (lowercased === 'false' || lowercased === '0' || lowercased === 'no') {
      return false;
    }
  }
  
  if (typeof value === 'number') {
    return value !== 0;
  }
  
  return defaultValue;
}; 