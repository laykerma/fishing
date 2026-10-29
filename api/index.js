/**
 * Vercel Serverless Function Handler - VUA THẺO CÂU PRO
 */
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) return { products: [], orders: [], settings: {} };
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (err) {
    return { products: [], orders: [], settings: {} };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { url, method, body } = req;
  const db = readDB();

  // 1. PRODUCTS
  if (url.includes('/api/products') && method === 'GET') {
    return res.status(200).json({ success: true, total: (db.products || []).length, data: db.products || [] });
  }

  if (url.includes('/api/products') && method === 'POST') {
    const newProduct = {
      id: Date.now(),
      name: body.name || 'Thẻo Mới',
      category: body.category || 'theo-dai',
      price: parseInt(body.price) || 35000,
      originalPrice: parseInt(body.originalPrice) || 50000,
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
      variants: body.variants || [{ name: 'Cước chuẩn - Lưỡi thông dụng', price: parseInt(body.price) || 35000 }]
    };
    return res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công', data: newProduct });
  }

  // 2. ORDERS
  if (url.includes('/api/orders') && method === 'GET') {
    return res.status(200).json({ success: true, total: (db.orders || []).length, data: db.orders || [] });
  }

  if (url.includes('/api/orders') && method === 'POST') {
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
    return res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: newOrder });
  }

  // 3. ANALYTICS
  if (url.includes('/api/analytics') && method === 'GET') {
    const orders = db.orders || [];
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totals?.total || 0), 0);
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        totalCustomers: new Set(orders.map(o => o.customer?.phone).filter(Boolean)).size,
        aov: validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0
      }
    });
  }

  // 4. CUSTOMERS
  if (url.includes('/api/customers') && method === 'GET') {
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
    return res.status(200).json({ success: true, data: Object.values(customerMap) });
  }

  // 5. WEBHOOK
  if (url.includes('/api/webhook/sepay') && method === 'POST') {
    return res.status(200).json({ success: true, message: 'Đã nhận webhook chuyển khoản thành công' });
  }

  return res.status(200).json({ success: true, message: 'Vua Thẻo Câu Backend API đang hoạt động 100%' });
}
