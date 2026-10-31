/**
 * Controller for Admin Portal - VUA THẺO CÂU PRO
 * Quản lý Sản Phẩm (CRUD), Đơn Hàng, Doanh Thu, Khách Hàng (User)
 */

const adminState = {
  currentTab: 'dashboard',
  products: [],
  orders: [],
  editingProductId: null,
  activeOrderModal: null,
  orderFilter: 'all',
  productSearch: ''
};

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function showAdminToast(message, type = 'success') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white');
  const icon = type === 'success' ? 'check-circle' : 'info';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-semibold ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 0. AUTHENTICATION & SECURITY (PHÂN QUYỀN CHỦ SHOP)
// ==========================================
function getAdminCredentials() {
  const stored = localStorage.getItem('theopro_admin_creds');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.password) return parsed;
    } catch (e) {}
  }
  return { username: 'admin', password: 'admin123', isDefault: true };
}

function checkAdminAuth() {
  // Chỉ chấp nhận phiên đăng nhập đã được xác thực bảo mật
  const isAuth = sessionStorage.getItem('theopro_admin_auth') === 'true';
  const loginScreen = document.getElementById('admin-login-screen');
  const appLayout = document.getElementById('admin-app-layout');

  if (isAuth) {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appLayout) appLayout.classList.remove('hidden');
    return true;
  } else {
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appLayout) appLayout.classList.add('hidden');
    return false;
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const userInput = document.getElementById('admin-user-input')?.value.trim();
  const passInput = document.getElementById('admin-pass-input')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang xác thực...';
    if (window.lucide) lucide.createIcons({ root: submitBtn });
  }

  try {
    const creds = getAdminCredentials();
    let isAuthSuccess = false;

    // 1. Xác thực bảo mật trực tiếp với Supabase Cloud Database
    if (typeof window.dbVerifyAdmin === 'function') {
      try {
        const cloudRes = await window.dbVerifyAdmin(userInput, passInput);
        if (cloudRes && cloudRes.success) {
          isAuthSuccess = true;
          // Lưu đồng bộ vào local cache
          localStorage.setItem('theopro_admin_creds', JSON.stringify({ username: userInput, password: passInput }));
        }
      } catch (cloudErr) {
        console.warn('Lỗi kết nối Cloud, dùng kiểm tra offline:', cloudErr);
      }
    }

    // 2. Fallback nếu Cloud chưa đồng bộ hoặc offline:
    if (!isAuthSuccess) {
      const normUser = (userInput || '').toLowerCase();
      const isUserValid = (normUser === 'admin' || normUser === 'admin@theocau.pro' || userInput === creds.username);
      // Chỉ chấp nhận nếu khớp chính xác với mật khẩu hiện tại trong máy
      if (isUserValid && passInput === creds.password) {
        isAuthSuccess = true;
        // Tự động đẩy mật khẩu này lên Cloud để khắc phục lệch dữ liệu
        if (typeof window.dbChangeAdminPassword === 'function') {
          window.dbChangeAdminPassword('admin123', creds.password).catch(() => {});
        }
      }
    }

    if (isAuthSuccess) {
      sessionStorage.setItem('theopro_admin_auth', 'true');
      if (errorMsg) errorMsg.classList.add('hidden');
      checkAdminAuth();
      loadAdminData();
      switchTab('dashboard');
      showAdminToast('Đăng nhập thành công! Chào mừng chủ shop.', 'success');
    } else {
      if (errorMsg) errorMsg.classList.remove('hidden');
      const passElem = document.getElementById('admin-pass-input');
      if (passElem) {
        passElem.value = '';
        passElem.focus();
      }
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
      if (window.lucide) lucide.createIcons({ root: submitBtn });
    }
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem('theopro_admin_auth');
  checkAdminAuth();
  showAdminToast('Đã đăng xuất khỏi tài khoản quản trị!', 'info');
}

async function handleChangeAdminPassword(e) {
  e.preventDefault();
  const oldPass = document.getElementById('old-pass')?.value.trim();
  const newPass = document.getElementById('new-pass')?.value.trim();
  const confirmPass = document.getElementById('confirm-pass')?.value.trim();
  const creds = getAdminCredentials();

  // 1. Kiểm tra xác thực mật khẩu cũ
  let isOldPassValid = false;
  if (oldPass === creds.password) {
    isOldPassValid = true;
  } else if (typeof window.dbVerifyAdmin === 'function') {
    const verifyCloud = await window.dbVerifyAdmin(creds.username || 'admin', oldPass);
    if (verifyCloud && verifyCloud.success) isOldPassValid = true;
  }

  if (!isOldPassValid) {
    showAdminToast('Mật khẩu hiện tại không chính xác!', 'error');
    return;
  }

  if (!newPass || newPass.length < 6) {
    showAdminToast('Mật khẩu mới phải từ 6 ký tự trở lên!', 'error');
    return;
  }

  if (newPass === 'admin123') {
    showAdminToast('Vui lòng không đặt lại mật khẩu mặc định admin123 vì lý do bảo mật!', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showAdminToast('Xác nhận mật khẩu mới không khớp!', 'error');
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Đang đổi mật khẩu...';
    if (window.lucide) lucide.createIcons({ root: submitBtn });
  }

  // Cập nhật lên Cloud Database (thử đổi từ oldPass hoặc admin123 nếu trước đó cloud chưa update)
  let cloudSynced = false;
  if (typeof window.dbChangeAdminPassword === 'function') {
    try {
      cloudSynced = await window.dbChangeAdminPassword(oldPass, newPass);
      if (!cloudSynced && oldPass !== 'admin123') {
        cloudSynced = await window.dbChangeAdminPassword('admin123', newPass);
      }
    } catch (err) {
      console.warn('Lỗi cập nhật cloud password:', err);
    }
  }

  // Lưu vào bộ nhớ máy tính
  creds.password = newPass;
  delete creds.isDefault;
  localStorage.setItem('theopro_admin_creds', JSON.stringify(creds));

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
    if (window.lucide) lucide.createIcons({ root: submitBtn });
  }

  document.getElementById('old-pass').value = '';
  document.getElementById('new-pass').value = '';
  document.getElementById('confirm-pass').value = '';

  if (cloudSynced) {
    showAdminToast('Đã đổi mật khẩu và đồng bộ Cloud thành công! Mật khẩu cũ và mặc định đã bị vô hiệu hóa hoàn toàn.', 'success');
  } else {
    showAdminToast('Đã đổi mật khẩu thành công trên thiết bị này!', 'success');
  }
}

// Load data
async function loadAdminData() {
  adminState.products = getStoredProducts();
  adminState.orders = getStoredOrders();

  if (typeof dbGetOrders === 'function') {
    const cloudOrders = await dbGetOrders();
    if (cloudOrders && cloudOrders.length > 0) {
      adminState.orders = cloudOrders;
      saveStoredOrders(cloudOrders);
      if (adminState.currentTab === 'dashboard') renderAdminDashboard();
      if (adminState.currentTab === 'orders') renderAdminOrders();
    }
  }
}

// Toggle Sidebar Mobile Drawer
function toggleAdminSidebar(show) {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (!sidebar) return;
  if (show) {
    sidebar.classList.remove('-translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
  } else {
    sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }
}

// Switch Tab
function switchTab(tabName) {
  adminState.currentTab = tabName;
  toggleAdminSidebar(false); // Đóng menu mobile khi chọn tab

  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.className = 'admin-tab-btn flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold bg-sky-600 text-white shadow-lg shadow-sky-600/30 transition-all';
    } else {
      btn.className = 'admin-tab-btn flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all';
    }
  });

  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.add('hidden');
  });

  const activeSection = document.getElementById(`tab-${tabName}`);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  }

  // Render tab specific content
  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'products') renderAdminProducts();
  if (tabName === 'orders') renderAdminOrders();
  if (tabName === 'customers') renderAdminCustomers();
  if (tabName === 'settings') renderAdminSettings();

  lucide.createIcons();
}

// ==========================================
// 1. DASHBOARD & REVENUE ANALYTICS
// ==========================================
function renderDashboard() {
  loadAdminData();

  // Metrics
  const totalRevenue = adminState.orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.totals?.total || 0), 0);
  
  const totalOrders = adminState.orders.length;
  const completedOrders = adminState.orders.filter(o => o.status === 'completed').length;
  const pendingOrders = adminState.orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

  // Unique customers
  const uniquePhones = new Set(adminState.orders.map(o => o.customer?.phone).filter(Boolean));
  const totalCustomers = uniquePhones.size;

  const aov = totalOrders > 0 ? Math.round(totalRevenue / (totalOrders - adminState.orders.filter(o => o.status === 'cancelled').length || 1)) : 0;

  // Update metric elements
  document.getElementById('metric-revenue').textContent = formatVND(totalRevenue);
  document.getElementById('metric-orders').textContent = totalOrders;
  document.getElementById('metric-customers').textContent = totalCustomers;
  document.getElementById('metric-aov').textContent = formatVND(aov);
  document.getElementById('metric-pending').textContent = pendingOrders;

  // Render Recent Orders Mini Table
  const recentOrdersList = document.getElementById('dashboard-recent-orders');
  if (recentOrdersList) {
    const recent = adminState.orders.slice(0, 5);
    recentOrdersList.innerHTML = recent.map(o => {
      const statusBadge = getStatusBadge(o.status);
      return `
        <tr class="hover:bg-slate-800/40 transition-colors border-b border-slate-800">
          <td class="p-3 font-mono font-bold text-sky-400 text-xs">${o.orderId}</td>
          <td class="p-3 text-xs font-semibold text-white">${o.customer.name}</td>
          <td class="p-3 text-xs text-slate-400">${o.customer.phone}</td>
          <td class="p-3 text-xs font-extrabold text-amber-400">${formatVND(o.totals.total)}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-right">
            <button onclick="viewOrderDetail('${o.orderId}')" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-[11px] font-bold">
              Xem
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Top Selling Products Mini List
  const topProductsList = document.getElementById('dashboard-top-products');
  if (topProductsList) {
    const sorted = [...adminState.products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);
    topProductsList.innerHTML = sorted.map((p, idx) => `
      <div class="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-lg bg-sky-950 text-sky-400 font-extrabold text-xs flex items-center justify-center">#${idx + 1}</span>
          <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover bg-slate-800" />
          <div>
            <h5 class="text-xs font-bold text-white line-clamp-1">${p.name}</h5>
            <span class="text-[11px] text-amber-400 font-bold">${formatVND(p.price)}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs font-bold text-emerald-400">${p.soldCount} vỉ</div>
          <span class="text-[10px] text-slate-500">Đã bán</span>
        </div>
      </div>
    `).join('');
  }
}

// Status Badge Helper
function getStatusBadge(status) {
  const map = {
    'pending': { text: 'Chờ Duyệt', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    'processing': { text: 'Đang Tóm', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'shipping': { text: 'Đang Giao', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    'completed': { text: 'Hoàn Tất', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'cancelled': { text: 'Đã Hủy', bg: 'bg-red-500/10 text-red-400 border-red-500/20' }
  };
  const c = map[status] || map.pending;
  return `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.bg}">${c.text}</span>`;
}

// ==========================================
// 2. PRODUCT MANAGEMENT (CRUD)
// ==========================================
function renderAdminProducts() {
  loadAdminData();
  const container = document.getElementById('admin-products-table-body');
  const countEl = document.getElementById('admin-products-count');
  if (!container) return;

  let list = [...adminState.products];
  if (adminState.productSearch.trim()) {
    const q = adminState.productSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (countEl) countEl.textContent = `Tổng cộng: ${list.length} sản phẩm thẻo & phụ kiện`;

  container.innerHTML = list.map(p => `
    <tr class="hover:bg-slate-800/40 transition-colors border-b border-slate-800 text-xs">
      <td class="p-3">
        <div class="flex items-center gap-3">
          <img src="${p.image}" alt="${p.name}" class="w-12 h-12 rounded-xl object-cover bg-slate-800 flex-shrink-0" />
          <div class="min-w-0">
            <h4 class="font-bold text-white text-xs line-clamp-1">${p.name}</h4>
            <div class="text-[11px] text-slate-400">${p.specs?.lineMaterial || 'Carbon Coated'} | ${p.specs?.lineSize || ''}</div>
          </div>
        </div>
      </td>
      <td class="p-3 text-slate-300 font-medium">
        <span class="bg-slate-800 px-2.5 py-1 rounded-lg text-[11px] text-sky-300">
          ${p.category}
        </span>
      </td>
      <td class="p-3 font-extrabold text-amber-400 text-sm">
        ${formatVND(p.price)}
        ${p.originalPrice ? `<div class="text-[10px] text-slate-500 line-through font-normal">${formatVND(p.originalPrice)}</div>` : ''}
      </td>
      <td class="p-3 text-slate-300 font-semibold">
        ${p.soldCount || 0} vỉ
      </td>
      <td class="p-3">
        ${p.badge ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded ${p.badgeColor || 'bg-sky-600'} text-white">${p.badge}</span>` : '<span class="text-slate-600">-</span>'}
      </td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="openEditProductModal(${p.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-sky-400 hover:text-white transition-colors" title="Sửa giá & thông tin">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteProduct(${p.id})" class="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors" title="Xóa sản phẩm">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons({ root: container });
}

// ==========================================
// HÀM XỬ LÝ & NÉN ẢNH TỪ ĐIỆN THOẠI (CANVAS COMPRESSOR)
// ==========================================
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Vui lòng chọn tệp hình ảnh'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Không thể tải ảnh'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc dữ liệu tệp'));
    reader.readAsDataURL(file);
  });
}

function setProductImageState(imgUrl) {
  const input = document.getElementById('prod-form-image');
  const preview = document.getElementById('prod-image-preview');
  const placeholder = document.getElementById('prod-image-placeholder');
  const removeBtn = document.getElementById('btn-remove-prod-image');
  const urlInput = document.getElementById('prod-form-url-input');

  if (input) input.value = imgUrl || '';
  if (urlInput) urlInput.value = (imgUrl && imgUrl.startsWith('http')) ? imgUrl : '';

  if (imgUrl) {
    if (preview) {
      preview.src = imgUrl;
      preview.classList.remove('hidden');
    }
    if (placeholder) placeholder.classList.add('hidden');
    if (removeBtn) removeBtn.classList.remove('hidden');
  } else {
    if (preview) {
      preview.src = '';
      preview.classList.add('hidden');
    }
    if (placeholder) placeholder.classList.remove('hidden');
    if (removeBtn) removeBtn.classList.add('hidden');
  }
}

function clearProductImage() {
  setProductImageState('');
  const fileInput = document.getElementById('prod-file-input');
  if (fileInput) fileInput.value = '';
}

function toggleImageUrlInput() {
  const wrap = document.getElementById('prod-url-wrap');
  if (wrap) wrap.classList.toggle('hidden');
}

function handleProductUrlInput(val) {
  setProductImageState(val.trim());
}

async function handleProductImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    showAdminToast('Đang nén & tối ưu ảnh chụp từ điện thoại...', 'info');
    const compressedDataUrl = await compressImage(file, 900, 900, 0.75);
    setProductImageState(compressedDataUrl);
    showAdminToast('Đã tải ảnh chụp thành công!', 'success');
  } catch (err) {
    console.error('Lỗi đọc ảnh:', err);
    showAdminToast('Lỗi khi đọc file ảnh: ' + err.message, 'error');
  }
}

function openAddProductModal() {
  adminState.editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Thêm Mới Thẻo Câu Cá';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-category').value = 'theo-dai';
  document.getElementById('prod-form-price').value = '';
  document.getElementById('prod-form-orig-price').value = '';
  document.getElementById('prod-form-badge').value = 'Mới Ra Mắt';
  document.getElementById('prod-form-desc').value = '';
  document.getElementById('prod-form-line').value = '#1.5 (Tải 5.5kg)';
  document.getElementById('prod-form-hook').value = 'Iseama #6 Có Ngạnh';

  setProductImageState('https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80');

  document.getElementById('admin-product-modal').classList.remove('hidden');
  lucide.createIcons();
}

function openEditProductModal(productId) {
  loadAdminData();
  const product = adminState.products.find(p => p.id === productId);
  if (!product) return;

  adminState.editingProductId = productId;
  document.getElementById('product-modal-title').textContent = `Chỉnh Sửa: ${product.name}`;
  document.getElementById('prod-form-id').value = product.id;
  document.getElementById('prod-form-name').value = product.name;
  document.getElementById('prod-form-category').value = product.category || 'theo-dai';
  document.getElementById('prod-form-price').value = product.price;
  document.getElementById('prod-form-orig-price').value = product.originalPrice || '';
  document.getElementById('prod-form-badge').value = product.badge || '';
  document.getElementById('prod-form-desc').value = product.shortDesc || '';
  document.getElementById('prod-form-line').value = product.specs?.lineSize || '';
  document.getElementById('prod-form-hook').value = product.specs?.hookModel || '';

  setProductImageState(product.image || '');

  document.getElementById('admin-product-modal').classList.remove('hidden');
  lucide.createIcons();
}

function closeProductModal() {
  document.getElementById('admin-product-modal').classList.add('hidden');
}

function saveProductSubmit(e) {
  e.preventDefault();
  loadAdminData();

  const idVal = document.getElementById('prod-form-id').value;
  const name = document.getElementById('prod-form-name').value.trim();
  const category = document.getElementById('prod-form-category').value;
  const price = parseInt(document.getElementById('prod-form-price').value) || 0;
  const originalPrice = parseInt(document.getElementById('prod-form-orig-price').value) || Math.round(price * 1.3);
  const image = document.getElementById('prod-form-image').value.trim();
  const badge = document.getElementById('prod-form-badge').value.trim();
  const desc = document.getElementById('prod-form-desc').value.trim();
  const lineSize = document.getElementById('prod-form-line').value.trim();
  const hookModel = document.getElementById('prod-form-hook').value.trim();

  if (!name || price <= 0) {
    showAdminToast('Vui lòng nhập tên và giá sản phẩm hợp lệ', 'error');
    return;
  }

  if (idVal) {
    // Edit existing
    const idx = adminState.products.findIndex(p => p.id === parseInt(idVal));
    if (idx > -1) {
      adminState.products[idx].name = name;
      adminState.products[idx].category = category;
      adminState.products[idx].price = price;
      adminState.products[idx].originalPrice = originalPrice;
      adminState.products[idx].image = image;
      adminState.products[idx].badge = badge;
      adminState.products[idx].shortDesc = desc;
      if (!adminState.products[idx].specs) adminState.products[idx].specs = {};
      adminState.products[idx].specs.lineSize = lineSize;
      adminState.products[idx].specs.hookModel = hookModel;

      // Đồng bộ tới Backend API
      if (window.location.protocol.startsWith('http')) {
        fetch(`/api/products/${idVal}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adminState.products[idx])
        }).catch(e => console.log('API sync:', e));
      }

      showAdminToast(`Đã cập nhật sản phẩm "${name}" thành công!`, 'success');
    }
  } else {
    // Add new
    const newId = Date.now();
    const newProduct = {
      id: newId,
      name,
      category,
      price,
      originalPrice,
      rating: 5.0,
      reviewsCount: 1,
      soldCount: 0,
      badge: badge || 'Hàng Mới',
      badgeColor: 'bg-emerald-600',
      image: image || 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
      shortDesc: desc || 'Thẻo câu cá buộc tay cao cấp',
      targetFish: ['Cá Chép', 'Cá Rô Phi'],
      style: 'Câu Đài Chuyên Nghiệp',
      specs: {
        lineMaterial: 'Fluorocarbon Nhật Bản',
        lineSize: lineSize || '#1.5 (Tải 5.5kg)',
        hookModel: hookModel || 'Lưỡi thép đen',
        hookSize: '#5, #7',
        rigLength: '25cm',
        craft: 'Buộc tay thủ công',
        pack: 'Vỉ 10 bộ thẻo đôi'
      },
      variants: [
        { name: 'Cước chuẩn - Lưỡi thông dụng', price: price }
      ]
    };
    adminState.products.unshift(newProduct);

    // Đồng bộ tới Backend API
    if (window.location.protocol.startsWith('http')) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(e => console.log('API sync:', e));
    }

    showAdminToast(`Đã thêm mới thẻo "${name}" thành công!`, 'success');
  }

  saveStoredProducts(adminState.products);
  closeProductModal();
  renderAdminProducts();
}

function deleteProduct(productId) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm thẻo này?')) return;
  loadAdminData();
  adminState.products = adminState.products.filter(p => p.id !== productId);
  saveStoredProducts(adminState.products);

  if (window.location.protocol.startsWith('http')) {
    fetch(`/api/products/${productId}`, { method: 'DELETE' }).catch(e => console.log('API sync delete:', e));
  }

  showAdminToast('Đã xóa sản phẩm thành công!', 'info');
  renderAdminProducts();
}

// ==========================================
// 3. ORDER MANAGEMENT & STATUS
// ==========================================
function renderAdminOrders() {
  loadAdminData();
  const container = document.getElementById('admin-orders-table-body');
  const countEl = document.getElementById('admin-orders-count');
  if (!container) return;

  let list = [...adminState.orders];
  if (adminState.orderFilter !== 'all') {
    list = list.filter(o => o.status === adminState.orderFilter);
  }

  if (countEl) countEl.textContent = `Tổng cộng: ${list.length} đơn hàng`;

  container.innerHTML = list.map(o => `
    <tr class="hover:bg-slate-800/40 transition-colors border-b border-slate-800 text-xs">
      <td class="p-3">
        <span class="font-mono font-bold text-sky-400 block">${o.orderId}</span>
        <span class="text-[10px] text-slate-500">${o.createdAt}</span>
      </td>
      <td class="p-3">
        <div class="font-bold text-white">${o.customer?.name}</div>
        <div class="text-[11px] text-slate-400">${o.customer?.phone}</div>
        <div class="text-[10px] text-slate-500 truncate max-w-xs">${o.customer?.address}, ${o.customer?.city}</div>
      </td>
      <td class="p-3">
        <div class="space-y-0.5 text-[11px] max-w-xs">
          ${o.items?.map(i => `<div class="truncate text-slate-300">• ${i.name} (x${i.quantity})</div>`).join('') || ''}
        </div>
      </td>
      <td class="p-3">
        <div class="font-extrabold text-amber-400 text-sm">${formatVND(o.totals?.total || 0)}</div>
        <span class="text-[10px] uppercase font-bold text-slate-400">${o.paymentMethod === 'cod' ? 'COD Khi Nhận' : 'VietQR Ngân Hàng'}</span>
      </td>
      <td class="p-3">
        <select onchange="updateOrderStatus('${o.orderId}', this.value)" class="bg-slate-900 border border-slate-700 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 ${getStatusSelectColor(o.status)}">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ Xác Nhận</option>
          <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang Tóm Thẻo</option>
          <option value="shipping" ${o.status === 'shipping' ? 'selected' : ''}>Đang Vận Chuyển</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Đã Hoàn Tất</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Hủy Đơn</option>
        </select>
      </td>
      <td class="p-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          <button onclick="viewOrderDetail('${o.orderId}')" class="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-sky-400 hover:text-white transition-colors" title="Xem chi tiết đơn">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button onclick="deleteOrder('${o.orderId}')" class="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors" title="Xóa đơn">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  lucide.createIcons({ root: container });
}

function getStatusSelectColor(status) {
  if (status === 'completed') return 'text-emerald-400 border-emerald-500/40';
  if (status === 'shipping') return 'text-sky-400 border-sky-500/40';
  if (status === 'processing') return 'text-blue-400 border-blue-500/40';
  if (status === 'cancelled') return 'text-red-400 border-red-500/40';
  return 'text-amber-400 border-amber-500/40';
}

function updateOrderStatus(orderId, newStatus) {
  loadAdminData();
  const order = adminState.orders.find(o => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
    saveStoredOrders(adminState.orders);

    if (typeof dbUpdateOrderStatus === 'function') {
      dbUpdateOrderStatus(orderId, newStatus);
    }

    if (window.location.protocol.startsWith('http')) {
      fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(e => console.log('API sync status:', e));
    }

    showAdminToast(`Đã chuyển đơn ${orderId} sang trạng thái: "${getStatusBadge(newStatus)}"`, 'success');
    renderAdminOrders();
  }
}

function deleteOrder(orderId) {
  if (!confirm(`Xóa vĩnh viễn đơn hàng ${orderId}?`)) return;
  loadAdminData();
  adminState.orders = adminState.orders.filter(o => o.orderId !== orderId);
  saveStoredOrders(adminState.orders);
  showAdminToast(`Đã xóa đơn ${orderId}!`, 'info');
  renderAdminOrders();
}

function filterOrders(status) {
  adminState.orderFilter = status;
  document.querySelectorAll('.order-filter-btn').forEach(btn => {
    if (btn.dataset.status === status) {
      btn.className = 'order-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-sm';
    } else {
      btn.className = 'order-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800';
    }
  });
  renderAdminOrders();
}

function viewOrderDetail(orderId) {
  loadAdminData();
  const order = adminState.orders.find(o => o.orderId === orderId);
  if (!order) return;

  const modal = document.getElementById('admin-order-detail-modal');
  const content = document.getElementById('admin-order-detail-content');

  content.innerHTML = `
    <div class="p-6 space-y-5 text-white">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span class="text-xs text-slate-400">Chi Tiết Đơn Hàng</span>
          <h3 class="text-lg font-mono font-bold text-sky-400">#${order.orderId}</h3>
        </div>
        <div class="text-right">
          <div class="text-xs text-slate-400">${order.createdAt}</div>
          <div class="mt-1">${getStatusBadge(order.status)}</div>
        </div>
      </div>

      <!-- Customer info card -->
      <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
        <div class="font-bold text-white flex items-center gap-1.5 text-sm mb-2 text-sky-400">
          <i data-lucide="user" class="w-4 h-4"></i> Thông Tin Khách Hàng
        </div>
        <div>Họ và tên: <strong class="text-white">${order.customer?.name}</strong></div>
        <div>Số điện thoại: <strong class="text-amber-400">${order.customer?.phone}</strong></div>
        <div>Địa chỉ nhận: <span class="text-slate-300">${order.customer?.address}, ${order.customer?.city}</span></div>
        ${order.customer?.notes ? `<div>Ghi chú: <span class="italic text-slate-400">${order.customer.notes}</span></div>` : ''}
        <div>Thanh toán: <strong class="text-emerald-400">${order.paymentMethod === 'cod' ? 'Thanh toán COD khi nhận hàng' : 'Chuyển khoản VietQR'}</strong></div>
      </div>

      <!-- Items Table -->
      <div class="border border-slate-800 rounded-2xl overflow-hidden text-xs">
        <div class="bg-slate-900 px-4 py-2.5 font-bold text-slate-400 border-b border-slate-800">
          Danh Sách Thẻo & Sản Phẩm Đặt Mua
        </div>
        <div class="divide-y divide-slate-800 bg-slate-950/60 p-2">
          ${order.items?.map(item => `
            <div class="p-2.5 flex items-center justify-between">
              <div>
                <div class="font-bold text-white">${item.name}</div>
                ${item.variantName ? `<div class="text-[11px] text-slate-400">${item.variantName}</div>` : ''}
                <div class="text-slate-500 text-[11px]">Đơn giá: ${formatVND(item.price)} x ${item.quantity}</div>
              </div>
              <div class="font-bold text-white">${formatVND(item.price * item.quantity)}</div>
            </div>
          `).join('') || ''}
        </div>
      </div>

      <!-- Totals calculation -->
      <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
        <div class="flex justify-between text-slate-400">
          <span>Tạm tính hàng:</span>
          <span class="text-white font-semibold">${formatVND(order.totals?.subtotal || 0)}</span>
        </div>
        <div class="flex justify-between text-slate-400">
          <span>Phí vận chuyển:</span>
          <span class="text-white font-semibold">${order.totals?.shipping === 0 ? 'Miễn phí' : formatVND(order.totals?.shipping || 0)}</span>
        </div>
        ${order.totals?.discount > 0 ? `
          <div class="flex justify-between text-emerald-400">
            <span>Giảm giá khuyến mãi:</span>
            <span>-${formatVND(order.totals.discount)}</span>
          </div>
        ` : ''}
        <div class="pt-2 border-t border-slate-800 flex justify-between items-baseline text-sm font-bold">
          <span>Tổng thu khách:</span>
          <span class="text-xl font-extrabold text-amber-400">${formatVND(order.totals?.total || 0)}</span>
        </div>
      </div>

      <div class="pt-3 flex justify-between">
        <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
          <i data-lucide="printer" class="w-4 h-4"></i> In Hóa Đơn
        </button>
        <button onclick="closeOrderDetailModal()" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold">
          Đóng
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons({ root: content });
}

function closeOrderDetailModal() {
  document.getElementById('admin-order-detail-modal').classList.add('hidden');
}

// ==========================================
// 4. CUSTOMER / USER MANAGEMENT (CRM)
// ==========================================
function renderAdminCustomers() {
  loadAdminData();
  const container = document.getElementById('admin-customers-table-body');
  const countEl = document.getElementById('admin-customers-count');
  if (!container) return;

  // Aggregate customers from orders
  const customerMap = {};
  adminState.orders.forEach(o => {
    const phone = o.customer?.phone;
    if (!phone) return;

    if (!customerMap[phone]) {
      customerMap[phone] = {
        name: o.customer.name,
        phone: phone,
        address: `${o.customer.address}, ${o.customer.city}`,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: o.createdAt
      };
    }

    customerMap[phone].ordersCount++;
    if (o.status !== 'cancelled') {
      customerMap[phone].totalSpent += (o.totals?.total || 0);
    }
  });

  const customerList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  if (countEl) countEl.textContent = `Tổng cộng: ${customerList.length} khách hàng đã lưu`;

  container.innerHTML = customerList.map(c => {
    let rankBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">Khách Mới</span>';
    if (c.totalSpent >= 500000) {
      rankBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">CẦN THỦ VIP ⭐</span>';
    } else if (c.ordersCount >= 2) {
      rankBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Khách Thân Thiết</span>';
    }

    return `
      <tr class="hover:bg-slate-800/40 transition-colors border-b border-slate-800 text-xs">
        <td class="p-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-slate-800 text-sky-400 font-bold flex items-center justify-center flex-shrink-0">
              ${c.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="font-bold text-white text-xs">${c.name}</div>
              <div class="text-[11px] text-slate-400">${c.phone}</div>
            </div>
          </div>
        </td>
        <td class="p-3 text-slate-400 text-[11px]">
          ${c.address}
        </td>
        <td class="p-3 font-bold text-center text-white">
          ${c.ordersCount} đơn
        </td>
        <td class="p-3 font-extrabold text-amber-400 text-sm">
          ${formatVND(c.totalSpent)}
        </td>
        <td class="p-3">
          ${rankBadge}
        </td>
        <td class="p-3 text-right">
          <div class="flex items-center justify-end gap-2">
            <a href="tel:${c.phone}" class="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-sky-400 hover:text-white transition-colors" title="Gọi điện">
              <i data-lucide="phone" class="w-3.5 h-3.5"></i>
            </a>
            <a href="https://zalo.me/${c.phone}" target="_blank" rel="noopener" class="p-2 rounded-xl bg-slate-800 hover:bg-sky-600 text-sky-400 hover:text-white transition-colors" title="Nhắn tin Zalo">
              <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons({ root: container });
}

// ==========================================
// 5. STORE SETTINGS
// ==========================================
function renderAdminSettings() {
  const hotline = localStorage.getItem('theopro_hotline') || '0988.776.655';
  const bankAcc = localStorage.getItem('theopro_bank_acc') || '0988776655';
  const bankName = localStorage.getItem('theopro_bank_name') || 'MB Bank (Quân Đội)';
  const bankOwner = localStorage.getItem('theopro_bank_owner') || 'VUA THEO CAU VIET NAM';

  document.getElementById('set-hotline').value = hotline;
  document.getElementById('set-bank-acc').value = bankAcc;
  document.getElementById('set-bank-name').value = bankName;
  document.getElementById('set-bank-owner').value = bankOwner;

  renderAdminHeroBanners();
}

function saveSettingsSubmit(e) {
  e.preventDefault();
  const hotline = document.getElementById('set-hotline').value.trim();
  const bankAcc = document.getElementById('set-bank-acc').value.trim();
  const bankName = document.getElementById('set-bank-name').value.trim();
  const bankOwner = document.getElementById('set-bank-owner').value.trim();

  localStorage.setItem('theopro_hotline', hotline);
  localStorage.setItem('theopro_bank_acc', bankAcc);
  localStorage.setItem('theopro_bank_name', bankName);
  localStorage.setItem('theopro_bank_owner', bankOwner);

  showAdminToast('Đã lưu cấu hình cửa hàng thành công!', 'success');
}

// ==========================================
// 6. QUẢN LÝ ẢNH BANNER TRÌNH CHIẾU TRANG CHỦ (HERO SHOWCASE)
// ==========================================
const DEFAULT_HERO_SLIDES = [
  {
    tag: '🔥 Thẻo Săn Hàng Đài 2026',
    title: 'Cấu Tạo Thẻo Đôi Chống Xoắn 7 Khóa Kép',
    desc: 'Mối buộc không rạn cước, dàn lưỡi BKK Titan tôi nhiệt đâm xuyên cá trắm chép 8-25kg.',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=1000&q=80',
    spec1Title: 'Độ Dài Thẻo Chuẩn:',
    spec1Val: '18cm - 45cm (Lệch 4cm)',
    spec2Title: 'Lực Tải Kéo Đứt:',
    spec2Val: '3.5kg - 28.0kg',
    btnText: 'Xem Chi Tiết Thẻo Săn Hàng BKK',
    actionType: 'quickview',
    actionValue: 2
  },
  {
    tag: '✨ Tàng Hình Toray Nhật Bản',
    title: 'Thẻo Rô Phi Thi Đấu Lưỡi Sode Bén Ngót',
    desc: '100% cước Fluorocarbon Nhật Bản tàng hình dưới nước, cá nhát mồi hút phao cực bén.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=1000&q=80',
    spec1Title: 'Cước Tàng Hình:',
    spec1Val: 'Toray 100% Carbon',
    spec2Title: 'Mã Lưỡi Thi Đấu:',
    spec2Val: 'Sode #4 - Sode #6',
    btnText: 'Xem Chi Tiết Thẻo Rô Phi',
    actionType: 'quickview',
    actionValue: 1
  },
  {
    tag: '🛠️ Nghệ Nhân Tóm Tay Thủ Công',
    title: 'Xưởng Tự Tóm Thẻo Theo Yêu Cầu Cần Thủ',
    desc: 'Tự do chọn cỡ cước, loại lưỡi, chiều dài lệch và hạt silicon chia chữ T chống xoắn.',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1000&q=80',
    spec1Title: 'Quy Cách Tự Chọn:',
    spec1Val: 'Tự phối 100% kích cỡ',
    spec2Title: 'Cam Kết Chất Lượng:',
    spec2Val: 'Bảo hành đổi mới 1-1',
    btnText: 'Tự Cấu Hình Thẻo Của Bạn',
    actionType: 'scroll',
    actionValue: '#xuong-tu-tom'
  }
];

function getHeroBannersData() {
  const stored = localStorage.getItem('theopro_hero_banners');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES));
}

function renderAdminHeroBanners() {
  const container = document.getElementById('admin-banner-slides-list');
  if (!container) return;

  const slides = getHeroBannersData();
  container.innerHTML = slides.map((slide, idx) => `
    <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
      <div class="flex items-center justify-between">
        <span class="font-bold text-white text-xs flex items-center gap-1.5">
          <span class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-extrabold flex items-center justify-center text-[10px]">${idx + 1}</span>
          Slide ${idx + 1}: ${slide.title || 'Slide Banner'}
        </span>
        <span class="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-semibold">${slide.tag || ''}</span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Thumbnail Preview -->
        <div class="w-full sm:w-48 h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0 relative group">
          <img id="banner-preview-${idx}" src="${slide.image}" class="w-full h-full object-cover" alt="Slide ${idx + 1}" />
        </div>

        <!-- Controls -->
        <div class="flex-1 space-y-2">
          <input 
            type="file" 
            id="banner-file-input-${idx}" 
            accept="image/*" 
            class="hidden" 
            onchange="handleBannerImageUpload(${idx}, event)" 
          />

          <button 
            type="button" 
            onclick="document.getElementById('banner-file-input-${idx}').click()" 
            class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
          >
            <i data-lucide="camera" class="w-4 h-4"></i>
            <span>📸 Chụp ảnh / Chọn ảnh từ điện thoại</span>
          </button>

          <div>
            <label class="block text-[10px] text-slate-400 mb-0.5 font-semibold">Tiêu đề slide trình chiếu:</label>
            <input 
              type="text" 
              value="${slide.title || ''}" 
              onchange="handleBannerTextChange(${idx}, 'title', this.value)"
              class="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500" 
            />
          </div>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons({ root: container });
}

async function handleBannerImageUpload(index, event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    showAdminToast(`Đang nén & tối ưu ảnh slide ${index + 1}...`, 'info');
    const compressedDataUrl = await compressImage(file, 1200, 800, 0.78);
    const slides = getHeroBannersData();
    slides[index].image = compressedDataUrl;
    localStorage.setItem('theopro_hero_banners', JSON.stringify(slides));
    renderAdminHeroBanners();
    showAdminToast(`Đã thay đổi ảnh slide ${index + 1} thành công! Ra trang chủ để xem ngay.`, 'success');
  } catch (err) {
    console.error('Lỗi upload banner:', err);
    showAdminToast('Lỗi khi tải ảnh: ' + err.message, 'error');
  }
}

function handleBannerTextChange(index, field, value) {
  const slides = getHeroBannersData();
  slides[index][field] = value.trim();
  localStorage.setItem('theopro_hero_banners', JSON.stringify(slides));
  showAdminToast('Đã lưu nội dung slide banner!', 'success');
}

function resetDefaultHeroBanners() {
  if (!confirm('Khôi phục lại 3 ảnh banner mẫu ban đầu của xưởng?')) return;
  localStorage.removeItem('theopro_hero_banners');
  renderAdminHeroBanners();
  showAdminToast('Đã khôi phục banner về ảnh gốc!', 'info');
}

// Global search input listener
function setupAdminSearch() {
  const prodSearch = document.getElementById('admin-prod-search');
  if (prodSearch) {
    prodSearch.addEventListener('input', (e) => {
      adminState.productSearch = e.target.value;
      renderAdminProducts();
    });
  }
}

// Init Admin
document.addEventListener('DOMContentLoaded', () => {
  setupAdminSearch();
  if (checkAdminAuth()) {
    loadAdminData();
    switchTab('dashboard');
  }
  lucide.createIcons();
});

