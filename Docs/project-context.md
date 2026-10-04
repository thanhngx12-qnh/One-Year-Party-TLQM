# 📘 PROJECT CONTEXT: TÀ LÙNG QUANG MINH GALA DINNER

## Hệ Thống Ứng Dụng Web Sân Khấu Kỷ Niệm Ra Mắt Thương Hiệu Tà Lùng Quang Minh Logistics

---

## 1. Thông Tin Chung Dự Án

- **Tên Dự Án**: One-Year-Party-TLQM (Gala Kỷ Niệm 1 Năm Ra Mắt Thương Hiệu).
- **Đơn Vị Chủ Quản**: **CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH** (TLQM Logistics).
- **Khẩu Hiệu / Slogan**: _KẾT NỐI BIÊN GIỚI – VƯƠN TỚI TOÀN CẦU_.
- **Thời Điểm Sự Kiện**: Gala Dinner Kỷ Niệm Ra Mắt Thương Hiệu.
- **Quy Mô Nhân Sự**: 111 Cán bộ Nhân viên (CBCNV), trong đó 65 nhân sự chính thức có mặt tại đêm tiệc Gala.
- **Mục Tiêu Hệ Thống**: Ứng dụng Web chuyên dụng phục vụ trình chiếu màn hình LED sân khấu lớn, tổ chức các gameshow sân khấu tương tác, minigames đối kháng, bốc thăm may mắn 29 giải thưởng và trao thưởng nóng theo thời gian thực với trải nghiệm thị giác chuẩn 16:9 cao cấp.

---

## 2. Kiến Trúc Kỹ Thuật (Tech Stack & Architecture)

Hệ thống được phát triển theo triết lý **Zero-Dependency & Pure Vanilla Web Performance**:

- **Core**: HTML5 Semantic, Modern Vanilla JavaScript (ES6+ Class-based Modules).
- **Styling**: Vanilla CSS3 với hệ thống Design Tokens đồng bộ, hiệu ứng kính mờ (Glassmorphism), chuyển màu Gradients cao cấp, thiết kế tối ưu tuyệt đối cho tỷ lệ khung hình chuẩn sân khấu **16:9**.
- **Không Cần Build Step**: Không sử dụng bundler nặng, chạy trực tiếp trên trình duyệt hoặc máy chủ tĩnh cục bộ (Python HTTP Server / Node serve / GitHub Pages).
- **Đồng Bộ Hai Màn Hình Thời Gian Thực (Dual-Screen Sync)**:
  - Tích hợp `BroadcastChannel('tlqm_stage_channel')` để đồng bộ giữa **Màn hình Kỹ thuật viên (Laptop)** và **Màn LED Sân Khấu (Projector / Stage Display)**.
  - Chế độ Màn LED Sân Khấu độc lập mở qua đường dẫn `?screen=stage` hoặc phím tắt `F8`.
  - Tự động phát hiện và áp dụng lớp giao diện `body.stage-pure-led` để ẩn toàn bộ nút bấm kỹ thuật viên nhạy cảm, chỉ phóng to nội dung sân khấu rực rỡ cho khán giả.
- **Audio & Visual Engines**:
  - `SoundEngine`: Quản lý nhạc nền Gala, tiếng trống dồn hồi hộp (Drum roll), tiếng chuông, đồng hồ đếm ngược tích tắc, tiếng reo hò vỗ tay.
  - `ConfettiEngine`: Đồ họa pháo hoa canvas đa tầng, hiệu ứng chúc mừng sân khấu.
  - `MC Voiceover`: Tích hợp thuyết minh MC truyền cảm (giọng Ninh Đôn – Deep & Warm tạo từ ElevenLabs).

---

## 3. Hệ Thống Thiết Kế & Nhận Diện Thương Hiệu (Design System)

### Bảng Mã Màu Thương Hiệu TLQM

| Tên Màu                   | Mã HEX                              | Ứng Dụng                                                  |
| :------------------------ | :---------------------------------- | :-------------------------------------------------------- |
| **Xanh Lá TLQM**          | `#0B9444`                           | Màu thương hiệu chính, huy hiệu thành công, nút kích hoạt |
| **Xanh Navy Chủ Đạo**     | `#223873`                           | Màu nền logo, tiêu đề công ty, thanh điều hướng chính     |
| **Xanh Navy Đêm**         | `#0F1833` / `#070C1B`               | Nền giao diện sân khấu Gala, thẻ kính mờ                  |
| **Vàng Hoàng Kim (Gold)** | `#F59E0B` / `#FBBF24`               | Chữ lấp lánh (gold-shimmer), viền giải thưởng cao cấp     |
| **Xanh Ngọc (Teal)**      | `#109B9A`                           | Thẻ tag bổ trợ, phân cấp danh mục                         |
| **Nền Trắng Kính**        | `#FFFFFF` / `rgba(255,255,255,0.9)` | Thẻ nổi bật, logo badge                                   |

### Hình Nền Sân Khấu Chính Thức (Backdrop)

- Tích hợp trực tiếp file ảnh chụp Backdrop chính thức của sự kiện: `assets/images/official-gala-backdrop.jpg` (kèm bản PNG chất lượng cao `official-gala-backdrop.png`).
- Kết hợp với lớp phủ chuyển màu đa lớp `linear-gradient(180deg, rgba(8, 16, 40, 0.74) 0%, rgba(7, 13, 31, 0.86) 100%)` để bảo đảm độ nổi của chữ vàng và số may mắn trong mọi điều kiện ánh sáng sân khấu.

---

## 4. Các Phân Hệ Chức Năng (Modules & Sections)

### F1 • Trang Chủ & Khởi Động Gala (`#section-home`)

- Banner đại diện thương hiệu **CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH**.
- Đồng hồ đếm ngược khai mạc chương trình, pháo hoa ăn mừng và video chào mừng.
- Hệ thống phát âm thanh chào mừng MC AI mở màn đêm Gala.

### F2 • Trình Chiếu Cơ Cấu Giải Thưởng (`#section-showcase`)

- Hệ thống 7 Slide trình chiếu giải thưởng 3D Glassmorphism sang trọng:
  1. _Slide 1_: Giới thiệu tổng quan cơ cấu 29 giải thưởng Gala.
  2. _Slide 2_: Quy định bốc thăm và trao quà.
  3. _Slide 3_: Quy trình vinh danh sân khấu.
  4. _Slide 4_: **12 Giải Đồng Hành** – Pin sạc dự phòng AVA+ 10.000 mAh.
  5. _Slide 5_: **08 Giải May Mắn** – Ấm đun siêu tốc Bear 1.5L.
  6. _Slide 6_: **05 Giải Ba** – Bàn là hơi nước Tefal Easy Steam.
  7. _Slide 7_: **01 Giải Nhất** – Quạt sưởi gốm Kangaroo cao cấp.
- Mỗi slide đều tích hợp file giọng đọc MC thuyết minh lồng tiếng chuyên nghiệp, nút nghe lại (`R`), chuyển slide tiến/lùi (`Space`, `←`, `→`).

### F3 • Minigame 1: Vua Tiếng Việt (`#section-king`)

- Trò chơi sắp xếp các chữ cái xáo trộn thành từ ngữ có nghĩa liên quan đến ngành Logistics, địa danh Tà Lùng và văn hóa TLQM.
- Đồng hồ đếm ngược 15 giây dạng vòng tròn SVG với thanh tiến độ đổi màu (xanh -> vàng -> đỏ).
- Phím tắt gợi ý MC (`H`/`G`), phím mở đáp án (`Enter`), phím đặt lại (`R`).
- Tích hợp Chế độ Tập dượt Demo (3 câu) và Chế độ Thật Gala (9 câu) được bảo vệ bằng mật mã Ban Tổ Chức (`Talung@2026`).

### F4 • Minigame 2: Tạo Dáng Thần Tốc (`#section-posing`)

- Thử thách đối kháng sân khấu giữa các đội thi cán bộ nhân viên.
- **Tùy biến số lượng đội**: Hỗ trợ linh hoạt 2 Đội, 3 Đội hoặc 4 Đội thi đấu đồng thời.
- **Bảng điểm tương thích thông minh**: Tự động cân đối chiều cao và bố cục theo số lượng đội tham gia.
- Hiệu ứng mở dáng bí mật, đồng hồ 15s và chớp sáng flash máy ảnh sân khấu.
- Phím tắt cộng/trừ điểm tức thì cho từng đội (`1`-`4`, `Q`/`W`/`E`/`U`), nút trao giải vô địch (`T`) với pháo hoa confetti chúc mừng.

### F5 • Bốc Thăm May Mắn & Trao Quà (`#section-awards`)

Được thiết kế lại chuyên biệt theo chuẩn **khung hình 16:9 duy nhất không cần cuộn chuột**:

1. **Dải 6 Đợt Giải Thưởng Siêu Gọn Gàng (Single-Line Mini Chips)**:
   - Đợt 1: `🎁 12 Đồng Hành (0/12)`
   - Đợt 2: `☕ 08 May Mắn (0/8)`
   - Đợt 3: `🥉 05 Giải Ba (0/5)`
   - Đợt 4: `🥈 03 Giải Nhì (0/3)`
   - Đợt 5: `🏆 01 Giải Nhất (0/1)`
   - Phát Sinh: `⭐ Thưởng Lãnh Đạo (0)`
   - Nút mỏng 30px, chỉ chiếm 1 dòng duy nhất, cập nhật tiến độ tự động thời gian thực.
2. **LABEL LỚN ĐỂ XEM GIẢI SÂN KHẤU (`#lucky-active-prize-card`)**:
   - Nằm trang trọng ở cột Sân Khấu (chiếm 70% chiều rộng màn hình).
   - Hiển thị trực quan hình ảnh giải thưởng chính hãng, huy hiệu đợt, tên sản phẩm khổ lớn, thanh tiến độ % hoàn thành và tên thương hiệu công ty.
   - Tự động thay đổi tương ứng khi người điều khiển bấm vào bất kỳ đợt nào.
3. **Vòng Quay Số 3 Chữ Số (Lucky Slot Machine)**:
   - 3 ô số dial cuộn mượt mà với âm thanh dồn dập, pháo hoa nổ khi chốt số may mắn.
4. **Thẻ Vinh Danh Người Trúng Thưởng (`#lucky-winner-announcement`)**:
   - Hiển thị logo Tà Lùng Quang Minh, số báo danh, họ và tên, chức vụ, phòng ban và giải thưởng đạt được.
5. **Bảng Điều Phối Riêng Trên Laptop**:
   - Chữ và nút đủ lớn để thao tác; cửa sổ LED riêng 1920×1080 chỉ chiếu giải, số và người trúng. Hướng dẫn: [LED_OPERATOR_GUIDE.md](LED_OPERATOR_GUIDE.md).
   - Hỗ trợ 2 chế độ: _1. Nhập Phiếu Đã Bốc_ (Kiểm tra, xác nhận rồi quay slot 3 số) hoặc _2. Nhập Cả Đợt_ (Ghi nhận hàng loạt mã NV cùng lúc).
   - 29 suất chính (12/8/5/3/1), chỉ người dự Gala, mỗi người tối đa một giải. Nhập cả đợt hợp lệ toàn bộ mới lưu. Giải phát sinh yêu cầu tên và phần quà cụ thể; xác nhận riêng các ngoại lệ.
   - Kết quả được lưu trước hiệu ứng, chặn ghi lặp/vượt suất giữa các cửa sổ. Sửa/hủy cần lý do và giữ lịch sử; xuất JSON để đối chiếu.
   - Bảng kết quả đã trao gọn gàng với bộ lọc theo đợt, nút xuất báo cáo và nút vinh danh cả đợt lên màn hình LED.
   - **Nút Bật/Tắt [Bảng Kỹ Thuật]**: Cho phép ẩn hoàn toàn cột điều khiển bên phải để phóng to Sân Khấu đạt **100% độ rộng màn hình 16:9** khi trình diễn trước toàn thể hội trường.

---

## 5. Cấu Trúc Thư Mục Dự Án (Directory Structure)

```
One-Year-Party-TLQM/
├── index.html                   # Giao diện chính chứa toàn bộ các Section và Modals
├── README.md                    # Hướng dẫn nhanh và phím tắt điều khiển
├── PROJECT_CONTEXT.md           # Tài liệu ngữ cảnh toàn diện của dự án (Tài liệu này)
├── css/
│   └── style.css                # Toàn bộ Design System, animations, layout 16:9, Dark/Light modes
├── js/
│   ├── app.js                   # Điều phối ứng dụng chính, chuyển tab, phím tắt toàn cục
│   ├── lucky-draw.js            # Quản lý bốc thăm 29 giải, quay số 3 số, danh bạ nhân sự, Label lớn
│   ├── awards.js                # Quản lý trình diễn giải thưởng và cơ cấu quà tặng
│   ├── stage-sync.js            # Module đồng bộ thời gian thực BroadcastChannel sang Màn LED
│   ├── sound-engine.js          # Hệ thống âm thanh sự kiện, nhạc nền, trống dồn, reo hò
│   ├── confetti-engine.js       # Hiệu ứng pháo hoa chúc mừng đa tầng
│   ├── king-of-knowledge.js     # Logic game Vua Tiếng Việt, bộ câu hỏi, đồng hồ đếm ngược
│   ├── speed-posing.js          # Logic game Tạo Dáng Thần Tốc, điểm số 2-4 đội, flash máy ảnh
│   └── employees-data.js        # Danh bạ chuẩn 111 CBCNV (Mã, Tên, Phòng ban, Trạng thái dự Gala)
├── assets/
│   ├── images/
│   │   ├── logo-official-full.png      # Logo nhận diện thương hiệu Tà Lùng Quang Minh
│   │   ├── official-gala-backdrop.jpg  # Backdrop sự kiện chính thức làm background
│   │   └── official-gala-backdrop.png  # Bản chất lượng cao của backdrop
│   ├── prizes/                         # Ảnh chụp các giải thưởng chính hãng
│   │   ├── pin_sac_ava.jpg             # Đợt 1: Pin sạc dự phòng AVA+ 10.000 mAh
│   │   ├── am_sieu_toc_bear.jpg        # Đợt 2: Ấm đun siêu tốc Bear 1.5L
│   │   ├── ban_la_tefal.jpg            # Đợt 3: Bàn là hơi nước Tefal Easy Steam
│   │   ├── may_say_toc.jpg             # Đợt 4: Máy sấy tóc ion âm cao cấp
│   │   └── quat_suoi_kangaroo.png      # Đợt 5: Quạt sưởi gốm Kangaroo cao cấp
│   ├── voices/                         # Giọng đọc thuyết minh MC AI ElevenLabs
│   │   ├── 1.mp3 đến 7.mp3             # Giọng MC tương ứng với từng Slide Quà Tặng
│   │   └── ElevenLabs_*.mp3            # Các bản ghi giọng MC gốc chất lượng cao
│   ├── audio/                          # Các hiệu ứng âm thanh (drum, cheer, tick, buzz, click)
│   └── posing/                         # Thư viện ảnh các tư thế tạo dáng cho Minigame 2
└── Docs/
    ├── project-context.md       # Bản sao tài liệu ngữ cảnh
    ├── color-design.md          # Quy chuẩn bộ màu thương hiệu
    ├── MC_VOICE_SCRIPTS.md      # Lời thoại MC và kịch bản phân đoạn giọng đọc
    └── message.txt              # Ghi chú tiến độ và trao đổi
```

---

## 6. Danh Mục Phím Tắt Điều Khiển (Keyboard Shortcuts Map)

### Điều Hướng Phân Hệ (Navigation)

- `F1`: Chuyển đến **Trang Chủ** (Home).
- `F2`: Chuyển đến **Slide Quà Tặng** (Showcase Giải Thưởng).
- `F3`: Chuyển đến Minigame **Vua Tiếng Việt**.
- `F4`: Chuyển đến Minigame **Tạo Dáng Thần Tốc**.
- `F5`: Chuyển đến **Bốc Thăm & Trao Quà** (Section Awards).
- `F8`: Mở cửa sổ **Màn LED Sân Khấu** riêng biệt (`?screen=stage`).
- `F9`: Mở hộp thoại nhập mật khẩu dữ liệu Gala thật (`Talung@2026`).
- `F` / `F11`: Bật / Tắt chế độ **Toàn Màn Hình** (Fullscreen).

### Điều Khiển Hiệu Ứng & Âm Thanh (Cheer & Audio)

- `C`: Bắn **Pháo Hoa** chúc mừng kèm âm thanh reo hò (Confetti & Cheer).
- `L`: Bật / Tắt âm thanh **Trống Dồn** hồi hộp (Drum roll).
- `B`: Bật / Tắt **Nhạc Nền** Gala (Background Music).
- `M`: Bật / Tắt toàn bộ hiệu ứng âm thanh (Mute/Unmute).

### Slide Quà Tặng (Showcase)

- `Space` / `→` / `N`: Chuyển sang Slide tiếp theo.
- `←` / `P`: Quay lại Slide trước đó.
- `R`: Nghe lại giọng đọc thuyết minh MC của slide hiện tại.

### Minigame Vua Tiếng Việt

- `Space`: Bắt đầu đếm ngược 15 giây.
- `H` / `G`: Hiển thị gợi ý của MC.
- `Enter`: Mở đáp án chính xác.
- `R`: Đặt lại câu hỏi và đồng hồ.

### Minigame Tạo Dáng Thần Tốc

- `Space`: Mở khóa tư thế bí mật và bắt đầu 15 giây tạo dáng.
- `1`, `2`, `3`, `4`: Cộng 1 điểm cho Đội 1 (Đỏ), Đội 2 (Xanh), Đội 3 (Vàng), Đội 4 (Tím).
- `Q`, `W`, `E`, `U`: Trừ 1 điểm cho đội tương ứng.
- `+` / `-`: Tăng / Giảm số đội thi (từ 2 đến 4 đội).
- `T`: Mở bảng Vinh Danh Trao Giải Vô Địch.
- `0` (hoặc `Shift+R`): Đặt lại điểm số các đội về 0.

### Bốc Thăm May Mắn (Lucky Draw)

- `Space`: Kiểm tra và xác nhận mã phiếu đang nhập; ô trống chỉ nhắc nhập mã. Quay ngẫu nhiên dự phòng có nút riêng.
- `ESC`: Đóng Modal danh sách trúng thưởng trên màn LED sân khấu.

---

## 7. Hướng Dẫn Vận Hành Đêm Tiệc (Operations & Run-of-Show Checklist)

1. **Chuẩn Bị Máy Điều Phối (Operator Laptop)**:
   - Kết nối máy tính với máy chiếu / màn hình LED hội trường qua cổng HDMI / Type-C.
   - Khởi chạy server nội bộ: `python3 -m http.server 8000` và mở trình duyệt Google Chrome tại địa chỉ `http://localhost:8000`.
   - Bấm `F8` để mở cửa sổ Màn LED riêng biệt, kéo cửa sổ này sang màn hình thứ 2 (màn LED chiếu khán giả) và bấm `F` để phóng to toàn màn hình.
   - Kiểm tra kết nối âm thanh ra dàn loa hội trường: Bấm thử phím `L` (trống dồn) và phím `C` (pháo hoa reo hò).
2. **Khai Mở Dữ Liệu Thật**:
   - Bấm phím `F9`, nhập mật khẩu `Talung@2026` để chuyển hệ thống từ chế độ Demo sang chế độ dữ liệu chính thức đêm Gala.
3. **Quy Trình Bốc Thăm & Trao Quà**:
   - Khi MC giới thiệu đợt nào, người điều khiển bấm vào chip đợt tương ứng (Đợt 1 -> 5 hoặc Phát sinh) ở thanh trên. **LABEL LỚN** trên màn hình sân khấu sẽ lập tức cập nhật giải thưởng.
   - Khi Ban Lãnh đạo bốc phiếu may mắn bên ngoài, người điều khiển gõ mã nhân viên vào ô nhập (hoặc dùng quay ngẫu nhiên).
   - Bấm `Vinh Danh Màn LED` hoặc gõ `Enter`, hệ thống sẽ cho 3 chữ số chạy hồi hộp, dừng lại đúng mã và hiện Thẻ Chúc Mừng rực rỡ kèm tiếng reo hò.
   - Sau khi kết thúc mỗi đợt, bấm `Chiếu Màn LED` để hiển thị toàn bộ danh sách những người may mắn của đợt đó lên sân khấu để Ban Lãnh đạo trao quà.
   - Người điều khiển có thể bấm nút **`Bảng Kỹ Thuật`** bất cứ lúc nào để ẩn giấu toàn bộ bảng thao tác bên phải, dành trọn vẹn 100% diện tích màn hình LED cho không gian sân khấu.

---

_Tài liệu được cập nhật ngày 04/10/2026. Bản quyền thuộc về CÔNG TY CỔ PHẦN TÀ LÙNG QUANG MINH._
