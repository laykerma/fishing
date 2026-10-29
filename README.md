# 🎣 VUA THẺO CÂU PRO - HỆ THỐNG FULL-STACK E-COMMERCE (0 ĐỒNG)

Hệ thống bán hàng đồ câu cá & thẻo câu cá chuyên nghiệp tích hợp **Backend REST API** và **Admin Portal** hoàn chỉnh theo **Phương án 0đ (Không tốn chi phí máy chủ, không cần cài thư viện nặng)**.

---

## 🚀 Cách Chạy & Thử Nghiệm

Mở terminal tại thư mục dự án và chạy lệnh:
```bash
npm run dev
```

Máy chủ sẽ tự động khởi động tại cổng `3000` và mở trình duyệt cho bạn:
* 🌐 **Trang Bán Hàng (Client)**: [http://localhost:3000/index.html](http://localhost:3000/index.html)
* 🔐 **Trang Đăng Nhập Cần Thủ**: [http://localhost:3000/login.html](http://localhost:3000/login.html)
* 📝 **Trang Đăng Ký Cần Thủ**: [http://localhost:3000/register.html](http://localhost:3000/register.html)
* 🔑 **Trang Quản Trị Admin**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
  * Tài khoản mặc định: `admin`
  * Mật khẩu mặc định: `admin123`
  * *(Có thể đổi mật khẩu bất kỳ lúc nào trong tab **Cài Đặt Cửa Hàng**)*
* 📡 **REST API Backend**: [http://localhost:3000/api/products](http://localhost:3000/api/products)

---

## ⚡ Kiến Trúc Backend 0đ ([`server.js`](file:///c:/Users/FPTShop/Desktop/fishing/server.js))

### 1. Cơ Sở Dữ Liệu (`data/database.json`)
* Dữ liệu sản phẩm, đơn hàng, khách hàng, cài đặt shop được lưu trữ trực tiếp vào file JSON chuẩn cấu trúc.
* Hoạt động bền vững, không cần cài đặt MySQL hay MongoDB phức tạp trên máy tính.

### 2. Hệ Thống RESTful API:
| Phương thức | Đường dẫn API | Chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản cần thủ (Mã hóa PBKDF2 SHA-512 + Salt) |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản & cấp JWT Token bảo mật |
| `POST` | `/api/auth/google` | Đăng nhập / Đăng ký nhanh 1-chạm bằng tài khoản Google |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại qua Bearer Token |
| `GET` | `/api/products` | Lấy danh sách thẻo câu (hỗ trợ lọc theo danh mục) |
| `POST` | `/api/products` | Thêm thẻo câu mới (Admin) |
| `PUT` | `/api/products/:id` | Sửa giá tiền, ảnh, thông số thẻo (Admin) |
| `DELETE` | `/api/products/:id` | Xóa thẻo câu khỏi kho (Admin) |
| `GET` | `/api/orders` | Lấy toàn bộ đơn hàng (Admin) |
| `POST` | `/api/orders` | Khách đặt đơn hàng mới từ giỏ hàng |
| `GET` | `/api/orders/track?q=...` | Tra cứu hành trình đơn bằng SĐT hoặc mã đơn |
| `PATCH` | `/api/orders/:id/status` | Cập nhật trạng thái đơn (Chờ duyệt ➔ Đang tóm ➔ Đang giao ➔ Hoàn tất) |
| `GET` | `/api/analytics` | Thống kê doanh thu thời gian thực, số đơn, tỉ lệ hoàn thành |
| `GET` | `/api/customers` | Tổng hợp danh bạ người mua, xếp hạng Cần Thủ VIP |
| `POST` | `/api/webhook/sepay` | Webhook tự động nhận biến động số dư VietQR và duyệt đơn tức thì |

---

## ☁️ Hướng Dẫn Đưa Lên Mạng Miễn Phí 100% (Deploy 0đ)

### Cách đưa lên Vercel (0 đồng trọn đời):
1. Đăng ký tài khoản miễn phí tại [Vercel.com](https://vercel.com).
2. Tải mã nguồn lên GitHub của bạn.
3. Trên Vercel bấm **"Add New Project"** ➔ Chọn repository GitHub của bạn ➔ Bấm **"Deploy"**.
4. Website sẽ tự động chạy online với tên miền miễn phí có bảo mật HTTPS (Ví dụ: `vuatheocau.vercel.app`).
