/**
 * Authentication & User Session Module - VUA THẺO CÂU PRO
 * Hỗ trợ Đăng ký, Đăng nhập thường (Mã hóa mật khẩu), Đăng nhập Google, Quản lý Cần Thủ
 */

const AUTH_STORAGE_KEY = 'theopro_auth_token';
const USER_STORAGE_KEY = 'theopro_user_info';
const LOCAL_USERS_KEY = 'theopro_local_users'; // Fallback offline

// ==========================================
// 1. HELPER & STATE
// ==========================================
function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY) || null;
}

function getCurrentUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setAuthSession(token, user, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  // Đồng bộ qua session kia nếu có
  if (remember) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

// Thông báo Toast nhanh cho trang auth
function showAuthToast(message, type = 'info') {
  let container = document.getElementById('auth-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'auth-toast-container';
    container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgClass = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white');
  const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info');

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-semibold ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 2. REGISTER USER (ĐĂNG KÝ CẦN THỦ)
// ==========================================
async function handleUserRegister(formData) {
  const { name, email, phone, password } = formData;

  // Thử gửi qua Backend REST API
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setAuthSession(data.token, data.user, true);
        return { success: true, message: data.message || 'Đăng ký tài khoản cần thủ thành công!', user: data.user };
      } else {
        return { success: false, message: data.message || 'Đăng ký thất bại' };
      }
    }
  } catch (e) {
    console.warn('Backend API unavailable, using offline mock registration:', e);
  }

  // Fallback Offline khi chạy file:/// hoặc API chưa bật
  const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  const existed = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase() || (phone && u.phone === phone));
  if (existed) {
    return { success: false, message: 'Email hoặc Số điện thoại này đã được đăng ký trên hệ thống!' };
  }

  const newUser = {
    id: Date.now(),
    name,
    email: email.toLowerCase(),
    phone,
    role: 'customer',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    createdAt: new Date().toISOString()
  };

  localUsers.push({ ...newUser, passwordHash: 'mock_hash_' + btoa(password) });
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

  const mockToken = 'mock_token_' + btoa(JSON.stringify(newUser));
  setAuthSession(mockToken, newUser, true);

  return { success: true, message: 'Tạo tài khoản cần thủ thành công!', user: newUser };
}

// ==========================================
// 3. LOGIN USER (ĐĂNG NHẬP THƯỜNG)
// ==========================================
async function handleUserLogin(emailOrPhone, password, remember = true) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrPhone, password })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setAuthSession(data.token, data.user, remember);
        return { success: true, message: 'Đăng nhập thành công!', user: data.user };
      } else {
        return { success: false, message: data.message || 'Sai thông tin đăng nhập' };
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, message: errData.message || 'Tài khoản hoặc mật khẩu không chính xác' };
    }
  } catch (e) {
    console.warn('Backend API unavailable, checking local offline credentials:', e);
  }

  // Fallback Offline
  const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  const inputNorm = emailOrPhone.trim().toLowerCase();
  
  // Tài khoản admin mặc định
  if ((inputNorm === 'admin' || inputNorm === 'admin@theocau.pro') && password === 'admin123') {
    const adminUser = {
      id: 9999,
      name: 'Chủ Shop Admin',
      email: 'admin@theocau.pro',
      phone: '0988776655',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
    const mockToken = 'mock_admin_token_' + Date.now();
    setAuthSession(mockToken, adminUser, remember);
    return { success: true, message: 'Đăng nhập thành công với quyền Chủ Shop!', user: adminUser };
  }

  const user = localUsers.find(u => (u.email === inputNorm || u.phone === inputNorm));
  if (!user || user.passwordHash !== 'mock_hash_' + btoa(password)) {
    return { success: false, message: 'Email/Số điện thoại hoặc Mật khẩu không chính xác!' };
  }

  const safeUser = { ...user };
  delete safeUser.passwordHash;
  const mockToken = 'mock_token_' + btoa(JSON.stringify(safeUser));
  setAuthSession(mockToken, safeUser, remember);
  return { success: true, message: 'Đăng nhập thành công!', user: safeUser };
}

// ==========================================
// 4. GOOGLE SIGN-IN (ĐĂNG NHẬP GOOGLE)
// ==========================================
async function handleGoogleLogin(googleUserData) {
  // googleUserData: { email, name, avatar, googleId }
  try {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleUserData)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        setAuthSession(data.token, data.user, true);
        return { success: true, message: `Chào mừng ${data.user.name} đã đăng nhập qua Google!`, user: data.user };
      }
    }
  } catch (e) {
    console.warn('Backend API unavailable, using offline Google auth:', e);
  }

  // Fallback Offline Google Auth
  const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  let user = localUsers.find(u => u.email === googleUserData.email.toLowerCase());

  if (!user) {
    user = {
      id: Date.now(),
      name: googleUserData.name,
      email: googleUserData.email.toLowerCase(),
      phone: '',
      role: 'customer',
      avatar: googleUserData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      authProvider: 'google',
      createdAt: new Date().toISOString()
    };
    localUsers.push(user);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
  }

  const mockToken = 'mock_google_token_' + btoa(JSON.stringify(user));
  setAuthSession(mockToken, user, true);
  return { success: true, message: `Đăng nhập Google thành công! Chào ${user.name}`, user };
}

// Giả lập Popup chọn tài khoản Google để trải nghiệm ngay lập tức
function triggerMockGooglePrompt(callback) {
  // Tạo Modal popup chọn nhanh tài khoản Google
  const modalId = 'google-signin-mock-modal';
  const oldModal = document.getElementById(modalId);
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in';
  modal.innerHTML = `
    <div class="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span class="font-bold text-xs text-slate-700">Đăng nhập bằng Google</span>
        </div>
        <button id="close-mock-google" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
      </div>

      <div class="text-xs text-slate-600">
        Chọn một tài khoản Google để tiếp tục với <strong>Vua Thẻo Câu PRO</strong>:
      </div>

      <div class="space-y-2">
        <button id="mock-google-acc-1" class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80 text-left">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" class="w-9 h-9 rounded-full object-cover shadow" alt="Avatar">
          <div class="overflow-hidden">
            <div class="font-bold text-xs text-slate-900 truncate">Nguyễn Cần Thủ</div>
            <div class="text-[11px] text-slate-500 truncate">nguyencan-thu@gmail.com</div>
          </div>
        </button>

        <button id="mock-google-acc-2" class="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200/80 text-left">
          <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" class="w-9 h-9 rounded-full object-cover shadow" alt="Avatar">
          <div class="overflow-hidden">
            <div class="font-bold text-xs text-slate-900 truncate">Trần Đình Câu Đài</div>
            <div class="text-[11px] text-slate-500 truncate">trandinh.caudai@gmail.com</div>
          </div>
        </button>
      </div>

      <div class="text-[10px] text-slate-400 text-center pt-1">
        Google Identity Services Sandbox • Bảo mật OAuth 2.0
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  document.getElementById('close-mock-google').onclick = closeModal;

  document.getElementById('mock-google-acc-1').onclick = async () => {
    closeModal();
    const result = await handleGoogleLogin({
      email: 'nguyencan-thu@gmail.com',
      name: 'Nguyễn Cần Thủ',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      googleId: 'google_id_10101'
    });
    if (callback) callback(result);
  };

  document.getElementById('mock-google-acc-2').onclick = async () => {
    closeModal();
    const result = await handleGoogleLogin({
      email: 'trandinh.caudai@gmail.com',
      name: 'Trần Đình Câu Đài',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      googleId: 'google_id_20202'
    });
    if (callback) callback(result);
  };
}

// ==========================================
// 5. HEADER SYNC (HIỂN THỊ TRẠNG THÁI TRÊN WEBSITE)
// ==========================================
function updateHeaderUserUI() {
  const user = getCurrentUser();
  const userSlots = document.querySelectorAll('.header-user-slot');

  userSlots.forEach(slot => {
    if (user) {
      slot.innerHTML = `
        <div class="relative group">
          <button class="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-sm">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" class="w-6 h-6 rounded-full object-cover ring-2 ring-sky-500/40" alt="Avatar">
            <span class="hidden md:inline max-w-[110px] truncate text-left">
              ${user.name}
            </span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform"></i>
          </button>

          <!-- Dropdown Menu -->
          <div class="hidden group-hover:block absolute right-0 top-full pt-2 w-52 z-50 animate-fade-in">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 text-xs space-y-1">
              <div class="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div class="font-extrabold text-slate-900 dark:text-white truncate">${user.name}</div>
                <div class="text-[10px] text-slate-400 truncate">${user.email}</div>
                ${user.role === 'admin' ? '<span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-500 text-white">Chủ Shop Admin</span>' : '<span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500">Cần Thủ Thành Viên</span>'}
              </div>

              ${user.role === 'admin' ? `
                <a href="admin.html" class="flex items-center gap-2 px-3 py-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-bold transition-colors">
                  <i data-lucide="shield-check" class="w-4 h-4"></i> Trang Quản Trị Shop
                </a>
              ` : ''}

              <button onclick="openOrderTrackingModal()" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 font-semibold transition-colors text-left">
                <i data-lucide="package-search" class="w-4 h-4 text-amber-500"></i> Đơn Hàng Của Tôi
              </button>

              <button onclick="logoutUser()" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold transition-colors text-left">
                <i data-lucide="log-out" class="w-4 h-4"></i> Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      slot.innerHTML = `
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <a href="login.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm">
            <i data-lucide="log-in" class="w-3.5 h-3.5 text-sky-500"></i>
            <span>Đăng Nhập</span>
          </a>
          <a href="register.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white text-xs font-black transition-all shadow-md shadow-sky-600/20">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Đăng Ký</span>
          </a>
        </div>
      `;
    }
  });

  if (window.lucide && typeof lucide.createIcons === 'function') {
    try {
      lucide.createIcons();
    } catch (e) {}
  }
}

function logoutUser() {
  clearAuthSession();
  showAuthToast('Đã đăng xuất tài khoản thành công!', 'info');
  updateHeaderUserUI();
  // Nếu đang ở trang admin hoặc trang yêu cầu auth thì reload
  if (window.location.pathname.includes('admin.html')) {
    window.location.reload();
  }
}

// Khởi tạo trạng thái khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderUserUI();
});

