/**
 * Supabase Cloud Database Client - VUA THẺO CÂU PRO
 * Kết nối Database PostgreSQL bảo mật & lưu trữ vĩnh viễn trên Cloud
 */

const SUPABASE_CONFIG = {
  url: 'https://ktiunyztxyjrvneuunta.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aXVueXp0eHlqcnZuZXV1bnRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzY0MTksImV4cCI6MjEwODkxMjQxOX0.rkHo76ENiE8-_um2pghExm-uoEHEVnLQGKuk4z3hhI0'
};

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
    // Hỗ trợ tìm qua Email hoặc Số điện thoại
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?or=(email.eq.${encodeURIComponent(normInput)},phone.eq.${encodeURIComponent(normInput)})&select=*`, {
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

// Xuất các hàm ra toàn cục window để các file khác dùng được
window.dbCreateOrder = dbCreateOrder;
window.dbGetOrders = dbGetOrders;
window.dbUpdateOrderStatus = dbUpdateOrderStatus;
window.dbRegisterUser = dbRegisterUser;
window.dbLoginUser = dbLoginUser;
