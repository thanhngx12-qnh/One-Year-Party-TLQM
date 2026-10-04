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

## 4. Bốc thăm và trao quà

1. Bấm **F5**, chọn đúng đợt trên laptop. LED hiển thị quà đang trao.
2. Ban Lãnh đạo bốc phiếu ngoài sân khấu. Nhập **mã phiếu** (1–3 chữ số, tự thêm số 0) hoặc **họ tên đầy đủ, duy nhất**. Hệ thống không đoán tên gần đúng.
3. Kiểm tra tên, phòng ban, tình trạng dự tiệc và số suất còn lại. Bấm **Kiểm tra & Công bố** hoặc Enter trong ô mã.
4. Đọc hộp xác nhận đúng người, đúng giải. **Hủy** không ghi nhận và không công bố. **OK** lưu kết quả trước, sau đó chạy ba số và vinh danh trên LED.
5. Với **Nhập cả đợt**, nhập các mã cách nhau bằng dấu phẩy, dấu chấm phẩy hoặc khoảng trắng. Cả danh sách phải hợp lệ; một mã sai, lặp hoặc vượt suất sẽ chặn toàn đợt. Sau xác nhận, danh sách được lưu cùng một lượt và chiếu tối đa 6 người mỗi trang.

**Quy tắc giải chính:** 12 Đồng Hành + 8 May Mắn + 5 Giải Ba + 3 Giải Nhì + 1 Giải Nhất = **29 giải**. Chỉ nhân sự đã xác nhận dự Gala; mỗi người nhận tối đa một giải. Đợt đủ suất sẽ chặn ghi thêm. Khi hủy kết quả, suất tương ứng được trả lại.

**Giải phát sinh:** chọn mục **Thưởng Lãnh Đạo**, nhập tên giải và phần quà cụ thể. Được ghi riêng, không chiếm 29 suất chính. Nếu người nhận đã trúng hoặc chưa xác nhận dự Gala, hộp xác nhận nêu rõ ngoại lệ để điều phối xác nhận theo quyết định Ban Lãnh đạo.

**Quay bằng máy:** mở phần **Quay ngẫu nhiên bằng máy (dự phòng)**. Máy chỉ chọn người dự Gala chưa trúng, rồi yêu cầu xác nhận trước khi lưu. Space khi chưa nhập mã phiếu chỉ nhắc nhập mã, không tự quay bằng máy.

**Sửa hoặc hủy:** tại danh sách đã trao, chọn biểu tượng bút để sửa người/giải, hoặc thùng rác để hủy. Bắt buộc ghi lý do và xác nhận. Sửa giữ mã định danh kết quả, kiểm tra lại điều kiện và suất giải, rồi cập nhật LED. Hủy đóng phần vinh danh hiện tại để tránh chiếu kết quả đã hủy. Hủy toàn bộ cũng giữ bản gốc trong lịch sử đối chiếu.

**Lưu và xuất:** kết quả, nội dung vinh danh và lịch sử sửa/hủy được lưu cùng một lần trong trình duyệt vận hành. Tải lại laptop/LED sẽ khôi phục kết quả đã lưu, kể cả khi hiệu ứng chưa chạy xong. Bấm **Xuất báo cáo** sau mỗi đợt để tải JSON gồm kết quả còn hiệu lực và lịch sử. Nút sao chép vẫn cung cấp danh sách văn bản cho MC. Dữ liệu gắn với hồ sơ trình duyệt và địa chỉ đang dùng; báo cáo tải xuống là bản lưu ngoài trình duyệt.

Nếu trình duyệt báo không đọc hoặc không lưu được dữ liệu, hệ thống chặn ghi nhận/công bố mới và giữ dữ liệu cũ. Kiểm tra nguyên nhân trước khi tiếp tục. Chạy qua localhost hoặc HTTPS bằng Chrome/Edge để khóa thao tác ghi giữa các cửa sổ điều phối; không dùng file mở trực tiếp cho chương trình thật.

## 5. Tập dượt tại hội trường

- Từ hàng ghế cuối, đọc thử tên người trúng, tên giải, chữ cái và điểm đội.
- Chuyển lần lượt F1–F5 trên laptop; LED phải chuyển theo, không lộ nút điều khiển.
- Thử bắt đầu → tạm dừng → tiếp tục đồng hồ; mở gợi ý rồi đáp án.
- Thử 2 và 4 đội; kiểm tra pha nhìn ảnh, pha quay lưng và hiệu lệnh hết giờ.
- Dùng dữ liệu thử nghiệm để thử mã sai, mã lặp, người vắng, hết suất, hủy xác nhận; LED không được công bố.
- Thử sửa/hủy có lý do và xuất báo cáo; kiểm tra suất giải và nội dung LED cập nhật.
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

Có thể đặt `CHROME_PATH` là đường dẫn chương trình Chrome nếu dùng Chrome có sẵn. Script chạy máy chủ tạm, tạo hồ sơ trình duyệt độc lập, dùng tên/mã thử nghiệm và lưu ảnh chụp vào thư mục tạm. Nó không tác động kết quả đang lưu trong trình duyệt vận hành. Script cũng kiểm tra bốc thăm với dữ liệu giả: giới hạn suất, người nhận, ghi một lần, sửa/hủy, lỗi lưu, hai cửa sổ ghi đồng thời và đọc kết quả cũ. Kiểm tra local không thay thế tập dượt với LED và âm thanh tại hội trường.
