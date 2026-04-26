const locations = [
  {
    id: 'halong',
    name: 'Vịnh Hạ Long',
    lat: 20.9101, 
    lng: 107.1839,
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://www.halomedia.vn/360tours/ha-long-bay',
    hook: 'Bạn đã bao giờ đứng giữa biển trời và thấy mình nhỏ bé?',
    description: 'Nơi hàng nghìn đảo đá vôi trôi nổi giữa làn nước xanh ngọc. Mỗi hòn đảo ở đây đều mang một câu chuyện cổ xưa…'
  },
  {
    id: 'hanoi',
    name: 'Hà Nội',
    lat: 21.0285,
    lng: 105.8542,
    image: 'https://images.unsplash.com/photo-1599708153386-62bf3f035c78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://diachidohanoi.vr360.com.vn/',
    hook: 'Thủ đô ngàn năm văn hiến với những góc phố thâm trầm...',
    description: 'Nơi thời gian như ngưng đọng bên Hồ Gươm, lẩn khuất trong từng con ngõ nhỏ của 36 phố phường.'
  },
  {
    id: 'phuna',
    name: 'Phủ Na (Thanh Hóa)',
    lat: 19.8056,
    lng: 105.7766,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.com.vn/projects/di-tich-phu-na/',
    hook: 'Trở về cội nguồn tâm linh giữa núi rừng hoang sơ...',
    description: 'Một vùng đất linh thiêng mang đậm dấu ấn lịch sử, nơi con người và thiên nhiên giao hòa làm một.'
  },
  {
    id: 'quebac',
    name: 'Quê Bác (Kim Liên)',
    lat: 18.6678,
    lng: 105.5411,
    image: 'https://images.unsplash.com/photo-1522079032-4752c1e7a4a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.com.vn/projects/ditich-langkimlien-vr360/',
    hook: 'Có một miền quê nghèo nhưng đã sinh ra một bậc vĩ nhân...',
    description: 'Làng Sen mộc mạc, nơi lưu giữ những ký ức tuổi thơ êm đềm của Chủ tịch Hồ Chí Minh.'
  },
  {
    id: 'quangtri',
    name: 'Quảng Trị',
    lat: 16.7538,
    lng: 107.1856,
    image: 'https://images.unsplash.com/photo-1622281566896-22449e7b2f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.quangtri.gov.vn/#thanhco_topview',
    hook: 'Mảnh đất của khói lửa và những bản hùng ca bất tử...',
    description: 'Nơi từng tấc đất đều thấm đẫm máu xương, giờ đây vươn mình với sức sống mãnh liệt và hòa bình.'
  },
  {
    id: 'hue',
    name: 'Huế',
    lat: 16.4637,
    lng: 107.5909,
    image: 'https://images.unsplash.com/photo-1582046830501-1b6fb6e02a0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.com.vn/projects/hue-tourist/',
    hook: 'Lắng nghe nhịp thời gian trôi chậm lại bên bờ sông Hương...',
    description: 'Kinh thành xưa với vẻ đẹp trầm mặc, những lăng tẩm uy nghi in bóng xuống dòng nước lững lờ.'
  },
  {
    id: 'hoangsa',
    name: 'Nhà trưng bày Hoàng Sa',
    lat: 16.0544,
    lng: 108.2022,
    image: 'https://images.unsplash.com/photo-1508933227447-38de6181f215?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/',
    hook: 'Bản hùng ca biển đảo thiêng liêng của Tổ quốc...',
    description: 'Nơi lưu giữ những minh chứng lịch sử hào hùng, khẳng định chủ quyền thiêng liêng trên biển Đông.'
  },
  {
    id: 'hoian',
    name: 'Hội An',
    lat: 15.8801,
    lng: 108.3380,
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.com.vn/projects/hoian-metaverse/',
    hook: 'Phố cổ rêu phong và những đêm lồng đèn lung linh...',
    description: 'Dạo bước trên những con phố nhỏ, bạn sẽ như lạc vào một dòng chảy xuyên thời gian từ hàng trăm năm trước.'
  },
  {
    id: 'cuchi',
    name: 'Địa Đạo Củ Chi',
    lat: 11.1440,
    lng: 106.4634,
    image: 'https://images.unsplash.com/photo-1583244248455-ce85bd296561?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.yoolife.vn/ia-ao-cu-chi-zbdsc253u26822s3642',
    hook: 'Mê cung ngầm vĩ đại - minh chứng cho ý chí thép...',
    description: 'Khám phá thế giới dưới lòng đất để hiểu về sức sáng tạo và sự kiên cường của con người Việt Nam.'
  },
  {
    id: 'doclap',
    name: 'Dinh Độc Lập',
    lat: 10.7769,
    lng: 106.6953,
    image: 'https://images.unsplash.com/photo-1595861111059-e9587425f171?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://vr360.com.vn/projects/dinhdoclap/',
    hook: 'Khoảnh khắc lịch sử hội tụ tại trung tâm Sài Gòn...',
    description: 'Biểu tượng của sự hòa bình và thống nhất, nơi đánh dấu cột mốc vàng son của dân tộc.'
  },
  {
    id: 'hoang_sa_island',
    name: 'QĐ. Hoàng Sa',
    lat: 16.5,
    lng: 111.6,
    isIsland: true,
    image: 'https://images.unsplash.com/photo-1508933227447-38de6181f215?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/',
    hook: 'Máu thịt thiêng liêng giữa ngàn khơi...',
    description: 'Quần đảo Hoàng Sa - Minh chứng lịch sử hào hùng và chủ quyền không thể chối cãi của Việt Nam trên Biển Đông.'
  },
  {
    id: 'truong_sa_island',
    name: 'QĐ. Trường Sa',
    lat: 10.0,
    lng: 114.0,
    isIsland: true,
    image: 'https://images.unsplash.com/photo-1508933227447-38de6181f215?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/', /* Tạm dùng link Hoàng Sa nếu chưa có Trường Sa */
    hook: 'Trái tim kiên cường nơi đầu sóng ngọn gió...',
    description: 'Quần đảo Trường Sa - Nơi những người con đất Việt ngày đêm bám biển, bảo vệ vững chắc phên dậu Tổ quốc.'
  }
];
