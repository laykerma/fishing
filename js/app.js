/**
 * Frontend Controller for VUA THẺO CÂU - THẺO PRO FISHING (Enhanced Version)
 */

// Application State
const state = {
  theme: localStorage.getItem('theopro_theme') || 'dark',
  cart: JSON.parse(localStorage.getItem('theopro_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('theopro_wishlist') || '[]'),
  userReviews: JSON.parse(localStorage.getItem('theopro_reviews') || '[]'),
  activeCategory: 'all',
  searchQuery: '',
  sortBy: 'popular',
  priceFilter: 'all', // 'all', 'under50', '50to100', 'over100'
  appliedCoupon: null,
  advisorFishId: 'tram-den',
  quickViewProduct: null,
  activeArticle: null,
  checkoutData: null,
  diyRig: {
    material: 'Fluorocarbon Toray Nhật',
    lineSize: '#1.5 (Tải 5.5kg)',
    hookModel: 'Lưỡi Iseama #6 Có Ngạnh',
    rigLength: '25cm (Lệch 4cm)',
    hasTBead: true,
    hasSwivel: false,
    quantityPack: 10,
    basePrice: 50000
  }
};

// Available Promo Codes
const PROMO_CODES = {
  'THEOPRO': { discount: 0.1, type: 'percent', label: 'Giảm 10% tổng đơn' },
  'CANTHU': { discount: 30000, type: 'fixed', label: 'Giảm 30.000₫ cho cần thủ mới' },
  'FREESHIP': { discount: 25000, type: 'shipping', label: 'Miễn phí giao hàng (25.000₫)' }
};

// Currency Formatter
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Save Cart to LocalStorage
function saveCart() {
  localStorage.setItem('theopro_cart', JSON.stringify(state.cart));
  updateCartBadge();
  renderCartDrawer();
}

// Save Wishlist
function saveWishlist() {
  localStorage.setItem('theopro_wishlist', JSON.stringify(state.wishlist));
  updateWishlistBadge();
}

// Show Toast Alert
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white');
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
  }, 3200);
}

// Update Badges
function updateCartBadge() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

function updateWishlistBadge() {
  const badge = document.getElementById('wishlist-badge');
  if (!badge) return;
  badge.textContent = state.wishlist.length;
  if (state.wishlist.length > 0) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function toggleWishlist(productId) {
  const index = state.wishlist.indexOf(productId);
  if (index > -1) {
    state.wishlist.splice(index, 1);
    showToast('Đã xóa khỏi danh sách yêu thích', 'info');
  } else {
    state.wishlist.push(productId);
    showToast('Đã thêm vào danh sách yêu thích ❤️', 'success');
  }
  saveWishlist();
  renderProducts();
}

// Flash Sale Countdown Timer
function initFlashSaleTimer() {
  const hoursEl = document.getElementById('flash-hours');
  const minutesEl = document.getElementById('flash-minutes');
  const secondsEl = document.getElementById('flash-seconds');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Set target end time to end of current day or +6 hours
  let timeLeft = 6 * 3600 + 42 * 60 + 15;

  setInterval(() => {
    if (timeLeft <= 0) timeLeft = 24 * 3600;
    timeLeft--;

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}

// Render Flash Sale Section
function renderFlashSale() {
  const container = document.getElementById('flash-sale-grid');
  if (!container) return;

  container.innerHTML = FLASH_SALE_ITEMS.map(item => {
    const percentSold = Math.round((item.sold / item.stock) * 100);
    return `
      <div class="bg-white rounded-2xl border border-amber-200/80 shadow-md p-4 flex flex-col justify-between relative overflow-hidden group card-hover">
        <span class="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
          ${item.discount}
        </span>
        <span class="absolute top-2 right-2 z-10 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded shadow uppercase">
          ${item.tag}
        </span>

        <div class="h-44 overflow-hidden rounded-xl bg-slate-100 relative mb-3 cursor-pointer" onclick="openQuickView(${item.id})">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>

        <div>
          <h4 onclick="openQuickView(${item.id})" class="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2 cursor-pointer">
            ${item.name}
          </h4>

          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-base font-extrabold text-red-600">${formatVND(item.salePrice)}</span>
            <span class="text-xs text-slate-400 line-through">${formatVND(item.originalPrice)}</span>
          </div>

          <!-- Stock Progress bar -->
          <div class="mt-2.5">
            <div class="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
              <span>Đã bán: <strong class="text-red-600">${item.sold}</strong></span>
              <span>Chỉ còn ${item.stock - item.sold} vỉ</span>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full" style="width: ${percentSold}%;"></div>
            </div>
          </div>
        </div>

        <button 
          onclick="quickAddToCart(${item.id})"
          class="mt-3.5 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5"
        >
          <i data-lucide="zap" class="w-3.5 h-3.5"></i> Săn Giá Sốc Ngay
        </button>
      </div>
    `;
  }).join('');

  lucide.createIcons({ root: container });
}

// Render Categories Bar
function renderCategories() {
  const container = document.getElementById('category-filter-bar');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => {
    const isActive = state.activeCategory === cat.id;
    return `
      <button 
        onclick="setCategory('${cat.id}')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
          isActive 
            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }"
      >
        <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
  lucide.createIcons({ root: container });
}

function setCategory(catId) {
  state.activeCategory = catId;
  renderCategories();
  renderProducts();
}

function setPriceFilter(filter) {
  state.priceFilter = filter;
  const buttons = document.querySelectorAll('.price-filter-btn');
  buttons.forEach(btn => {
    if (btn.dataset.price === filter) {
      btn.className = 'price-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white shadow-sm';
    } else {
      btn.className = 'price-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200';
    }
  });
  renderProducts();
}

// Filter and Sort Products
function getFilteredProducts() {
  let list = [...getStoredProducts()];

  if (state.activeCategory !== 'all') {
    list = list.filter(p => p.category === state.activeCategory);
  }

  if (state.priceFilter === 'under50') {
    list = list.filter(p => p.price < 50000);
  } else if (state.priceFilter === '50to100') {
    list = list.filter(p => p.price >= 50000 && p.price <= 100000);
  } else if (state.priceFilter === 'over100') {
    list = list.filter(p => p.price > 100000);
  }

  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.shortDesc.toLowerCase().includes(q) ||
      p.targetFish.some(f => f.toLowerCase().includes(q))
    );
  }

  if (state.sortBy === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else {
    // popular
    list.sort((a, b) => b.soldCount - a.soldCount);
  }

  return list;
}

// Render Products Grid
function renderProducts() {
  const container = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');
  if (!container) return;

  const products = getFilteredProducts();

  if (countEl) {
    countEl.textContent = `Hiển thị ${products.length} sản phẩm chuyên dụng`;
  }

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="text-base font-bold text-slate-800">Không tìm thấy thẻo phù hợp bộ lọc</h3>
        <p class="text-slate-500 text-xs mt-1 max-w-md mx-auto">Vui lòng thử từ khóa khác hoặc đặt lại khoảng giá.</p>
        <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700">Xem tất cả thẻo</button>
      </div>
    `;
    lucide.createIcons({ root: container });
    return;
  }

  container.innerHTML = products.map(product => {
    const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    const isWishlisted = state.wishlist.includes(product.id);

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col card-hover group relative">
        <!-- Wishlist Button -->
        <button 
          onclick="toggleWishlist(${product.id})"
          class="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
          title="Lưu vào yêu thích"
        >
          <i data-lucide="heart" class="w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : ''}"></i>
        </button>

        <!-- Badge -->
        ${product.badge ? `
          <div class="absolute top-3 left-3 z-10 ${product.badgeColor || 'bg-sky-600'} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
            ${product.badge}
          </div>
        ` : ''}

        <!-- Product Image -->
        <div class="relative h-52 overflow-hidden bg-slate-100 cursor-pointer" onclick="openQuickView(${product.id})">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span class="bg-white/95 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> Xem Chi Tiết
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 flex-1 flex flex-col justify-between">
          <div>
            <!-- Target fish pills -->
            <div class="flex flex-wrap gap-1.5 mb-2">
              ${product.targetFish.slice(0, 2).map(fish => `
                <span class="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded">
                  ${fish}
                </span>
              `).join('')}
            </div>

            <!-- Title -->
            <h3 
              onclick="openQuickView(${product.id})"
              class="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors cursor-pointer line-clamp-2"
              title="${product.name}"
            >
              ${product.name}
            </h3>

            <!-- Specs snippet -->
            <p class="text-xs text-slate-500 mt-1.5 line-clamp-2">
              ${product.shortDesc}
            </p>
          </div>

          <!-- Bottom Section -->
          <div class="mt-4 pt-3 border-t border-slate-100">
            <!-- Rating & Sold -->
            <div class="flex items-center justify-between text-xs text-slate-500 mb-2">
              <div class="flex items-center gap-1 text-amber-500 font-bold">
                <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
                <span>${product.rating}</span>
                <span class="text-slate-400 font-normal">(${product.reviewsCount})</span>
              </div>
              <span class="text-slate-500 font-semibold text-[11px]">Đã bán ${product.soldCount > 1000 ? (product.soldCount / 1000).toFixed(1) + 'k' : product.soldCount}</span>
            </div>

            <!-- Price & Action -->
            <div class="flex items-end justify-between gap-2">
              <div>
                <div class="text-base font-extrabold text-sky-700">
                  ${formatVND(product.price)}
                </div>
                ${product.originalPrice ? `
                  <div class="text-[11px] text-slate-400 line-through">
                    ${formatVND(product.originalPrice)}
                  </div>
                ` : ''}
              </div>

              <div class="flex items-center gap-1.5">
                <button 
                  onclick="quickAddToCart(${product.id})"
                  class="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white transition-colors border border-sky-200"
                  title="Thêm nhanh vào giỏ"
                >
                  <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                </button>
                <button 
                  onclick="buyNowProduct(${product.id})"
                  class="px-3 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-all"
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons({ root: container });
}

function resetFilters() {
  state.activeCategory = 'all';
  state.searchQuery = '';
  state.priceFilter = 'all';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  setPriceFilter('all');
  renderCategories();
  renderProducts();
}

// Xưởng Tự Tóm Thẻo Theo Yêu Cầu (DIY Rig Configurator)
function updateDiyRig(key, value) {
  state.diyRig[key] = value;
  calculateDiyPrice();
  renderDiyVisualizer();
}

function calculateDiyPrice() {
  let pricePerPack = 40000;
  if (state.diyRig.material.includes('Toray')) pricePerPack += 15000;
  if (state.diyRig.material.includes('PE')) pricePerPack += 25000;
  if (state.diyRig.hasTBead) pricePerPack += 5000;
  if (state.diyRig.hasSwivel) pricePerPack += 5000;

  let total = pricePerPack * (state.diyRig.quantityPack / 10);
  state.diyRig.totalPrice = total;

  const priceEl = document.getElementById('diy-price-display');
  if (priceEl) priceEl.textContent = formatVND(total);
}

function renderDiyVisualizer() {
  const lineLabel = document.getElementById('diy-vis-line');
  const hookLabel = document.getElementById('diy-vis-hook');
  const lengthLabel = document.getElementById('diy-vis-length');
  const beadLabel = document.getElementById('diy-vis-bead');

  if (lineLabel) lineLabel.textContent = `${state.diyRig.material} - ${state.diyRig.lineSize}`;
  if (hookLabel) hookLabel.textContent = state.diyRig.hookModel;
  if (lengthLabel) lengthLabel.textContent = `Chiều dài: ${state.diyRig.rigLength}`;
  if (beadLabel) beadLabel.textContent = state.diyRig.hasTBead ? '✓ Có hạt silicon chống xoắn chữ T' : 'Không dùng hạt chia';
}

function addDiyRigToCart() {
  calculateDiyPrice();
  const customItem = {
    productId: 999,
    name: `Thẻo Buộc Tay Theo Yêu Cầu (${state.diyRig.quantityPack} bộ)`,
    price: state.diyRig.totalPrice,
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
    variantName: `${state.diyRig.material} | ${state.diyRig.lineSize} | ${state.diyRig.hookModel} | ${state.diyRig.rigLength}`,
    quantity: 1
  };

  addToCart(customItem);
  showToast('Đã thêm thẻo đặt riêng của bạn vào giỏ hàng!', 'success');
}

// Bảng Tra Cứu Tương Quan Dây Trục & Thẻo
function renderRigSizeTable() {
  const container = document.getElementById('rig-size-table-body');
  if (!container) return;

  container.innerHTML = RIG_SIZE_TABLE.map((row, idx) => `
    <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-sky-50/50 transition-colors">
      <td class="p-3 font-bold text-slate-900 border-b border-slate-200">
        <div>${row.target}</div>
        <span class="text-[11px] text-slate-500 font-normal">Trọng lượng cá: ${row.fishWeight}</span>
      </td>
      <td class="p-3 font-semibold text-sky-700 border-b border-slate-200">${row.mainLine}</td>
      <td class="p-3 font-bold text-emerald-700 border-b border-slate-200">${row.leaderLine}</td>
      <td class="p-3 font-medium text-slate-700 border-b border-slate-200">${row.hookType}</td>
      <td class="p-3 font-medium text-slate-600 border-b border-slate-200">${row.rigLength}</td>
      <td class="p-3 font-bold text-amber-600 border-b border-slate-200">${row.floatWeight}</td>
    </tr>
  `).join('');
}

// Quick View Modal
function openQuickView(productId) {
  const product = getStoredProducts().find(p => p.id === productId);
  if (!product) return;

  state.quickViewProduct = product;
  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  modalContent.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div class="space-y-4">
        <div class="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-200">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover" />
          ${product.badge ? `
            <div class="absolute top-3 left-3 ${product.badgeColor || 'bg-sky-600'} text-white text-[10px] font-bold px-2.5 py-1 rounded shadow uppercase">
              ${product.badge}
            </div>
          ` : ''}
        </div>
        
        <div class="bg-sky-50/80 border border-sky-100 rounded-xl p-3 text-xs space-y-1.5 text-slate-700">
          <div class="font-bold text-sky-900 flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-4 h-4 text-sky-600"></i> Cam Kết Chất Lượng Vua Thẻo:
          </div>
          <div>✓ Buộc tay thủ công, kiểm tra từng nút thắt trước khi xuất xưởng</div>
          <div>✓ Cước chuẩn số milimet, không đôn số, bao tải giật</div>
          <div>✓ Đổi trả 1-1 miễn phí nếu thẻo bị tuột nút hoặc đứt ngầm</div>
        </div>
      </div>

      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded">
              ${product.style}
            </span>
            <div class="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>
              <span>${product.rating}</span>
              <span class="text-slate-400">(${product.reviewsCount} đánh giá)</span>
            </div>
          </div>

          <h2 class="text-xl font-bold text-slate-900 leading-tight">
            ${product.name}
          </h2>

          <div class="mt-3 flex items-baseline gap-3">
            <span class="text-2xl font-extrabold text-sky-700" id="modal-price">
              ${formatVND(product.price)}
            </span>
            ${product.originalPrice ? `
              <span class="text-xs text-slate-400 line-through">
                ${formatVND(product.originalPrice)}
              </span>
              <span class="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">
                Tiết kiệm ${discount}%
              </span>
            ` : ''}
          </div>

          <p class="text-slate-600 text-xs mt-3 leading-relaxed">
            ${product.shortDesc}
          </p>

          <!-- Specifications Table -->
          <div class="mt-4 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div class="bg-slate-50 px-3 py-2 font-bold text-slate-700 border-b border-slate-200 flex items-center gap-1.5">
              <i data-lucide="sliders" class="w-3.5 h-3.5 text-sky-600"></i> Thông Số Kỹ Thuật Chi Tiết
            </div>
            <div class="divide-y divide-slate-100 bg-white">
              <div class="grid grid-cols-3 px-3 py-1.5">
                <span class="text-slate-400">Chất liệu:</span>
                <span class="col-span-2 text-slate-800 font-semibold">${product.specs.lineMaterial}</span>
              </div>
              <div class="grid grid-cols-3 px-3 py-1.5">
                <span class="text-slate-400">Lực tải:</span>
                <span class="col-span-2 text-slate-800 font-semibold">${product.specs.lineSize}</span>
              </div>
              <div class="grid grid-cols-3 px-3 py-1.5">
                <span class="text-slate-400">Mã lưỡi:</span>
                <span class="col-span-2 text-slate-800 font-semibold">${product.specs.hookModel}</span>
              </div>
              <div class="grid grid-cols-3 px-3 py-1.5">
                <span class="text-slate-400">Chiều dài:</span>
                <span class="col-span-2 text-slate-800 font-semibold">${product.specs.rigLength}</span>
              </div>
              <div class="grid grid-cols-3 px-3 py-1.5">
                <span class="text-slate-400">Quy cách:</span>
                <span class="col-span-2 text-slate-800 font-semibold">${product.specs.pack}</span>
              </div>
            </div>
          </div>

          <!-- Variants -->
          ${product.variants && product.variants.length > 0 ? `
            <div class="mt-4">
              <label class="block text-xs font-bold text-slate-700 mb-2">Chọn phân loại kích cỡ:</label>
              <div class="space-y-1.5" id="modal-variants-list">
                ${product.variants.map((v, idx) => `
                  <label class="flex items-center justify-between p-2 rounded-xl border ${idx === 0 ? 'border-sky-600 bg-sky-50/50 text-sky-900 font-semibold' : 'border-slate-200 text-slate-700'} cursor-pointer text-xs">
                    <div class="flex items-center gap-2">
                      <input type="radio" name="modal-variant" value="${idx}" ${idx === 0 ? 'checked' : ''} onchange="onModalVariantChange(${product.id}, ${idx})" class="text-sky-600 focus:ring-sky-500">
                      <span>${v.name}</span>
                    </div>
                    <span class="font-bold text-sky-700">${formatVND(v.price)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Quantity -->
          <div class="mt-4 flex items-center gap-3">
            <span class="text-xs font-bold text-slate-700">Số lượng:</span>
            <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button onclick="changeModalQty(-1)" class="px-2.5 py-1 text-slate-500 hover:bg-slate-100">
                <i data-lucide="minus" class="w-3.5 h-3.5"></i>
              </button>
              <input type="number" id="modal-quantity" value="1" min="1" max="99" class="w-10 text-center text-xs font-bold border-none focus:outline-none" />
              <button onclick="changeModalQty(1)" class="px-2.5 py-1 text-slate-500 hover:bg-slate-100">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
          <button 
            onclick="addModalProductToCart(false)"
            class="flex-1 py-3 px-4 bg-sky-50 text-sky-700 border border-sky-300 rounded-xl font-bold text-xs hover:bg-sky-100 transition-colors flex items-center justify-center gap-2"
          >
            <i data-lucide="shopping-cart" class="w-4 h-4"></i> Thêm Vào Giỏ
          </button>
          <button 
            onclick="addModalProductToCart(true)"
            class="flex-1 py-3 px-4 bg-sky-600 text-white rounded-xl font-bold text-xs hover:bg-sky-700 shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
          >
            <i data-lucide="zap" class="w-4 h-4"></i> Mua Ngay
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons({ root: modalContent });
}

function closeQuickView() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
}

function changeModalQty(delta) {
  const qtyInput = document.getElementById('modal-quantity');
  if (!qtyInput) return;
  let val = parseInt(qtyInput.value) || 1;
  val = Math.max(1, Math.min(99, val + delta));
  qtyInput.value = val;
}

function onModalVariantChange(productId, variantIdx) {
  const product = getStoredProducts().find(p => p.id === productId);
  if (!product || !product.variants[variantIdx]) return;
  const priceEl = document.getElementById('modal-price');
  if (priceEl) {
    priceEl.textContent = formatVND(product.variants[variantIdx].price);
  }
}

function addModalProductToCart(isBuyNow = false) {
  if (!state.quickViewProduct) return;
  const product = state.quickViewProduct;
  const qtyInput = document.getElementById('modal-quantity');
  const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;

  let selectedVariantIdx = 0;
  const radio = document.querySelector('input[name="modal-variant"]:checked');
  if (radio) {
    selectedVariantIdx = parseInt(radio.value);
  }

  const variant = (product.variants && product.variants[selectedVariantIdx]) ? product.variants[selectedVariantIdx] : null;
  const itemPrice = variant ? variant.price : product.price;
  const itemName = variant ? `${product.name} (${variant.name})` : product.name;

  addToCart({
    productId: product.id,
    name: itemName,
    price: itemPrice,
    image: product.image,
    variantName: variant ? variant.name : '',
    quantity: qty
  });

  closeQuickView();

  if (isBuyNow) {
    openCheckoutModal();
  }
}

function quickAddToCart(productId) {
  const product = getStoredProducts().find(p => p.id === productId);
  if (!product) return;

  const variant = (product.variants && product.variants.length > 0) ? product.variants[0] : null;
  const itemPrice = variant ? variant.price : product.price;
  const itemName = variant ? `${product.name} (${variant.name})` : product.name;

  addToCart({
    productId: product.id,
    name: itemName,
    price: itemPrice,
    image: product.image,
    variantName: variant ? variant.name : '',
    quantity: 1
  });
}

function buyNowProduct(productId) {
  quickAddToCart(productId);
  openCheckoutModal();
}

function addToCart(item) {
  const existingIndex = state.cart.findIndex(i => i.productId === item.productId && i.variantName === item.variantName);
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += item.quantity;
  } else {
    state.cart.push(item);
  }

  saveCart();
  showToast(`Đã thêm "${item.name}" vào giỏ hàng!`, 'success');
}

function updateCartItemQty(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;
  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
    showToast('Đã xóa sản phẩm khỏi giỏ', 'info');
  }
  saveCart();
}

function removeCartItem(index) {
  if (!state.cart[index]) return;
  state.cart.splice(index, 1);
  saveCart();
  showToast('Đã xóa sản phẩm khỏi giỏ', 'info');
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShipThreshold = 250000;
  let shipping = subtotal >= freeShipThreshold || subtotal === 0 ? 0 : 25000;

  let discount = 0;
  if (state.appliedCoupon) {
    const coupon = PROMO_CODES[state.appliedCoupon];
    if (coupon) {
      if (coupon.type === 'percent') {
        discount = Math.round(subtotal * coupon.discount);
      } else if (coupon.type === 'fixed') {
        discount = Math.min(subtotal, coupon.discount);
      } else if (coupon.type === 'shipping') {
        shipping = 0;
      }
    }
  }

  const total = Math.max(0, subtotal - discount + shipping);

  return {
    subtotal,
    shipping,
    discount,
    total,
    freeShipThreshold,
    amountNeededForFreeShip: Math.max(0, freeShipThreshold - subtotal)
  };
}

function renderCartDrawer() {
  const drawerList = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const discountEl = document.getElementById('cart-discount-row');
  const discountAmountEl = document.getElementById('cart-discount-amount');
  const totalEl = document.getElementById('cart-total');
  const freeShipBar = document.getElementById('freeship-progress-bar');
  const freeShipText = document.getElementById('freeship-text');

  if (!drawerList) return;

  const totals = calculateCartTotals();

  if (freeShipBar && freeShipText) {
    const percent = Math.min(100, Math.round((totals.subtotal / totals.freeShipThreshold) * 100));
    freeShipBar.style.width = `${percent}%`;

    if (totals.amountNeededForFreeShip === 0) {
      freeShipText.innerHTML = `🎉 Bạn đã được <strong class="text-emerald-600">MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC!</strong>`;
    } else {
      freeShipText.innerHTML = `Mua thêm <strong class="text-sky-600">${formatVND(totals.amountNeededForFreeShip)}</strong> để được <strong>FREESHIP</strong>!`;
    }
  }

  if (state.cart.length === 0) {
    drawerList.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
          <i data-lucide="shopping-bag" class="w-8 h-8"></i>
        </div>
        <p class="font-bold text-slate-700 text-sm">Giỏ hàng của bạn đang trống</p>
        <p class="text-xs text-slate-400 mt-1">Hãy khám phá các mẫu thẻo buộc sẵn tinh xảo cho chuyến đi câu sắp tới nhé!</p>
        <button onclick="toggleCartDrawer(false)" class="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors">
          Khám Phá Sản Phẩm Ngay
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatVND(0);
    if (shippingEl) shippingEl.textContent = formatVND(0);
    if (totalEl) totalEl.textContent = formatVND(0);
    if (discountEl) discountEl.classList.add('hidden');
    lucide.createIcons({ root: drawerList });
    return;
  }

  drawerList.innerHTML = state.cart.map((item, idx) => `
    <div class="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-sm">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg bg-slate-100 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <h4 class="text-xs font-bold text-slate-800 line-clamp-1">${item.name}</h4>
        ${item.variantName ? `<span class="text-[10px] text-slate-500 line-clamp-1">${item.variantName}</span>` : ''}
        <div class="text-xs font-extrabold text-sky-700 mt-0.5">
          ${formatVND(item.price)}
        </div>
      </div>
      <div class="flex flex-col items-end gap-1">
        <button onclick="removeCartItem(${idx})" class="text-slate-400 hover:text-red-500 p-0.5" title="Xóa">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
        <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button onclick="updateCartItemQty(${idx}, -1)" class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs">-</button>
          <span class="px-2 text-xs font-bold text-slate-800">${item.quantity}</span>
          <button onclick="updateCartItemQty(${idx}, 1)" class="px-2 py-0.5 text-slate-600 hover:bg-slate-200 text-xs">+</button>
        </div>
      </div>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = formatVND(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shipping === 0 ? 'Miễn Phí' : formatVND(totals.shipping);
  if (totalEl) totalEl.textContent = formatVND(totals.total);

  if (discountEl && discountAmountEl) {
    if (totals.discount > 0) {
      discountEl.classList.remove('hidden');
      discountAmountEl.textContent = `-${formatVND(totals.discount)}`;
    } else {
      discountEl.classList.add('hidden');
    }
  }

  lucide.createIcons({ root: drawerList });
}

function toggleCartDrawer(open = null) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (!drawer) return;

  const isOpen = !drawer.classList.contains('translate-x-full');
  const shouldOpen = open !== null ? open : !isOpen;

  if (shouldOpen) {
    renderCartDrawer();
    drawer.classList.remove('translate-x-full');
    if (backdrop) backdrop.classList.remove('hidden');
  } else {
    drawer.classList.add('translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }
}

function applyCoupon() {
  const input = document.getElementById('coupon-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showToast('Vui lòng nhập mã giảm giá', 'error');
    return;
  }

  if (PROMO_CODES[code]) {
    state.appliedCoupon = code;
    showToast(`Áp dụng mã ${code}: ${PROMO_CODES[code].label}`, 'success');
    renderCartDrawer();
  } else {
    showToast('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
  }
}

// Rig Advisor Selector
function renderRigAdvisor() {
  const tabsContainer = document.getElementById('advisor-tabs');
  const resultCard = document.getElementById('advisor-result-card');
  if (!tabsContainer || !resultCard) return;

  tabsContainer.innerHTML = RIG_ADVISOR_DATA.fishTypes.map(fish => {
    const isSelected = state.advisorFishId === fish.id;
    return `
      <button 
        onclick="setAdvisorFish('${fish.id}')"
        class="text-left p-3.5 rounded-2xl border transition-all ${
          isSelected 
            ? 'border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
            : 'border-slate-200 bg-white hover:border-sky-300 text-slate-800'
        }"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}">${fish.name}</span>
          <i data-lucide="${isSelected ? 'check-circle-2' : 'chevron-right'}" class="w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}"></i>
        </div>
        <p class="text-[11px] mt-0.5 leading-snug ${isSelected ? 'text-sky-100' : 'text-slate-500'}">${fish.desc}</p>
      </button>
    `;
  }).join('');

  const currentFish = RIG_ADVISOR_DATA.fishTypes.find(f => f.id === state.advisorFishId) || RIG_ADVISOR_DATA.fishTypes[0];
  const rec = currentFish.recommended;
  const linkedProduct = PRODUCTS.find(p => p.id === rec.productId);

  resultCard.innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div class="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-sky-500/10 pointer-events-none"></div>

      <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
        <i data-lucide="sparkles" class="w-4 h-4"></i> Cấu Hình Đề Xuất Cho: ${currentFish.name}
      </div>

      <h3 class="text-lg font-bold text-white mb-4">
        ${rec.rigName}
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-5">
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
          <span class="text-sky-300 font-semibold block mb-0.5">Kích Cỡ Dây Thẻo:</span>
          <span class="text-white font-medium">${rec.line}</span>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
          <span class="text-sky-300 font-semibold block mb-0.5">Lưỡi Câu Chuẩn:</span>
          <span class="text-white font-medium">${rec.hook}</span>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
          <span class="text-sky-300 font-semibold block mb-0.5">Quy Cách Chiều Dài:</span>
          <span class="text-white font-medium">${rec.rigLength}</span>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
          <span class="text-amber-400 font-semibold block mb-0.5">Kinh Nghiệm Săn Cá:</span>
          <span class="text-slate-200 line-clamp-2">${rec.tip}</span>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <span class="text-xs text-slate-400 block">Giá sản phẩm vỉ 10 bộ:</span>
          <span class="text-lg font-extrabold text-amber-400">
            ${linkedProduct ? formatVND(linkedProduct.price) : '35.000₫'}
          </span>
        </div>
        <div class="flex items-center gap-2">
          ${linkedProduct ? `
            <button 
              onclick="openQuickView(${linkedProduct.id})"
              class="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors"
            >
              Xem Chi Tiết
            </button>
            <button 
              onclick="quickAddToCart(${linkedProduct.id})"
              class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center gap-1.5"
            >
              <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i> Thêm Vào Giỏ
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  lucide.createIcons({ root: tabsContainer });
  lucide.createIcons({ root: resultCard });
}

function setAdvisorFish(fishId) {
  state.advisorFishId = fishId;
  renderRigAdvisor();
}

// Order Tracking System
function openOrderTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Nếu khách đã đăng nhập và có SĐT, tự động điền và tra cứu luôn
    if (typeof getCurrentUser === 'function') {
      const curUser = getCurrentUser();
      const input = document.getElementById('tracking-query');
      if (curUser && curUser.phone && input) {
        input.value = curUser.phone;
        searchOrder();
      }
    }
  }
}

function closeOrderTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) modal.classList.add('hidden');
}

function searchOrder() {
  const query = document.getElementById('tracking-query')?.value.trim();
  const resultContainer = document.getElementById('tracking-result');
  if (!query || !resultContainer) {
    showToast('Vui lòng nhập số điện thoại hoặc mã đơn hàng', 'error');
    return;
  }

  const orders = getStoredOrders();
  const cleanQ = query.toUpperCase();
  const found = orders.find(o => o.orderId.toUpperCase() === cleanQ || o.customer.phone === query);

  if (found) {
    const statusMap = {
      'pending': { text: 'Chờ Xác Nhận', color: 'bg-amber-100 text-amber-800' },
      'processing': { text: 'Xưởng Đang Tóm Thẻo', color: 'bg-blue-100 text-blue-800' },
      'shipping': { text: 'Đang Vận Chuyển', color: 'bg-sky-100 text-sky-800' },
      'completed': { text: 'Đã Giao Thành Công', color: 'bg-emerald-100 text-emerald-800' },
      'cancelled': { text: 'Đã Hủy', color: 'bg-red-100 text-red-800' }
    };
    const st = statusMap[found.status || 'pending'] || statusMap.pending;

    resultContainer.innerHTML = `
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div class="text-xs text-slate-400">Mã đơn: <strong class="text-slate-800">${found.orderId}</strong> (${found.createdAt})</div>
            <div class="text-sm font-bold text-sky-700 mt-0.5">${found.customer.name} - ${found.customer.phone}</div>
          </div>
          <span class="${st.color} text-[11px] font-bold px-2.5 py-1 rounded-full">
            ${st.text}
          </span>
        </div>

        <div class="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-200">
          <div class="font-bold text-slate-800">Sản phẩm đặt mua:</div>
          ${found.items.map(i => `<div>• ${i.name} (x${i.quantity}) - ${formatVND(i.price * i.quantity)}</div>`).join('')}
          <div class="pt-1.5 border-t border-slate-100 font-extrabold text-sky-700">
            Tổng tiền: ${formatVND(found.totals.total)} (${found.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản VietQR'})
          </div>
        </div>

        <div class="pt-2 text-xs text-slate-500 flex justify-between items-center">
          <span>Địa chỉ nhận: <strong class="text-slate-700">${found.customer.address}, ${found.customer.city}</strong></span>
          <button onclick="showToast('Đã gửi yêu cầu giục giao hàng nhanh!', 'success')" class="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold">
            Giục giao hàng
          </button>
        </div>
      </div>
    `;
    lucide.createIcons({ root: resultContainer });
    return;
  }

  // Not found fallback
  resultContainer.innerHTML = `
    <div class="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl">
      <i data-lucide="alert-circle" class="w-8 h-8 text-amber-500 mx-auto mb-2"></i>
      <div class="font-bold text-xs text-slate-800">Không tìm thấy đơn hàng với thông tin: "${query}"</div>
      <p class="text-[11px] text-slate-500 mt-1">Vui lòng kiểm tra lại số điện thoại hoặc mã đơn (VD: 0988776655 hoặc THEO-882314).</p>
    </div>
  `;
  lucide.createIcons({ root: resultContainer });
}

// Recent Purchases Live Notification Popup
function initRecentSalesNotification() {
  const container = document.getElementById('recent-sale-popup');
  if (!container) return;

  let index = 0;
  setInterval(() => {
    const sale = RECENT_SALES[index];
    index = (index + 1) % RECENT_SALES.length;

    container.innerHTML = `
      <div class="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-sky-100 shadow-xl max-w-sm pointer-events-auto">
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
          <i data-lucide="check-circle" class="w-5 h-5 text-emerald-500"></i>
        </div>
        <div class="text-xs">
          <div class="font-bold text-slate-900">${sale.name}</div>
          <div class="text-slate-500 text-[11px] line-clamp-1">Vừa mua: <strong class="text-sky-700">${sale.item}</strong></div>
          <div class="text-[10px] text-slate-400 mt-0.5">${sale.time}</div>
        </div>
      </div>
    `;

    lucide.createIcons({ root: container });
    container.classList.remove('hidden', 'recent-sale-exit');
    container.classList.add('recent-sale-enter');

    setTimeout(() => {
      container.classList.remove('recent-sale-enter');
      container.classList.add('recent-sale-exit');
      setTimeout(() => container.classList.add('hidden'), 400);
    }, 4500);
  }, 14000);
}

// User Reviews Submission
function openReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.classList.add('hidden');
}

function submitNewReview(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('rev-author')?.value.trim();
  const product = document.getElementById('rev-product')?.value.trim();
  const comment = document.getElementById('rev-comment')?.value.trim();
  const rating = parseInt(document.querySelector('input[name="rev-star"]:checked')?.value || '5');

  if (!name || !comment) {
    showToast('Vui lòng nhập tên và cảm nhận của bạn', 'error');
    return;
  }

  const newReview = {
    id: Date.now(),
    name: name,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    rating: rating,
    date: 'Vừa xong',
    productName: product || 'Thẻo Đôi Buộc Sẵn Vua Thẻo',
    comment: comment,
    verified: true
  };

  state.userReviews.unshift(newReview);
  localStorage.setItem('theopro_reviews', JSON.stringify(state.userReviews));
  closeReviewModal();
  renderReviews();
  showToast('Cảm ơn bạn! Đánh giá đã được xuất bản thành công.', 'success');
}

// Blog Articles Modal
function openArticleModal(articleId) {
  const article = BLOG_ARTICLES.find(a => a.id === articleId);
  if (!article) return;

  const modal = document.getElementById('article-modal');
  const modalContent = document.getElementById('article-modal-content');

  modalContent.innerHTML = `
    <div class="p-6 md:p-8 space-y-4">
      <div class="flex items-center gap-3 text-xs text-slate-500">
        <span class="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full font-semibold">${article.author}</span>
        <span>•</span>
        <span>${article.date}</span>
        <span>•</span>
        <span>${article.readTime}</span>
      </div>

      <h1 class="text-xl md:text-2xl font-black text-slate-900 leading-tight">
        ${article.title}
      </h1>

      <div class="rounded-2xl overflow-hidden h-56 bg-slate-100">
        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover" />
      </div>

      <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed text-xs pt-2">
        ${article.content}
      </div>

      <div class="pt-6 border-t border-slate-200 flex justify-between items-center">
        <span class="text-xs text-slate-500">Tư vấn kỹ thuật? Gọi: <strong class="text-sky-600">0988.776.655</strong></span>
        <button onclick="closeArticleModal()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors">
          Đóng
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons({ root: modalContent });
}

function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  if (modal) modal.classList.add('hidden');
}

function renderBlogArticles() {
  const container = document.getElementById('articles-grid');
  if (!container) return;

  container.innerHTML = BLOG_ARTICLES.map(art => `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group card-hover cursor-pointer" onclick="openArticleModal(${art.id})">
      <div class="h-44 overflow-hidden bg-slate-100 relative">
        <img src="${art.image}" alt="${art.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span class="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded shadow">
          ${art.readTime}
        </span>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="text-[10px] text-sky-600 font-bold mb-1">${art.date} • ${art.author}</div>
          <h3 class="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors line-clamp-2 leading-snug">
            ${art.title}
          </h3>
          <p class="text-xs text-slate-500 mt-2 line-clamp-2">
            ${art.summary}
          </p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
          <span>Đọc Bí Quyết</span>
          <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons({ root: container });
}

function renderReviews() {
  const container = document.getElementById('reviews-grid');
  if (!container) return;

  const allReviews = [...state.userReviews, ...REVIEWS];

  container.innerHTML = allReviews.map(rev => `
    <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <img src="${rev.avatar}" alt="${rev.name}" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
            <div>
              <div class="font-bold text-xs text-slate-900 flex items-center gap-1">
                ${rev.name}
                ${rev.verified ? `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-sky-500"></i>` : ''}
              </div>
              <span class="text-[10px] text-slate-400">${rev.date}</span>
            </div>
          </div>
          <div class="flex text-amber-400">
            ${Array.from({ length: rev.rating }).map(() => `<i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i>`).join('')}
          </div>
        </div>
        <div class="bg-slate-50 px-2.5 py-1 rounded text-[10px] text-sky-700 font-semibold mb-2 line-clamp-1">
          Đã mua: ${rev.productName}
        </div>
        <p class="text-xs text-slate-600 italic leading-relaxed">
          "${rev.comment}"
        </p>
      </div>
    </div>
  `).join('');

  lucide.createIcons({ root: container });
}

// Checkout Modal
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng trống! Hãy chọn thẻo trước khi đặt.', 'info');
    return;
  }

  toggleCartDrawer(false);
  const modal = document.getElementById('checkout-modal');
  const modalContent = document.getElementById('checkout-modal-content');
  const totals = calculateCartTotals();

  modalContent.innerHTML = `
    <div class="p-6 md:p-8">
      <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 class="text-xl md:text-2xl font-extrabold text-slate-900">Xác Nhận & Đặt Hàng</h2>
          <p class="text-xs text-slate-500 mt-0.5">Kiểm tra thông tin giao hàng và chọn phương thức thanh toán</p>
        </div>
        <button onclick="closeCheckoutModal()" class="text-slate-400 hover:text-slate-600 p-1">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-7 space-y-4">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="map-pin" class="w-4 h-4 text-sky-600"></i> 1. Thông Tin Nhận Hàng
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Họ và tên cần thủ *</label>
              <input type="text" id="order-name" placeholder="Ví dụ: Nguyễn Văn Cần" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
              <input type="tel" id="order-phone" placeholder="Ví dụ: 0912345678" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết (Số nhà, đường/thôn xóm) *</label>
            <input type="text" id="order-address" placeholder="Ví dụ: Số 24 ngõ 12 đường Trần Phú" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tỉnh / Thành phố *</label>
              <input type="text" id="order-city" placeholder="Ví dụ: Hà Nội / TP.HCM" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho xưởng làm thẻo</label>
              <input type="text" id="order-notes" placeholder="VD: Buộc lệch 4cm, giao ngoài giờ..." class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>
          </div>

          <div class="pt-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <i data-lucide="credit-card" class="w-4 h-4 text-sky-600"></i> 2. Hình Thức Thanh Toán
            </h3>

            <div class="space-y-2">
              <label class="flex items-center justify-between p-3.5 rounded-xl border border-sky-500 bg-sky-50/40 cursor-pointer">
                <div class="flex items-center gap-3">
                  <input type="radio" name="payment-method" value="cod" checked onchange="togglePaymentQR(false)" class="text-sky-600 focus:ring-sky-500">
                  <div>
                    <div class="text-xs font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                    <div class="text-[11px] text-slate-500">Được mở hộp kiểm tra cước & lưỡi trước khi thanh toán</div>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Khuyên Dùng</span>
              </label>

              <label class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 cursor-pointer">
                <div class="flex items-center gap-3">
                  <input type="radio" name="payment-method" value="vietqr" onchange="togglePaymentQR(true)" class="text-sky-600 focus:ring-sky-500">
                  <div>
                    <div class="text-xs font-bold text-slate-900">Chuyển khoản VietQR tự động</div>
                    <div class="text-[11px] text-slate-500">Quét mã QR qua app ngân hàng MB / Vietcombank / Techcombank...</div>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Nhanh Chóng</span>
              </label>
            </div>

            <div id="vietqr-container" class="hidden mt-4 p-4 bg-slate-900 text-white rounded-xl text-center space-y-3">
              <span class="text-xs text-amber-400 font-bold block">Mã QR Chuyển Khoản Tức Thì (VietQR)</span>
              <div class="inline-block p-2 bg-white rounded-lg shadow">
                <img 
                  id="vietqr-image" 
                  src="https://api.vietqr.io/image/970422-0988776655-compact2.jpg?amount=${totals.total}&addInfo=THEOPRO%20DAT%20HANG&accountName=VUATHEOCAU" 
                  alt="VietQR Code" 
                  class="w-48 h-48 mx-auto"
                />
              </div>
              <div class="text-xs text-slate-300 space-y-0.5">
                <div>Ngân hàng Quân Đội (MB Bank): <strong class="text-white">0988.776.655</strong></div>
                <div>Chủ tài khoản: <strong class="text-white">VUA THEO CAU VIET NAM</strong></div>
                <div>Số tiền: <strong class="text-amber-400 font-bold">${formatVND(totals.total)}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between mb-3">
              <span>Đơn Hàng Của Bạn</span>
              <span class="text-slate-500 font-normal lowercase">${state.cart.length} món</span>
            </h3>

            <div class="divide-y divide-slate-200/80 max-h-56 overflow-y-auto mb-4 pr-1">
              ${state.cart.map(item => `
                <div class="py-2 flex items-center justify-between text-xs">
                  <div class="min-w-0 pr-2">
                    <div class="font-bold text-slate-800 truncate">${item.name}</div>
                    <div class="text-slate-400">Số lượng: ${item.quantity} x ${formatVND(item.price)}</div>
                  </div>
                  <span class="font-bold text-slate-900 whitespace-nowrap">${formatVND(item.price * item.quantity)}</span>
                </div>
              `).join('')}
            </div>

            <div class="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span class="font-semibold text-slate-800">${formatVND(totals.subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Phí vận chuyển:</span>
                <span class="font-semibold ${totals.shipping === 0 ? 'text-emerald-600' : 'text-slate-800'}">
                  ${totals.shipping === 0 ? 'Miễn phí' : formatVND(totals.shipping)}
                </span>
              </div>
              ${totals.discount > 0 ? `
                <div class="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-${formatVND(totals.discount)}</span>
                </div>
              ` : ''}
              <div class="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span class="font-bold text-slate-800 text-sm">Tổng cộng:</span>
                <span class="font-extrabold text-sky-700 text-lg">${formatVND(totals.total)}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-200">
            <button 
              onclick="submitOrder()"
              class="w-full py-3.5 bg-sky-600 text-white rounded-xl font-bold text-xs hover:bg-sky-700 shadow-xl shadow-sky-600/30 transition-all flex items-center justify-center gap-2"
            >
              <i data-lucide="check" class="w-4 h-4"></i> HOÀN TẤT ĐẶT HÀNG
            </button>
            <p class="text-[10px] text-center text-slate-400 mt-2">
              Quý khách được quyền mở bưu phẩm kiểm tra cước & lưỡi trước khi thanh toán.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  lucide.createIcons({ root: modalContent });

  // Tự động điền thông tin nếu đã đăng nhập tài khoản cần thủ
  if (typeof getCurrentUser === 'function') {
    const curUser = getCurrentUser();
    if (curUser) {
      const nameInput = document.getElementById('order-name');
      const phoneInput = document.getElementById('order-phone');
      if (nameInput && curUser.name) nameInput.value = curUser.name;
      if (phoneInput && curUser.phone) phoneInput.value = curUser.phone;
    }
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

function togglePaymentQR(show) {
  const container = document.getElementById('vietqr-container');
  if (container) {
    if (show) container.classList.remove('hidden');
    else container.classList.add('hidden');
  }
}

function submitOrder() {
  const nameInput = document.getElementById('order-name');
  const phoneInput = document.getElementById('order-phone');
  const addressInput = document.getElementById('order-address');
  const cityInput = document.getElementById('order-city');
  const notesInput = document.getElementById('order-notes');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const city = cityInput ? cityInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name || !phone || !address || !city) {
    showToast('Vui lòng điền đầy đủ: Họ tên, SĐT, Địa chỉ và Tỉnh/Thành phố', 'error');
    return;
  }

  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone)) {
    showToast('Số điện thoại không đúng định dạng. Vui lòng nhập lại.', 'error');
    return;
  }

  const totals = calculateCartTotals();
  const orderId = 'THEO-' + Math.floor(100000 + Math.random() * 900000);
  const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'cod';

  state.checkoutData = {
    orderId,
    customer: { name, phone, address, city, notes },
    items: [...state.cart],
    totals,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toLocaleString('vi-VN')
  };

  // Lưu đơn hàng vào danh sách đơn hàng Admin & Khách hàng
  const orders = getStoredOrders();
  orders.unshift(state.checkoutData);
  saveStoredOrders(orders);

  // Đồng bộ lưu vào Backend API
  if (window.location.protocol.startsWith('http')) {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.checkoutData)
    }).catch(e => console.log('API sync order:', e));
  }

  state.cart = [];
  saveCart();
  renderOrderSuccess(state.checkoutData);
}

function renderOrderSuccess(order) {
  const modalContent = document.getElementById('checkout-modal-content');
  if (!modalContent) return;

  modalContent.innerHTML = `
    <div class="p-8 text-center max-w-xl mx-auto">
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
        <i data-lucide="check" class="w-8 h-8"></i>
      </div>

      <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
        Đặt Hàng Thành Công!
      </span>

      <h2 class="text-xl md:text-2xl font-black text-slate-900 mt-2">
        Cảm Ơn Cần Thủ ${order.customer.name}!
      </h2>

      <p class="text-slate-600 text-xs mt-1">
        Mã đơn hàng: <strong class="text-sky-600 font-mono text-sm">${order.orderId}</strong>
      </p>

      <div class="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
        <div class="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span>Chi Tiết Đơn Hàng</span>
          <span class="text-slate-400 font-normal">${order.createdAt}</span>
        </div>

        <div class="space-y-1">
          <div>Người nhận: <strong class="text-slate-800">${order.customer.name}</strong> (${order.customer.phone})</div>
          <div>Địa chỉ: <span class="text-slate-700">${order.customer.address}, ${order.customer.city}</span></div>
          ${order.customer.notes ? `<div>Ghi chú: <span class="italic text-slate-600">${order.customer.notes}</span></div>` : ''}
          <div>Hình thức: <strong class="text-sky-700">${order.paymentMethod === 'cod' ? 'Thanh toán COD khi nhận hàng' : 'Chuyển khoản VietQR'}</strong></div>
        </div>

        <div class="border-t border-slate-200 pt-2 divide-y divide-slate-100">
          ${order.items.map(item => `
            <div class="py-1 flex justify-between">
              <span>${item.name} x${item.quantity}</span>
              <span class="font-semibold">${formatVND(item.price * item.quantity)}</span>
            </div>
          `).join('')}
        </div>

        <div class="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-xs">
          <span>Tổng tiền thanh toán:</span>
          <span class="text-sky-700 text-base font-extrabold">${formatVND(order.totals.total)}</span>
        </div>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button 
          onclick="window.print()"
          class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <i data-lucide="printer" class="w-4 h-4"></i> In Hóa Đơn
        </button>
        <button 
          onclick="closeCheckoutModal()"
          class="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Tiếp Tục Mua Sắm
        </button>
      </div>
    </div>
  `;

  lucide.createIcons({ root: modalContent });
}

// Global search & sort listener
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderProducts();
  });
}

function setupSort() {
  const select = document.getElementById('sort-select');
  if (!select) return;

  select.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });
}

// Sidebar Drawer Toggle (Thanh Dọc Bên Trái)
function toggleSidebarDrawer(open) {
  const backdrop = document.getElementById('sidebar-drawer-backdrop');
  const drawer = document.getElementById('sidebar-drawer');
  if (!backdrop || !drawer) return;

  if (open) {
    backdrop.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      drawer.classList.remove('-translate-x-full');
    });
  } else {
    backdrop.classList.add('opacity-0');
    drawer.classList.add('-translate-x-full');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 300);
  }
}

// Helper an toàn khi gọi Lucide Icons
function safeCreateIcons(options) {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons(options);
    } catch (e) {
      console.warn('Lucide icon warning:', e);
    }
  }
}

// Theme Toggle (Light / Dark Mode)
function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theopro_theme', theme);
  const root = document.documentElement;
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');

  if (theme === 'dark') {
    root.classList.add('dark');
    toggleBtns.forEach(btn => {
      btn.innerHTML = `<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>`;
      btn.title = 'Chuyển sang giao diện Sáng';
    });
  } else {
    root.classList.remove('dark');
    toggleBtns.forEach(btn => {
      btn.innerHTML = `<i data-lucide="moon" class="w-4 h-4 text-slate-700"></i>`;
      btn.title = 'Chuyển sang giao diện Tối';
    });
  }
  safeCreateIcons();
}

function toggleTheme() {
  const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? 'Đã chuyển sang giao diện Tối 🌙' : 'Đã chuyển sang giao diện Sáng ☀️', 'info');
}

function initTheme() {
  // Luôn đặt Dark Mode làm theme chuẩn mặc định cho thương hiệu Vua Thẻo Câu PRO
  let savedTheme = localStorage.getItem('theopro_theme');
  if (!savedTheme || savedTheme === 'light') {
    savedTheme = 'dark';
    localStorage.setItem('theopro_theme', 'dark');
  }
  applyTheme(savedTheme);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderCategories();
  renderProducts();
  renderFlashSale();
  initFlashSaleTimer();
  renderRigAdvisor();
  renderRigSizeTable();
  renderBlogArticles();
  renderReviews();
  renderDiyVisualizer();
  calculateDiyPrice();
  updateCartBadge();
  updateWishlistBadge();
  setupSearch();
  setupSort();
  initRecentSalesNotification();
  safeCreateIcons();
});
