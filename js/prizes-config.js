/**
 * ==============================================================================
 * CẤU HÌNH QUÀ TẶNG & GHÉP GIỌNG MC BỐC THĂM MAY MẮN (GALA TLQM)
 * DỮ LIỆU ĐỒNG BỘ CHÍNH THỨC TỪ DANH SÁCH MỚI NHẤT BTC GALA TLQM
 * ==============================================================================
 * Cơ cấu 29 Giải Thưởng Bốc Thăm May Mắn (Tỉ lệ trúng 43.94% ~ 44%):
 * - 01 Giải Nhất: Quạt sưởi gốm Kangaroo cao cấp KGAH06G (1.390.000đ)
 * - 03 Giải Nhì: Máy sấy tóc ion âm cao cấp (460.000đ/cái)
 * - 05 Giải Ba: Bàn là hơi nước Tefal Easy Steam FV1955E0 (442.000đ/cái)
 * - 08 Giải May Mắn: Ấm đun nước siêu tốc Bear 1.5L KE-5H15V35 (430.000đ/cái)
 * - 12 Giải Đồng Hành: Pin sạc dự phòng AVA+ / Delites 10.000 mAh (240.000đ/cái)
 * - Quà Gameshow: 02 Thùng quà bí mật bánh kẹo (Nhất 200k, Nhì 100k) + Ô cầm tay TLQM
 * ==============================================================================
 */

window.GALA_PRIZES_CONFIG = {
  // Cài đặt chung âm thanh & thời gian
  settings: {
    sectionTitle: 'CƠ CẤU QUÀ TẶNG & BỐC THĂM MAY MẮN',
    sectionSubtitle: '29 Phần Quà Giá Trị Chào Đón 2026 • Gala Kỷ Niệm Ra Mắt Thương Hiệu TLQM',
    bgMusicSrc: 'assets/voices/sound-background.mp3',
    luckyDrumSrc: 'assets/voices/luckydraw.mp3',
    defaultVolume: 0.55,
    autoAdvanceDelay: 1800,
    suspenseSlideDelay: 4200
  },

  // Danh sách các Slide trình chiếu quà tặng (8 Slides)
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
        label: 'PHẦN QUÀ GIÁ TRỊ (TỈ LỆ TRÚNG 44%)',
        summaryBadges: [
          { tag: '12 Giải Đồng Hành', tagClass: 'tag-bronze', desc: 'Pin Sạc Dự Phòng AVA+ / Delites 10.000 mAh' },
          { tag: '08 Giải May Mắn', tagClass: 'tag-bronze', desc: 'Ấm Đun Nước Siêu Tốc Bear 1.5L Cao Cấp' },
          { tag: '05 Giải Ba', tagClass: 'tag-silver', desc: 'Bàn Là Hơi Nước Tefal Easy Steam' },
          { tag: '03 Giải Nhì', tagClass: 'tag-gold', desc: 'Máy Sấy Tóc Ion Âm Cao Cấp' },
          { tag: '01 Giải Nhất', tagClass: 'tag-special', desc: 'Quạt Sưởi Gốm Kangaroo Cao Cấp', highlight: true }
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
      category: 'GIẢI ĐỒNG HÀNH (ĐỢT 1)',
      categoryClass: 'tag-bronze',
      name: 'PIN SẠC DỰ PHÒNG AVA+ 10.000 mAh',
      image: 'assets/prizes/pin_sac_ava.jpg',
      imageAlt: 'Pin sạc dự phòng AVA+ 10.000 mAh',
      badgeCount: '12 GIẢI',
      badgeSub: '(Lõi pin Polymer bền bỉ, công suất 12W, 2 cổng ra USB tiện lợi)',
      goldShimmer: false
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
      category: 'GIẢI MAY MẮN (ĐỢT 2)',
      categoryClass: 'tag-bronze',
      name: 'BÌNH ĐUN SIÊU TỐC BEAR 1.5 LÍT KE-5H15V35',
      image: 'assets/prizes/am_sieu_toc_bear.jpg',
      imageAlt: 'Bình đun siêu tốc Bear 1.5L',
      badgeCount: '08 GIẢI',
      badgeSub: '(Công suất 1500W đun sôi cực nhanh, ruột Inox 304 cao cấp an toàn, phong cách Retro)',
      goldShimmer: false
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
      category: 'GIẢI BA (ĐỢT 3)',
      categoryClass: 'tag-silver',
      name: 'BÀN ỦI HƠI NƯỚC TEFAL EASY STEAM FV1955E0',
      image: 'assets/prizes/ban_la_tefal.jpg',
      imageAlt: 'Bàn ủi hơi nước Tefal Easy Steam',
      badgeCount: '05 GIẢI',
      badgeSub: '(Thương hiệu Pháp, công suất 1400W, mặt đế Ceramic chống dính lướt êm ái, phun hơi mạnh)',
      goldShimmer: false
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
      category: 'GIẢI NHÌ (ĐỢT 4)',
      categoryClass: 'tag-gold',
      name: 'MÁY SẤY TÓC ION ÂM CAO CẤP',
      image: 'assets/prizes/may_say_toc.jpg',
      imageAlt: 'Máy sấy tóc ion âm cao cấp',
      badgeCount: '03 GIẢI',
      badgeSub: '(Động cơ mạnh mẽ, luồng gió ion âm bảo vệ tóc bóng mượt, đa cấp độ nhiệt thông minh)',
      goldShimmer: true
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
      category: '🏆 GIẢI NHẤT DANH GIÁ GALA TLQM 🏆',
      categoryClass: 'tag-special',
      name: 'QUẠT SƯỞI GỐM KANGAROO KGAH06G CAO CẤP',
      image: 'assets/prizes/quat_suoi_kangaroo.jpg',
      imageAlt: 'Quạt sưởi gốm Kangaroo KGAH06G',
      badgeCount: '01 GIẢI DUY NHẤT',
      badgeSub: '(Công nghệ sưởi gốm PTC 2000W không khô da, điều khiển từ xa, hẹn giờ 12h, tự ngắt an toàn)',
      goldShimmer: true,
      triggerFlash: true,
      triggerConfetti: true,
      triggerCheer: true
    }
  ]
};

