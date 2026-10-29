/**
 * Database sản phẩm và cẩm nang VUA THẺO CÂU - THẺO PRO FISHING
 */

const CATEGORIES = [
  { id: 'all', name: 'Tất Cả Sản Phẩm', icon: 'sparkles' },
  { id: 'theo-dai', name: 'Thẻo Đài Buộc Sẵn', icon: 'anchor' },
  { id: 'theo-san-hang', name: 'Thẻo Săn Hàng Khủng', icon: 'shield-alert' },
  { id: 'cuoc-theo', name: 'Dây Thẻo & Fluorocarbon', icon: 'disc' },
  { id: 'luoi-cau', name: 'Lưỡi Câu & Phụ Kiện Tóm', icon: 'crosshair' },
  { id: 'phu-kien', name: 'Hộp & Bảng Quấn Thẻo', icon: 'box' },
  { id: 'combo', name: 'Combo Săn Cá Giá Tốt', icon: 'flame' }
];

const FLASH_SALE_ITEMS = [
  {
    id: 2,
    name: 'Thẻo Đôi Săn Hàng BKK Titan Siêu Cường (Trắm Đen 8-25kg)',
    originalPrice: 110000,
    salePrice: 69000,
    discount: '-37%',
    stock: 50,
    sold: 43,
    image: 'https://images.unsplash.com/photo-1529230117010-b6c436154f25?auto=format&fit=crop&w=600&q=80',
    tag: 'SĂN HÀNG HỦY DIỆT'
  },
  {
    id: 1,
    name: 'Thẻo Đôi Buộc Sẵn Lưỡi Sode Tàng Hình (Chuyên Rô Phi)',
    originalPrice: 50000,
    salePrice: 28000,
    discount: '-44%',
    stock: 100,
    sold: 89,
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
    tag: 'RÔ PHI THI ĐẤU'
  },
  {
    id: 4,
    name: 'Cuộn Cước Thẻo Fluorocarbon 100% Toray Nhật 50M',
    originalPrice: 190000,
    salePrice: 129000,
    discount: '-32%',
    stock: 40,
    sold: 34,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    tag: 'TÀNG HÌNH CHUẨN NHẬT'
  },
  {
    id: 11,
    name: 'Combo 5 Vỉ Thẻo Đôi Tự Chọn + TẶNG Hộp Đựng Mini',
    originalPrice: 260000,
    salePrice: 169000,
    discount: '-35%',
    stock: 30,
    sold: 27,
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80',
    tag: 'COMBO HOT NHẤT'
  }
];

const PRODUCTS = [
  {
    id: 1,
    name: 'Thẻo Đôi Buộc Sẵn Lưỡi Sode Tàng Hình - Chuyên Rô Phi & Diếc',
    category: 'theo-dai',
    price: 35000,
    originalPrice: 50000,
    rating: 4.9,
    reviewsCount: 384,
    soldCount: 2450,
    badge: 'Bán Chạy Nhất',
    badgeColor: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Dây cước Carbon mềm tàng hình, mồi rơi tự nhiên, cá nhát mồi hút nhẹ là dính.',
    targetFish: ['Cá Rô Phi', 'Cá Diếc', 'Cá Mương'],
    style: 'Câu Đài Thi Đấu & Tự Nhiên',
    specs: {
      lineMaterial: 'Cước Fluorocarbon Coated Nhật Bản',
      lineSize: '#0.8 - #1.2 (Tải tĩnh 2.8kg - 4.2kg)',
      hookModel: 'Lưỡi Sode Đen không rỉ, bén ngót',
      hookSize: '#3, #4, #5',
      rigLength: 'Độ dài thẻo 18cm - Chênh lệch 2 lưỡi 3cm',
      craft: 'Buộc tay thủ công 7 vòng khóa kép chống tuột',
      pack: 'Vỉ 10 bộ thẻo đôi (20 lưỡi)'
    },
    variants: [
      { name: 'Cước #0.8 - Lưỡi Sode #3 (Rô phi nhỏ, Diếc tự nhiên)', price: 35000 },
      { name: 'Cước #1.0 - Lưỡi Sode #4 (Rô phi bàn tay, cá nhát)', price: 35000 },
      { name: 'Cước #1.2 - Lưỡi Sode #5 (Rô phi hồ dịch vụ cúp)', price: 38000 }
    ]
  },
  {
    id: 2,
    name: 'Thẻo Đôi Săn Hàng BKK Titan Siêu Cường - Chuyên Trắm Đen 8kg - 25kg',
    category: 'theo-san-hang',
    price: 85000,
    originalPrice: 110000,
    rating: 5.0,
    reviewsCount: 512,
    soldCount: 3120,
    badge: 'Săn Hàng Cực Đại',
    badgeColor: 'bg-red-600',
    image: 'https://images.unsplash.com/photo-1529230117010-b6c436154f25?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Dây PE bện 8 lõi phủ sáp kết hợp lưỡi BKK Titan không ngạnh, chống nổ cước khi bốc đầu cá khủng.',
    targetFish: ['Trắm Đen', 'Trắm Cỏ Khủng', 'Cá Tra Hồ Dịch Vụ'],
    style: 'Câu Đài Săn Hàng / Hố Đấu',
    specs: {
      lineMaterial: 'Dây PE Braided 8X chịu mài mòn cao',
      lineSize: '#3.0 - #5.0 (Tải tĩnh 16kg - 28kg)',
      hookModel: 'BKK Titan cường lực rèn nguội siêu cứng',
      hookSize: '#9, #11, #13',
      rigLength: 'Độ dài thẻo 35cm - Chênh lệch 2 lưỡi 5cm',
      craft: 'Tết bím chống sốc đầu thẻo + hạt xoay bạc đạn',
      pack: 'Vỉ 10 bộ thẻo đôi'
    },
    variants: [
      { name: 'PE #3.0 - Lưỡi BKK #9 (Cá 5kg - 10kg)', price: 85000 },
      { name: 'PE #4.0 - Lưỡi BKK #11 (Cá 8kg - 16kg)', price: 89000 },
      { name: 'PE #5.0 - Lưỡi BKK #13 (Thủy quái 15kg - 25kg+)', price: 95000 }
    ]
  },
  {
    id: 3,
    name: 'Thẻo Đôi Iseama Có Ngạnh Chống Nổ - Chuyên Trắm Chép Hồ Dịch Vụ',
    category: 'theo-dai',
    price: 45000,
    originalPrice: 60000,
    rating: 4.8,
    reviewsCount: 220,
    soldCount: 1850,
    badge: 'Chống Xoắn 100%',
    badgeColor: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Tích hợp hạt silicon chia đôi góc 60 độ, tự bung thẻo khi rơi mồi, không lo xoắn rối.',
    targetFish: ['Cá Chép', 'Cá Trắm Cỏ', 'Cá Trôi Củ'],
    style: 'Câu Đài Cổ Điển & Hồ Dịch Vụ',
    specs: {
      lineMaterial: 'Nylon Monofilament cao cấp nhập khẩu Đức',
      lineSize: '#1.5 - #2.5 (Tải tĩnh 5.5kg - 8.9kg)',
      hookModel: 'Iseama đen có ngạnh, giữ cá cực chắc',
      hookSize: '#5, #7, #9',
      rigLength: 'Độ dài thẻo 25cm - Chênh lệch 4cm',
      craft: 'Có hạt định vị chữ T chống quấn dây',
      pack: 'Vỉ 10 bộ thẻo đôi'
    },
    variants: [
      { name: 'Dây #1.5 - Lưỡi Iseama #5 (Chép 1-2kg)', price: 45000 },
      { name: 'Dây #2.0 - Lưỡi Iseama #7 (Chép trôi 2-4kg)', price: 45000 },
      { name: 'Dây #2.5 - Lưỡi Iseama #9 (Trắm chép 3-6kg)', price: 48000 }
    ]
  },
  {
    id: 4,
    name: 'Cuộn Dây Thẻo Fluorocarbon 100% Toray Nhật Bản (Cuộn 50M)',
    category: 'cuoc-theo',
    price: 145000,
    originalPrice: 190000,
    rating: 5.0,
    reviewsCount: 410,
    soldCount: 1920,
    badge: 'Hàng Chuẩn Nhật',
    badgeColor: 'bg-blue-600',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Chỉ số khúc xạ ánh sáng tương đương nước, tàng hình 100%, lực nút thắt không đổi khi ngâm nước lâu.',
    targetFish: ['Đa năng mọi loại cá nước ngọt và nước mặn'],
    style: 'Dây làm thẻo chuyên nghiệp',
    specs: {
      lineMaterial: '100% Fluorocarbon PVDF tinh khiết',
      lineSize: 'Có đủ size #0.8, #1.0, #1.5, #2.0, #3.0',
      hookModel: 'Không kèm lưỡi (Cuộn nguyên bản 50m)',
      hookSize: 'Dùng tóm mọi loại lưỡi câu',
      rigLength: 'Cuộn dài 50 mét chuẩn tiêu chuẩn Nhật',
      craft: 'Cắt dây bằng rãnh gài chống bung cuộn',
      pack: 'Hộp nhựa bảo quản chống tia UV'
    },
    variants: [
      { name: 'Size #0.8 (Đường kính 0.148mm - Tải 3.1kg)', price: 145000 },
      { name: 'Size #1.2 (Đường kính 0.185mm - Tải 4.8kg)', price: 145000 },
      { name: 'Size #2.0 (Đường kính 0.235mm - Tải 7.2kg)', price: 155000 },
      { name: 'Size #3.0 (Đường kính 0.285mm - Tải 10.5kg)', price: 165000 }
    ]
  },
  {
    id: 5,
    name: 'Thẻo Lure Shock Leader Fluorocarbon Siêu Bền (Chuyên Lóc, Chẽm, Măng)',
    category: 'cuoc-theo',
    price: 75000,
    originalPrice: 95000,
    rating: 4.9,
    reviewsCount: 189,
    soldCount: 1240,
    badge: 'Chống Răng Sắc',
    badgeColor: 'bg-purple-600',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Độ dãn sốc hoàn hảo hấp thụ cú táp mồi hung bạo, chống ma sát răng cá và đá ngầm bén.',
    targetFish: ['Cá Lóc', 'Cá Chẽm', 'Cá Măng', 'Cá Suối'],
    style: 'Câu Lure & Jigging',
    specs: {
      lineMaterial: 'Hard Fluorocarbon Carbon mật độ cao',
      lineSize: '#3.0, #4.0, #5.0 (Cuộn 30m bỏ túi)',
      hookModel: 'Dùng nối giữa dây PE và Khóa Snap/Con mồi',
      hookSize: 'Đa dụng',
      rigLength: 'Cuộn 30m kèm chun kẹp dây tiện lợi',
      craft: 'Công nghệ Nano kháng cọ xát',
      pack: '1 Cuộn 30 mét'
    },
    variants: [
      { name: 'Cuộn #3.0 (15LB / Tải 6.8kg - Lure Lóc đồng)', price: 75000 },
      { name: 'Cuộn #4.0 (20LB / Tải 9.1kg - Lure Chẽm hồ)', price: 80000 },
      { name: 'Cuộn #5.0 (25LB / Tải 11.4kg - Lure Ghềnh đá)', price: 85000 }
    ]
  },
  {
    id: 6,
    name: 'Hộp Đựng Thẻo Câu Đài Hợp Kim Nhôm Cao Cấp 45cm (Chứa 60 Bộ Thẻo)',
    category: 'phu-kien',
    price: 165000,
    originalPrice: 220000,
    rating: 4.9,
    reviewsCount: 310,
    soldCount: 1420,
    badge: 'Chống Nước IPX5',
    badgeColor: 'bg-sky-600',
    image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Khung nhôm xước sang trọng, đệm mút EVA mật độ cao giữ căng thẻo không bị gãy góc cước.',
    targetFish: ['Bảo vệ mọi loại thẻo câu đài'],
    style: 'Phụ kiện thi đấu chuyên nghiệp',
    specs: {
      lineMaterial: 'Hợp kim nhôm + Nam châm hít tự động + Mút EVA',
      lineSize: 'Kích thước: 45cm x 9cm x 2.8cm',
      hookModel: 'Cột móc hợp kim đồng chống rỉ sét',
      hookSize: 'Chứa tối đa 60 bộ thẻo đôi dài tới 40cm',
      rigLength: 'Thiết kế 2 mặt mở thông minh',
      craft: 'Bản lề thép không gỉ cực bền',
      pack: '1 Hộp + 20 ghim cố định sơ cua'
    },
    variants: [
      { name: 'Màu Đen Nhám Titan (Sang trọng)', price: 165000 },
      { name: 'Màu Xanh Biển Ánh Kim (Hiện đại)', price: 165000 },
      { name: 'Màu Đỏ Carbon Thể Thao', price: 165000 }
    ]
  },
  {
    id: 7,
    name: 'Hộp Lưỡi Câu Đài Thép Vonfram BKK Chinu Siêu Cứng (Hộp 50 Chiếc)',
    category: 'luoi-cau',
    price: 68000,
    originalPrice: 90000,
    rating: 4.8,
    reviewsCount: 175,
    soldCount: 980,
    badge: 'Bén Vô Địch',
    badgeColor: 'bg-amber-600',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Mũi lưỡi mài 3 cạnh tam giác sắc như dao cạo, đuôi xẻ rãnh quấn cước cực êm không cắn đứt dây.',
    targetFish: ['Trắm Đen', 'Chép Cụ', 'Cá Chim', 'Rô Phi'],
    style: 'Lưỡi tự tóm thẻo',
    specs: {
      lineMaterial: 'Thép Carbon Vonfram cao cấp tôi nhiệt',
      lineSize: 'Có hoặc không ngạnh tùy chọn',
      hookModel: 'BKK Chinu rãnh gáy chống trượt cước',
      hookSize: '#1, #2, #3, #4, #5',
      rigLength: 'Độ cứng chuẩn 4H, không oằn không gãy',
      craft: 'Mạ đen Niken chống oxy hóa nước phèn',
      pack: 'Hộp 50 lưỡi câu chia ngăn'
    },
    variants: [
      { name: 'BKK Chinu #1 (Chép, Rô phi lớn)', price: 68000 },
      { name: 'BKK Chinu #3 (Trắm cỏ, Chép cụ 2-5kg)', price: 68000 },
      { name: 'BKK Chinu #5 (Trắm đen, Tra hồ 5-15kg)', price: 72000 }
    ]
  },
  {
    id: 8,
    name: 'Bảng Quấn Thẻo Tròn Bọt Xốp EVA Đa Năng Chống Gãy Cước (Bộ 10 Cái)',
    category: 'phu-kien',
    price: 39000,
    originalPrice: 55000,
    rating: 4.7,
    reviewsCount: 95,
    soldCount: 1540,
    badge: 'Tiện Lợi',
    badgeColor: 'bg-teal-600',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Đường kính 6.5cm cuộn thẻo vòng tròn giúp cước thẳng tắp, không bị gấp khúc như quấn thanh vuông.',
    targetFish: ['Mọi loại thẻo câu đài, thẻo câu lục'],
    style: 'Bảo quản thẻo câu',
    specs: {
      lineMaterial: 'Bọt xốp EVA mềm đàn hồi cao',
      lineSize: 'Đường kính 6.5cm, dày 1.5cm',
      hookModel: 'Có rãnh kẹp lưỡi và gài đầu thẻo',
      hookSize: 'Đa sắc màu dễ phân loại size thẻo',
      rigLength: 'Nhẹ nổi trên nước không sợ rơi chìm',
      craft: 'Đúc nguyên khối bền đẹp',
      pack: 'Túi 10 chiếc màu ngẫu nhiên'
    },
    variants: [
      { name: 'Set 10 Bảng Quấn Tiêu Chuẩn (6.5cm)', price: 39000 },
      { name: 'Set 20 Bảng Quấn + Hộp Đựng Trong Suốt', price: 89000 }
    ]
  },
  {
    id: 9,
    name: 'Combo Trục & Thẻo Đồng Bộ Chuyên Câu Đài Săn Hàng (Đủ Size 3.6m - 7.2m)',
    category: 'combo',
    price: 129000,
    originalPrice: 180000,
    rating: 5.0,
    reviewsCount: 640,
    soldCount: 2890,
    badge: 'Khuyên Dùng Cho Người Mới',
    badgeColor: 'bg-rose-600',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Gồm 1 bộ trục buộc sẵn hạt chặn xịn + chì lá cân sẵn + 3 vỉ thẻo đôi săn hàng chuẩn tỉ lệ.',
    targetFish: ['Trắm Đen', 'Chép', 'Trôi', 'Rô Phi'],
    style: 'Full set sẵn sàng câu ngay',
    specs: {
      lineMaterial: 'Bộ trục Carbon Đức + Thẻo Fluorocarbon Nhật',
      lineSize: 'Trục #3.0 + Thẻo #2.0 hoặc Trục #4.0 + Thẻo #3.0',
      hookModel: 'Lưỡi Iseama / Chinu săn hàng có ngạnh',
      hookSize: 'Được cân tỉ lệ tuyệt đối',
      rigLength: 'Đầy đủ chiều dài cần 3.6m / 4.5m / 5.4m / 6.3m',
      craft: 'Cân sẵn phao chì chuẩn đáy',
      pack: '1 Trục hoàn thiện + 3 Vỉ Thẻo (30 bộ) + Bảng quấn'
    },
    variants: [
      { name: 'Combo Cần 4.5m (Trục 3.0 + Thẻo 2.0 - Lưỡi Chép)', price: 129000 },
      { name: 'Combo Cần 5.4m (Trục 4.0 + Thẻo 2.5 - Săn Hàng)', price: 139000 },
      { name: 'Combo Cần 6.3m (Trục 5.0 + Thẻo 3.5 - Khủng Long)', price: 149000 }
    ]
  },
  {
    id: 10,
    name: 'Thẻo Đơn Câu Đài Hố Đấu Chống Xoắn Hạt Sứ - Chuyên Cá Ăn Nổi Tầng Lửng',
    category: 'theo-dai',
    price: 49000,
    originalPrice: 65000,
    rating: 4.8,
    reviewsCount: 140,
    soldCount: 890,
    badge: 'Mới Ra Mắt',
    badgeColor: 'bg-cyan-600',
    image: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Khuyên sứ nano tự do xoay 360 độ triệt tiêu lực xoắn vặn khi kéo cá nhanh trong thi đấu.',
    targetFish: ['Rô Phi Tầng Nước', 'Cá Chép Nhát Mồi', 'Diếc Hồ Sâu'],
    style: 'Câu Đơn & Hố Đấu Tốc Độ',
    specs: {
      lineMaterial: 'Fluorocarbon 100% không giãn',
      lineSize: '#0.8, #1.0, #1.5',
      hookModel: 'Lưỡi Barbless không ngạnh rút cá nhanh',
      hookSize: '#4, #6',
      rigLength: 'Dài 40cm - 60cm câu rơi chậm',
      craft: 'Mối tóm chống tụt khóa kép',
      pack: 'Vỉ 10 bộ thẻo đơn cao cấp'
    },
    variants: [
      { name: 'Thẻo #0.8 - Lưỡi số 4 (Câu cá nhỏ, thi đấu)', price: 49000 },
      { name: 'Thẻo #1.2 - Lưỡi số 6 (Rô phi cúp tốc độ)', price: 49000 }
    ]
  },
  {
    id: 11,
    name: 'Combo 5 Vỉ Thẻo Đôi Tự Chọn (50 Bộ Thẻo) + Tặng 1 Hộp Đựng Thẻo Mini',
    category: 'combo',
    price: 189000,
    originalPrice: 260000,
    rating: 5.0,
    reviewsCount: 890,
    soldCount: 4200,
    badge: 'Siêu Tiết Kiệm -30%',
    badgeColor: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Tiết kiệm ngay 71k! Thoải mái chọn kích cỡ thẻo cho cả mùa câu, kèm quà tặng giá trị.',
    targetFish: ['Đầy đủ cho mọi loài cá nước ngọt'],
    style: 'Gói ưu đãi toàn diện cho cần thủ',
    specs: {
      lineMaterial: 'Dây Carbon Nhật + Thép cường lực BKK',
      lineSize: 'Tùy chọn tự do trong đơn hàng',
      hookModel: 'Đa dạng Sode / Iseama / Chinu',
      hookSize: 'Đủ số từ nhỏ đến lớn',
      rigLength: 'Chuẩn quy cách câu đài',
      craft: 'Buộc tay nghệ nhân làng nghề',
      pack: '5 Vỉ Thẻo (50 bộ thẻo) + Hộp đựng mini trị giá 45k'
    },
    variants: [
      { name: 'Set Rô Phi: 3 Vỉ Sode + 2 Vỉ Iseama Nhỏ', price: 189000 },
      { name: 'Set Trắm Chép: 3 Vỉ Iseama + 2 Vỉ Săn Hàng BKK', price: 199000 },
      { name: 'Set Săn Hàng Khủng: 5 Vỉ PE Titan BKK Siêu Cường', price: 219000 }
    ]
  },
  {
    id: 12,
    name: 'Vòng Cao Su & Hạt Chặn Chia Thẻo Chữ T Chống Xoắn Rối (Túi 100 Chiếc)',
    category: 'luoi-cau',
    price: 29000,
    originalPrice: 40000,
    rating: 4.8,
    reviewsCount: 92,
    soldCount: 1650,
    badge: 'Phụ Kiện Tiện Ích',
    badgeColor: 'bg-emerald-600',
    image: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=600&q=80',
    shortDesc: 'Phụ kiện thần thánh giúp 2 nhánh lưỡi thẻo luôn dang rộng 2 bên, hạn chế 99% tình trạng xoắn khi giật.',
    targetFish: ['Mọi loại cá câu đài'],
    style: 'Phụ kiện tự tóm thẻo tại nhà',
    specs: {
      lineMaterial: 'Silicon y tế đàn hồi cao, không làm xước dây',
      lineSize: 'Phù hợp dây cước #0.6 đến #4.0',
      hookModel: 'Dùng cho thẻo đôi',
      hookSize: 'Mọi size',
      rigLength: 'Thiết kế góc mở chữ Y thông minh',
      craft: 'Đúc chính xác không bavia',
      pack: 'Túi 100 chiếc'
    },
    variants: [
      { name: 'Size S (Dùng dây #0.6 - #1.5)', price: 29000 },
      { name: 'Size M (Dùng dây #1.5 - #3.0)', price: 29000 },
      { name: 'Size L (Dùng dây #3.0 - #5.0 Săn Hàng)', price: 32000 }
    ]
  }
];

// Bảng tra cứu tương quan Dây Trục và Dây Thẻo toàn diện
const RIG_SIZE_TABLE = [
  {
    target: 'Cá Rô Phi, Diếc Hồ Tự Nhiên',
    fishWeight: '0.1kg - 0.5kg',
    mainLine: '#1.0 - #1.2 (0.165mm)',
    leaderLine: '#0.6 - #0.8 (0.128mm)',
    hookType: 'Sode #2 - #4 (Không ngạnh)',
    rigLength: '15cm - 18cm (Lệch 3cm)',
    floatWeight: '0.8g - 1.5g'
  },
  {
    target: 'Cá Rô Phi Hồ Dịch Vụ / Rô Phi Cúp',
    fishWeight: '0.5kg - 1.8kg',
    mainLine: '#1.5 - #2.0 (0.205mm)',
    leaderLine: '#0.8 - #1.2 (0.165mm)',
    hookType: 'Sode #4 - #6 / Iseama #3 - #5',
    rigLength: '18cm - 22cm (Lệch 3cm - 4cm)',
    floatWeight: '1.5g - 2.5g'
  },
  {
    target: 'Cá Chép, Trôi Củ Hồ Dịch Vụ',
    fishWeight: '1.5kg - 4.5kg',
    mainLine: '#2.5 - #3.0 (0.260mm)',
    leaderLine: '#1.5 - #2.0 (0.205mm)',
    hookType: 'Iseama #6 - #8 (Có ngạnh)',
    rigLength: '25cm - 32cm (Lệch 4cm - 5cm)',
    floatWeight: '2.0g - 3.5g'
  },
  {
    target: 'Săn Hàng Trắm Đen / Trắm Cỏ',
    fishWeight: '5.0kg - 12.0kg',
    mainLine: '#3.5 - #4.5 (0.330mm)',
    leaderLine: '#2.5 - #3.0 (hoặc PE #1.5)',
    hookType: 'Chinu / BKK Titan #9 - #11',
    rigLength: '35cm - 42cm (Lệch 5cm - 7cm)',
    floatWeight: '3.0g - 5.5g'
  },
  {
    target: 'Thủy Quái Hố Đấu / Trắm Đen Khổng Lồ',
    fishWeight: '12kg - 25kg+',
    mainLine: '#5.0 - #7.0 (0.400mm)',
    leaderLine: 'PE Braided 8X #3.0 - #5.0',
    hookType: 'BKK Titan Siêu Cường #11 - #14',
    rigLength: '40cm - 50cm (Lệch 7cm - 9cm)',
    floatWeight: '4.5g - 8.0g'
  }
];

// Dữ liệu cho công cụ "Trợ Lý Bắt Bệnh & Chọn Thẻo Thông Minh"
const RIG_ADVISOR_DATA = {
  fishTypes: [
    {
      id: 'ro-phi',
      name: 'Cá Rô Phi / Cá Diếc',
      desc: 'Mồm nhỏ, hút mồi nhanh, thường nhát cước to',
      recommended: {
        rigName: 'Thẻo Đôi Buộc Sẵn Lưỡi Sode Tàng Hình',
        line: 'Dây Fluorocarbon #0.8 - #1.2 (0.14mm - 0.18mm)',
        hook: 'Lưỡi Sode #3 - #5 không ngạnh hoặc ngạnh nhỏ',
        rigLength: 'Dài 18cm - 22cm (chênh 2 lưỡi 3cm)',
        tip: 'Nên dùng cước mỏng tàng hình để cá hút cả mồi lẫn lưỡi sâu vào khoang miệng.',
        productId: 1
      }
    },
    {
      id: 'chep',
      name: 'Cá Chép Củ / Chép Dịch Vụ',
      desc: 'Khôn ranh, ăn mồi dò xét, lực chạy mạnh đầm',
      recommended: {
        rigName: 'Thẻo Đôi Iseama Có Ngạnh Chống Nổ',
        line: 'Dây Monofilament mềm #1.5 - #2.5 (0.20mm - 0.26mm)',
        hook: 'Lưỡi Iseama #5 - #8 thép tôi đen',
        rigLength: 'Dài 25cm - 32cm (chênh 2 lưỡi 4cm - 5cm)',
        tip: 'Thẻo dài giúp mồi nằm tự nhiên trên lớp bùn đáy hồ, cá chép hút mồi không bị cấn phao.',
        productId: 3
      }
    },
    {
      id: 'tram-den',
      name: 'Trắm Đen / Trắm Cỏ Khủng (8kg - 25kg+)',
      desc: 'Lực cắn ốc nghiền nát, cú giật bốc đầu cực kỳ hung tợn',
      recommended: {
        rigName: 'Thẻo Đôi Săn Hàng BKK Titan Siêu Cường',
        line: 'Dây PE X8 bện sáp hoặc Carbon đanh #3.5 - #5.0',
        hook: 'Lưỡi BKK Titan / Chinu #9 - #13 siêu cứng',
        rigLength: 'Dài 35cm - 45cm (chênh 2 lưỡi 5cm - 7cm)',
        tip: 'Tuyệt đối cần dùng mối tóm bện sốc và hạt sứ giảm ma sát chống nổ chân thẻo khi cá đóng mạnh.',
        productId: 2
      }
    },
    {
      id: 'tra-chim',
      name: 'Cá Tra / Cá Chim / Cá Nheo',
      desc: 'Răng sắc, lực kéo đáy giật thót, xoắn dây liên tục',
      recommended: {
        rigName: 'Thẻo Chống Xoắn Hạt Chuỗi Titan Cường Lực',
        line: 'Dây Fluorocarbon chịu mài mòn răng #4.0 - #6.0 hoặc PE bện',
        hook: 'Lưỡi Maruseigo / Chinu có ngạnh dày',
        rigLength: 'Dài 30cm - 40cm có chống xoắn kim loại',
        tip: 'Cá chim và cá tra có lực bẻ lưỡi rất gắt, hãy chọn lưỡi thép đúc nguyên khối dày dặn.',
        productId: 2
      }
    },
    {
      id: 'lure',
      name: 'Cá Lóc / Cá Chẽm (Câu Lure)',
      desc: 'Táp mồi chớp nhoáng, kéo vào cọc và ghềnh đá ngầm',
      recommended: {
        rigName: 'Thẻo Lure Shock Leader Fluorocarbon Siêu Bền',
        line: 'Dây Leader 15LB - 25LB (Dài 1.2m - 1.5m nối dây chính PE)',
        hook: 'Khóa Snap cường lực + Lưỡi câu mồi thìa/mồi mềm',
        rigLength: 'Đoạn leader nối dài 1.2m chống mài mòn vảy và đá',
        tip: 'Khóa mối nối GT Knot hoặc FG Knot giúp ném mồi xa qua khoen cần êm ái.',
        productId: 5
      }
    }
  ]
};

// Cẩm nang kinh nghiệm tóm thẻo & câu cá
const BLOG_ARTICLES = [
  {
    id: 1,
    title: 'Bảng Tra Cứu Tương Quan Kích Cỡ Dây Trục Và Dây Thẻo Chuẩn Nhất',
    date: '28/10/2026',
    author: 'Chuyên gia Vũ Thẻo',
    readTime: '4 phút đọc',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44a0462?auto=format&fit=crop&w=600&q=80',
    summary: 'Nguyên tắc vàng: Dây thẻo luôn phải nhỏ hơn dây trục từ 0.5 đến 1.5 số để bảo vệ phao đắt tiền và bảo vệ ngọn cần khi gặp cá quá khổ.',
    content: `
      <h3>1. Tại sao thẻo câu luôn phải yếu hơn trục?</h3>
      <p>Khi câu đài, nếu dây thẻo to hơn hoặc bằng dây trục, khi gặp cá quá khổ hoặc vướng chà đáy, lực đứt sẽ xảy ra ở nút thắt dây trục hoặc ngọn cần. Bạn sẽ bị mất phao câu (phao săn hàng xịn vài trăm ngàn) hoặc thậm chí gãy đọt cần câu.</p>
      
      <h3>2. Bảng tỉ lệ vàng cho cần thủ:</h3>
      <ul>
        <li><strong>Câu Rô phi thi đấu:</strong> Trục #1.2 -> Thẻo #0.6 đến #0.8</li>
        <li><strong>Câu Rô phi & Chép nhỏ (dưới 2kg):</strong> Trục #1.5 -> Thẻo #1.0 đến #1.2</li>
        <li><strong>Câu Chép cụ, Trôi củ (2kg - 5kg):</strong> Trục #2.5 -> Thẻo #1.5 đến #2.0</li>
        <li><strong>Săn hàng Trắm đen hồ dịch vụ (5kg - 12kg):</strong> Trục #4.0 -> Thẻo #2.5 đến #3.0 (hoặc PE #1.5 - #2.0)</li>
        <li><strong>Săn thủy quái hố đấu (trên 15kg):</strong> Trục #6.0 -> Thẻo #4.0 đến #5.0 (hoặc PE #2.5 - #3.0)</li>
      </ul>

      <h3>3. Khoảng cách chênh lệch giữa 2 lưỡi thẻo đôi:</h3>
      <p>Thông thường chênh lệch từ 1.5 đến 2 lần chiều dài thân lưỡi (khoảng 3cm - 5cm). Lưỡi dưới nằm sát bùn đáy chịu trách nhiệm mồi neo, lưỡi trên lơ lửng hấp dẫn cá tò mò đớp mồi rơi.</p>
    `
  },
  {
    id: 2,
    title: 'Mẹo Khắc Phục Thẻo Bị Xoắn Rối Khi Câu Đài Nước Sâu Hoặc Giật Nhanh',
    date: '25/10/2026',
    author: 'Cần thủ Minh Hải',
    readTime: '5 phút đọc',
    image: 'https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=600&q=80',
    summary: 'Rất nhiều cần thủ bực mình vì giật mồi vài đường là 2 nhánh thẻo quấn chặt vào nhau. Xem ngay 3 mẹo cực đơn giản để khắc phục triệt để!',
    content: `
      <h3>1. Nguyên nhân chính khiến thẻo bị xoắn:</h3>
      <p>Khi vuốt mồi tơi hoặc vê 2 viên mồi không cân đối về trọng lượng, khi thu cần với tốc độ cao, 2 viên mồi sẽ đóng vai trò như hai cánh quạt trực thăng xoay tròn trong nước, xoắn vặn hai sợi cước lại với nhau.</p>
      
      <h3>2. Ba giải pháp hiệu quả 100%:</h3>
      <ol>
        <li><strong>Dùng hạt silicon định vị chia góc chữ T:</strong> Đặt 1 hạt chia thẻo tại nút thắt gốc thẻo, giữ cho 2 sợi cước luôn vươn ra góc 60 độ.</li>
        <li><strong>Chuyển sang dây thẻo Fluorocarbon:</strong> Dây cước nilon thông thường mềm dễ nhiễm tĩnh điện và nhớ nếp xoắn. Dây Fluorocarbon có mật độ phân tử cao, đanh hơn nên tự bung thẳng cực nhanh.</li>
        <li><strong>Tập thói quen thu cần đều nhịp:</strong> Tránh giật giật nhấp cần liên hồi khi không có cá cắn, hãy kéo cần êm để mồi lướt thẳng trong nước.</li>
      </ol>
    `
  },
  {
    id: 3,
    title: 'Nên Dùng Thẻo Nilon Hay Fluorocarbon Khi Câu Cá Nhát Mồi?',
    date: '20/10/2026',
    author: 'Admin Thẻo Pro',
    readTime: '3 phút đọc',
    image: 'https://images.unsplash.com/photo-1529230117010-b6c436154f25?auto=format&fit=crop&w=600&q=80',
    summary: 'So sánh ưu nhược điểm thực chiến của 2 loại chất liệu cước làm thẻo phổ biến nhất hiện nay.',
    content: `
      <h3>1. Cước Thẻo Nilon (Monofilament):</h3>
      <p><strong>Ưu điểm:</strong> Rất mềm, mồi rơi tự nhiên uyển chuyển, độ đàn hồi giảm sốc tốt khi giật cá, giá thành tiết kiệm.<br>
      <strong>Nhược điểm:</strong> Thấm nước sau vài giờ câu làm giảm lực kéo đứt 15-20%, dễ bị xoăn khi cọ xát vào mang cá.</p>

      <h3>2. Cước Thẻo Fluorocarbon:</h3>
      <p><strong>Ưu điểm:</strong> Chỉ số khúc xạ ánh sáng xấp xỉ nước (1.42 vs 1.33) nên gần như tàng hình dưới nước, không thấm nước dù ngâm cả ngày, chống răng cá và chà đáy cực tốt.<br>
      <strong>Nhược điểm:</strong> Hơi cứng hơn nilon, cần kỹ thuật tóm khóa 7 vòng để không bị tuột nút thắt.</p>
    `
  }
];

// Khách hàng đánh giá thực tế
const REVIEWS = [
  {
    id: 1,
    name: 'Bác Ba Cần Thủ - Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 ngày trước',
    productName: 'Thẻo Đôi Săn Hàng BKK Titan Siêu Cường',
    comment: 'Tôi đánh hố đấu đầm Sóc Sơn lên con trắm đen 14.5kg giật bốc đầu mà thẻo PE BKK tải êm ru, không hề dãn nổ. Mối buộc rất chắc tay và thẩm mỹ!',
    verified: true
  },
  {
    id: 2,
    name: 'Nguyễn Văn Tuấn - Đồng Nai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '4 ngày trước',
    productName: 'Thẻo Đôi Buộc Sẵn Lưỡi Sode Tàng Hình',
    comment: 'Đánh giải rô phi hồ sinh thái nước trong vắt, cá nhát mồi mà dùng thẻo Sode 0.8 này hút phát nào thụt phao phát đó. Vỉ 10 bộ giá quá rẻ so với tự ngồi còng lưng tóm.',
    verified: true
  },
  {
    id: 3,
    name: 'Trần Hoàng Lâm - Đà Nẵng',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 tuần trước',
    productName: 'Combo Trục & Thẻo Đồng Bộ Chuyên Câu Đài',
    comment: 'Shop giao hàng hỏa tốc đóng gói ống chỉ nhựa rất cẩn thận. Trục cân chì chuẩn đáy về chỉ việc móc mồi quăng là lên cá. Sẽ ủng hộ dài dài!',
    verified: true
  }
];

// Giả lập thông báo mua hàng gần đây (Social Proof)
const RECENT_SALES = [
  { name: 'Anh Hoàng (Ba Đình, HN)', item: 'Combo 5 Vỉ Thẻo Săn Hàng BKK', time: '2 phút trước' },
  { name: 'Cần thủ Minh (Biên Hòa)', item: '3 Vỉ Thẻo Sode Tàng Hình Rô Phi', time: '5 phút trước' },
  { name: 'Bác Thắng (Hải Dương)', item: 'Cuộn Fluorocarbon Toray 50m', time: '8 phút trước' },
  { name: 'Anh Đức (Quận 7, TP.HCM)', item: 'Hộp Đựng Thẻo Nhôm Cao Cấp 45cm', time: '12 phút trước' }
];

// Dữ liệu mẫu đơn hàng khởi tạo ban đầu cho Admin
const SAMPLE_ORDERS = [
  {
    orderId: 'THEO-882314',
    customer: { name: 'Nguyễn Văn Tuấn', phone: '0988776655', address: 'Số 12 Trần Hưng Đạo', city: 'Hà Nội', notes: 'Giao buổi sáng' },
    items: [
      { productId: 1, name: 'Thẻo Đôi Buộc Sẵn Lưỡi Sode Tàng Hình (#1.0)', price: 35000, quantity: 3 }
    ],
    totals: { subtotal: 105000, shipping: 25000, discount: 0, total: 130000 },
    paymentMethod: 'vietqr',
    status: 'shipping', // 'pending', 'processing', 'shipping', 'completed', 'cancelled'
    createdAt: '29/10/2026, 09:15:30'
  },
  {
    orderId: 'THEO-771923',
    customer: { name: 'Trần Hoàng Lâm', phone: '0912345678', address: 'Khu Đô Thị Ecopark', city: 'Hưng Yên', notes: 'Test lực tải kỹ giúp em' },
    items: [
      { productId: 2, name: 'Thẻo Đôi Săn Hàng BKK Titan Siêu Cường (PE #4.0)', price: 89000, quantity: 2 },
      { productId: 6, name: 'Hộp Đựng Thẻo Hợp Kim Nhôm 45cm', price: 165000, quantity: 1 }
    ],
    totals: { subtotal: 343000, shipping: 0, discount: 0, total: 343000 },
    paymentMethod: 'cod',
    status: 'completed',
    createdAt: '28/10/2026, 14:20:10'
  },
  {
    orderId: 'THEO-661044',
    customer: { name: 'Lê Văn Thắng', phone: '0978901234', address: '45 Lê Duẩn', city: 'Đà Nẵng', notes: 'Gói kỹ giúp mình' },
    items: [
      { productId: 11, name: 'Combo 5 Vỉ Thẻo Đôi Tự Chọn', price: 189000, quantity: 1 }
    ],
    totals: { subtotal: 189000, shipping: 25000, discount: 18900, total: 195100 },
    paymentMethod: 'cod',
    status: 'processing',
    createdAt: '29/10/2026, 11:05:40'
  },
  {
    orderId: 'THEO-552981',
    customer: { name: 'Phạm Minh Quân', phone: '0933445566', address: '128 Nguyễn Thị Thập', city: 'TP.HCM', notes: '' },
    items: [
      { productId: 4, name: 'Cuộn Dây Thẻo Fluorocarbon 100% Toray Nhật 50M', price: 145000, quantity: 2 }
    ],
    totals: { subtotal: 290000, shipping: 0, discount: 0, total: 290000 },
    paymentMethod: 'vietqr',
    status: 'completed',
    createdAt: '27/10/2026, 16:45:00'
  }
];

// Helper Functions đồng bộ dữ liệu giữa Store và Admin qua LocalStorage
function getStoredProducts() {
  const local = localStorage.getItem('theopro_products');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('theopro_products', JSON.stringify(PRODUCTS));
  return PRODUCTS;
}

function saveStoredProducts(products) {
  localStorage.setItem('theopro_products', JSON.stringify(products));
}

function getStoredOrders() {
  const local = localStorage.getItem('theopro_orders');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem('theopro_orders', JSON.stringify(SAMPLE_ORDERS));
  return SAMPLE_ORDERS;
}

function saveStoredOrders(orders) {
  localStorage.setItem('theopro_orders', JSON.stringify(orders));
}

