# Ca kiểm thử tối thiểu cho bốn vùng bắt buộc

Mỗi bảng là mức **tối thiểu**, không phải mức đủ. Thêm ca khi lát cắt có tình huống riêng.

---

## 1. Tính tiền điện nước và hóa đơn

### 1.1 Đơn giá ba tầng (BR-036)

| Ca | Kỳ vọng |
|---|---|
| Phòng không đặt đơn giá riêng | Dùng đơn giá của khu trọ |
| Phòng đặt đơn giá bằng 0 | Miễn phí — **không** rơi về giá khu, không hiển thị "chưa cấu hình" |
| Sửa giá của khu sau khi đã ghi chỉ số kỳ trước | Số tiền của kỳ đã ghi giữ nguyên |
| Sửa giá của phòng sau khi đã ghi chỉ số kỳ trước | Số tiền của kỳ đã ghi giữ nguyên |
| Tính tiền cho một bản ghi chỉ số | Đọc đơn giá từ **chính bản ghi**, không tra ngược lên phòng hay khu |

Ca thứ ba và thứ tư là lý do tầng 3 tồn tại: đổi giá điện tháng này không được làm đổi số
tiền của hóa đơn tháng trước.

### 1.2 Chỉ số công tơ

| Ca | Kỳ vọng |
|---|---|
| Tiêu thụ | Đúng bằng chỉ số mới trừ chỉ số cũ |
| Chỉ số mới nhỏ hơn chỉ số cũ | Bị chặn ngay ở schema |
| Ghi hai lần cùng phòng, cùng loại, cùng kỳ | Bị chặn (unique), trả 409 |
| Kỳ mới | Chỉ số cũ lấy đúng chỉ số mới của kỳ liền trước |
| Chỉ số người ở gửi lên (BR-033) | Chưa phải chỉ số chính thức, không vào hóa đơn |
| Chủ trọ sửa số rồi xác nhận | Dùng số của chủ trọ, **vẫn lưu** số người ở gửi ban đầu |

### 1.3 Làm tròn tiền (BR-041)

> Chỉ số công tơ lưu số nguyên. Tiền lưu số nguyên đồng. Làm tròn **từng dòng hóa đơn** tới
> đồng gần nhất; tổng hóa đơn bằng tổng các dòng đã làm tròn. Không tự làm tròn lên hàng
> nghìn — số tiền chủ trọ nhìn thấy phải đúng bằng số người ở chuyển khoản.

| Ca | Kỳ vọng |
|---|---|
| Một dòng có tích ra số lẻ | Làm tròn tới đồng gần nhất |
| Tổng hóa đơn | Bằng đúng tổng các dòng **đã làm tròn**, không làm tròn lần thứ hai |
| Hóa đơn nhiều dòng đều có số lẻ | Tổng hiển thị bằng đúng tổng các dòng hiển thị, không chênh một đồng |
| Số tiền lưu xuống DB | Số nguyên, không có phần thập phân |

### 1.4 Điều kiện lập hóa đơn (BR-004)

| Ca | Kỳ vọng |
|---|---|
| Phòng không có hợp đồng đang hiệu lực | Không lập được hóa đơn |
| Tiền thuê trong hóa đơn | Lấy từ hợp đồng; giá trị nhập tay bị bỏ qua |
| Hóa đơn thứ hai cùng hợp đồng, cùng kỳ | Bị chặn (unique hợp đồng + kỳ) |
| Đổi người ở giữa tháng — hai hợp đồng khác nhau | Lập được hai hóa đơn cho cùng phòng trong cùng kỳ |
| Tiền cọc | Chỉ xuất hiện ở hóa đơn kỳ đầu của hợp đồng |
| Hóa đơn không có dòng nào có số tiền | Bị chặn |

### 1.5 Trạng thái hóa đơn suy từ tổng đã thu (BR-004)

| Ca | Kỳ vọng |
|---|---|
| Chưa thu đồng nào | Chưa thu |
| Đã thu nhưng chưa đủ, chưa tới hạn | Thu một phần |
| Thu đủ | Đã thu đủ |
| Thu vượt số phải thu | Đã thu đủ |
| Qua ngày đến hạn mà chưa đủ | Quá hạn |
| Đang quá hạn, thu thêm nhưng vẫn thiếu | **Vẫn quá hạn**, không lùi về thu một phần |
| Đang quá hạn, thu nốt cho đủ | Đã thu đủ |
| Request gửi kèm trạng thái | Bỏ qua — trạng thái luôn suy ra từ tổng đã thu |
| Nhiều lần thu trên một hóa đơn | Cộng dồn đúng |

### 1.6 Mã hóa đơn và nội dung chuyển khoản (BR-038)

| Ca | Kỳ vọng |
|---|---|
| Sinh mã lần đầu | Dạng mã phòng + kỳ, ví dụ `P203-202603` |
| Đổi mã phòng sau khi đã có hóa đơn | Mã hóa đơn cũ **không đổi** |
| Hóa đơn thứ hai cùng phòng, cùng kỳ | Thêm hậu tố thứ tự: `P203-202603-2` |
| Nội dung chuyển khoản | Không bao giờ vượt 25 ký tự |
| Mã phòng dài | Rút phần mã phòng; **không cắt kỳ, không cắt hậu tố** |
| Mã phòng có dấu tiếng Việt | Bỏ dấu |

`packages/utils/src/invoiceNote.ts` đã có sẵn logic này kèm test. Backend **dùng lại hàm đó**;
viết hàm cắt chuỗi thứ hai trong `apps/api` là tạo ra hai cách cắt khác nhau cho cùng một mã.

---

## 2. Lọc dữ liệu theo chủ sở hữu

### 2.1 Dữ liệu vận hành của chủ trọ (BR-007)

| Ca | Kỳ vọng |
|---|---|
| Chủ trọ B gọi endpoint chi tiết bằng id của chủ trọ A | **Không trả dữ liệu**; 403 theo chuẩn response |
| Danh sách | Chỉ trả bản ghi của chính người gọi, kể cả khi client gửi thêm tham số lọc |
| Truy vấn lồng: phòng thuộc khu của A, B gọi | Không trả — **ca dễ lọt nhất**, vì tầng ngoài đã lọc nên tầng trong hay quên |
| Hóa đơn truy qua hợp đồng của người khác | Không trả |
| Sửa hoặc xóa bằng id của người khác | Không thay đổi gì, trả 403 |
| Body gửi kèm định danh chủ sở hữu | Bỏ qua — chủ sở hữu luôn lấy từ phiên đăng nhập |

Điều cần khẳng định trong test là **không có dữ liệu nào rò ra**, quan trọng hơn cả việc mã
lỗi trả về là gì.

### 2.2 Phạm vi của người ở (BR-034)

| Ca | Kỳ vọng |
|---|---|
| Đọc phòng, hợp đồng, hóa đơn gắn với bản ghi người ở của mình | Được |
| Đọc dữ liệu của phòng khác trong cùng khu | Không |
| Số liệu vận hành của khu | Không thấy |
| Người đã rời đi (qua ngày kết thúc) | Vẫn xem được lịch sử của chính mình |
| Tài khoản chưa liên kết phòng nào | `RESIDENCY_NOT_LINKED` |

### 2.3 Tệp riêng tư (BR-008)

| Ca | Kỳ vọng |
|---|---|
| Bản chụp hợp đồng | Chỉ lấy được qua đường dẫn có thời hạn |
| Đường dẫn đã hết hạn | Không mở được |
| Người không liên quan xin đường dẫn | Bị từ chối trước khi đường dẫn được sinh ra |

### 2.4 Quản trị viên

| Ca | Kỳ vọng |
|---|---|
| Quản trị viên đọc dữ liệu của một chủ trọ | Được, và **có ghi vết** |

---

## 3. Kiểm tra quyền theo gói dịch vụ

### 3.1 Bốn trạng thái (BR-015)

| Trạng thái | Đọc zone vận hành | Ghi zone vận hành |
|---|---|---|
| Chưa dùng | Chỉ thấy màn mời dùng thử | Không |
| Dùng thử | Được | Được, trong hạn mức của gói dùng thử |
| Đang hiệu lực | Được | Được, trong hạn mức của gói |
| Hết hạn | Được, xuất dữ liệu được | Không — `WORKSPACE_READ_ONLY` |

### 3.2 Phần không bị gating — ca dễ sai nhất

| Ca | Kỳ vọng |
|---|---|
| Chủ trọ đang ở trạng thái hết hạn đăng tin cho thuê | Được |
| ... đẩy tin nổi bật | Được |
| ... nhắn tin với người thuê | Được |
| Dữ liệu vận hành khi gói hết hạn | Giữ nguyên: không xóa, không ẩn |

### 3.3 Hạn mức

| Ca | Kỳ vọng |
|---|---|
| Chạm hạn mức số khu hoặc số phòng | Chặn tạo mới, gợi ý nâng gói |
| Gia hạn xuống gói nhỏ hơn dữ liệu đang có | Giữ nguyên dữ liệu, chỉ chặn tạo mới |
| Số còn tạo được khi đang vượt hạn mức | Hiển thị 0, không hiển thị số âm |
| Gia hạn xong | Mở lại quyền ghi ngay |

### 3.4 Thứ tự guard

| Ca | Kỳ vọng |
|---|---|
| Chưa đăng nhập gọi endpoint quản lý vận hành | 401 |
| Vai trò người thuê gọi endpoint quản lý vận hành | 403 **vì vai trò**, không phải lỗi gating |
| Chủ trọ chưa dùng gói gọi endpoint ghi | Lỗi gating |
| Bấm dùng thử lần thứ hai | `TRIAL_ALREADY_USED` |

Ca thứ hai đáng viết riêng: trả nhầm lỗi gating cho người thuê là nói với họ rằng "mua gói đi"
trong khi vấn đề là họ không phải chủ trọ.

### 3.5 Người ở khi gói của chủ trọ hết hạn (BR-034)

| Ca | Kỳ vọng |
|---|---|
| Xem hợp đồng và hóa đơn đã phát hành | Được |
| Tạo báo cáo sự cố mới | Không |
| Gửi chỉ số điện nước | Không |

---

## 4. Chống trùng khi cổng thanh toán gọi lại

Quyền lợi (hạn đẩy tin, hạn gói) **chỉ** được kích hoạt tại webhook — Mục 4.9, AS-026.

### 4.1 Ca nền

| Ca | Kỳ vọng |
|---|---|
| Webhook báo thành công lần đầu | Kích hoạt quyền lợi, chuyển sang thành công, ghi thời điểm trả tiền |
| Webhook trùng của cùng giao dịch đến lần hai | **Không** kích hoạt lần hai: không cộng thêm hạn đẩy tin, không gia hạn gói thêm lần nữa |
| Hai webhook đến gần như cùng lúc | Chỉ một bên thắng; khóa unique trên khóa chống trùng là chốt chặn cuối |
| Trình duyệt quay về trang kết quả | Không kích hoạt gì, chỉ hiển thị trạng thái |
| Chữ ký không hợp lệ | Từ chối ngay, không đổi trạng thái, không kích hoạt |
| Endpoint webhook | Không nằm sau guard xác thực, nhưng luôn kiểm chữ ký |
| Người dùng bấm thử lại sau khi thất bại | Tạo giao dịch mới với khóa chống trùng mới |

### 4.2 Webhook tới sau khi giao dịch đã bị đánh thất bại (BR-039)

> Tác vụ 15 phút chỉ dọn giao diện cho chủ trọ khỏi thấy giao dịch treo; nó **không quyết định
> về tiền**. Tiền đã vào thì trạng thái phải chạy theo tiền.

| Ca | Kỳ vọng |
|---|---|
| Webhook thành công, chữ ký hợp lệ, giao dịch đang ở trạng thái thất bại | **Vẫn kích hoạt quyền lợi**; chuyển thất bại → thành công |
| Chuyển thất bại → thành công từ bất kỳ nguồn nào khác | Không cho phép — chỉ webhook đã xác thực chữ ký mới làm được |
| Khách đã bấm thử lại và trả tiền lần hai, cả hai webhook đều tới | Kích hoạt cả hai, **cộng dồn thời hạn**, ghi nhật ký để quản trị viên hoàn tiền thủ công |

Ca thứ ba không phải lỗi: hai giao dịch khác nhau, hai lần tiền thật. Hệ thống không tự hoàn
tiền, nhưng phải để lại đủ dấu vết cho người xử lý.

### 4.3 Mã không khớp giao dịch nào (BR-040)

> Cổng gửi lại thì cũng không khớp được, nên trả lỗi chỉ tạo ra một vòng gửi lại vô ích. Ghi
> cảnh báo để người trực hệ thống biết có gì đó không khớp.

| Ca | Kỳ vọng |
|---|---|
| Chữ ký hợp lệ nhưng mã không khớp giao dịch nào | Trả về thành công và **ghi cảnh báo**, không trả lỗi |
| Chữ ký không hợp lệ | Từ chối ngay (ca ở mục 4.1) — hai tình huống khác nhau, viết thành hai ca riêng |

Hành vi gửi lại cụ thể của PayOS — gửi lại bao nhiêu lần, cách nhau bao lâu, mã trạng thái nào
thì cổng dừng — cần **đối chiếu tài liệu PayOS khi viết thật**, và chỉnh lại hai ca trên nếu
tài liệu nói khác.
