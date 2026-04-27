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
    image: 'assets/phu_na_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/di-tich-phu-na/',
    hook: 'Trờ về cội nguồn tâm linh giữa núi rừng hoang sơ...',
    description: 'Một vùng đất linh thiêng mang đậm dấu ấn lịch sử, nơi con người và thiên nhiên giao hòa làm một.'
  },
  {
    id: 'quebac',
    name: 'Quê Bác (Kim Liên)',
    lat: 18.6678,
    lng: 105.5411,
    image: 'assets/que_bac_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/ditich-langkimlien-vr360/',
    hook: 'Có một miền quê nghèo nhưng đã sinh ra một bậc vĩ nhân...',
    description: 'Làng Sen mộc mạc, nơi lưu giữ những ký ức tuổi thơ êm đềm của Chủ tịch Hồ Chí Minh.'
  },
  {
    id: 'quangtri',
    name: 'Quảng Trị',
    lat: 16.7538,
    lng: 107.1856,
    image: 'assets/quang_tri_bg.jpg',
    vrLink: 'https://vr360.quangtri.gov.vn/#thanhco_topview',
    hook: 'Mảnh đất của khói lửa và những bản hùng ca bất tử...',
    description: 'Nơi từng tấc đất đều thấm đẫm máu xương, giờ đây vươn mình với sức sống mãnh liệt và hòa bình.'
  },
  {
    id: 'hue',
    name: 'Huế',
    lat: 16.4637,
    lng: 107.5909,
    image: 'assets/hue_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/hue-tourist/',
    hook: 'Lắng nghe nhịp thời gian trôi chậm lại bên bờ sông Hương...',
    description: 'Kinh thành xưa with vẻ đẹp trầm mặc, những lăng tẩm uy nghi in bóng xuống dòng nước lững lờ.'
  },
  {
    id: 'hoangsa',
    name: 'Nhà trưng bày Hoàng Sa',
    lat: 16.0963, 
    lng: 108.2494,
    image: 'assets/hoang_sa_museum_bg.jpg',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/',
    forceNewTab: true,
    hook: 'Bản hùng ca biển đảo thiêng liêng của Tổ quốc...',
    description: 'Nơi lưu giữ những minh chứng lịch sử hào hùng, khẳng định chủ quyền thiêng liêng trên biển Đông.'
  },
  {
    id: 'hoian',
    name: 'Hội An',
    lat: 15.8794, 
    lng: 108.3331,
    image: 'assets/hoi_an_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/hoian-metaverse/',
    hook: 'Phố cổ rêu phong và những đêm lồng đèn lung linh...',
    description: 'Dạo bước trên những con phố nhỏ, bạn sẽ như lạc vào một dòng chảy xuyên thời gian từ hàng trăm năm trước.'
  },
  {
    id: 'cuchi',
    name: 'Địa Đạo Củ Chi',
    lat: 11.1440,
    lng: 106.4634,
    image: 'assets/cu_chi_bg.jpg',
    vrLink: 'https://vr360.yoolife.vn/ia-ao-cu-chi-zbdsc253u26822s3642',
    hook: 'Mê cung ngầm vĩ đại - minh chứng cho ý chí thép...',
    description: 'Khám phá thế giới dưới lòng đất để hiểu về sức sáng tạo và sự kiên cường của con người Việt Nam.'
  },
  {
    id: 'doclap',
    name: 'Dinh Độc Lập',
    lat: 10.7769,
    lng: 106.6953,
    image: 'assets/dinh_doc_lap_bg.jpg',
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
    image: 'assets/memorial_bg.jpg',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/',
    hook: 'Máu thịt thiêng liêng giữa ngàn khơi...',
    description: 'Quần đảo Hoàng Sa - Minh chứng lịch sử hào hùng và chủ quyền không thể chối cãi của Việt Nam trên Biển Đông.'
  },
  {
    id: 'truong_sa_island',
    name: 'QĐ. Trường Sa',
    lat: 10.7,
    lng: 115.8,
    isIsland: true,
    image: 'assets/truong_sa_bg.jpg',
    vrLink: 'https://duan.vrtour360.vn/NhaTrungBayHoangSa/', /* Tạm dùng link Hoàng Sa nếu chưa có Trường Sa */
    hook: 'Trái tim kiên cường nơi đầu sóng ngọn gió...',
    description: 'Quần đảo Trường Sa - Nơi những người con đất Việt ngày đêm bám biển, bảo vệ vững chắc phên dậu Tổ quốc.'
  },
  {
    id: 'ponagar',
    name: 'Tháp Bà Ponagar',
    lat: 12.2655,
    lng: 109.1958,
    image: 'assets/ponagar_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/ponagar-nhatrang/#Node72',
    hook: 'Dấu ấn văn hóa Chăm Pa rực rỡ bên vịnh Nha Trang...',
    description: 'Quần thể tháp cổ kính với kiến trúc độc đáo, nơi lưu giữ những giá trị tâm linh và nghệ thuật điêu khắc bậc thầy của người Chăm.'
  },
  {
    id: 'dongkhoi',
    name: 'Di tích Đồng Khởi',
    lat: 10.1555,
    lng: 106.3380,
    image: 'assets/dong_khoi_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/di-tich-quoc-gia-dac-biet-dong-khoi-ben-tre/',
    hook: 'Ngọn lửa đồng khởi rực cháy trên quê hương xứ Dừa...',
    description: 'Nơi khởi nguồn của phong trào Đồng Khởi anh hùng, minh chứng cho ý chí quật cường và tinh thần đoàn kết của nhân dân miền Nam.'
  },
  {
    id: 'myson',
    name: 'Thánh địa Mỹ Sơn',
    lat: 15.7647,
    lng: 108.1244,
    image: 'assets/my_son_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/myson-metaverse/',
    hook: 'Thung lũng huyền bí của các vị thần và vương triều Chăm cổ...',
    description: 'Di sản văn hóa thế giới với những ngôi đền gạch nung kỳ bí, nơi lưu giữ lịch sử vàng son của một nền văn minh rực rỡ.'
  },
  {
    id: 'trangan',
    name: 'Bái Đính - Tràng An',
    lat: 20.2526,
    lng: 105.8672,
    image: 'assets/bai_dinh_trang_an_bg.jpg',
    vrLink: 'https://360.holomia.com/tour/29L4EHYO3VIIvad1M?startscene=0',
    hook: 'Vẻ đẹp kỳ ảo của "Hạ Long trên cạn"...',
    description: 'Quần thể danh thắng Ninh Bình với hệ thống núi đá vôi hùng vĩ và những ngôi chùa tâm linh thanh tịnh giữa thiên nhiên tuyệt mỹ.'
  },
  {
    id: 'pacbo',
    name: 'Pác Bó (Cao Bằng)',
    lat: 22.9791,
    lng: 106.0528,
    image: 'assets/pac_bo_bg.jpg',
    vrLink: 'https://store360.vingg.vn/cao-bang/pac-bo/',
    hook: 'Nơi cội nguồn cách mạng giữa đại ngàn Việt Bắc...',
    description: 'Di tích quốc gia đặc biệt với suối Lê-nin trong vắt và núi Các-mác hùng vĩ, nơi Bác Hồ đã sống và làm việc sau 30 năm bôn ba tìm đường cứu nước.'
  },
  {
    id: 'langbac',
    name: 'Lăng Chủ tịch Hồ Chí Minh',
    lat: 21.0368,
    lng: 105.8347,
    image: 'assets/lang_bac_bg.jpg',
    vrLink: 'https://sanpham.starglobal3d.vn/smart-heritage-3d/lang-chu-tich-ho-chi-minh/?startscene=scene_01_lang_bac_(1)&startactions=lookat(0,0,120,0,0);',
    forceNewTab: true,
    hook: 'Trái tim của Thủ đô và niềm tự hào dân tộc...',
    description: 'Công trình kiến trúc thiêng liêng giữa Quảng trường Ba Đình lịch sử, nơi an nghỉ của vị lãnh tụ kính yêu của nhân dân Việt Nam.'
  },
  {
    id: 'vanmieu',
    name: 'Văn Miếu – Quốc Tử Giám',
    lat: 21.0285,
    lng: 105.8355,
    image: 'assets/van_mieu_bg.jpg',
    vrLink: 'https://vr360.com.vn/projects/van-mieu-quoc-tu-giam/#duonglo',
    hook: 'Nơi tôn vinh đạo học và trí tuệ Việt Nam...',
    description: 'Trường Đại học đầu tiên của Việt Nam với kiến trúc cổ kính, nơi lưu giữ những tấm bia Tiến sĩ vinh danh những bậc hiền tài của đất nước.'
  },
  {
    id: 'hoalo',
    name: 'Di tích Nhà tù Hoả Lò',
    lat: 21.0253,
    lng: 105.8465,
    image: 'assets/hoa_lo_bg.jpg',
    vrLink: 'https://store360.vingg.vn/ha-noi/hoan-kiem/nhatuhoalo/',
    hook: 'Nơi ý chí thép nở hoa giữa ngục tù tăm tối...',
    description: 'Di tích lịch sử minh chứng cho tinh thần quật cường của các chiến sĩ cách mạng, được mệnh danh là "Địa ngục trần gian" giữa lòng Hà Nội.'
  }
];
