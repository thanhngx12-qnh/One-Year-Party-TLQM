/**
 * ==============================================================================
 * CẤU HÌNH QUÀ TẶNG & GHÉP GIỌNG MC BỐC THĂM MAY MẮN (GALA TÀ LÙNG QUANG MINH)
 * CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH - KỶ NIỆM RA MẮT THƯƠNG HIỆU
 * ==============================================================================
 */

window.GALA_PRIZES_CONFIG = {
  // Cài đặt chung âm thanh & thời gian
  settings: {
    sectionTitle: 'CƠ CẤU QUÀ TẶNG & BỐC THĂM MAY MẮN',
    sectionSubtitle: '29 Phần Quà Giá Trị Chào Đón 2026 • Gala Kỷ Niệm Ra Mắt Thương Hiệu Tà Lùng Quang Minh Logistics',
    bgMusicSrc: 'assets/voices/sound-background.mp3',
    luckyDrumSrc: 'assets/voices/luckydraw.mp3',
    defaultVolume: 0.55,
    autoAdvanceDelay: 1800,
    suspenseSlideDelay: 4200
  },

  // Danh sách các Slide trình chiếu quà tặng (8 Slides Cao Cấp)
  slides: [
    // -------------------------------------------------------------
    // SLIDE 1: KHỞI ĐỘNG
    // -------------------------------------------------------------
    {
      id: 'slide-opening',
      type: 'opening',
      tabTitle: '1. Khởi Động',
      tabIcon: 'fas fa-flag',
      voice: 'assets/voices/1.mp3',
      content: {
        logo: 'assets/images/logo-official-full.png',
        badge: 'KỶ NIỆM RA MẮT THƯƠNG HIỆU TÀ LÙNG QUANG MINH',
        companyName: 'CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH',
        mainTitle: 'TÀ LÙNG QUANG MINH LOGISTICS',
        caption: 'Kết Nối Biên Giới - Vươn Tới Toàn Cầu • Đồng Hành Cùng Phát Triển',
        milestones: [
          { icon: 'fas fa-shield-halved', num: 'LOGISTICS', label: 'Thương Hiệu Tiên Phong Cửa Khẩu Tà Lùng' },
          { icon: 'fas fa-users-gear', num: '111', label: 'Cán Bộ Nhân Viên Chung Sức' },
          { icon: 'fas fa-truck-ramp-box', num: '24/7', label: 'Chuỗi Vận Hành Cửa Khẩu Thông Suốt' },
          { icon: 'fas fa-award', num: '2026', label: 'Khát Vọng Vươn Tầm Quốc Tế' }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 2: BỐC THĂM MAY MẮN - KỶ NIỆM THƯƠNG HIỆU TÀ LÙNG QUANG MINH
    // -------------------------------------------------------------
    {
      id: 'slide-welcome-gala',
      type: 'transition',
      tabTitle: '2. Bốc Thăm',
      tabIcon: 'fas fa-champagne-glasses',
      voice: 'assets/voices/2.mp3',
      content: {
        badge: 'KỶ NIỆM THƯƠNG HIỆU TÀ LÙNG QUANG MINH',
        welcomeText: 'CHÀO MỪNG ĐÊM TIỆC KỶ NIỆM',
        mainTitle: 'BỐC THĂM MAY MẮN',
        quote: '“MAY MẮN ĐANG CHỜ ĐÓN BẠN”',
        features: [
          { icon: 'fas fa-boxes-stacked', title: '29 Phần Quà May Mắn', desc: '5 Hạng giải thưởng cao cấp và thiết thực trao tận tay CBCNV' },
          { icon: 'fas fa-chart-pie', title: 'Tỉ Lệ Trúng Cao ~44%', desc: 'Gần một nửa khán phòng đêm nay đều sẽ có cơ hội rinh quà' },
          { icon: 'fas fa-shield-halved', title: 'Minh Bạch Tuyệt Đối 100%', desc: 'Ban Lãnh đạo bốc thăm công khai trực tiếp tại sân khấu' }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 3: TỔNG QUAN 29 PHẦN QUÀ CHÍNH THỨC
    // -------------------------------------------------------------
    {
      id: 'slide-stats-29',
      type: 'stats',
      tabTitle: '3. 29 Quà',
      tabIcon: 'fas fa-boxes-stacked',
      voice: 'assets/voices/3.mp3',
      content: {
        totalTarget: 29,
        label: 'PHẦN QUÀ MAY MẮN (TỈ LỆ TRÚNG ~44%)',
        oddsText: '29 Giải Thưởng / 66 Khách Tham Dự = 43.94% Cơ Hội Rinh Quà Đêm Nay',
        summaryBadges: [
          { tag: '12 Giải Đồng Hành', tagClass: 'tag-bronze', icon: 'fas fa-battery-three-quarters', desc: 'Pin Sạc Dự Phòng AVA+ 10.000 mAh', count: '12 Suất Quà Tặng', note: 'Chính Hãng Nguyên Seal' },
          { tag: '08 Giải May Mắn', tagClass: 'tag-bronze', icon: 'fas fa-mug-hot', desc: 'Ấm Đun Nước Siêu Tốc Bear 1.5L', count: '08 Suất Quà Tặng', note: 'Ruột Inox 304 An Toàn' },
          { tag: '05 Giải Ba', tagClass: 'tag-silver', icon: 'fas fa-shirt', desc: 'Bàn Là Hơi Nước Tefal Easy Steam', count: '05 Suất Quà Tặng', note: 'Thương Hiệu Pháp' },
          { tag: '03 Giải Nhì', tagClass: 'tag-gold', icon: 'fas fa-wind', desc: 'Máy Sấy Tóc Ion Âm Cao Cấp', count: '03 Suất Quà Tặng', note: 'Công Nghệ Khóa Ẩm' },
          { tag: '01 Giải Nhất', tagClass: 'tag-special', icon: 'fas fa-fire', desc: 'Quạt Sưởi Gốm Kangaroo Cao Cấp', count: '01 Giải Tâm Điểm', note: 'Sưởi Gốm PTC 2000W', highlight: true }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 4: 12 GIẢI ĐỒNG HÀNH - PIN SẠC DỰ PHÒNG AVA+ 10.000 mAh
    // -------------------------------------------------------------
    {
      id: 'prize-dong-hanh-pin-sac',
      type: 'prize',
      tabTitle: '4. 12 Đồng Hành',
      tabIcon: 'fas fa-battery-three-quarters',
      voice: 'assets/voices/4.mp3',
      category: 'GIẢI ĐỒNG HÀNH',
      categoryClass: 'tag-bronze',
      roundTag: 'ĐỢT 1 • 12 VÉ MAY MẮN',
      name: 'PIN SẠC DỰ PHÒNG AVA+ 10.000 mAh',
      image: 'assets/prizes/pin_sac_ava.jpg',
      imageAlt: 'Pin sạc dự phòng AVA+ 10.000 mAh',
      badgeCount: '12 GIẢI',
      badgeSub: 'Lõi Polymer bền bỉ, công suất 12W, 2 cổng ra USB tiện lợi',
      awardMethod: 'Bốc Thăm Công Khai Sân Khấu',
      quantityLabel: '12 Suất Quà Tặng May Mắn',
      targetNote: 'Toàn Thể Cán Bộ Nhân Viên Tà Lùng Quang Minh',
      qualityStandard: 'Chính Hãng Nguyên Seal 100%',
      trustHighlights: ['Bảo Hành Chính Hãng', 'Đóng Gói Sang Trọng', 'Trao Thưởng Tận Tay'],
      quote: '“Nguồn năng lượng bền bỉ đồng hành cùng bạn trên mọi hành trình công tác và cuộc sống!”',
      haloClass: 'halo-bronze',
      goldShimmer: false,
      specs: [
        { icon: 'fas fa-bolt', title: 'Lõi Pin Polymer 10.000 mAh', desc: 'Dung lượng thực bền bỉ, đáp ứng tiêu chuẩn an toàn hàng không' },
        { icon: 'fas fa-plug', title: '2 Cổng Ra USB Tiện Lợi', desc: 'Sạc đồng thời 2 thiết bị thông minh với công suất ổn định 12W' },
        { icon: 'fas fa-lightbulb', title: 'Đèn LED 4 Mức Báo Pin', desc: 'Dễ dàng theo dõi dung lượng pin còn lại chỉ bằng một nút bấm' },
        { icon: 'fas fa-shield-heart', title: 'Bảo Vệ Đa Lớp Thông Minh', desc: 'Tự động ngắt khi quá nhiệt, chống quá dòng và hiện tượng đoản mạch' }
      ]
    },

    // -------------------------------------------------------------
    // SLIDE 5: 08 GIẢI MAY MẮN - BÌNH ĐUN SIÊU TỐC BEAR 1.5L KE-5H15V35
    // -------------------------------------------------------------
    {
      id: 'prize-may-man-am-bear',
      type: 'prize',
      tabTitle: '5. 8 May Mắn',
      tabIcon: 'fas fa-mug-hot',
      voice: 'assets/voices/5.mp3',
      category: 'GIẢI MAY MẮN',
      categoryClass: 'tag-bronze',
      roundTag: 'ĐỢT 2 • 08 VÉ MAY MẮN',
      name: 'BÌNH ĐUN SIÊU TỐC BEAR 1.5 LÍT KE-5H15V35',
      image: 'assets/prizes/am_sieu_toc_bear.jpg',
      imageAlt: 'Bình đun siêu tốc Bear 1.5L',
      badgeCount: '08 GIẢI',
      badgeSub: 'Công suất 1500W đun sôi cực nhanh, ruột Inox 304 cao cấp an toàn, phong cách Retro',
      awardMethod: 'Bốc Thăm Công Khai Sân Khấu',
      quantityLabel: '08 Suất Quà Tặng May Mắn',
      targetNote: 'Toàn Thể Cán Bộ Nhân Viên Tà Lùng Quang Minh',
      qualityStandard: 'Chính Hãng Nguyên Seal 100%',
      trustHighlights: ['Bảo Hành Chính Hãng', 'Đóng Gói Sang Trọng', 'Trao Thưởng Tận Tay'],
      quote: '“Ấm áp mỗi ngày cùng những tách trà và cà phê thơm nồng bên gia đình!”',
      haloClass: 'halo-amber',
      goldShimmer: false,
      specs: [
        { icon: 'fas fa-gauge-high', title: 'Công Suất 1500W Siêu Tốc', desc: 'Đun sôi nước chỉ trong 5 phút, tiết kiệm thời gian và điện năng' },
        { icon: 'fas fa-award', title: 'Ruột Bình Inox 304 Cao Cấp', desc: 'Chống bám cặn, chống gỉ sét, an toàn tuyệt đối cho sức khỏe' },
        { icon: 'fas fa-shield', title: 'Cách Nhiệt 2 Lớp Chống Bỏng', desc: 'Lớp vỏ nhựa PP chịu nhiệt cao cấp, cầm nắm êm ái và an toàn' },
        { icon: 'fas fa-paint-roller', title: 'Phong Cách Retro Trang Nhã', desc: 'Thiết kế vintage cổ điển kết hợp tone màu ấm cúng, sang trọng' }
      ]
    },

    // -------------------------------------------------------------
    // SLIDE 6: 05 GIẢI BA - BÀN ỦI HƠI NƯỚC TEFAL EASY STEAM FV1955E0
    // -------------------------------------------------------------
    {
      id: 'prize-ba-ban-la-tefal',
      type: 'prize',
      tabTitle: '6. 5 Giải Ba',
      tabIcon: 'fas fa-shirt',
      voice: 'assets/voices/6.mp3',
      category: 'GIẢI BA',
      categoryClass: 'tag-silver',
      roundTag: 'ĐỢT 3 • 05 VÉ MAY MẮN',
      name: 'BÀN ỦI HƠI NƯỚC TEFAL EASY STEAM FV1955E0',
      image: 'assets/prizes/ban_la_tefal.jpg',
      imageAlt: 'Bàn ủi hơi nước Tefal Easy Steam',
      badgeCount: '05 GIẢI',
      badgeSub: 'Thương hiệu Pháp, công suất 1400W, mặt đế Ceramic chống dính lướt êm ái, phun hơi mạnh',
      awardMethod: 'Bốc Thăm Công Khai Sân Khấu',
      quantityLabel: '05 Suất Quà Tặng May Mắn',
      targetNote: 'Toàn Thể Cán Bộ Nhân Viên Tà Lùng Quang Minh',
      qualityStandard: 'Chính Hãng Nguyên Seal 100%',
      trustHighlights: ['Bảo Hành Chính Hãng', 'Đóng Gói Sang Trọng', 'Trao Thưởng Tận Tay'],
      quote: '“Cho diện mạo luôn phẳng phiu tinh tươm, tự tin đón nhận những thành công mới!”',
      haloClass: 'halo-silver',
      goldShimmer: false,
      specs: [
        { icon: 'fas fa-globe-europe', title: 'Thương Hiệu Pháp Nổi Tiếng', desc: 'Tập đoàn Tefal danh tiếng chuẩn chất lượng gia dụng châu Âu' },
        { icon: 'fas fa-wand-magic-sparkles', title: 'Mặt Đế Ceramic Siêu Trượt', desc: 'Chống dính vượt trội, lướt êm nhẹ nhàng trên mọi chất liệu vải' },
        { icon: 'fas fa-cloud', title: 'Phun Hơi Tăng Cường Mạnh Mẽ', desc: 'Công suất 1400W làm phẳng các nếp nhăn cứng đầu trong tích tắc' },
        { icon: 'fas fa-droplet-slash', title: 'Hệ Thống Chống Nhỏ Giọt', desc: 'Ngăn rò rỉ nước ở nhiệt độ thấp, giữ quần áo luôn tinh tươm' }
      ]
    },

    // -------------------------------------------------------------
    // SLIDE 7: 03 GIẢI NHÌ - MÁY SẤY TÓC ION ÂM CAO CẤP
    // -------------------------------------------------------------
    {
      id: 'prize-nhi-may-say-toc',
      type: 'prize',
      tabTitle: '7. 3 Giải Nhì',
      tabIcon: 'fas fa-wind',
      voice: 'assets/voices/7.mp3',
      category: 'GIẢI NHÌ',
      categoryClass: 'tag-gold',
      roundTag: 'ĐỢT 4 • 03 VÉ MAY MẮN',
      name: 'MÁY SẤY TÓC ION ÂM CAO CẤP',
      image: 'assets/prizes/may_say_toc.jpg',
      imageAlt: 'Máy sấy tóc ion âm cao cấp',
      badgeCount: '03 GIẢI',
      badgeSub: 'Động cơ mạnh mẽ, luồng gió ion âm bảo vệ tóc bóng mượt, đa cấp độ nhiệt thông minh',
      awardMethod: 'Bốc Thăm Công Khai Sân Khấu',
      quantityLabel: '03 Suất Quà Tặng May Mắn',
      targetNote: 'Toàn Thể Cán Bộ Nhân Viên Tà Lùng Quang Minh',
      qualityStandard: 'Chính Hãng Nguyên Seal 100%',
      trustHighlights: ['Bảo Hành Chính Hãng', 'Đóng Gói Sang Trọng', 'Trao Thưởng Tận Tay'],
      quote: '“Chăm sóc mái tóc bồng bềnh khỏe đẹp, rạng rỡ phong thái mỗi sớm mai!”',
      haloClass: 'halo-gold',
      goldShimmer: true,
      specs: [
        { icon: 'fas fa-wind', title: 'Luồng Gió Lốc Cực Đại', desc: 'Động cơ tốc độ cao giúp sấy khô tóc nhanh chóng mà không gây tổn hại' },
        { icon: 'fas fa-sparkles', title: 'Công Nghệ Hàng Triệu Ion Âm', desc: 'Khóa ẩm sâu vào lõi tóc, giảm tĩnh điện và chống khô xơ tối đa' },
        { icon: 'fas fa-sliders', title: 'Đa Dạng Chế Độ Nhiệt & Gió', desc: 'Tùy chỉnh linh hoạt theo từng độ dài và cấu trúc sợi tóc khác nhau' },
        { icon: 'fas fa-snowflake', title: 'Nút Thổi Gió Lạnh Khóa Nếp', desc: 'Giúp cố định tạo kiểu tóc đẹp tự nhiên, giữ nếp suốt cả ngày' }
      ]
    },

    // -------------------------------------------------------------
    // SLIDE 8: 01 GIẢI NHẤT - QUẠT SƯỞI GỐM KANGAROO KGAH06G CAO CẤP
    // -------------------------------------------------------------
    {
      id: 'prize-nhat-quat-suoi-kangaroo',
      type: 'grand-prize',
      tabTitle: '8. 1 Giải Nhất',
      tabIcon: 'fas fa-fire',
      voice: 'assets/voices/8.mp3',
      category: '🏆 GIẢI NHẤT DANH GIÁ GALA TÀ LÙNG QUANG MINH 🏆',
      categoryClass: 'tag-special',
      roundTag: '🏆 ĐỢT 5 • 01 GIẢI NHẤT DUY NHẤT 🏆',
      name: 'QUẠT SƯỞI GỐM KANGAROO KGAH06G CAO CẤP',
      image: 'assets/prizes/quat_suoi_kangaroo.jpg',
      imageAlt: 'Quạt sưởi gốm Kangaroo KGAH06G',
      badgeCount: '01 GIẢI DUY NHẤT',
      badgeSub: 'Công nghệ sưởi gốm PTC 2000W không khô da, điều khiển từ xa, hẹn giờ 12h, tự ngắt an toàn',
      awardMethod: 'Bốc Thăm Tâm Điểm Đêm Gala',
      quantityLabel: '01 Giải Nhất Danh Giá Duy Nhất',
      targetNote: 'Tâm Điểm May Mắn Nhất Đêm Gala Tà Lùng Quang Minh',
      qualityStandard: 'Chính Hãng Kangaroo Nguyên Seal',
      trustHighlights: ['Bảo Hành Chính Hãng 12T', 'Đóng Gói Sang Trọng', 'Vinh Danh Sân Khấu'],
      quote: '“Món quà đỉnh cao trao trọn sự ấm áp, thịnh vượng và an lành cho gia đình bạn!”',
      haloClass: 'halo-special',
      goldShimmer: true,
      triggerFlash: true,
      triggerConfetti: true,
      triggerCheer: true,
      specs: [
        { icon: 'fas fa-fire-burner', title: 'Công Nghệ Gốm PTC 2000W', desc: 'Làm ấm tức thì, hoàn toàn không đốt oxy, không phát sáng gây chói mắt' },
        { icon: 'fas fa-mobile-screen', title: 'Điều Khiển Từ Xa & Màn LED', desc: 'Bảng điều khiển cảm ứng hiện đại, tùy chỉnh nhiệt độ tiện lợi' },
        { icon: 'fas fa-arrows-left-right', title: 'Góc Quay Đảo Gió Rộng 80°', desc: 'Lan tỏa hơi ấm đồng đều khắp không gian phòng khách, phòng ngủ' },
        { icon: 'fas fa-shield-halved', title: 'Cảm Biến Tự Ngắt An Toàn', desc: 'Tự động ngắt điện khi nghiêng đổ hoặc quá nhiệt, bảo vệ gia đình toàn diện' }
      ]
    }
  ]
};

