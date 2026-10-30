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
      return JSON.parse(stored);
    } catch (e) {}
  }
  const defaultCreds = { username: 'admin', password: 'admin123' };
  localStorage.setItem('theopro_admin_creds', JSON.stringify(defaultCreds));
  return defaultCreds;
}

function checkAdminAuth() {
  let isAuth = sessionStorage.getItem('theopro_admin_auth') === 'true';
  if (!isAuth) {
    try {
      const curUser = JSON.parse(localStorage.getItem('theopro_user_info') || sessionStorage.getItem('theopro_user_info') || '{}');
      if (curUser && curUser.role === 'admin') {
        isAuth = true;
        sessionStorage.setItem('theopro_admin_auth', 'true');
      }
    } catch (e) {}
  }
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

function handleAdminLogin(e) {
  e.preventDefault();
  const user = document.getElementById('admin-user-input')?.value.trim();
  const pass = document.getElementById('admin-pass-input')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');
  const creds = getAdminCredentials();

  if (user === creds.username && pass === creds.password) {
    sessionStorage.setItem('theopro_admin_auth', 'true');
    if (errorMsg) errorMsg.classList.add('hidden');
    checkAdminAuth();
    loadAdminData();
    switchTab('dashboard');
    showAdminToast('Đăng nhập thành công! Chào mừng chủ shop.', 'success');
  } else {
    if (errorMsg) errorMsg.classList.remove('hidden');
    const passInput = document.getElementById('admin-pass-input');
    if (passInput) {
      passInput.value = '';
      passInput.focus();
    }
  }
}

function handleAdminLogout() {
  sessionStorage.removeItem('theopro_admin_auth');
  checkAdminAuth();
  showAdminToast('Đã đăng xuất khỏi tài khoản quản trị!', 'info');
}

function handleChangeAdminPassword(e) {
  e.preventDefault();
  const oldPass = document.getElementById('old-pass')?.value.trim();
  const newPass = document.getElementById('new-pass')?.value.trim();
  const confirmPass = document.getElementById('confirm-pass')?.value.trim();
  const creds = getAdminCredentials();

  if (oldPass !== creds.password) {
    showAdminToast('Mật khẩu hiện tại không chính xác!', 'error');
    return;
  }

  if (!newPass || newPass.length < 6) {
    showAdminToast('Mật khẩu mới phải từ 6 ký tự trở lên!', 'error');
    return;
  }

  if (newPass !== confirmPass) {
    showAdminToast('Xác nhận mật khẩu mới không khớp!', 'error');
    return;
  }

  creds.password = newPass;
  localStorage.setItem('theopro_admin_creds', JSON.stringify(creds));

  document.getElementById('old-pass').value = '';
  document.getElementById('new-pass').value = '';
  document.getElementById('confirm-pass').value = '';

  showAdminToast('Đã đổi mật khẩu chủ shop thành công! Vui lòng ghi nhớ mật khẩu mới.', 'success');
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

function openAddProductModal() {
  adminState.editingProductId = null;
  document.getElementById('product-modal-title').textContent = 'Thêm Mới Thẻo Câu Cá';
  document.getElementById('prod-form-id').value = '';
  document.getElementById('prod-form-name').value = '';
  document.getElementById('prod-form-category').value = 'theo-dai';
  document.getElementById('prod-form-price').value = '';
  document.getElementById('prod-form-orig-price').value = '';
  document.getElementById('prod-form-image').value = 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80';
  document.getElementById('prod-form-badge').value = 'Mới Ra Mắt';
  document.getElementById('prod-form-desc').value = '';
  document.getElementById('prod-form-line').value = '#1.5 (Tải 5.5kg)';
  document.getElementById('prod-form-hook').value = 'Iseama #6 Có Ngạnh';

  document.getElementById('admin-product-modal').classList.remove('hidden');
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
  document.getElementById('prod-form-image').value = product.image;
  document.getElementById('prod-form-badge').value = product.badge || '';
  document.getElementById('prod-form-desc').value = product.shortDesc || '';
  document.getElementById('prod-form-line').value = product.specs?.lineSize || '';
  document.getElementById('prod-form-hook').value = product.specs?.hookModel || '';

  document.getElementById('admin-product-modal').classList.remove('hidden');
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

