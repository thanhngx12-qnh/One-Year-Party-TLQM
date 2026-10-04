# Điều phối laptop và trình chiếu LED riêng

Mục tiêu: kỹ thuật viên thao tác trên laptop; khán giả xem cửa sổ LED riêng ở độ phân giải 1920×1080, tỷ lệ 16:9. Dùng hai cửa sổ trong cùng trình duyệt trên cùng máy tính.

## 1. Kết nối hai màn hình

1. Kết nối laptop với bộ xử lý LED qua HDMI hoặc bộ chuyển đổi tương ứng.
2. Chọn **mở rộng màn hình (Extend)** trong cài đặt hiển thị của máy tính. Trên Windows có thể bấm `Win + P` → **Extend**. Trên macOS tắt chế độ phản chiếu và dùng màn hình mở rộng.
3. Đặt tín hiệu đầu ra LED ở **1920×1080**, tỷ lệ **16:9**. Nhờ kỹ thuật hội trường kiểm tra hình hiển thị đủ bốn mép.

## 2. Mở ứng dụng và cửa sổ LED

Trong thư mục dự án, chạy:

```sh
python3 -m http.server 8000
```

1. Mở Chrome hoặc Edge tại `http://localhost:8000`. Giữ cửa sổ này trên laptop.
2. Bấm nút hình màn hình có gợi ý `F8`, hoặc bấm `F8` (một số bàn phím cần `Fn + F8`). Cho phép cửa sổ bật lên nếu trình duyệt yêu cầu.
3. Kéo **cửa sổ mới** sang màn LED. Cửa sổ có địa chỉ `http://localhost:8000/?screen=stage`.
4. Bấm vào cửa sổ LED rồi bấm `F` để toàn màn hình. Sau đó quay lại cửa sổ laptop để điều khiển.
5. Kiểm tra dòng **LED đã kết nối** trên laptop và tên mục đang chiếu. Nếu không kết nối, kiểm tra hai cửa sổ dùng cùng trình duyệt, cùng địa chỉ và cùng cổng.

Không mở một cửa sổ bằng `localhost` và cửa sổ còn lại bằng IP; không dùng hai hồ sơ trình duyệt hoặc chế độ ẩn danh khác nhau. Đồng bộ này phục vụ hai màn hình của cùng máy tính, chưa phục vụ một máy LED độc lập qua mạng.

## 3. Nội dung từng màn hình

| Laptop điều phối | Màn LED khán giả |
| --- | --- |
| Chọn mục F1–F5, chọn đợt, nhập mã nhân viên, quay số | Quà đang trao, ba số may mắn, tên và mã người trúng |
| Chọn câu, bắt đầu/tạm dừng, mở gợi ý/đáp án | Chữ cái, đồng hồ, gợi ý và đáp án đã công bố |
| Chọn dáng, bắt đầu/tạm dừng, cộng/trừ điểm, chọn 2–4 đội | Ảnh dáng, hiệu lệnh, đồng hồ và bảng điểm |
| Mở danh sách vinh danh, bấm **Trang trước / Trang sau**, đóng danh sách | Tối đa 6 người mỗi trang, số trang rõ ràng |

LED dùng nền tối độc lập với lựa chọn giao diện sáng/tối trên laptop. Nút kỹ thuật, ô nhập, phím tắt và thông báo thao tác không xuất hiện trên LED. Khi công bố người trúng, ba ô quay số nhường chỗ cho thẻ tên lớn.

Nếu tải lại hoặc mở lại cửa sổ LED, nó nhận nội dung hiện tại từ laptop, gồm câu/đáp án, đồng hồ, điểm đội và trang vinh danh. Kết quả bốc thăm do laptop ghi nhận; LED chỉ trình diễn.

## 4. Tập dượt tại hội trường

- Từ hàng ghế cuối, đọc thử tên người trúng, tên giải, chữ cái và điểm đội.
- Chuyển lần lượt F1–F5 trên laptop; LED phải chuyển theo, không lộ nút điều khiển.
- Thử bắt đầu → tạm dừng → tiếp tục đồng hồ; mở gợi ý rồi đáp án.
- Thử 2 và 4 đội; kiểm tra pha nhìn ảnh, pha quay lưng và hiệu lệnh hết giờ.
- Thử danh sách 12 người: chuyển đủ hai trang từ laptop, sau đó đóng.
- Tải lại cửa sổ LED khi đang hiển thị một đáp án hoặc trang vinh danh; kiểm tra nội dung được khôi phục.
- Bấm thử `F` trên cửa sổ LED để vào/thoát toàn màn hình; các phím F1–F5 chỉ dùng trên laptop.
- Kiểm tra âm thanh với dàn loa thực tế và chọn đầu ra âm thanh trên máy tính.

## Kiểm tra tự động dành cho kỹ thuật

Ứng dụng không cần thư viện hay bước build. Script kiểm tra trình duyệt dùng Playwright được cài riêng trong môi trường phát triển:

```sh
# Khi Playwright đã có trong môi trường Node:
node scripts/check-led.cjs

# Hoặc chỉ rõ thư mục module Playwright bên ngoài dự án:
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node scripts/check-led.cjs
```

Có thể đặt `CHROME_PATH` là đường dẫn chương trình Chrome nếu dùng Chrome có sẵn. Script chạy máy chủ tạm, tạo hồ sơ trình duyệt độc lập, dùng tên/mã thử nghiệm và lưu ảnh chụp vào thư mục tạm. Nó không tác động kết quả đang lưu trong trình duyệt vận hành. Kiểm tra local không thay thế tập dượt với LED và âm thanh tại hội trường.
