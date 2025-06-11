import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [3, 5, 10, 50]
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số trang tối đa hiển thị
    
    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng số trang tối đa hiển thị, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Nếu tổng số trang nhiều hơn số trang tối đa hiển thị
      if (currentPage <= 3) {
        // Nếu trang hiện tại gần đầu, hiển thị 5 trang đầu
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Nếu trang hiện tại gần cuối, hiển thị 5 trang cuối
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Nếu trang hiện tại ở giữa, hiển thị trang hiện tại và 2 trang trước/sau
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationControls}>
        <div className={styles.itemsPerPageControl}>
          <label htmlFor="itemsPerPage">Hiển thị: </label>
          <select 
            id="itemsPerPage" 
            value={itemsPerPage} 
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={styles.itemsPerPageSelect}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className={styles.paginationInfo}>
          Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} trên {totalItems} mục
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            &laquo; Trước
          </button>
          
          {getPageNumbers().map(number => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`${styles.paginationButton} ${currentPage === number ? styles.activePage : ''}`}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Sau &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;