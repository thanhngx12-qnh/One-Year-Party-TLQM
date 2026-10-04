# 🎉 Tà Lùng Quang Minh (TLQM) - Gala Kỷ Niệm Ra Mắt Thương Hiệu & Gameshow

Ứng dụng Web tương tác cao cấp phục vụ Lễ Kỷ Niệm Ra Mắt Thương Hiệu TLQM - Công Ty Cổ Phần Tà Lùng Quang Minh. Tích hợp đầy đủ các tính năng trình diễn sân khấu, minigame tương tác, bảng điểm thích ứng và đồng bộ màn hình LED thời gian thực.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🎁 Trình Chiếu Cơ Cấu Giải Thưởng (Prize Showcase)
- Hiệu ứng lật thẻ 3D Glassmorphism sang trọng.
- Pháo hoa và âm thanh chúc mừng riêng cho từng hạng mục giải thưởng (Đặc biệt, Nhất, Nhì, Ba, May mắn).
- Hỗ trợ trình chiếu tự động hoặc điều khiển thủ công.

### 2. 👑 Minigame 1: Đấu Trí Vua Tri Thức (King of Knowledge)
- Bộ câu hỏi kiến thức và đố vui liên quan đến văn hóa doanh nghiệp TLQM.
- Đồng hồ đếm ngược 15 giây hồi hộp kèm âm thanh tích tắc nhịp điệu dồn dập.
- Hiệu ứng mở đáp án từng bước kèm âm thanh chúc mừng / cảnh báo.

### 3. 📸 Minigame 2: Tạo Dáng Thần Tốc (Speed Posing Challenge)
- **Tùy biến số lượng đội thi đấu linh hoạt (2 Đội, 3 Đội, 4 Đội)**.
- **Bảng điểm thích ứng**: Tự động ẩn/hiện và cân đối độ cao linh hoạt tương ứng với số đội tham gia.
- Hiệu ứng mở dáng bí mật, đếm ngược 15 giây và chớp sáng flash máy ảnh sân khấu.
- Nút và phím tắt cộng / trừ điểm riêng cho từng đội (Đội 1: Áo Đỏ, Đội 2: Áo Xanh, Đội 3: Áo Vàng, Đội 4: Áo Tím).
- Trao giải vô địch và đồng quán quân với pháo hoa đa tầng confetti và âm thanh reo hò.

### 4. 🎰 Vòng Quay May Mắn (Lucky Draw)
- Quay số ngẫu nhiên minh bạch với khoảng số tùy chỉnh linh hoạt.
- Lịch sử quay số trúng thưởng rõ ràng, hỗ trợ xuất và đặt lại.

### 5. 🖥️ Đồng Bộ 2 Màn Hình Sân Khấu (Stage Dual-Screen Realtime Sync)
- Sử dụng `BroadcastChannel` đồng bộ giữa **Màn hình Điều phối Laptop** và **Màn LED Sân Khấu Chiếu Khán Giả** trong cùng trình duyệt, cùng địa chỉ web.
- Mở màn LED chuyên dụng chỉ với 1 click hoặc phím `F8` (đường dẫn: `?screen=stage`).
- Màn LED tự động ẩn toàn bộ các thanh điều khiển nhạy cảm của MC/Kỹ thuật viên.
- Giao diện LED riêng tối ưu 1920×1080: chữ/số lớn, nền tối, vinh danh 6 người mỗi trang; tự nhận trạng thái hiện tại khi mở hoặc tải lại cửa sổ.
- Xem [hướng dẫn mở hai màn hình riêng](Docs/LED_OPERATOR_GUIDE.md).

### 6. 🔒 Chế Độ Bảo Mật Dữ Liệu Gala Thật
- Tích hợp cổng mật khẩu bảo mật dữ liệu chính thức đêm tiệc (`Talung@2026`).
- Bản Demo tập dượt an toàn với các câu hỏi và dáng chụp mẫu để MC duyệt thử nghiệm mà không lộ đáp án đêm Gala thật.

---

## ⌨️ Phím Tắt Điều Khiển Nhanh (Keyboard Shortcuts)

| Phím Tắt | Chức Năng |
| :--- | :--- |
| `F1` | Chuyển đến Trang Chủ |
| `F2` | Chuyển đến Trình Chiếu Giải Thưởng |
| `F3` | Chuyển đến Minigame Vua Tri Thức |
| `F4` | Chuyển đến Minigame Tạo Dáng Thần Tốc |
| `F` | Bật / Tắt Toàn Màn Hình (Fullscreen) |
| `F8` | Mở Cửa Sổ Màn LED Sân Khấu |
| `F9` | Mở Hộp Thoại Nhập Mật Khẩu Dữ Liệu Thật Gala |
| `M` | Bật / Tắt Hiệu Ứng Âm Thanh |
| `B` | Bật / Tắt Nhạc Nền Gala |
| `C` | Bắn Pháo Hoa Chúc Mừng (Confetti) |
| `Space` / `Enter` | Bắt Đầu / Tạm Dừng Đếm Ngược Hoặc Mở Khóa Dáng |
| `R` | Đặt Lại Đồng Hồ Đếm Ngược |
| `+` / `-` | Tăng / Giảm Số Lượng Đội Thi Đấu (2 - 4 Đội) |
| `1`, `2`, `3`, `4` | Cộng 1 Điểm Cho Đội Tương Ứng |
| `Q`, `W`, `E`, `U` | Trừ 1 Điểm Cho Đội Tương Ứng |
| `0` (hoặc `Shift+R`) | Đặt Lại Điểm Tất Cả Các Đội Về 0 |
| `T` | Trao Giải Vô Địch (Hiển thị Modal Chúc Mừng) |

---

## 🚀 Khởi Chạy Nhanh (Getting Started)

Dự án là ứng dụng Web tĩnh thuần túy (Vanilla HTML5, CSS3, Modern JavaScript), không cần cài đặt backend phức tạp:

1. **Chạy trực tiếp**:
   Mở file `index.html` bằng trình duyệt web hiện đại (Google Chrome, Microsoft Edge khuyến nghị).

2. **Chạy qua Local Server** (Khuyến nghị để đồng bộ BroadcastChannel và âm thanh tốt nhất):
   ```bash
   # Sử dụng Python HTTP Server
   python3 -m http.server 3000
   
   # Hoặc sử dụng Node npx serve
   npx serve . -p 3000
   ```
   Truy cập: `http://localhost:3000`

---
*© 2026 Tà Lùng Quang Minh (TLQM). All Rights Reserved.*
