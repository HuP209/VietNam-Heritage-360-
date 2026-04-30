const videoData = [
  {
    id: 'v_lichsu',
    title: 'Lịch Sử Việt Nam Toàn Tập',
    youtubeId: 'MjeFdeEBZBo',
    keywords: ['lịch sử', 'việt nam', 'tổng quan', 'dân tộc', '4000 năm'],
    locationId: null,
    description: 'Hành trình 4000 năm dựng nước và giữ nước hào hùng của dân tộc Việt Nam.'
  },
  {
    id: 'v_30t4',
    title: 'Giải Phóng Miền Nam 30/4/1975',
    youtubeId: 'bp7JBr8D_q4',
    keywords: ['30 tháng 4', '1975', 'giải phóng', 'thống nhất', 'dinh độc lập', 'sài gòn', 'miền nam'],
    locationId: 'doclap',
    description: 'Khoảnh khắc lịch sử trưa 30/4/1975 – đất nước thống nhất, non sông liền một dải.'
  },
  {
    id: 'v_quangtri',
    title: 'Thành Cổ Quảng Trị – 81 Ngày Đêm',
    youtubeId: 'RH7i8Fd__h4',
    keywords: ['quảng trị', 'thành cổ', '1972', 'mùa hè đỏ lửa', 'kháng chiến', '81 ngày đêm'],
    locationId: 'quangtri',
    description: '81 ngày đêm khói lửa – trang sử bi hùng tráng nhất của chiến tranh chống Mỹ.'
  },
  {
    id: 'v_cuchi',
    title: 'Địa Đạo Củ Chi – Kỳ Tích Ngầm',
    youtubeId: '4E1j-Hsc0k4',
    keywords: ['địa đạo', 'củ chi', 'đường hầm', 'kháng chiến', 'chiến tranh', 'mỹ'],
    locationId: 'cuchi',
    description: 'Hệ thống địa đạo 250km – kỳ tích của ý chí và sức sáng tạo Việt Nam.'
  },
  {
    id: 'v_cmthu8',
    title: 'Cách Mạng Tháng Tám 1945',
    youtubeId: 'zgR6nH84wsQ',
    keywords: ['cách mạng', 'tháng tám', '1945', 'độc lập', 'hồ chí minh', 'ba đình', 'việt minh'],
    locationId: 'hanoi',
    description: 'Tổng khởi nghĩa tháng Tám 1945 – bước ngoặt vĩ đại khai sinh nước Việt Nam Dân chủ Cộng hòa.'
  },
  {
    id: 'v_nguyen_ai_quoc',
    title: 'Hành Trình Tìm Đường Cứu Nước Của Nguyễn Ái Quốc',
    youtubeId: 'Qu3yMoQfWXI',
    keywords: ['nguyễn ái quốc', 'hồ chí minh', 'bác hồ', 'cứu nước', 'pháp', 'liên xô', 'cách mạng'],
    locationId: 'pacbo',
    description: '30 năm bôn ba tìm đường cứu nước – hành trình vĩ đại của lãnh tụ Hồ Chí Minh.'
  },
  {
    id: 'v_dbn_tren_khong',
    title: 'Điện Biên Phủ Trên Không 1972',
    youtubeId: 'B_h556DlLmw',
    keywords: ['điện biên phủ trên không', '1972', 'b52', 'hà nội', 'không quân', 'kháng chiến'],
    locationId: 'hanoi',
    description: '12 ngày đêm rực lửa – Hà Nội bắn hạ pháo đài bay B-52 của Mỹ trên bầu trời.'
  },
  {
    id: 'v_dbp1954',
    title: 'Chiến Dịch Điện Biên Phủ 1954',
    youtubeId: 'CD8sKixEDsI',
    keywords: ['điện biên phủ', '1954', 'kháng chiến', 'pháp', 'chiến thắng', 'võ nguyên giáp'],
    locationId: null,
    lat: 21.3859, lng: 103.0166,
    description: 'Chiến thắng lừng lẫy năm châu, chấn động địa cầu – kết thúc 9 năm kháng chiến chống Pháp.'
  },
  {
    id: 'v_nan_doi',
    title: 'Nạn Đói Ất Dậu 1945',
    youtubeId: 'UUdbK2d32XY',
    keywords: ['nạn đói', 'ất dậu', '1945', 'pháp', 'nhật', 'lịch sử', 'bi thảm'],
    locationId: null,
    description: 'Hơn 2 triệu người chết đói – thảm họa nhân đạo dưới ách cai trị của Pháp và Nhật.'
  },
  {
    id: 'v_tet_mau_than',
    title: 'Tổng Tiến Công Tết Mậu Thân 1968',
    youtubeId: 'YpThj9yGzeM',
    keywords: ['tết mậu thân', '1968', 'tổng tiến công', 'huế', 'sài gòn', 'chiến tranh'],
    locationId: 'hue',
    description: 'Cuộc tổng tiến công táo bạo Tết Mậu Thân 1968 – bước ngoặt của cuộc chiến tranh chống Mỹ.'
  },
  {
    id: 'v_viet_trung_1979',
    title: 'Chiến Tranh Biên Giới Việt–Trung 1979',
    youtubeId: '3TIq3Va1G6s',
    keywords: ['biên giới', 'việt trung', '1979', 'trung quốc', 'chiến tranh', 'phía bắc'],
    locationId: null,
    description: 'Cuộc chiến bảo vệ biên giới phía Bắc năm 1979 – dân tộc Việt Nam kiên cường đứng vững.'
  },
  {
    id: 'v_tay_nam',
    title: 'Chiến Tranh Biên Giới Tây Nam',
    youtubeId: '2Hl7PPXkqcU',
    keywords: ['biên giới tây nam', 'campuchia', 'khmer đỏ', 'chiến tranh', 'giải phóng'],
    locationId: null,
    description: 'Quân tình nguyện Việt Nam giúp nhân dân Campuchia thoát khỏi nạn diệt chủng Khmer Đỏ.'
  },
  {
    id: 'v_mua_xuan_1975',
    title: 'Các Cuộc Tấn Công Mùa Xuân 1975',
    youtubeId: 'aqMp24oZJa8',
    keywords: ['mùa xuân 1975', 'tổng tấn công', 'giải phóng', 'thống nhất', 'chiến dịch hồ chí minh'],
    locationId: 'doclap',
    description: 'Đại thắng mùa Xuân 1975 – chiến dịch lịch sử kết thúc chiến tranh, thống nhất đất nước.'
  },
  {
    id: 'v_hue_danang',
    title: 'Chiến Dịch Huế – Đà Nẵng 1975',
    youtubeId: 'x9016IIAAdk',
    keywords: ['huế', 'đà nẵng', '1975', 'giải phóng', 'chiến dịch', 'mùa xuân'],
    locationId: 'hue',
    description: 'Giải phóng Huế và Đà Nẵng – những đòn quyết định trong Đại thắng mùa Xuân 1975.'
  },
  {
    id: 'v_thuong_lao',
    title: 'Chiến Dịch Thượng Lào',
    youtubeId: 'zDBoIO9t9_4',
    keywords: ['thượng lào', 'lào', 'chiến dịch', 'kháng chiến', 'đông dương', '1953'],
    locationId: null,
    description: 'Chiến dịch Thượng Lào 1953 – mở rộng vùng giải phóng, phối hợp chiến trường Đông Dương.'
  },
  {
    id: 'v_bien_gioi_thu_dong',
    title: 'Chiến Dịch Biên Giới Thu Đông 1950',
    youtubeId: 'hbRc5eFXARM',
    keywords: ['biên giới', 'thu đông', '1950', 'kháng chiến', 'pháp', 'giải phóng'],
    locationId: null,
    description: 'Chiến dịch Biên Giới Thu Đông 1950 – phá vỡ thế bao vây, khai thông biên giới Việt–Trung.'
  },
  {
    id: 'v_viet_bac_1947',
    title: 'Chiến Dịch Việt Bắc Thu Đông 1947',
    youtubeId: 'Al16C_Qd6vE',
    keywords: ['việt bắc', 'thu đông', '1947', 'kháng chiến', 'pháp', 'căn cứ địa'],
    locationId: 'pacbo',
    description: 'Chiến thắng Việt Bắc Thu Đông 1947 – đập tan âm mưu đánh nhanh thắng nhanh của Pháp.'
  },
  {
    id: 'v_can_vuong',
    title: 'Phong Trào Cần Vương',
    youtubeId: 'QA9tNvmcF9I',
    keywords: ['cần vương', 'chống pháp', 'kháng chiến', 'triều nguyễn', 'hàm nghi', 'lịch sử'],
    locationId: null,
    description: 'Phong trào Cần Vương cuối thế kỷ 19 – ngọn lửa chống thực dân Pháp của vua quan triều Nguyễn.'
  },
  {
    id: 'v_phap_dai_nam',
    title: 'Chiến Tranh Pháp – Đại Nam',
    youtubeId: 'pA3pBCfUkt8',
    keywords: ['pháp', 'đại nam', 'xâm lược', 'thuộc địa', 'lịch sử', 'triều nguyễn'],
    locationId: null,
    description: 'Thực dân Pháp xâm lược Đại Nam – khởi đầu một thời kỳ đen tối của dân tộc.'
  },
  {
    id: 'v_trinh_nguyen',
    title: 'Trịnh Nguyễn Phân Tranh',
    youtubeId: 'KsyW3rG8wk0',
    keywords: ['trịnh nguyễn', 'phân tranh', 'nội chiến', 'chúa trịnh', 'chúa nguyễn', 'lịch sử'],
    locationId: null,
    description: 'Gần 2 thế kỷ phân tranh Nam Bắc – bi kịch lịch sử của dân tộc Việt Nam thế kỷ 17–18.'
  },
  {
    id: 'v_tay_son',
    title: 'Phong Trào Tây Sơn – Quang Trung Đại Phá Quân Thanh',
    youtubeId: 'HD89UaWkVQk',
    keywords: ['tây sơn', 'quang trung', 'nguyễn huệ', 'quân thanh', 'đống đa', '1789', 'đại phá'],
    locationId: null,
    description: 'Hoàng đế Quang Trung đại phá 29 vạn quân Thanh trong 5 ngày – chiến công lẫy lừng lịch sử.'
  },
  {
    id: 'v_lam_son',
    title: 'Khởi Nghĩa Lam Sơn (1418–1427)',
    youtubeId: '7hYLCHS-WHU',
    keywords: ['lam sơn', 'lê lợi', 'nguyễn trãi', 'kháng minh', '10 năm', 'bình ngô', '1427'],
    locationId: null,
    description: '10 năm kháng chiến của nghĩa quân Lam Sơn – giải phóng đất nước khỏi ách đô hộ nhà Minh.'
  },
  {
    id: 'v_nguyen_mong',
    title: 'Đại Việt 3 Lần Đại Phá Quân Nguyên Mông (1258–1288)',
    youtubeId: 'BDuq30woAM8',
    keywords: ['nguyên mông', 'đại việt', 'trần hưng đạo', 'bạch đằng', '1258', '1285', '1288', 'kháng chiến'],
    locationId: null,
    description: 'Ba lần chiến thắng đế quốc Nguyên Mông hùng mạnh – đỉnh cao võ công nhà Trần.'
  },
  {
    id: 'v_chong_tong',
    title: 'Cuộc Kháng Chiến Chống Tống',
    youtubeId: '-DeDoT0S1so',
    keywords: ['chống tống', 'lý thường kiệt', 'sông như nguyệt', 'nhà lý', '1075', 'tống'],
    locationId: null,
    description: 'Lý Thường Kiệt đọc bài thơ "Nam quốc sơn hà" – tinh thần độc lập bất diệt của Đại Việt.'
  },
  {
    id: 'v_dinh_bo_linh',
    title: 'Đinh Bộ Lĩnh Dẹp Loạn 12 Sứ Quân',
    youtubeId: 'NLRYvB5VFYk',
    keywords: ['đinh bộ lĩnh', '12 sứ quân', 'thống nhất', 'đinh tiên hoàng', 'hoa lư', 'ninh bình'],
    locationId: 'trangan',
    description: 'Đinh Bộ Lĩnh thống nhất đất nước, lập ra nhà Đinh – mở kỷ nguyên độc lập tự chủ.'
  },
  {
    id: 'v_bach_dang_938',
    title: 'Chiến Thắng Bạch Đằng 938',
    youtubeId: 'ZPIUuLtRUFY',
    keywords: ['bạch đằng', '938', 'ngô quyền', 'nam hán', 'chiến thắng', 'độc lập'],
    locationId: null,
    description: 'Ngô Quyền đại phá quân Nam Hán trên sông Bạch Đằng – kết thúc 1000 năm Bắc thuộc.'
  },
  {
    id: 'v_ba_trieu',
    title: 'Khởi Nghĩa Bà Triệu',
    youtubeId: '6SVQ12dXV3c',
    keywords: ['bà triệu', 'khởi nghĩa', 'chống ngô', '248', 'triệu thị trinh', 'lịch sử'],
    locationId: null,
    description: 'Bà Triệu cưỡi voi đánh giặc – biểu tượng anh hùng bất khuất của phụ nữ Việt Nam.'
  },
  {
    id: 'v_hai_ba_trung',
    title: 'Khởi Nghĩa Hai Bà Trưng',
    youtubeId: 'FC5Rf5daGz0',
    keywords: ['hai bà trưng', 'trưng trắc', 'trưng nhị', 'khởi nghĩa', 'chống hán', '40', 'lịch sử'],
    locationId: null,
    description: 'Hai Bà Trưng phất cờ khởi nghĩa năm 40 SCN – ngọn đuốc đầu tiên của tinh thần quật khởi.'
  }
];
