/**
 * HỆ THỐNG QUẢN LÝ THƯ VIỆN THÔNG MINH ỨNG DỤNG AI
 * Sinh viên thực hiện: Phan Văn Quân - MSSV: 29214663437
 * Client JavaScript Application (Hỗ trợ cả REST API và LocalStorage Offline)
 */

// Global State
const APP_STATE = {
  isApiMode: false,
  apiBase: window.location.origin.includes('http') ? window.location.origin : 'http://127.0.0.1:8000',
  currentTab: 'dashboard',
  booksView: 'grid',
  stats: {},
  books: [],
  readers: [],
  borrows: [],
  categories: [],
  charts: {
    category: null,
    borrow: null
  },
  aiApiKey: localStorage.getItem('gemini_api_key') || ''
};

// Default Seed Data for LocalStorage Fallback
const DEFAULT_SEED_DATA = {
  categories: [
    { id: 'CAT01', name: 'Công nghệ thông tin', icon: 'fa-laptop-code', count: 4 },
    { id: 'CAT02', name: 'Khoa học dữ liệu & AI', icon: 'fa-brain', count: 3 },
    { id: 'CAT03', name: 'Kinh tế & Quản trị', icon: 'fa-chart-line', count: 2 },
    { id: 'CAT04', name: 'Khoa học & Kỹ thuật', icon: 'fa-atom', count: 1 },
    { id: 'CAT05', name: 'Kỹ năng sống & Phát triển', icon: 'fa-user-graduate', count: 2 }
  ],
  books: [
    {
      id: 'B001',
      isbn: '978-604-0-12341-1',
      title: 'Cấu trúc dữ liệu và Giải thuật nâng cao',
      author: 'PGS.TS. Trần Minh Thái',
      publisher: 'NXB Đại học Quốc gia',
      publishYear: 2023,
      categoryId: 'CAT01',
      categoryName: 'Công nghệ thông tin',
      totalCopies: 8,
      availableCopies: 5,
      location: 'Kệ A1-01',
      description: 'Giáo trình chi tiết về danh sách liên kết, cây nhị phân, đồ thị và các giải thuật tối ưu hóa trong tin học.',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B002',
      isbn: '978-604-2-98765-4',
      title: 'Clean Code - Nghệ thuật viết code sạch',
      author: 'Robert C. Martin',
      publisher: 'NXB Thông tin và Truyền thông',
      publishYear: 2022,
      categoryId: 'CAT01',
      categoryName: 'Công nghệ thông tin',
      totalCopies: 6,
      availableCopies: 2,
      location: 'Kệ A1-02',
      description: 'Cẩm nang lập trình mẫu mực dành cho lập trình viên muốn nâng cao chất lượng mã nguồn.',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B003',
      isbn: '978-604-1-84729-3',
      title: 'Trí tuệ nhân tạo: Tiếp cận hiện đại (AI: A Modern Approach)',
      author: 'Stuart Russell, Peter Norvig',
      publisher: 'NXB Bách Khoa Hà Nội',
      publishYear: 2024,
      categoryId: 'CAT02',
      categoryName: 'Khoa học dữ liệu & AI',
      totalCopies: 10,
      availableCopies: 4,
      location: 'Kệ A2-01',
      description: 'Cuốn sách kinh điển thế giới về Trí tuệ nhân tạo, Search, Logic, Machine Learning, Deep Learning và LLMs.',
      cover: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B004',
      isbn: '978-604-3-11223-8',
      title: 'Học sâu (Deep Learning) từ cơ bản đến ứng dụng',
      author: 'Ian Goodfellow, Yoshua Bengio',
      publisher: 'NXB Khoa học Tự nhiên',
      publishYear: 2023,
      categoryId: 'CAT02',
      categoryName: 'Khoa học dữ liệu & AI',
      totalCopies: 5,
      availableCopies: 3,
      location: 'Kệ A2-02',
      description: 'Kiến thức cốt lõi về mạng nơ-ron nhân tạo, CNN, RNN, Transformer và mô hình sinh.',
      cover: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B005',
      isbn: '978-604-6-77889-0',
      title: 'Thiết kế cơ sở dữ liệu quan hệ và NoSQL',
      author: 'TS. Nguyễn Thị Hồng',
      publisher: 'NXB Giáo Dục Việt Nam',
      publishYear: 2023,
      categoryId: 'CAT01',
      categoryName: 'Công nghệ thông tin',
      totalCopies: 7,
      availableCopies: 6,
      location: 'Kệ A1-03',
      description: 'Mô hình thực thể kết hợp E-R, chuẩn hóa 3NF, BCNF, tối ưu câu truy vấn SQL và MongoDB.',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B006',
      isbn: '978-604-0-33445-5',
      title: 'Lập trình Web hiện đại với React & Node.js',
      author: 'Vũ Hoàng Tuấn',
      publisher: 'NXB Thanh Niên',
      publishYear: 2024,
      categoryId: 'CAT01',
      categoryName: 'Công nghệ thông tin',
      totalCopies: 9,
      availableCopies: 7,
      location: 'Kệ A1-04',
      description: 'Hướng dẫn phát triển ứng dụng Fullstack Single Page Application, RESTful API.',
      cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B008',
      isbn: '978-604-1-00223-1',
      title: 'Kinh tế học vi mô hiện đại',
      author: 'N. Gregory Mankiw',
      publisher: 'NXB Kinh Tế Quốc Dân',
      publishYear: 2023,
      categoryId: 'CAT03',
      categoryName: 'Kinh tế & Quản trị',
      totalCopies: 8,
      availableCopies: 5,
      location: 'Kệ B1-01',
      description: 'Nguyên lý kinh tế cơ bản, quy luật cung cầu, hành vi người tiêu dùng.',
      cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60'
    },
    {
      id: 'B010',
      isbn: '978-604-8-12990-2',
      title: 'Đắc Nhân Tâm',
      author: 'Dale Carnegie',
      publisher: 'NXB Tổng hợp TP.HCM',
      publishYear: 2024,
      categoryId: 'CAT05',
      categoryName: 'Kỹ năng sống & Phát triển',
      totalCopies: 12,
      availableCopies: 9,
      location: 'Kệ C1-01',
      description: 'Nghệ thuật giao tiếp, thu phục lòng người và xây dựng mối quan hệ bền vững.',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=60'
    }
  ],
  readers: [
    {
      id: '29214663437',
      name: 'Phan Văn Quân',
      email: 'quan.pv.29214663437@student.edu.vn',
      phone: '0912345678',
      type: 'Sinh viên',
      department: 'Công nghệ Thông tin',
      createdDate: '2024-09-05',
      expiryDate: '2028-09-05',
      status: 'active',
      maxBorrow: 3,
      currentBorrowCount: 1
    },
    {
      id: '29214661001',
      name: 'Nguyễn Thị Thu Hà',
      email: 'ha.ntt@student.edu.vn',
      phone: '0988123456',
      type: 'Sinh viên',
      department: 'Hệ thống thông tin',
      createdDate: '2024-09-10',
      expiryDate: '2028-09-10',
      status: 'active',
      maxBorrow: 3,
      currentBorrowCount: 2
    },
    {
      id: 'GV2019001',
      name: 'TS. Lê Hoàng Nam',
      email: 'nam.lh@university.edu.vn',
      phone: '0903456789',
      type: 'Giảng viên',
      department: 'Khoa học máy tính',
      createdDate: '2022-01-15',
      expiryDate: '2030-01-15',
      status: 'active',
      maxBorrow: 5,
      currentBorrowCount: 0
    },
    {
      id: '29214663005',
      name: 'Vũ Đình Trọng',
      email: 'trong.vd@student.edu.vn',
      phone: '0933998877',
      type: 'Sinh viên',
      department: 'Kinh tế số',
      createdDate: '2023-10-01',
      expiryDate: '2027-10-01',
      status: 'suspended',
      maxBorrow: 3,
      currentBorrowCount: 1
    }
  ],
  borrowRecords: [
    {
      id: 'BR2026-001',
      readerId: '29214663437',
      readerName: 'Phan Văn Quân',
      bookId: 'B003',
      bookTitle: 'Trí tuệ nhân tạo: Tiếp cận hiện đại (AI: A Modern Approach)',
      borrowDate: '2026-11-15',
      dueDate: '2026-11-29',
      returnDate: null,
      status: 'borrowing',
      fineAmount: 0,
      notes: 'Phục vụ nghiên cứu đồ án môn học AI',
      renewCount: 0
    },
    {
      id: 'BR2026-002',
      readerId: '29214661001',
      readerName: 'Nguyễn Thị Thu Hà',
      bookId: 'B002',
      bookTitle: 'Clean Code - Nghệ thuật viết code sạch',
      borrowDate: '2026-11-10',
      dueDate: '2026-11-24',
      returnDate: null,
      status: 'borrowing',
      fineAmount: 0,
      notes: 'Tình trạng sách tốt',
      renewCount: 0
    },
    {
      id: 'BR2026-003',
      readerId: '29214661001',
      readerName: 'Nguyễn Thị Thu Hà',
      bookId: 'B006',
      bookTitle: 'Lập trình Web hiện đại với React & Node.js',
      borrowDate: '2026-10-25',
      dueDate: '2026-11-08',
      returnDate: null,
      status: 'overdue',
      fineAmount: 75000,
      notes: 'Đã quá hạn 15 ngày, gửi thông báo nhắc nhở',
      renewCount: 0
    },
    {
      id: 'BR2026-005',
      readerId: '29214663005',
      readerName: 'Vũ Đình Trọng',
      bookId: 'B001',
      bookTitle: 'Cấu trúc dữ liệu và Giải thuật nâng cao',
      borrowDate: '2026-10-10',
      dueDate: '2026-10-24',
      returnDate: null,
      status: 'overdue',
      fineAmount: 150000,
      notes: 'Thẻ đang bị tạm khóa do trễ hạn kéo dài',
      renewCount: 0
    }
  ]
};

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  setupNavigation();
  setupEventListeners();
  await checkBackendConnection();
  await loadData();
  renderCurrentTab();
});

// Theme Handling
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
  if (APP_STATE.charts.category) APP_STATE.charts.category.update();
  if (APP_STATE.charts.borrow) APP_STATE.charts.borrow.update();
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Check Backend Connection
async function checkBackendConnection() {
  const badge = document.getElementById('connection-status-badge');
  try {
    const res = await fetch(`${APP_STATE.apiBase}/api/stats`, { method: 'GET' });
    if (res.ok) {
      APP_STATE.isApiMode = true;
      if (badge) {
        badge.innerHTML = '<i class="fas fa-database"></i> Server API (FastAPI + SQLite)';
        badge.className = 'mode-badge';
      }
      return;
    }
  } catch (e) {
    // API not reachable, fallback to LocalStorage
  }
  APP_STATE.isApiMode = false;
  if (badge) {
    badge.innerHTML = '<i class="fas fa-bolt"></i> LocalStorage Mode (Offline)';
    badge.className = 'mode-badge';
    badge.style.backgroundColor = '#fef3c7';
    badge.style.color = '#92400e';
    badge.style.borderColor = '#fde68a';
  }
  initLocalStorage();
}

function initLocalStorage() {
  if (!localStorage.getItem('lib_books')) {
    localStorage.setItem('lib_books', JSON.stringify(DEFAULT_SEED_DATA.books));
  }
  if (!localStorage.getItem('lib_readers')) {
    localStorage.setItem('lib_readers', JSON.stringify(DEFAULT_SEED_DATA.readers));
  }
  if (!localStorage.getItem('lib_borrows')) {
    localStorage.setItem('lib_borrows', JSON.stringify(DEFAULT_SEED_DATA.borrowRecords));
  }
  if (!localStorage.getItem('lib_categories')) {
    localStorage.setItem('lib_categories', JSON.stringify(DEFAULT_SEED_DATA.categories));
  }
}

// Load Data
async function loadData() {
  if (APP_STATE.isApiMode) {
    try {
      const [stats, books, readers, borrows] = await Promise.all([
        fetch(`${APP_STATE.apiBase}/api/stats`).then(r => r.json()),
        fetch(`${APP_STATE.apiBase}/api/books`).then(r => r.json()),
        fetch(`${APP_STATE.apiBase}/api/readers`).then(r => r.json()),
        fetch(`${APP_STATE.apiBase}/api/borrows`).then(r => r.json())
      ]);
      APP_STATE.stats = stats;
      APP_STATE.books = books;
      APP_STATE.readers = readers;
      APP_STATE.borrows = borrows;
      APP_STATE.categories = stats.categories || DEFAULT_SEED_DATA.categories;
      return;
    } catch (e) {
      console.warn('API fetch failed, falling back to local storage', e);
      APP_STATE.isApiMode = false;
    }
  }

  // LocalStorage mode
  APP_STATE.books = JSON.parse(localStorage.getItem('lib_books')) || [];
  APP_STATE.readers = JSON.parse(localStorage.getItem('lib_readers')) || [];
  APP_STATE.borrows = JSON.parse(localStorage.getItem('lib_borrows')) || [];
  APP_STATE.categories = JSON.parse(localStorage.getItem('lib_categories')) || DEFAULT_SEED_DATA.categories;
  
  // Calculate stats dynamically
  calculateLocalStats();
}

function calculateLocalStats() {
  const totalCopies = APP_STATE.books.reduce((acc, b) => acc + (parseInt(b.totalCopies) || 0), 0);
  const availableCopies = APP_STATE.books.reduce((acc, b) => acc + (parseInt(b.availableCopies) || 0), 0);
  const borrowingCount = APP_STATE.borrows.filter(b => b.status === 'borrowing').length;
  const overdueCount = APP_STATE.borrows.filter(b => b.status === 'overdue').length;
  const totalFines = APP_STATE.borrows.reduce((acc, b) => acc + (parseFloat(b.fineAmount) || 0), 0);
  
  // Categories grouping
  const catMap = {};
  APP_STATE.books.forEach(b => {
    catMap[b.categoryName] = (catMap[b.categoryName] || 0) + 1;
  });
  const categories = Object.keys(catMap).map(k => ({ categoryName: k, count: catMap[k] }));

  APP_STATE.stats = {
    totalBooks: APP_STATE.books.length,
    totalCopies,
    availableCopies,
    borrowedCopies: totalCopies - availableCopies,
    totalReaders: APP_STATE.readers.length,
    borrowingCount,
    overdueCount,
    totalFines,
    categories,
    recentBorrows: APP_STATE.borrows.slice(0, 5)
  };
}

// Navigation & Tab Switching
function setupNavigation() {
  const menuItems = document.querySelectorAll('.menu-item[data-tab]');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  APP_STATE.currentTab = tabId;
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  const activeMenu = document.querySelector(`.menu-item[data-tab="${tabId}"]`);
  if (activeMenu) activeMenu.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.add('active');

  const titles = {
    dashboard: 'Tổng quan Hệ thống Thư viện',
    books: 'Quản lý Kho Sách & Danh mục',
    readers: 'Quản lý Độc giả & Thẻ thư viện',
    borrows: 'Quản lý Mượn - Trả & Quá hạn',
    search: 'Tra cứu Danh mục Trực tuyến',
    ai: 'Trợ lý AI Thư viện Thông minh',
    settings: 'Cấu hình Hệ thống & Dữ liệu'
  };
  const pageTitleEl = document.getElementById('current-page-title');
  if (pageTitleEl) pageTitleEl.innerText = titles[tabId] || 'Quản lý Thư viện';

  renderCurrentTab();
}

function renderCurrentTab() {
  switch (APP_STATE.currentTab) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'books':
      renderBooks();
      break;
    case 'readers':
      renderReaders();
      break;
    case 'borrows':
      renderBorrows();
      break;
    case 'search':
      renderCatalogSearch();
      break;
    case 'ai':
      // AI view is static chat box
      break;
    case 'settings':
      renderSettings();
      break;
  }
}

// Render Dashboard
function renderDashboard() {
  const stats = APP_STATE.stats;
  document.getElementById('stat-books-count').innerText = stats.totalBooks || 0;
  document.getElementById('stat-books-sub').innerText = `${stats.availableCopies || 0} / ${stats.totalCopies || 0} bản sao khả dụng`;
  document.getElementById('stat-readers-count').innerText = stats.totalReaders || 0;
  document.getElementById('stat-borrowing-count').innerText = stats.borrowingCount || 0;
  document.getElementById('stat-overdue-count').innerText = stats.overdueCount || 0;
  document.getElementById('stat-overdue-sub').innerText = `Tiền phạt: ${(stats.totalFines || 0).toLocaleString()} VNĐ`;

  // Render Recent Activity Table
  const tbody = document.getElementById('dashboard-recent-table');
  if (tbody) {
    const list = APP_STATE.borrows.slice(0, 5);
    tbody.innerHTML = list.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${b.readerName} <br><small class="text-muted">${b.readerId}</small></td>
        <td><strong>${b.bookTitle}</strong></td>
        <td>${formatDate(b.borrowDate)}</td>
        <td>${formatDate(b.dueDate)}</td>
        <td>${getStatusBadge(b.status)}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted">Chưa có giao dịch mượn trả nào.</td></tr>';
  }

  // Render Charts
  renderDashboardCharts();
}

function renderDashboardCharts() {
  const catCanvas = document.getElementById('chartCategory');
  if (catCanvas && window.Chart) {
    if (APP_STATE.charts.category) APP_STATE.charts.category.destroy();
    
    const catData = APP_STATE.stats.categories || [];
    const labels = catData.map(c => c.categoryName);
    const data = catData.map(c => c.count);

    APP_STATE.charts.category = new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Công nghệ', 'AI', 'Kinh tế', 'Kỹ năng'],
        datasets: [{
          data: data.length ? data : [4, 3, 2, 2],
          backgroundColor: ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  const borrowCanvas = document.getElementById('chartBorrow');
  if (borrowCanvas && window.Chart) {
    if (APP_STATE.charts.borrow) APP_STATE.charts.borrow.destroy();

    APP_STATE.charts.borrow = new Chart(borrowCanvas, {
      type: 'bar',
      data: {
        labels: ['Đang mượn', 'Quá hạn', 'Đã trả hoàn tất'],
        datasets: [{
          label: 'Số lượng phiếu',
          data: [
            APP_STATE.stats.borrowingCount || 0,
            APP_STATE.stats.overdueCount || 0,
            APP_STATE.borrows.filter(b => b.status === 'returned').length
          ],
          backgroundColor: ['#2563eb', '#ef4444', '#10b981']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}

// Render Books
function renderBooks() {
  const search = (document.getElementById('books-search-input')?.value || '').toLowerCase();
  const catFilter = document.getElementById('books-category-filter')?.value || '';

  const filtered = APP_STATE.books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search) || 
                        b.author.toLowerCase().includes(search) || 
                        b.isbn.toLowerCase().includes(search);
    const matchCat = !catFilter || b.categoryId === catFilter || b.categoryName === catFilter;
    return matchSearch && matchCat;
  });

  const gridContainer = document.getElementById('books-grid-container');
  const tableContainer = document.getElementById('books-table-container');

  if (APP_STATE.booksView === 'grid') {
    gridContainer.style.display = 'grid';
    tableContainer.style.display = 'none';
    gridContainer.innerHTML = filtered.map(b => `
      <div class="book-card">
        <div class="book-cover">
          <img src="${b.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'}" alt="${b.title}" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'">
          <span class="book-category-tag">${b.categoryName}</span>
        </div>
        <div class="book-body">
          <h4 class="book-title" title="${b.title}">${b.title}</h4>
          <p class="book-author"><i class="fas fa-user-edit"></i> ${b.author}</p>
          <div class="book-meta">
            <span><i class="fas fa-layer-group"></i> Kệ: <strong>${b.location}</strong></span>
            <span><i class="fas fa-check-circle"></i> Còn: <strong>${b.availableCopies}/${b.totalCopies}</strong></span>
          </div>
          <div class="book-actions">
            <button class="btn btn-primary btn-sm" onclick="openBorrowModalWithBook('${b.id}')" ${b.availableCopies <= 0 ? 'disabled' : ''}>
              <i class="fas fa-hand-holding"></i> Mượn
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openEditBookModal('${b.id}')">
              <i class="fas fa-edit"></i> Sửa
            </button>
            <button class="btn btn-secondary btn-sm" onclick="deleteBookAction('${b.id}')">
              <i class="fas fa-trash text-danger"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('') || '<div class="col-span-full text-center p-8 text-muted">Không tìm thấy sách nào phù hợp.</div>';
  } else {
    gridContainer.style.display = 'none';
    tableContainer.style.display = 'block';
    const tbody = document.getElementById('books-table-body');
    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>
          <strong>${b.title}</strong><br>
          <small class="text-muted">ISBN: ${b.isbn}</small>
        </td>
        <td>${b.author}</td>
        <td><span class="badge badge-info">${b.categoryName}</span></td>
        <td>${b.location}</td>
        <td><strong>${b.availableCopies}</strong> / ${b.totalCopies}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="openBorrowModalWithBook('${b.id}')" ${b.availableCopies <= 0 ? 'disabled' : ''}>Mượn</button>
          <button class="btn btn-secondary btn-sm" onclick="openEditBookModal('${b.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="deleteBookAction('${b.id}')"><i class="fas fa-trash text-danger"></i></button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="text-center text-muted">Không tìm thấy sách.</td></tr>';
  }
}

// Render Readers
function renderReaders() {
  const search = (document.getElementById('readers-search-input')?.value || '').toLowerCase();
  const filtered = APP_STATE.readers.filter(r => 
    r.name.toLowerCase().includes(search) || 
    r.id.toLowerCase().includes(search) || 
    r.email.toLowerCase().includes(search)
  );

  const tbody = document.getElementById('readers-table-body');
  if (tbody) {
    tbody.innerHTML = filtered.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>
          <strong>${r.name}</strong><br>
          <small class="text-muted">${r.email}</small>
        </td>
        <td><span class="badge ${r.type === 'Giảng viên' ? 'badge-warning' : 'badge-info'}">${r.type}</span></td>
        <td>${r.department || 'CNTT'}</td>
        <td>${r.phone}</td>
        <td><strong>${r.currentBorrowCount}</strong> / ${r.maxBorrow} cuốn</td>
        <td>
          <span class="badge ${r.status === 'active' ? 'badge-success' : 'badge-danger'}">
            ${r.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="toggleReaderStatus('${r.id}')" title="Đổi trạng thái thẻ">
            <i class="fas ${r.status === 'active' ? 'fa-lock' : 'fa-unlock'}"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openEditReaderModal('${r.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="deleteReaderAction('${r.id}')">
            <i class="fas fa-trash text-danger"></i>
          </button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" class="text-center text-muted">Không có độc giả nào.</td></tr>';
  }
}

// Render Borrows
function renderBorrows() {
  const statusFilter = document.getElementById('borrows-status-filter')?.value || '';
  const filtered = APP_STATE.borrows.filter(b => !statusFilter || b.status === statusFilter);

  const tbody = document.getElementById('borrows-table-body');
  if (tbody) {
    tbody.innerHTML = filtered.map(b => {
      const isBorrowing = b.status === 'borrowing';
      const isOverdue = b.status === 'overdue';
      return `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>${b.readerName} <br><small class="text-muted">MSSV: ${b.readerId}</small></td>
          <td><strong>${b.bookTitle}</strong> <br><small class="text-muted">Mã: ${b.bookId}</small></td>
          <td>${formatDate(b.borrowDate)}</td>
          <td>${formatDate(b.dueDate)}</td>
          <td>${b.returnDate ? formatDate(b.returnDate) : '-'}</td>
          <td>${getStatusBadge(b.status)}</td>
          <td><strong>${b.fineAmount ? b.fineAmount.toLocaleString() + ' đ' : '-'}</strong></td>
          <td>
            ${(isBorrowing || isOverdue) ? `
              <button class="btn btn-success btn-sm" onclick="returnBookAction('${b.id}')" title="Xác nhận trả sách">
                <i class="fas fa-undo"></i> Trả sách
              </button>
              ${isBorrowing && b.renewCount < 1 ? `
                <button class="btn btn-secondary btn-sm" onclick="renewBookAction('${b.id}')" title="Gia hạn thêm 7 ngày">
                  <i class="fas fa-clock"></i> Gia hạn
                </button>
              ` : ''}
            ` : '<span class="text-muted"><i class="fas fa-check"></i> Đã đóng</span>'}
          </td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="9" class="text-center text-muted">Không tìm thấy phiếu mượn nào.</td></tr>';
  }
}

// Render Catalog Search Tab
function renderCatalogSearch() {
  const input = (document.getElementById('catalog-search-keyword')?.value || '').toLowerCase();
  const container = document.getElementById('catalog-search-results');
  if (!container) return;

  const results = APP_STATE.books.filter(b => 
    b.title.toLowerCase().includes(input) || 
    b.author.toLowerCase().includes(input) || 
    b.categoryName.toLowerCase().includes(input) ||
    b.description.toLowerCase().includes(input)
  );

  container.innerHTML = results.map(b => `
    <div class="stat-card" style="align-items: flex-start; gap: 16px;">
      <div style="width: 70px; height: 95px; border-radius: 8px; overflow: hidden; flex-shrink: 0;">
        <img src="${b.cover}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="flex: 1;">
        <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 4px;">${b.title}</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">Tác giả: <strong>${b.author}</strong> | NXB: ${b.publisher} (${b.publishYear})</p>
        <p style="font-size: 13px; margin-bottom: 10px;">${b.description}</p>
        <div style="display: flex; gap: 12px; align-items: center; font-size: 12px;">
          <span class="badge badge-info"><i class="fas fa-bookmark"></i> ${b.categoryName}</span>
          <span><i class="fas fa-map-marker-alt"></i> Vị trí: <strong>${b.location}</strong></span>
          <span><i class="fas fa-boxes"></i> Tồn kho: <strong class="${b.availableCopies > 0 ? 'text-success' : 'text-danger'}">${b.availableCopies}/${b.totalCopies}</strong></span>
        </div>
      </div>
      <div>
        <button class="btn btn-primary btn-sm" onclick="openBorrowModalWithBook('${b.id}')" ${b.availableCopies <= 0 ? 'disabled' : ''}>Mượn sách</button>
      </div>
    </div>
  `).join('') || '<div class="text-center text-muted p-8">Không có kết quả tra cứu nào phù hợp.</div>';
}

// Render Settings Tab
function renderSettings() {
  const apiKeyInput = document.getElementById('gemini-api-key-input');
  if (apiKeyInput) {
    apiKeyInput.value = APP_STATE.aiApiKey;
  }
}

// Actions & Business Logic
async function handleCreateBorrow() {
  const readerId = document.getElementById('borrow-modal-reader-select').value;
  const bookId = document.getElementById('borrow-modal-book-select').value;
  const notes = document.getElementById('borrow-modal-notes').value;

  if (!readerId || !bookId) {
    showToast('Vui lòng chọn độc giả và cuốn sách cần mượn!', 'warning');
    return;
  }

  if (APP_STATE.isApiMode) {
    try {
      const res = await fetch(`${APP_STATE.apiBase}/api/borrows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readerId, bookId, notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Lỗi lập phiếu mượn');
      showToast('Lập phiếu mượn sách thành công!', 'success');
      closeModal('modal-borrow');
      await loadData();
      renderCurrentTab();
      return;
    } catch (e) {
      showToast(e.message, 'error');
      return;
    }
  }

  // LocalStorage Logic
  const reader = APP_STATE.readers.find(r => r.id === readerId);
  const book = APP_STATE.books.find(b => b.id === bookId);

  if (!reader || !book) {
    showToast('Thông tin độc giả hoặc sách không hợp lệ!', 'error');
    return;
  }

  if (reader.status !== 'active') {
    showToast(`Thẻ độc giả của ${reader.name} đang bị khóa! Không thể mượn.`, 'error');
    return;
  }

  if (reader.currentBorrowCount >= reader.maxBorrow) {
    showToast(`Độc giả đã mượn tối đa ${reader.maxBorrow} cuốn sách!`, 'error');
    return;
  }

  const hasOverdue = APP_STATE.borrows.some(b => b.readerId === readerId && b.status === 'overdue');
  if (hasOverdue) {
    showToast('Độc giả đang có sách trễ hạn chưa trả! Không thể mượn thêm.', 'error');
    return;
  }

  if (book.availableCopies <= 0) {
    showToast('Sách này đã hết trong kho!', 'error');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const days = reader.type === 'Giảng viên' ? 30 : 14;
  const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const newRec = {
    id: `BR${Date.now().toString().slice(-6)}`,
    readerId: reader.id,
    readerName: reader.name,
    bookId: book.id,
    bookTitle: book.title,
    borrowDate: today,
    dueDate: dueDate,
    returnDate: null,
    status: 'borrowing',
    fineAmount: 0,
    notes: notes || '',
    renewCount: 0
  };

  book.availableCopies -= 1;
  reader.currentBorrowCount += 1;
  APP_STATE.borrows.unshift(newRec);

  saveLocalData();
  showToast('Lập phiếu mượn thành công!', 'success');
  closeModal('modal-borrow');
  renderCurrentTab();
}

async function returnBookAction(recordId) {
  if (!confirm('Xác nhận độc giả đã trả cuốn sách này vào kho?')) return;

  if (APP_STATE.isApiMode) {
    try {
      const res = await fetch(`${APP_STATE.apiBase}/api/borrows/${recordId}/return`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Lỗi trả sách');
      showToast(`Đã nhận lại sách! Tiền phạt quá hạn: ${data.fineAmount ? data.fineAmount.toLocaleString() + ' đ' : '0 đ'}`, 'success');
      await loadData();
      renderCurrentTab();
      return;
    } catch (e) {
      showToast(e.message, 'error');
      return;
    }
  }

  const rec = APP_STATE.borrows.find(b => b.id === recordId);
  if (!rec) return;

  const today = new Date().toISOString().split('T')[0];
  const due = new Date(rec.dueDate);
  const now = new Date(today);
  let fine = 0;
  if (now > due) {
    const diffDays = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    fine = diffDays * 5000;
  }

  rec.returnDate = today;
  rec.status = 'returned';
  rec.fineAmount = fine;

  const book = APP_STATE.books.find(b => b.id === rec.bookId);
  if (book) book.availableCopies += 1;

  const reader = APP_STATE.readers.find(r => r.id === rec.readerId);
  if (reader) reader.currentBorrowCount = Math.max(0, reader.currentBorrowCount - 1);

  saveLocalData();
  showToast(`Đã nhận lại sách thành công! ${fine > 0 ? `Tiền phạt: ${fine.toLocaleString()} đ` : ''}`, 'success');
  renderCurrentTab();
}

async function renewBookAction(recordId) {
  if (APP_STATE.isApiMode) {
    try {
      const res = await fetch(`${APP_STATE.apiBase}/api/borrows/${recordId}/renew`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Lỗi gia hạn');
      showToast(`Gia hạn thành công! Hạn trả mới: ${formatDate(data.dueDate)}`, 'success');
      await loadData();
      renderCurrentTab();
      return;
    } catch (e) {
      showToast(e.message, 'error');
      return;
    }
  }

  const rec = APP_STATE.borrows.find(b => b.id === recordId);
  if (!rec) return;
  if (rec.renewCount >= 1) {
    showToast('Phiếu mượn này đã được gia hạn tối đa 1 lần!', 'warning');
    return;
  }

  const currDue = new Date(rec.dueDate);
  currDue.setDate(currDue.getDate() + 7);
  rec.dueDate = currDue.toISOString().split('T')[0];
  rec.renewCount += 1;
  rec.notes = (rec.notes ? rec.notes + ' ' : '') + '[Đã gia hạn +7 ngày]';

  saveLocalData();
  showToast(`Đã gia hạn thêm 7 ngày! Hạn trả mới: ${formatDate(rec.dueDate)}`, 'success');
  renderCurrentTab();
}

// AI Assistant Query
async function handleSendAI() {
  const input = document.getElementById('ai-chat-input');
  const prompt = (input?.value || '').trim();
  if (!prompt) return;

  const messagesBox = document.getElementById('ai-chat-messages');
  // Add user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerText = prompt;
  messagesBox.appendChild(userBubble);
  input.value = '';
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Add AI thinking bubble
  const aiBubble = document.createElement('div');
  aiBubble.className = 'chat-bubble ai';
  aiBubble.innerHTML = '<div class="ai-meta"><i class="fas fa-robot"></i> Trợ lý AI đang xử lý câu trả lời...</div><i class="fas fa-spinner fa-spin"></i>';
  messagesBox.appendChild(aiBubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    let resultText = '';
    let source = 'Google Gemini & Knowledge Base';

    if (APP_STATE.isApiMode) {
      const res = await fetch(`${APP_STATE.apiBase}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, apiKey: APP_STATE.aiApiKey })
      });
      const data = await res.json();
      resultText = data.response;
      source = data.source;
    } else {
      // Offline local AI response
      await new Promise(r => setTimeout(r, 600)); // small delay for UX
      resultText = localAIResponse(prompt);
      source = 'AI Library Engine (Offline Mode)';
    }

    aiBubble.innerHTML = `
      <div class="ai-meta"><i class="fas fa-sparkles"></i> ${source}</div>
      <div>${formatMarkdownToHTML(resultText)}</div>
    `;
  } catch (e) {
    aiBubble.innerHTML = `
      <div class="ai-meta text-danger"><i class="fas fa-exclamation-triangle"></i> Lỗi phản hồi</div>
      <div>Xin lỗi, đã xảy ra lỗi trong quá trình kết nối Trợ lý AI: ${e.message}</div>
    `;
  }
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

function sendPresetPrompt(text) {
  const input = document.getElementById('ai-chat-input');
  if (input) {
    input.value = text;
    handleSendAI();
  }
}

function localAIResponse(prompt) {
  const q = prompt.toLowerCase();
  if (q.includes('quy định') || q.includes('tối đa') || q.includes('hạn mượn')) {
    return `### 📜 Quy định Mượn - Trả Thư viện:\n\n- **Sinh viên**: Mượn tối đa **3 cuốn/lần**, hạn **14 ngày**.\n- **Giảng viên**: Mượn tối đa **5 cuốn/lần**, hạn **30 ngày**.\n- **Gia hạn**: Tối đa **1 lần (+7 ngày)** nếu không có độc giả khác đặt trước.\n- **Phí phạt trễ hạn**: **5.000 VNĐ / ngày / cuốn**.`;
  }
  if (q.includes('ai') || q.includes('trí tuệ') || q.includes('học máy') || q.includes('deep learning')) {
    return `### 🤖 Gợi ý sách Trí tuệ Nhân tạo & Khoa học Dữ liệu:\n\n1. **Trí tuệ nhân tạo: Tiếp cận hiện đại** (Stuart Russell) - Kệ A2-01.\n2. **Học sâu (Deep Learning) từ cơ bản đến ứng dụng** (Ian Goodfellow) - Kệ A2-02.\n\n💡 *Gợi ý*: Cả hai sách đều có bản dịch tiếng Việt chất lượng cao tại thư viện!`;
  }
  if (q.includes('code') || q.includes('lập trình') || q.includes('web')) {
    return `### 💻 Sách Lập trình & Kỹ thuật phần mềm:\n\n1. **Clean Code - Nghệ thuật viết code sạch** (Robert C. Martin) - Kệ A1-02.\n2. **Lập trình Web hiện đại với React & Node.js** - Kệ A1-04.\n3. **Cấu trúc dữ liệu và Giải thuật nâng cao** - Kệ A1-01.`;
  }
  return `Chào bạn! Tôi là **Trợ lý AI Thư viện** (Đồ án Lab 02 - Phan Văn Quân - 29214663437).\n\nBạn có thể hỏi tôi về quy định mượn sách, tra cứu vị trí các đầu sách CNTT, AI, Kinh tế, hoặc gợi ý tài liệu học tập phù hợp!`;
}

// Helper Functions
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

function getStatusBadge(status) {
  switch (status) {
    case 'borrowing': return '<span class="badge badge-info"><i class="fas fa-book-reader"></i> Đang mượn</span>';
    case 'overdue': return '<span class="badge badge-danger"><i class="fas fa-exclamation-circle"></i> Quá hạn</span>';
    case 'returned': return '<span class="badge badge-success"><i class="fas fa-check"></i> Đã trả</span>';
    default: return `<span class="badge badge-secondary">${status}</span>`;
  }
}

function formatMarkdownToHTML(md) {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n\n/gim, '<br><br>')
    .replace(/\n/gim, '<br>');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function saveLocalData() {
  localStorage.setItem('lib_books', JSON.stringify(APP_STATE.books));
  localStorage.setItem('lib_readers', JSON.stringify(APP_STATE.readers));
  localStorage.setItem('lib_borrows', JSON.stringify(APP_STATE.borrows));
  calculateLocalStats();
}

// Modal Helpers
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}

function openBorrowModalWithBook(bookId) {
  populateBorrowModalOptions(bookId);
  openModal('modal-borrow');
}

function populateBorrowModalOptions(selectedBookId = '') {
  const readerSelect = document.getElementById('borrow-modal-reader-select');
  const bookSelect = document.getElementById('borrow-modal-book-select');

  if (readerSelect) {
    readerSelect.innerHTML = '<option value="">-- Chọn độc giả mượn --</option>' + 
      APP_STATE.readers.map(r => `
        <option value="${r.id}" ${r.status !== 'active' ? 'disabled' : ''}>
          ${r.name} (${r.id}) - Đang mượn ${r.currentBorrowCount}/${r.maxBorrow} ${r.status !== 'active' ? '[Khóa]' : ''}
        </option>
      `).join('');
  }

  if (bookSelect) {
    bookSelect.innerHTML = '<option value="">-- Chọn sách cần mượn --</option>' + 
      APP_STATE.books.map(b => `
        <option value="${b.id}" ${b.id === selectedBookId ? 'selected' : ''} ${b.availableCopies <= 0 ? 'disabled' : ''}>
          ${b.title} [Còn ${b.availableCopies}/${b.totalCopies}]
        </option>
      `).join('');
  }
}

// Event Listeners setup
function setupEventListeners() {
  // Theme Toggle
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);

  // Books search and view toggle
  document.getElementById('books-search-input')?.addEventListener('input', renderBooks);
  document.getElementById('books-category-filter')?.addEventListener('change', renderBooks);
  document.getElementById('btn-view-grid')?.addEventListener('click', () => {
    APP_STATE.booksView = 'grid';
    renderBooks();
  });
  document.getElementById('btn-view-table')?.addEventListener('click', () => {
    APP_STATE.booksView = 'table';
    renderBooks();
  });

  // Readers search
  document.getElementById('readers-search-input')?.addEventListener('input', renderReaders);

  // Borrows filter
  document.getElementById('borrows-status-filter')?.addEventListener('change', renderBorrows);

  // Catalog search input
  document.getElementById('catalog-search-keyword')?.addEventListener('input', renderCatalogSearch);

  // AI chat send
  document.getElementById('ai-chat-send-btn')?.addEventListener('click', handleSendAI);
  document.getElementById('ai-chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendAI();
  });

  // Save Gemini Key
  document.getElementById('btn-save-api-key')?.addEventListener('click', () => {
    const key = document.getElementById('gemini-api-key-input')?.value.trim();
    APP_STATE.aiApiKey = key;
    localStorage.setItem('gemini_api_key', key);
    showToast('Đã lưu cấu hình Google Gemini API Key thành công!', 'success');
  });

  // Export & Reset
  document.getElementById('btn-export-json')?.addEventListener('click', exportDataJSON);
  document.getElementById('btn-reset-data')?.addEventListener('click', resetAllData);
}

function exportDataJSON() {
  const data = {
    books: APP_STATE.books,
    readers: APP_STATE.readers,
    borrows: APP_STATE.borrows,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DuLieu_ThuVien_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showToast('Đã xuất dữ liệu thư viện thành công!', 'success');
}

async function resetAllData() {
  if (!confirm('Bạn có chắc chắn muốn khôi phục toàn bộ dữ liệu mẫu ban đầu?')) return;
  if (APP_STATE.isApiMode) {
    await fetch(`${APP_STATE.apiBase}/api/reset`, { method: 'POST' });
  } else {
    localStorage.clear();
    initLocalStorage();
  }
  await loadData();
  renderCurrentTab();
  showToast('Đã khôi phục dữ liệu ban đầu thành công!', 'success');
}

// Add/Edit Book & Reader Modals
function openAddBookModal() {
  document.getElementById('form-book-title').innerText = 'Thêm Sách Mới';
  document.getElementById('book-form').reset();
  document.getElementById('book-id').value = `B0${APP_STATE.books.length + 1}`;
  openModal('modal-book');
}

function openEditBookModal(bookId) {
  const b = APP_STATE.books.find(x => x.id === bookId);
  if (!b) return;
  document.getElementById('form-book-title').innerText = 'Chỉnh sửa Sách';
  document.getElementById('book-id').value = b.id;
  document.getElementById('book-isbn').value = b.isbn;
  document.getElementById('book-title').value = b.title;
  document.getElementById('book-author').value = b.author;
  document.getElementById('book-publisher').value = b.publisher;
  document.getElementById('book-year').value = b.publishYear;
  document.getElementById('book-category').value = b.categoryId;
  document.getElementById('book-total').value = b.totalCopies;
  document.getElementById('book-available').value = b.availableCopies;
  document.getElementById('book-location').value = b.location;
  document.getElementById('book-cover').value = b.cover;
  document.getElementById('book-description').value = b.description;
  openModal('modal-book');
}

async function handleSaveBook() {
  const id = document.getElementById('book-id').value;
  const isbn = document.getElementById('book-isbn').value;
  const title = document.getElementById('book-title').value;
  const author = document.getElementById('book-author').value;
  const publisher = document.getElementById('book-publisher').value;
  const publishYear = parseInt(document.getElementById('book-year').value) || 2024;
  const categoryId = document.getElementById('book-category').value;
  const catNames = {
    'CAT01': 'Công nghệ thông tin',
    'CAT02': 'Khoa học dữ liệu & AI',
    'CAT03': 'Kinh tế & Quản trị',
    'CAT04': 'Khoa học & Kỹ thuật',
    'CAT05': 'Kỹ năng sống & Phát triển'
  };
  const categoryName = catNames[categoryId] || 'Tổng hợp';
  const totalCopies = parseInt(document.getElementById('book-total').value) || 1;
  const availableCopies = parseInt(document.getElementById('book-available').value) || 1;
  const location = document.getElementById('book-location').value;
  const cover = document.getElementById('book-cover').value;
  const description = document.getElementById('book-description').value;

  if (!title || !author || !isbn) {
    showToast('Vui lòng điền đủ Tiêu đề, Tác giả và ISBN!', 'warning');
    return;
  }

  const bookData = {
    id, isbn, title, author, publisher, publishYear,
    categoryId, categoryName, totalCopies, availableCopies,
    location, description, cover
  };

  if (APP_STATE.isApiMode) {
    const isEdit = APP_STATE.books.some(b => b.id === id);
    const url = isEdit ? `${APP_STATE.apiBase}/api/books/${id}` : `${APP_STATE.apiBase}/api/books`;
    const method = isEdit ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });
  } else {
    const idx = APP_STATE.books.findIndex(b => b.id === id);
    if (idx >= 0) {
      APP_STATE.books[idx] = bookData;
    } else {
      APP_STATE.books.push(bookData);
    }
    saveLocalData();
  }

  showToast('Đã lưu thông tin sách thành công!', 'success');
  closeModal('modal-book');
  await loadData();
  renderBooks();
}

async function deleteBookAction(bookId) {
  if (!confirm(`Xác nhận xóa cuốn sách mã ${bookId}?`)) return;
  if (APP_STATE.isApiMode) {
    await fetch(`${APP_STATE.apiBase}/api/books/${bookId}`, { method: 'DELETE' });
  } else {
    APP_STATE.books = APP_STATE.books.filter(b => b.id !== bookId);
    saveLocalData();
  }
  showToast('Đã xóa sách khỏi hệ thống!', 'success');
  await loadData();
  renderBooks();
}

function openAddReaderModal() {
  document.getElementById('reader-form').reset();
  openModal('modal-reader');
}

async function handleSaveReader() {
  const id = document.getElementById('reader-id').value;
  const name = document.getElementById('reader-name').value;
  const email = document.getElementById('reader-email').value;
  const phone = document.getElementById('reader-phone').value;
  const type = document.getElementById('reader-type').value;
  const department = document.getElementById('reader-dept').value;

  if (!id || !name) {
    showToast('Vui lòng nhập Mã độc giả (MSSV) và Họ tên!', 'warning');
    return;
  }

  const readerData = {
    id, name, email, phone, type, department,
    maxBorrow: type === 'Giảng viên' ? 5 : 3,
    status: 'active'
  };

  if (APP_STATE.isApiMode) {
    await fetch(`${APP_STATE.apiBase}/api/readers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readerData)
    });
  } else {
    const idx = APP_STATE.readers.findIndex(r => r.id === id);
    if (idx >= 0) {
      APP_STATE.readers[idx] = { ...APP_STATE.readers[idx], ...readerData };
    } else {
      APP_STATE.readers.push({
        ...readerData,
        createdDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentBorrowCount: 0
      });
    }
    saveLocalData();
  }

  showToast('Đã lưu thông tin độc giả!', 'success');
  closeModal('modal-reader');
  await loadData();
  renderReaders();
}

async function toggleReaderStatus(readerId) {
  const reader = APP_STATE.readers.find(r => r.id === readerId);
  if (!reader) return;
  const nextStatus = reader.status === 'active' ? 'suspended' : 'active';
  reader.status = nextStatus;

  if (APP_STATE.isApiMode) {
    await fetch(`${APP_STATE.apiBase}/api/readers/${readerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reader)
    });
  } else {
    saveLocalData();
  }
  showToast(`Đã ${nextStatus === 'active' ? 'mở khóa' : 'khóa'} thẻ độc giả!`, 'info');
  renderReaders();
}

async function deleteReaderAction(readerId) {
  if (!confirm(`Xác nhận xóa độc giả mã ${readerId}?`)) return;
  if (APP_STATE.isApiMode) {
    await fetch(`${APP_STATE.apiBase}/api/readers/${readerId}`, { method: 'DELETE' });
  } else {
    APP_STATE.readers = APP_STATE.readers.filter(r => r.id !== readerId);
    saveLocalData();
  }
  showToast('Đã xóa độc giả!', 'success');
  await loadData();
  renderReaders();
}
