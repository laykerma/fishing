/**
 * Supabase Cloud Database Client - VUA THẺO CÂU PRO
 * Kết nối Database PostgreSQL bảo mật & lưu trữ vĩnh viễn trên Cloud
 */

const SUPABASE_CONFIG = {
  url: 'https://ktiunyztxyjrvneuunta.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aXVueXp0eHlqcnZuZXV1bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzY0MTksImV4cCI6MjEwODkxMjQxOX0.rkHo76ENiE8-_um2pghExm-uoEHEVnLQGKuk4z3hhI0'
};

// Khởi tạo Supabase JS SDK nếu có thư viện
let sbClient = null;
function getSupabaseClient() {
  if (!sbClient && window.supabase && typeof window.supabase.createClient === 'function') {
    sbClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    window.sbClient = sbClient;
  }
  return sbClient;
}

const supabaseHeaders = {
  'apikey': SUPABASE_CONFIG.anonKey,
  'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ==========================================
// 1. ORDERS API (LƯU & ĐỒNG BỘ ĐƠN HÀNG)
// ==========================================
async function dbCreateOrder(orderData) {
  try {
    const payload = {
      id: orderData.orderId,
      customer: orderData.customer,
      items: orderData.items,
      totals: orderData.totals,
      payment_method: orderData.paymentMethod || 'cod',
      status: orderData.status || 'pending',
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ Đã lưu đơn hàng lên Supabase Cloud:', orderData.orderId);
      return { success: true };
    } else {
      console.warn('Supabase order insert error:', await res.text());
    }
  } catch (err) {
    console.warn('Không thể kết nối Supabase, fallback sang local:', err);
  }
  return { success: false };
}

async function dbGetOrders() {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: supabaseHeaders
    });
    if (res.ok) {
      const rows = await res.json();
      return rows.map(r => ({
        orderId: r.id,
        customer: r.customer,
        items: r.items,
        totals: r.totals,
        paymentMethod: r.payment_method,
        status: r.status,
        createdAt: new Date(r.created_at).toLocaleString('vi-VN')
      }));
    }
  } catch (err) {
    console.warn('Lỗi lấy đơn hàng từ Supabase:', err);
  }
  return null;
}

async function dbUpdateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify({ status: newStatus })
    });
    return res.ok;
  } catch (err) {
    console.warn('Lỗi cập nhật trạng thái đơn:', err);
    return false;
  }
}

// ==========================================
// 2. USERS & AUTH API (PHÂN QUYỀN ADMIN / CẦN THỦ)
// ==========================================
async function dbRegisterUser(name, email, phone, password) {
  try {
    const normEmail = email.trim().toLowerCase();
    
    // Kiểm tra xem email đã tồn tại chưa
    const checkRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?email=eq.${encodeURIComponent(normEmail)}&select=id`, {
      headers: supabaseHeaders
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      if (existing.length > 0) {
        return { success: false, message: 'Email này đã được đăng ký tài khoản rồi!' };
      }
    }

    const newUser = {
      name: name.trim(),
      email: normEmail,
      phone: (phone || '').trim(),
      password_hash: password, // Có thể băm thêm
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      auth_provider: 'local'
    };

    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(newUser)
    });

    if (res.ok) {
      const created = await res.json();
      const user = created[0] || newUser;
      delete user.password_hash;
      return { success: true, user, message: 'Đăng ký tài khoản cần thủ thành công!' };
    }
  } catch (err) {
    console.warn('Lỗi đăng ký Supabase:', err);
  }
  return null; // Fallback
}

async function dbLoginUser(email, password) {
  try {
    const normInput = email.trim().toLowerCase();
    // Hỗ trợ tìm qua Email, Số điện thoại hoặc tên 'admin'
    let filterQuery = `or=(email.eq.${encodeURIComponent(normInput)},phone.eq.${encodeURIComponent(normInput)})`;
    if (normInput === 'admin') {
      filterQuery = `or=(email.eq.admin@theocau.pro,role.eq.admin)`;
    }
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?${filterQuery}&select=*`, {
      headers: supabaseHeaders
    });

    if (res.ok) {
      const rows = await res.json();
      if (rows.length > 0) {
        const user = rows[0];
        if (user.password_hash === password) {
          delete user.password_hash;
          return { success: true, user, message: `Chào mừng ${user.name} đã quay trở lại!` };
        } else {
          return { success: false, message: 'Mật khẩu không chính xác!' };
        }
      } else {
        return { success: false, message: 'Không tìm thấy tài khoản với email hoặc SĐT này!' };
      }
    }
  } catch (err) {
    console.warn('Lỗi đăng nhập Supabase:', err);
  }
  return null;
}

// Xác thực Admin bảo mật trên Cloud: CHỈ kiểm tra khớp, TUYỆT ĐỐI không trả password_hash về client
async function dbVerifyAdmin(userInput, password) {
  try {
    const norm = (userInput || '').trim().toLowerCase();
    const isNameAdmin = (norm === 'admin' || norm === 'admin@theocau.pro');
    let filter = `role=eq.admin&password_hash=eq.${encodeURIComponent(password)}`;
    if (!isNameAdmin) {
      filter = `email=eq.${encodeURIComponent(norm)}&role=eq.admin&password_hash=eq.${encodeURIComponent(password)}`;
    }
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?${filter}&select=id,name,email,role,avatar`, {
      headers: supabaseHeaders
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0) {
        return { success: true, user: rows[0] };
      }
    }
  } catch (err) {
    console.warn('Lỗi xác thực admin Supabase:', err);
  }
  return { success: false };
}

// Cập nhật mật khẩu Admin an toàn: Chỉ cho đổi khi mật khẩu cũ (oldPassword) khớp trên Cloud
async function dbChangeAdminPassword(oldPassword, newPassword) {
  try {
    // 1. Kiểm tra mật khẩu cũ trên Cloud trước
    const checkFilter = `role=eq.admin&password_hash=eq.${encodeURIComponent(oldPassword)}`;
    const checkRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?${checkFilter}&select=id`, {
      headers: supabaseHeaders
    });
    if (!checkRes.ok) return false;
    const existing = await checkRes.json();
    if (!existing || existing.length === 0) {
      // Mật khẩu cũ không khớp trên Cloud
      return false;
    }

    // 2. Thực hiện cập nhật sang mật khẩu mới
    const updateRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?role=eq.admin&id=eq.${existing[0].id}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify({ password_hash: newPassword })
    });
    return updateRes.ok;
  } catch (err) {
    console.warn('Lỗi cập nhật mật khẩu admin lên Supabase:', err);
    return false;
  }
}

// ==========================================
// 3. GOOGLE OAUTH THẬT (GOOGLE SIGN-IN)
// ==========================================
async function dbSignInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    alert('Thư viện Supabase SDK chưa tải xong, vui lòng thử lại sau 2 giây.');
    return;
  }

  // Tự động chuyển hướng về trang chủ sau khi xác thực Google thành công
  const redirectUrl = window.location.origin + window.location.pathname.replace(/\/(login|register)\.html$/, '/index.html');
  
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    console.error('Google OAuth error:', error);
    if (error.message && error.message.includes('not enabled')) {
      alert('Chưa kích hoạt Google Provider trong Supabase!\n\nVui lòng vào Supabase Dashboard -> Authentication -> Providers -> Bật Google và nhập Google Client ID & Secret.');
    } else {
      alert('Lỗi đăng nhập Google: ' + error.message);
    }
  }
  return { data, error };
}

// Lắng nghe và đồng bộ phiên đăng nhập Google sau khi redirect về trang
async function initSupabaseAuthListener() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data: { session } } = await client.auth.getSession();
    if (session && session.user) {
      const sbUser = session.user;
      const email = sbUser.email;
      const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0];
      const avatar = sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

      const userObj = {
        id: sbUser.id,
        name,
        email,
        phone: sbUser.phone || '',
        role: 'customer',
        avatar,
        authProvider: 'google',
        createdAt: sbUser.created_at || new Date().toISOString()
      };

      // Đồng bộ thông tin người dùng vào bảng public.users
      fetch(`${SUPABASE_CONFIG.url}/rest/v1/users`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          name: userObj.name,
          email: userObj.email,
          avatar: userObj.avatar,
          auth_provider: 'google',
          role: 'customer'
        })
      }).catch(e => console.warn('Sync google user error:', e));

      if (typeof setAuthSession === 'function') {
        setAuthSession(session.access_token, userObj, true);
      }
      if (typeof updateHeaderUserUI === 'function') {
        updateHeaderUserUI();
      }
    }

    client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && session.user) {
        const sbUser = session.user;
        const email = sbUser.email;
        const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0];
        const avatar = sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

        const userObj = {
          id: sbUser.id,
          name,
          email,
          phone: sbUser.phone || '',
          role: 'customer',
          avatar,
          authProvider: 'google',
          createdAt: sbUser.created_at || new Date().toISOString()
        };

        if (typeof setAuthSession === 'function') {
          setAuthSession(session.access_token, userObj, true);
        }
        if (typeof updateHeaderUserUI === 'function') {
          updateHeaderUserUI();
        }
      }
    });
  } catch (err) {
    console.warn('Supabase auth listener error:', err);
  }
}

// Tự động kích hoạt listener khi trang load
document.addEventListener('DOMContentLoaded', () => {
  initSupabaseAuthListener();
});

// Xuất các hàm ra toàn cục window để các file khác dùng được
window.dbCreateOrder = dbCreateOrder;
window.dbGetOrders = dbGetOrders;
window.dbUpdateOrderStatus = dbUpdateOrderStatus;
window.dbRegisterUser = dbRegisterUser;
window.dbLoginUser = dbLoginUser;
window.dbVerifyAdmin = dbVerifyAdmin;
window.dbChangeAdminPassword = dbChangeAdminPassword;
window.dbSignInWithGoogle = dbSignInWithGoogle;
window.getSupabaseClient = getSupabaseClient;

