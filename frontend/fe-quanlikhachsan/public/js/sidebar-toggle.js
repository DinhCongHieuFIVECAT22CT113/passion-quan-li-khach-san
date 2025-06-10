// Thêm vào thẻ head của trang admin
document.addEventListener('DOMContentLoaded', function() {
  // Tạo nút toggle
  const toggleButton = document.createElement('button');
  toggleButton.id = 'sidebarToggle';
  toggleButton.innerHTML = '☰';
  toggleButton.style.cssText = `
    position: fixed;
    top: 15px;
    left: 15px;
    z-index: 1001;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
  `;
  
  document.body.appendChild(toggleButton);
  
  // Tìm sidebar và main content
  const sidebar = document.querySelector('.sidebar') || document.querySelector('aside');
  const mainContent = document.querySelector('main');
  
  if (sidebar && mainContent) {
    // Thêm CSS cho transition
    sidebar.style.transition = 'transform 0.3s ease';
    mainContent.style.transition = 'margin-left 0.3s ease';
    mainContent.style.marginLeft = sidebar.offsetWidth + 'px';
    
    // Xử lý sự kiện click
    let sidebarOpen = true;
    toggleButton.addEventListener('click', function() {
      sidebarOpen = !sidebarOpen;
      
      if (sidebarOpen) {
        sidebar.style.transform = 'translateX(0)';
        mainContent.style.marginLeft = sidebar.offsetWidth + 'px';
      } else {
        sidebar.style.transform = 'translateX(-100%)';
        mainContent.style.marginLeft = '0';
      }
    });
  }
});