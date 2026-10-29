/**
 * BACKEND REST API & STATIC SERVER - VUA THẺO CÂU PRO
 * Phương án 0đ: Chạy trực tiếp trên Node.js không cần cài thêm thư viện
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');
const JWT_SECRET = 'VUA_THEO_CAU_PRO_SUPER_SECRET_KEY_2026';

// Password Security Helpers using PBKDF2 with SHA-512 and random Salt
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedCombined) {
  if (!storedCombined || !storedCombined.includes(':')) return false;
  const [salt, originalHash] = storedCombined.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

function generateToken(user) {
  const payload = Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Database Helpers (Thread-safe read/write)
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { products: [], orders: [], settings: {} };
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { products: [], orders: [], settings: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Helper to parse JSON body
function getRequestBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// JSON Response Helper with CORS
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Main HTTP Handler
const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];
  const searchParams = new URLSearchParams(urlParts[1] || '');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ==========================================
  // BACKEND REST APIs (/api/...)
  // ==========================================

  // 0. AUTHENTICATION APIs (/api/auth/...)
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return sendJSON(res, 400, { success: false, message: 'Họ tên, email và mật khẩu là bắt buộc' });
    }

    if (password.length < 6) {
      return sendJSON(res, 400, { success: false, message: 'Mật khẩu phải từ 6 ký tự trở lên' });
    }

    const db = readDB();
    if (!db.users) db.users = [];

    const normEmail = email.trim().toLowerCase();
    const existing = db.users.find(u => u.email === normEmail || (phone && u.phone === phone));
    if (existing) {
      return sendJSON(res, 400, { success: false, message: 'Email hoặc Số điện thoại này đã được đăng ký!' });
    }

    const hashedPassword = hashPassword(password);
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: normEmail,
      phone: (phone || '').trim(),
      passwordHash: hashedPassword,
      role: 'customer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toLocaleString('vi-VN')
    };

    db.users.push(newUser);
    writeDB(db);

    const safeUser = { ...newUser };
    delete safeUser.passwordHash;
    const token = generateToken(safeUser);

    return sendJSON(res, 201, {
      success: true,
      message: 'Đăng ký tài khoản cần thủ thành công!',
      token,
      user: safeUser
    });
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return sendJSON(res, 400, { success: false, message: 'Vui lòng nhập email/SĐT và mật khẩu' });
    }

    const db = readDB();
    if (!db.users) db.users = [];

    const normInput = email.trim().toLowerCase();

    // Tài khoản admin hệ thống mặc định
    if ((normInput === 'admin' || normInput === 'admin@theocau.pro') && password === 'admin123') {
      const adminUser = {
        id: 9999,
        name: 'Chủ Shop Admin',
        email: 'admin@theocau.pro',
        phone: '0988776655',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      const token = generateToken(adminUser);
      return sendJSON(res, 200, { success: true, message: 'Đăng nhập thành công với quyền Chủ Shop!', token, user: adminUser });
    }

    const user = db.users.find(u => u.email === normInput || u.phone === normInput);
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return sendJSON(res, 401, { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    const token = generateToken(safeUser);

    return sendJSON(res, 200, {
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: safeUser
    });
  }

  if (pathname === '/api/auth/google' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const { email, name, avatar, googleId } = body;

    if (!email) {
      return sendJSON(res, 400, { success: false, message: 'Thông tin Google không hợp lệ' });
    }

    const db = readDB();
    if (!db.users) db.users = [];

    const normEmail = email.trim().toLowerCase();
    let user = db.users.find(u => u.email === normEmail);

    if (!user) {
      user = {
        id: Date.now(),
        name: name || 'Cần Thủ Google',
        email: normEmail,
        phone: '',
        role: 'customer',
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        authProvider: 'google',
        googleId: googleId || '',
        createdAt: new Date().toLocaleString('vi-VN')
      };
      db.users.push(user);
      writeDB(db);
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    const token = generateToken(safeUser);

    return sendJSON(res, 200, {
      success: true,
      message: 'Đăng nhập bằng Google thành công!',
      token,
      user: safeUser
    });
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/, '');
    const decoded = verifyToken(token);

    if (!decoded) {
      return sendJSON(res, 401, { success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
    }

    const db = readDB();
    const user = (db.users || []).find(u => u.id === decoded.userId);
    if (!user && decoded.userId === 9999) {
      return sendJSON(res, 200, {
        success: true,
        user: { id: 9999, name: 'Chủ Shop Admin', email: 'admin@theocau.pro', role: 'admin' }
      });
    }

    if (!user) {
      return sendJSON(res, 404, { success: false, message: 'Không tìm thấy người dùng' });
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    return sendJSON(res, 200, { success: true, user: safeUser });
  }

  // 1. PRODUCTS API
  if (pathname === '/api/products' && req.method === 'GET') {
    const db = readDB();
    let list = db.products || [];
    const cat = searchParams.get('category');
    if (cat && cat !== 'all') {
      list = list.filter(p => p.category === cat);
    }
    return sendJSON(res, 200, { success: true, total: list.length, data: list });
  }

  if (pathname.startsWith('/api/products/') && req.method === 'GET') {
    const id = parseInt(pathname.replace('/api/products/', ''));
    const db = readDB();
    const product = (db.products || []).find(p => p.id === id);
    if (!product) return sendJSON(res, 404, { success: false, message: 'Không tìm thấy thẻo câu' });
    return sendJSON(res, 200, { success: true, data: product });
  }

  if (pathname === '/api/products' && req.method === 'POST') {
    const body = await getRequestBody(req);
    if (!body.name || !body.price) {
      return sendJSON(res, 400, { success: false, message: 'Tên và giá sản phẩm là bắt buộc' });
    }

    const db = readDB();
    const newProduct = {
      id: Date.now(),
      name: body.name,
      category: body.category || 'theo-dai',
      price: parseInt(body.price),
      originalPrice: parseInt(body.originalPrice) || Math.round(body.price * 1.3),
      rating: 5.0,
      reviewsCount: 1,
      soldCount: 0,
      badge: body.badge || 'Mới',
      badgeColor: 'bg-emerald-600',
      image: body.image || 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
      shortDesc: body.shortDesc || 'Thẻo câu cá buộc tay cao cấp',
      targetFish: body.targetFish || ['Cá Chép', 'Cá Rô Phi'],
      style: body.style || 'Câu Đài Chuyên Nghiệp',
      specs: body.specs || {
        lineMaterial: 'Fluorocarbon Nhật',
        lineSize: '#1.5 (Tải 5.5kg)',
        hookModel: 'Iseama #6 Có Ngạnh',
        hookSize: '#6',
        rigLength: '25cm',
        craft: 'Buộc tay thủ công',
        pack: 'Vỉ 10 bộ thẻo đôi'
      },
      variants: body.variants || [{ name: 'Cước chuẩn - Lưỡi thông dụng', price: parseInt(body.price) }]
    };

    db.products.unshift(newProduct);
    writeDB(db);
    return sendJSON(res, 201, { success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
  }

  if (pathname.startsWith('/api/products/') && req.method === 'PUT') {
    const id = parseInt(pathname.replace('/api/products/', ''));
    const body = await getRequestBody(req);
    const db = readDB();
    const idx = (db.products || []).findIndex(p => p.id === id);

    if (idx === -1) {
      return sendJSON(res, 404, { success: false, message: 'Không tìm thấy sản phẩm' });
    }

    db.products[idx] = { ...db.products[idx], ...body, id };
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Cập nhật thành công', data: db.products[idx] });
  }

  if (pathname.startsWith('/api/products/') && req.method === 'DELETE') {
    const id = parseInt(pathname.replace('/api/products/', ''));
    const db = readDB();
    const initLen = db.products.length;
    db.products = db.products.filter(p => p.id !== id);

    if (db.products.length === initLen) {
      return sendJSON(res, 404, { success: false, message: 'Không tìm thấy sản phẩm' });
    }

    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Đã xóa sản phẩm thành công' });
  }

  // 2. ORDERS API
  if (pathname === '/api/orders' && req.method === 'GET') {
    const db = readDB();
    return sendJSON(res, 200, { success: true, total: (db.orders || []).length, data: db.orders || [] });
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    const body = await getRequestBody(req);
    if (!body.customer || !body.items || body.items.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Thông tin đơn hàng không hợp lệ' });
    }

    const db = readDB();
    const orderId = body.orderId || ('THEO-' + Math.floor(100000 + Math.random() * 900000));
    const newOrder = {
      orderId,
      customer: body.customer,
      items: body.items,
      totals: body.totals,
      paymentMethod: body.paymentMethod || 'cod',
      status: 'pending',
      createdAt: new Date().toLocaleString('vi-VN')
    };

    if (!db.orders) db.orders = [];
    db.orders.unshift(newOrder);

    // Cập nhật số lượng đã bán (soldCount) cho các sản phẩm
    body.items.forEach(item => {
      const prod = db.products.find(p => p.id === item.productId);
      if (prod) prod.soldCount = (prod.soldCount || 0) + item.quantity;
    });

    writeDB(db);
    return sendJSON(res, 201, { success: true, message: 'Đặt hàng thành công', data: newOrder });
  }

  // Tra cứu đơn hàng theo SĐT hoặc mã đơn
  if (pathname === '/api/orders/track' && req.method === 'GET') {
    const q = (searchParams.get('q') || '').trim().toUpperCase();
    if (!q) return sendJSON(res, 400, { success: false, message: 'Vui lòng cung cấp mã đơn hoặc SĐT' });

    const db = readDB();
    const order = (db.orders || []).find(o => 
      o.orderId.toUpperCase() === q || 
      (o.customer && o.customer.phone === q)
    );

    if (!order) {
      return sendJSON(res, 404, { success: false, message: 'Không tìm thấy đơn hàng phù hợp' });
    }

    return sendJSON(res, 200, { success: true, data: order });
  }

  // Đổi trạng thái đơn hàng (Admin)
  if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && (req.method === 'PATCH' || req.method === 'PUT')) {
    const orderId = pathname.replace('/api/orders/', '').replace('/status', '');
    const body = await getRequestBody(req);
    const db = readDB();
    const order = (db.orders || []).find(o => o.orderId === orderId);

    if (!order) return sendJSON(res, 404, { success: false, message: 'Không tìm thấy đơn hàng' });

    order.status = body.status;
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Đã cập nhật trạng thái đơn hàng', data: order });
  }

  // 3. ANALYTICS & CRM API
  if (pathname === '/api/analytics' && req.method === 'GET') {
    const db = readDB();
    const orders = db.orders || [];
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    const uniqueCustomers = new Set(orders.map(o => o.customer?.phone).filter(Boolean)).size;

    return sendJSON(res, 200, {
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        totalCustomers: uniqueCustomers,
        aov: validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0
      }
    });
  }

  if (pathname === '/api/customers' && req.method === 'GET') {
    const db = readDB();
    const customerMap = {};
    (db.orders || []).forEach(o => {
      const phone = o.customer?.phone;
      if (!phone) return;
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: o.customer.name,
          phone,
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

    return sendJSON(res, 200, {
      success: true,
      data: Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent)
    });
  }

  // 4. STORE SETTINGS API
  if (pathname === '/api/settings' && req.method === 'GET') {
    const db = readDB();
    return sendJSON(res, 200, { success: true, data: db.settings || {} });
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const db = readDB();
    db.settings = { ...db.settings, ...body };
    writeDB(db);
    return sendJSON(res, 200, { success: true, message: 'Đã lưu cài đặt', data: db.settings });
  }

  // 5. WEBHOOK THANH TOÁN TỰ ĐỘNG (VietQR / SePay / Casso)
  if (pathname === '/api/webhook/sepay' && req.method === 'POST') {
    const body = await getRequestBody(req);
    const db = readDB();
    
    // Nhận thông tin chuyển khoản từ SePay (content, transferAmount)
    const transferContent = (body.content || '').toUpperCase();
    const amount = body.transferAmount || 0;

    // Tìm đơn hàng khớp mã
    const matchedOrder = (db.orders || []).find(o => transferContent.includes(o.orderId.toUpperCase()));
    if (matchedOrder && amount >= matchedOrder.totals?.total) {
      matchedOrder.status = 'processing'; // Đã thanh toán, chuyển sang xưởng tóm thẻo
      writeDB(db);
      console.log(`[Webhook] Tự động duyệt đơn ${matchedOrder.orderId} qua VietQR thành công!`);
      return sendJSON(res, 200, { success: true, message: `Duyệt đơn ${matchedOrder.orderId} thành công` });
    }

    return sendJSON(res, 200, { success: false, message: 'Không tìm thấy đơn hàng khớp nội dung' });
  }

  // ==========================================
  // STATIC FILES SERVING (index.html, admin.html, css, js)
  // ==========================================
  let reqUrl = pathname;
  if (reqUrl === '/') reqUrl = '/index.html';
  if (!path.extname(reqUrl)) reqUrl += '.html';

  let filePath = path.join(__dirname, reqUrl);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), reqUrl);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end('<h1>404 Không Tìm Thấy Trang</h1><p><a href="/">Quay về trang chủ Vua Thẻo</a></p>');
      } else {
        res.writeHead(500);
        res.end(`Lỗi Máy Chủ: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

// Start Server
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n============================================================`);
  console.log(`🎣 VUA THẺO CÂU PRO - MÁY CHỦ BACKEND & FRONTEND ĐANG CHẠY`);
  console.log(`📡 URL Cửa Hàng:     ${url}`);
  console.log(`🔑 URL Trang Admin:  ${url}/admin.html`);
  console.log(`⚡ REST API Base:    ${url}/api/products`);
  console.log(`============================================================\n`);

  // Tự động mở trình duyệt nếu đang chạy local trên Windows
  if (process.platform === 'win32' && !process.env.PORT) {
    exec(`start ${url}`);
  }
});
