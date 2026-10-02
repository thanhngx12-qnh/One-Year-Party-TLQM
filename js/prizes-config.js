/**
 * ==============================================================================
 * CẤU HÌNH QUÀ TẶNG & GHÉP GIỌNG MC BỐC THĂM MAY MẮN (GALA TLQM)
 * ==============================================================================
 * HƯỚNG DẪN DÀNH CHO ADMIN / KỸ THUẬT:
 * 1. Muốn THÊM SẢN PHẨM MỚI: 
 *    Chỉ cần sao chép một block type: 'prize' bên dưới, dán vào danh sách và điền:
 *    - name: Tên sản phẩm quà tặng
 *    - image: Đường dẫn ảnh (VD: 'assets/prizes/ten_anh.jpg')
 *    - voice: Đường dẫn file ghi âm MC (VD: 'assets/voices/11.mp3')
 *    - badgeCount: Số lượng giải (VD: '2 GIẢI')
 *    - badgeSub: Mô tả chi tiết (VD: 'Mỗi giải 1 phần quà...')
 * 
 * 2. Muốn GHÉP LẠI GIỌNG NÓI (VOICE OVER):
 *    - Đổi trường `voice: 'assets/voices/so_file.mp3'` tương ứng với từng slide.
 *    - Để `voice: null` nếu slide không có thuyết minh (sẽ tự động dừng chờ vài giây).
 * 
 * 3. HỆ THỐNG SẼ TỰ ĐỘNG:
 *    - Tự sinh tab điều hướng, chấm tròn phân trang, thanh tiến trình (1/N).
 *    - Tự động đồng bộ phím tắt số 1..9, 0...
 *    - Tự động điều chỉnh khớp màn hình 100vh không bị tràn.
 * ==============================================================================
 */

window.GALA_PRIZES_CONFIG = {
  // Cài đặt chung âm thanh & thời gian
  settings: {
    sectionTitle: 'CƠ CẤU QUÀ TẶNG & BỐC THĂM MAY MẮN',
    sectionSubtitle: '17 Phần Quà Giá Trị Chào Đón 2026 • Tiệc Tất Niên & Kỷ Niệm 1 Năm TLQM',
    bgMusicSrc: 'assets/voices/sound-background.mp3',
    luckyDrumSrc: 'assets/voices/luckydraw.mp3',
    defaultVolume: 0.55,
    autoAdvanceDelay: 1800, // Thời gian chờ (ms) sau khi MC đọc xong để tự chuyển slide (khi bật Auto)
    suspenseSlideDelay: 4200 // Thời gian chờ (ms) ở slide kịch tính không có giọng nói
  },

  // Danh sách các Slide trình chiếu quà tặng
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
        logo: 'assets/images/logo-tlqm.png',
        badge: 'TIỆC TẤT NIÊN 2025 & KỶ NIỆM 1 NĂM',
        companyName: 'CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH',
        mainTitle: 'TÀ LÙNG QUANG MINH LOGISTICS',
        caption: 'Đồng Hành Phát Triển • Kết Nối Vững Bền • May Mắn Ngập Tràn'
      }
    },

    // -------------------------------------------------------------
    // SLIDE 2: CHÀO ĐÓN NĂM MỚI 2026
    // -------------------------------------------------------------
    {
      id: 'slide-welcome-2026',
      type: 'transition',
      tabTitle: '2. Chào 2026',
      tabIcon: 'fas fa-champagne-glasses',
      voice: 'assets/voices/2.mp3',
      content: {
        badge: 'GALA XUÂN BỨT PHÁ',
        welcomeText: 'CHÀO ĐÓN NĂM MỚI 2026',
        mainTitle: 'BỐC THĂM MAY MẮN',
        quote: '“MAY MẮN ĐANG CHỜ ĐÓN BẠN”'
      }
    },

    // -------------------------------------------------------------
    // SLIDE 3: TỔNG QUAN 17 PHẦN QUÀ
    // -------------------------------------------------------------
    {
      id: 'slide-stats-17',
      type: 'stats',
      tabTitle: '3. 17 Quà',
      tabIcon: 'fas fa-boxes-stacked',
      voice: 'assets/voices/3.mp3',
      content: {
        totalTarget: 17,
        label: 'PHẦN QUÀ GIÁ TRỊ',
        summaryBadges: [
          { tag: '10 Giải Khuyến Khích', tagClass: 'tag-bronze', desc: '5 Thùng Bia Hạ Long Sapphire + 5 Thùng Coca Cola' },
          { tag: '03 Giải Ba', tagClass: 'tag-silver', desc: 'Bếp Từ Đơn Cao Cấp Pramie' },
          { tag: '02 Giải Nhì', tagClass: 'tag-gold', desc: 'Bộ 3 Nồi Inox 304 Elmich 3 Đáy' },
          { tag: '01 Giải Nhất', tagClass: 'tag-primary', desc: 'Nồi Chiên Không Dầu Toshiba 7.4L' },
          { tag: '01 Giải Đặc Biệt', tagClass: 'tag-special', desc: 'Bộ Chăn Ga Gối Cao Cấp Everon Monstera', highlight: true }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 4: GIẢI KHUYẾN KHÍCH 1 - BIA HẠ LONG SAPPHIRE
    // -------------------------------------------------------------
    {
      id: 'prize-kk-bia-halong',
      type: 'prize',
      tabTitle: '4. 5 KK (Bia)',
      tabIcon: 'fas fa-beer-mug-empty',
      voice: 'assets/voices/4.mp3',
      category: 'GIẢI KHUYẾN KHÍCH (1/2)',
      categoryClass: 'tag-bronze',
      name: 'THÙNG BIA HẠ LONG SAPPHIRE',
      image: 'assets/prizes/bia_halong.jpg',
      imageAlt: 'Bia Hạ Long Sapphire',
      badgeCount: '5 GIẢI',
      badgeSub: '(Mỗi giải 01 thùng bia Hạ Long Sapphire hảo hạng)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 5: GIẢI KHUYẾN KHÍCH 2 - COCA COLA
    // -------------------------------------------------------------
    {
      id: 'prize-kk-coca-cola',
      type: 'prize',
      tabTitle: '5. 5 KK (Coca)',
      tabIcon: 'fas fa-bottle-water',
      voice: 'assets/voices/5.mp3',
      category: 'GIẢI KHUYẾN KHÍCH (2/2)',
      categoryClass: 'tag-bronze',
      name: 'THÙNG NƯỚC NGỌT COCA COLA',
      image: 'assets/prizes/coca_cola.jpg',
      imageAlt: 'Nước Ngọt Coca Cola',
      badgeCount: '5 GIẢI',
      badgeSub: '(Mỗi giải 01 thùng nước ngọt Coca Cola Tết)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 6: 3 GIẢI BA - BẾP TỪ ĐƠN PRAMIE
    // -------------------------------------------------------------
    {
      id: 'prize-ba-bep-tu',
      type: 'prize',
      tabTitle: '6. 3 Giải Ba',
      tabIcon: 'fas fa-fire-burner',
      voice: 'assets/voices/6.mp3',
      category: 'GIẢI BA',
      categoryClass: 'tag-silver',
      name: 'BẾP TỪ ĐƠN CAO CẤP PRAMIE',
      image: 'assets/prizes/bep_tu.jpg',
      imageAlt: 'Bếp từ đơn Pramie',
      badgeCount: '3 GIẢI',
      badgeSub: '(Mặt kính Ceramic cao cấp, cảm ứng siêu nhạy)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 7: 2 GIẢI NHÌ - BỘ 3 NỒI INOX 304 ELMICH
    // -------------------------------------------------------------
    {
      id: 'prize-nhi-noi-elmich',
      type: 'prize',
      tabTitle: '7. 2 Giải Nhì',
      tabIcon: 'fas fa-kitchen-set',
      voice: 'assets/voices/7.mp3',
      category: 'GIẢI NHÌ',
      categoryClass: 'tag-gold',
      name: 'BỘ 3 NỒI INOX 304 ELMICH 3 ĐÁY',
      image: 'assets/prizes/noi_elmich.jpg',
      imageAlt: 'Bộ 3 nồi Inox 304 Elmich',
      badgeCount: '2 GIẢI',
      badgeSub: '(Chất liệu Inox 304 an toàn chuẩn Châu Âu, bắt từ siêu bền)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 8: 1 GIẢI NHẤT - NỒI CHIÊN KHÔNG DẦU TOSHIBA 7.4L
    // -------------------------------------------------------------
    {
      id: 'prize-nhat-noi-chien',
      type: 'prize',
      tabTitle: '8. 1 Giải Nhất',
      tabIcon: 'fas fa-fan',
      voice: 'assets/voices/8.mp3',
      category: 'GIẢI NHẤT',
      categoryClass: 'tag-primary',
      name: 'NỒI CHIÊN KHÔNG DẦU TOSHIBA 7.4L',
      image: 'assets/prizes/noi_chien.jpg',
      imageAlt: 'Nồi chiên không dầu Toshiba',
      badgeCount: '1 GIẢI',
      badgeSub: '(Dung tích khủng 7.4 lít, công nghệ nhiệt đối lưu 360 độ)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 9: KỊCH TÍNH / HỒI HỘP TRƯỚC GIẢI ĐẶC BIỆT
    // -------------------------------------------------------------
    {
      id: 'slide-suspense',
      type: 'drama',
      tabTitle: '9. Kịch Tính',
      tabIcon: 'fas fa-envelope-open-text',
      voice: null, // Không có file âm thanh thuyết minh để tạo không khí hồi hộp
      content: {
        icon: '🧧',
        headline: 'AI SẼ LÀ NGƯỜI MAY MẮN?',
        subhead: 'Phần quà danh giá và bất ngờ nhất của Gala TLQM đang đến gần...',
        buttonText: 'KHÁM PHÁ GIẢI ĐẶC BIỆT'
      }
    },

    // -------------------------------------------------------------
    // SLIDE 10: GIẢI ĐẶC BIỆT - BỘ CHĂN GA EVERON MONSTERA
    // -------------------------------------------------------------
    {
      id: 'prize-dac-biet-everon',
      type: 'grand-prize',
      tabTitle: '10. Giải Đặc Biệt',
      tabIcon: 'fas fa-trophy',
      voice: 'assets/voices/9.mp3',
      category: '🏆 GIẢI ĐẶC BIỆT GALA TLQM 🏆',
      categoryClass: 'tag-special',
      name: 'BỘ CHĂN GA CAO CẤP EVERON MONSTERA',
      image: 'assets/prizes/chan_ga_everon.jpg',
      imageAlt: 'Bộ Chăn Ga Cao Cấp Everon Monstera',
      badgeCount: '1 GIẢI DUY NHẤT',
      badgeSub: '(Chất liệu Tencel sinh học thượng hạng, họa tiết Monstera tinh tế)',
      goldShimmer: true,
      triggerFlash: true,
      triggerConfetti: true,
      triggerCheer: true
    },

    // -------------------------------------------------------------
    // SLIDE 11: BACKDROP BỐC THĂM BAN LÃNH ĐẠO
    // -------------------------------------------------------------
    {
      id: 'slide-backdrop-vip',
      type: 'backdrop',
      tabTitle: '11. Bốc Thăm VIP',
      tabIcon: 'fas fa-crown',
      voice: 'assets/voices/10.mp3',
      content: {
        logo: 'assets/images/logo-tlqm.png',
        company: 'CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH',
        title: 'BỐC THĂM MAY MẮN 2026',
        invitationMain: 'KÍNH MỜI BAN LÃNH ĐẠO',
        invitationSub: 'LÊN SÂN KHẤU TIẾN HÀNH BỐC THĂM',
        drumButtonText: 'BẬT / DỪNG TRỐNG DỒN BỐC THĂM'
      }
    }
  ]
};
