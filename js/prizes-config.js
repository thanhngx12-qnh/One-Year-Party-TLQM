/**
 * ==============================================================================
 * CẤU HÌNH QUÀ TẶNG & GHÉP GIỌNG MC BỐC THĂM MAY MẮN (GALA TLQM)
 * DỮ LIỆU ĐỒNG BỘ CHÍNH THỨC TỪ FILE EXCEL CHUẨN BỊ CHƯƠNG TRÌNH GALA TLQM
 * ==============================================================================
 * Cơ cấu 26 Giải Thưởng Bốc Thăm May Mắn (Tỉ lệ trúng 40%):
 * - 01 Giải Nhất: Quạt sưởi gốm Kangaroo cao cấp (1.390.000đ)
 * - 05 Giải Nhì: Bàn là hơi nước Tefal Easy Steam (442.000đ/cái)
 * - 08 Giải Ba: Ấm đun nước siêu tốc Bear 1.5L (430.000đ/cái)
 * - 12 Giải May Mắn: Pin sạc dự phòng Delites Polymer (240.000đ/cái)
 * - Quà Gameshow: 02 Thùng quà bí mật bánh kẹo (Nhất 200k, Nhì 100k) + Ô cầm tay TLQM
 * ==============================================================================
 */

window.GALA_PRIZES_CONFIG = {
  // Cài đặt chung âm thanh & thời gian
  settings: {
    sectionTitle: 'CƠ CẤU QUÀ TẶNG & BỐC THĂM MAY MẮN',
    sectionSubtitle: '26 Phần Quà Giá Trị Chào Đón 2026 • Gala Kỷ Niệm Ra Mắt Thương Hiệu TLQM',
    bgMusicSrc: 'assets/voices/sound-background.mp3',
    luckyDrumSrc: 'assets/voices/luckydraw.mp3',
    defaultVolume: 0.55,
    autoAdvanceDelay: 1800,
    suspenseSlideDelay: 4200
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
        badge: 'KỶ NIỆM RA MẮT THƯƠNG HIỆU TLQM',
        companyName: 'CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH',
        mainTitle: 'TÀ LÙNG QUANG MINH LOGISTICS',
        caption: 'Kết Nối Biên Giới - Vươn Tới Toàn Cầu • Đồng Hành Phát Triển'
      }
    },

    // -------------------------------------------------------------
    // SLIDE 2: BỐC THĂM MAY MẮN - KỶ NIỆM THƯƠNG HIỆU TLQM
    // -------------------------------------------------------------
    {
      id: 'slide-welcome-gala',
      type: 'transition',
      tabTitle: '2. Bốc Thăm',
      tabIcon: 'fas fa-champagne-glasses',
      voice: 'assets/voices/2.mp3',
      content: {
        badge: 'KỶ NIỆM THƯƠNG HIỆU TLQM',
        welcomeText: 'CHÀO MỪNG ĐÊM TIỆC KỶ NIỆM',
        mainTitle: 'BỐC THĂM MAY MẮN',
        quote: '“MAY MẮN ĐANG CHỜ ĐÓN BẠN”'
      }
    },

    // -------------------------------------------------------------
    // SLIDE 3: TỔNG QUAN 26 PHẦN QUÀ CHÍNH THỨC
    // -------------------------------------------------------------
    {
      id: 'slide-stats-26',
      type: 'stats',
      tabTitle: '3. 26 Quà',
      tabIcon: 'fas fa-boxes-stacked',
      voice: 'assets/voices/3.mp3',
      content: {
        totalTarget: 26,
        label: 'PHẦN QUÀ GIÁ TRỊ (TỈ LỆ TRÚNG 40%)',
        summaryBadges: [
          { tag: '12 Giải May Mắn', tagClass: 'tag-bronze', desc: 'Pin Sạc Dự Phòng Delites Polymer Siêu Bền' },
          { tag: '08 Giải Ba', tagClass: 'tag-silver', desc: 'Ấm Đun Nước Siêu Tốc Bear 1.5L Cao Cấp' },
          { tag: '05 Giải Nhì', tagClass: 'tag-gold', desc: 'Bàn Là Hơi Nước Tefal Easy Steam' },
          { tag: '01 Giải Nhất', tagClass: 'tag-special', desc: 'Quạt Sưởi Gốm Kangaroo Cao Cấp', highlight: true },
          { tag: 'Quà Gameshow', tagClass: 'tag-primary', desc: '02 Thùng Quà Bí Mật Sân Khấu + Ô Cầm Tay TLQM' }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 4: 12 GIẢI MAY MẮN - PIN SẠC DỰ PHÒNG DELITES
    // -------------------------------------------------------------
    {
      id: 'prize-may-man-pin-sac',
      type: 'prize',
      tabTitle: '4. 12 May Mắn',
      tabIcon: 'fas fa-battery-three-quarters',
      voice: 'assets/voices/4.mp3',
      category: 'GIẢI MAY MẮN (ĐỢT 1)',
      categoryClass: 'tag-bronze',
      name: 'PIN SẠC DỰ PHÒNG DELITES 10.000 mAh',
      image: 'assets/prizes/pin_sac_delites.svg',
      imageAlt: 'Pin sạc dự phòng Delites',
      badgeCount: '12 GIẢI',
      badgeSub: '(Mỗi giải 01 pin sạc dự phòng Delites Polymer sạc nhanh an toàn)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 5: 08 GIẢI BA - ẤM ĐUN SIÊU TỐC BEAR 1.5L
    // -------------------------------------------------------------
    {
      id: 'prize-ba-am-bear',
      type: 'prize',
      tabTitle: '5. 8 Giải Ba',
      tabIcon: 'fas fa-mug-hot',
      voice: 'assets/voices/6.mp3',
      category: 'GIẢI BA (ĐỢT 2)',
      categoryClass: 'tag-silver',
      name: 'ẤM ĐUN NƯỚC SIÊU TỐC BEAR 1.5 LÍT',
      image: 'assets/prizes/am_sieu_toc_bear.jpg',
      imageAlt: 'Ấm đun nước siêu tốc Bear',
      badgeCount: '08 GIẢI',
      badgeSub: '(Thiết kế phong cách Retro trang nhã, Inox 304 an toàn cho sức khỏe)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 6: 05 GIẢI NHÌ - BÀN LÀ HƠI NƯỚC TEFAL EASY STEAM
    // -------------------------------------------------------------
    {
      id: 'prize-nhi-ban-la-tefal',
      type: 'prize',
      tabTitle: '6. 5 Giải Nhì',
      tabIcon: 'fas fa-shirt',
      voice: 'assets/voices/7.mp3',
      category: 'GIẢI NHÌ (ĐỢT 2)',
      categoryClass: 'tag-gold',
      name: 'BÀN LÀ HƠI NƯỚC TEFAL EASY STEAM',
      image: 'assets/prizes/ban_la_tefal.jpg',
      imageAlt: 'Bàn là hơi nước Tefal',
      badgeCount: '05 GIẢI',
      badgeSub: '(Công nghệ hơi nước siêu mạnh, mặt đế chống dính cao cấp chống nhăn tuyệt đối)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 7: 01 GIẢI NHẤT - QUẠT SƯỞI GỐM KANGAROO
    // -------------------------------------------------------------
    {
      id: 'prize-nhat-quat-suoi-kangaroo',
      type: 'grand-prize',
      tabTitle: '7. 1 Giải Nhất',
      tabIcon: 'fas fa-fire',
      voice: 'assets/voices/8.mp3',
      category: '🏆 GIẢI NHẤT DANH GIÁ GALA TLQM 🏆',
      categoryClass: 'tag-special',
      name: 'QUẠT SƯỞI GỐM KANGAROO CAO CẤP',
      image: 'assets/prizes/quat_suoi_kangaroo.jpg',
      imageAlt: 'Quạt sưởi gốm Kangaroo KG-AH06G',
      badgeCount: '01 GIẢI DUY NHẤT',
      badgeSub: '(Công nghệ sưởi gốm PTC không khô da, cảm ứng điện tử thông minh, sang trọng)',
      goldShimmer: true,
      triggerFlash: true,
      triggerConfetti: true,
      triggerCheer: true
    },

    // -------------------------------------------------------------
    // SLIDE 8: QUÀ TẶNG GAMESHOW SÂN KHẤU
    // -------------------------------------------------------------
    {
      id: 'prize-game-show-boxes',
      type: 'prize',
      tabTitle: '8. Quà Game',
      tabIcon: 'fas fa-trophy',
      voice: 'assets/voices/9.mp3',
      category: 'QUÀ TẶNG GAMESHOW',
      categoryClass: 'tag-primary',
      name: 'THÙNG QUÀ BÍ MẬT & Ô CẦM TAY TLQM',
      image: 'assets/prizes/thung_qua_secret.svg',
      imageAlt: 'Thùng quà bí mật Gameshow',
      badgeCount: 'GAMESHOW',
      badgeSub: '(02 Thùng quà bí mật bánh kẹo trao Đội Nhất/Nhì & Ô cầm tay thương hiệu TLQM)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 9: BACKDROP BỐC THĂM BAN LÃNH ĐẠO
    // -------------------------------------------------------------
    {
      id: 'slide-backdrop-vip',
      type: 'backdrop',
      tabTitle: '9. Bốc Thăm VIP',
      tabIcon: 'fas fa-crown',
      voice: 'assets/voices/10.mp3',
      content: {
        logo: 'assets/images/logo-tlqm.png',
        company: 'CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH',
        title: 'BỐC THĂM MAY MẮN • GALA TLQM',
        invitationMain: 'KÍNH MỜI BAN LÃNH ĐẠO',
        invitationSub: 'LÊN SÂN KHẤU TIẾN HÀNH BỐC THĂM',
        drumButtonText: 'BẬT / DỪNG TRỐNG DỒN BỐC THĂM'
      }
    }
  ]
};
