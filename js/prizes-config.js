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
          { tag: '01 Giải Nhất', tagClass: 'tag-special', desc: 'Quạt Sưởi Gốm Kangaroo Cao Cấp', highlight: true }
        ]
      }
    },

    // -------------------------------------------------------------
    // SLIDE 4: 12 GIẢI MAY MẮN - BÌNH GIỮ NHIỆT / PIN DỰ PHÒNG DELITES
    // -------------------------------------------------------------
    {
      id: 'prize-may-man-pin-sac',
      type: 'prize',
      tabTitle: '4. 12 May Mắn',
      tabIcon: 'fas fa-battery-three-quarters',
      voice: 'assets/voices/4.mp3',
      category: 'GIẢI MAY MẮN (ĐỢT 1)',
      categoryClass: 'tag-bronze',
      name: 'PIN SẠC DỰ PHÒNG AVA+ 10.000 mAh',
      image: 'assets/prizes/pin_sac_ava.jpg',
      imageAlt: 'Pin sạc dự phòng AVA+ 10.000 mAh',
      badgeCount: '12 GIẢI',
      badgeSub: '(Lõi pin Polymer bền bỉ, công suất 12W, 2 cổng ra USB tiện lợi)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 5: 08 GIẢI BA - BÌNH ĐUN SIÊU TỐC BEAR 1.5L KE-5H15V35
    // -------------------------------------------------------------
    {
      id: 'prize-ba-am-bear',
      type: 'prize',
      tabTitle: '5. 8 Giải Ba',
      tabIcon: 'fas fa-mug-hot',
      voice: 'assets/voices/5.mp3',
      category: 'GIẢI BA (ĐỢT 2)',
      categoryClass: 'tag-silver',
      name: 'BÌNH ĐUN SIÊU TỐC BEAR 1.5 LÍT KE-5H15V35',
      image: 'assets/prizes/am_sieu_toc_bear.jpg',
      imageAlt: 'Bình đun siêu tốc Bear 1.5L',
      badgeCount: '08 GIẢI',
      badgeSub: '(Công suất 1500W đun sôi cực nhanh, ruột Inox 304 cao cấp an toàn, phong cách Retro)',
      goldShimmer: false
    },

    // -------------------------------------------------------------
    // SLIDE 6: 05 GIẢI NHÌ - BÀN ỦI HƠI NƯỚC TEFAL EASY STEAM FV1955E0
    // -------------------------------------------------------------
    {
      id: 'prize-nhi-ban-la-tefal',
      type: 'prize',
      tabTitle: '6. 5 Giải Nhì',
      tabIcon: 'fas fa-shirt',
      voice: 'assets/voices/6.mp3',
      category: 'GIẢI NHÌ (ĐỢT 2)',
      categoryClass: 'tag-gold',
      name: 'BÀN ỦI HƠI NƯỚC TEFAL EASY STEAM FV1955E0',
      image: 'assets/prizes/ban_la_tefal.jpg',
      imageAlt: 'Bàn ủi hơi nước Tefal Easy Steam',
      badgeCount: '05 GIẢI',
      badgeSub: '(Thương hiệu Pháp, công suất 1400W, mặt đế Ceramic chống dính lướt êm ái, phun hơi mạnh)',
      goldShimmer: true
    },

    // -------------------------------------------------------------
    // SLIDE 7: 01 GIẢI NHẤT - QUẠT SƯỞI GỐM KANGAROO KGAH06G CAO CẤP
    // -------------------------------------------------------------
    {
      id: 'prize-nhat-quat-suoi-kangaroo',
      type: 'grand-prize',
      tabTitle: '7. 1 Giải Nhất',
      tabIcon: 'fas fa-fire',
      voice: 'assets/voices/7.mp3',
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

