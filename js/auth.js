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

  // 1. Thử đăng ký trực tiếp lên Supabase Cloud Database
  if (typeof dbRegisterUser === 'function') {
    const cloudRes = await dbRegisterUser(name, email, phone, password);
    if (cloudRes && cloudRes.success) {
      const token = 'sb_token_' + btoa(JSON.stringify(cloudRes.user));
      setAuthSession(token, cloudRes.user, true);
      return cloudRes;
    } else if (cloudRes && !cloudRes.success) {
      return cloudRes;
    }
  }

  // 2. Thử gửi qua Backend REST API
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
  // 1. Thử đăng nhập qua Supabase Cloud Database
  if (typeof dbLoginUser === 'function') {
    const cloudRes = await dbLoginUser(emailOrPhone, password);
    if (cloudRes && cloudRes.success) {
      const token = 'sb_token_' + btoa(JSON.stringify(cloudRes.user));
      setAuthSession(token, cloudRes.user, remember);
      return cloudRes;
    } else if (cloudRes && !cloudRes.success) {
      return cloudRes;
    }
  }

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
  
  // Kiểm tra tài khoản Quản Trị Viên (Admin)
  if (inputNorm === 'admin' || inputNorm === 'admin@theocau.pro') {
    let isAdminValid = false;
    // 1. Đối chiếu trực tiếp qua Cloud Supabase
    if (typeof window.dbVerifyAdmin === 'function') {
      try {
        const cloudVerify = await window.dbVerifyAdmin(inputNorm, password);
        if (cloudVerify && cloudVerify.success) isAdminValid = true;
      } catch (err) {}
    }

    // 2. Đối chiếu qua mật khẩu quản trị đã lưu trên máy
    if (!isAdminValid) {
      try {
        const creds = JSON.parse(localStorage.getItem('theopro_admin_creds') || '{}');
        if (creds && creds.password && password === creds.password) {
          isAdminValid = true;
        }
      } catch (e) {}
    }

    if (isAdminValid) {
      const adminUser = {
        id: 9999,
        name: 'Chủ Shop Admin',
        email: 'admin@theocau.pro',
        phone: '0988776655',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      const mockToken = 'mock_admin_token_' + Date.now();
      sessionStorage.setItem('theopro_admin_auth', 'true');
      setAuthSession(mockToken, adminUser, remember);
      return { success: true, message: 'Đăng nhập thành công với quyền Chủ Shop!', user: adminUser };
    } else {
      return { success: false, message: 'Mật khẩu tài khoản quản trị không chính xác!' };
    }
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

// Đăng nhập bằng Google Thật qua Supabase OAuth
async function triggerRealGoogleLogin() {
  if (typeof dbSignInWithGoogle === 'function') {
    await dbSignInWithGoogle();
  } else {
    showAuthToast('Đang kết nối cổng Google...', 'info');
  }
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
          <button class="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 transition-all text-xs font-bold text-slate-800 dark:text-white shadow-sm">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" class="w-6 h-6 rounded-full object-cover ring-2 ring-sky-500/40" alt="Avatar">
            <span class="hidden md:inline max-w-[110px] truncate text-left">
              ${user.name}
            </span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform hidden sm:inline"></i>
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
        <div class="hidden sm:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <a href="login.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm">
            <i data-lucide="log-in" class="w-3.5 h-3.5 text-sky-500"></i>
            <span>Đăng Nhập</span>
          </a>
          <a href="register.html" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white text-xs font-black transition-all shadow-md shadow-sky-600/20">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
            <span>Đăng Ký</span>
          </a>
        </div>
        <div class="flex sm:hidden items-center">
          <a href="login.html" class="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-sky-600 dark:text-sky-400 text-xs font-bold" title="Đăng Nhập">
            <i data-lucide="user" class="w-3.5 h-3.5"></i>
            <span class="text-[11px]">Vào</span>
          </a>
        </div>
      `;
    }
  });

  // Cập nhật thẻ người dùng ở thanh Menu Sidebar
  const sidebarUserSlot = document.getElementById('sidebar-user-slot');
  if (sidebarUserSlot) {
    if (user) {
      sidebarUserSlot.innerHTML = `
        <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3 overflow-hidden">
            <img src="${user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" class="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/40 flex-shrink-0" alt="Avatar">
            <div class="overflow-hidden">
              <div class="font-bold text-xs text-slate-900 dark:text-white truncate">${user.name}</div>
              <div class="text-[10px] text-slate-400 truncate">${user.email}</div>
            </div>
          </div>
          <button onclick="logoutUser()" class="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0" title="Đăng Xuất">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      sidebarUserSlot.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <i data-lucide="user" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="font-bold text-xs text-slate-900 dark:text-white">Tài Khoản Cần Thủ</div>
              <div class="text-[10px] text-slate-400">Đăng nhập để nhận ưu đãi & lưu đơn</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <a href="login.html" class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all text-center">
              <i data-lucide="log-in" class="w-3.5 h-3.5"></i>
              <span>Đăng Nhập</span>
            </a>
            <a href="register.html" class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all text-center">
              <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
              <span>Đăng Ký</span>
            </a>
          </div>
        </div>
      `;
    }
  }

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

