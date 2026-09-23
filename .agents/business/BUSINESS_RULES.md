# Quy tắc nghiệp vụ (BR-001 → BR-041)

Danh mục tra cứu toàn bộ quy tắc của hệ thống, chép theo Mục 5 của
`docs/spec/dac-ta-ky-thuat.md` — nội dung, tên quy tắc và thứ tự mã giữ đúng như đặc tả. Mọi
tài liệu khác tham chiếu theo mã BR ở đây.

Quy tắc phát biểu bằng lời. Tên cột và giá trị enum tương ứng tra ở `DATA_ENTITIES.md`,
`STATUS_ENUMS.md` và `VALIDATION_RULES.md` — giữ một nguồn để không lệch.

## Bảng mục lục

| Mã | Tên quy tắc |
|---|---|
| BR-001 | Vòng đời tin đăng |
| BR-002 | Trạng thái phòng |
| BR-003 | Duyệt lại khi sửa tin |
| BR-004 | Điều kiện lập hóa đơn và trạng thái thu tiền |
| BR-005 | Điều kiện hiển thị và thứ tự tin |
| BR-006 | Vòng đời hợp đồng và chống chồng lấn |
| BR-007 | Cô lập dữ liệu theo chủ sở hữu |
| BR-008 | Bảo vệ tệp riêng tư |
| BR-009 | Thời hạn tin của người tìm thuê |
| BR-010 | Giới hạn số tin nhu cầu |
| BR-011 | Điều kiện xóa khu trọ |
| BR-012 | Chỉ số nhạy cảm trên báo cáo |
| BR-013 | Vai trò tài khoản |
| BR-014 | Hai kênh liên hệ |
| BR-015 | Gói dịch vụ và quyền vào khu quản lý |
| BR-016 | Định danh tài khoản |
| BR-017 | Nhắc hạn gói dịch vụ |
| BR-018 | Tự tạm ẩn tin bị báo cáo nhiều |
| BR-019 | Điều kiện mở hội thoại |
| BR-020 | Chặn và báo cáo trong tin nhắn |
| BR-021 | *(không dùng — bỏ cùng tính năng hỗ trợ thuế)* |
| BR-022 | Quyền viết đánh giá |
| BR-023 | Giới hạn và kiểm duyệt đánh giá |
| BR-024 | Hiển thị đánh giá và trang khu công khai |
| BR-025 | Giờ giấc ra vào và thời điểm tin |
| BR-026 | Thời hạn tin cho thuê |
| BR-027 | Đồng bộ phòng và tin đăng |
| BR-028 | Khóa tài khoản và tin đăng |
| BR-029 | Liên kết người ở với tài khoản |
| BR-030 | Cấm tự tương tác |
| BR-031 | Đồng bộ trạng thái phòng với hợp đồng |
| BR-032 | Báo cáo vi phạm bắt buộc đăng nhập |
| BR-033 | Người ở gửi chỉ số điện nước |
| BR-034 | Phạm vi truy cập của người ở |
| BR-035 | Vòng đời báo cáo sự cố |
| BR-036 | Đơn giá điện nước ba tầng |
| BR-037 | Người ở và ngày kết thúc |
| BR-038 | Mã hóa đơn và nội dung chuyển khoản |
| BR-039 | Webhook thanh toán tới muộn |
| BR-040 | Webhook không khớp giao dịch |
| BR-041 | Làm tròn tiền và đơn vị lưu trữ |

---

## BR-001 — Vòng đời tin đăng

Tin đi qua các trạng thái: *nháp* → *chờ duyệt* → *đang hiển thị* → (*hết hạn* / *đã cho
thuê* / *tạm ẩn* / *bị từ chối*). Áp dụng cho cả tin cho thuê và tin của người tìm thuê.

## BR-002 — Trạng thái phòng

Phòng chuyển qua lại giữa *còn trống*, *đã nhận cọc* và *đang cho thuê*; ngoài ra *tạm ẩn*
chuyển qua lại với *còn trống*. Trạng thái đồng bộ với hợp đồng theo BR-031.

## BR-003 — Duyệt lại khi sửa tin

Sửa nội dung quan trọng của tin — giá, địa chỉ, ảnh — thì phải duyệt lại, và **tin tạm ẩn
trong lúc chờ duyệt**. Giao diện cảnh báo trước khi lưu để người đăng biết hậu quả. Gia hạn mà
không sửa nội dung thì không phải duyệt lại.

## BR-004 — Điều kiện lập hóa đơn và trạng thái thu tiền

Hóa đơn **chỉ lập được cho phòng có hợp đồng đang hiệu lực**; tiền thuê lấy từ hợp đồng, không
nhập tay.

Trạng thái hóa đơn **suy tự động từ tổng số tiền đã thu** so với tổng phải thu, chủ trọ không
tự đặt: *chưa thu* → *thu một phần* → *đã thu đủ*. Qua ngày đến hạn mà chưa đủ thì thành *quá
hạn*. Từ *quá hạn*, thu đủ thì thành *đã thu đủ*, còn thu một phần thì **vẫn là quá hạn** —
để chủ trọ không bỏ sót khoản còn nợ.

## BR-005 — Điều kiện hiển thị và thứ tự tin

Chỉ tin *đang hiển thị* mới xuất hiện trên trang công khai. Tin còn hạn đẩy nổi bật xếp trước.
Chỉ đẩy nổi bật được tin *đang hiển thị*.

## BR-006 — Vòng đời hợp đồng và chống chồng lấn

Hợp đồng đi qua: *đang soạn* → *đang hiệu lực* → (*hết hạn* / *chấm dứt sớm*). Mỗi phòng tại
một thời điểm chỉ có một hợp đồng đang hiệu lực; hệ thống tự chuyển sang *hết hạn* khi qua
ngày kết thúc và gửi thông báo.

Khoảng thời gian tính **đóng ở cả hai đầu**: hợp đồng cũ kết thúc ngày 31/12 và hợp đồng mới
bắt đầu cũng ngày 31/12 thì **bị coi là chồng lấn**, không tạo được.

## BR-007 — Cô lập dữ liệu theo chủ sở hữu

Dữ liệu quản lý vận hành riêng tư tuyệt đối theo chủ trọ sở hữu. Người thuê đã liên kết chỉ
xem được dữ liệu của chính mình. Quản trị viên truy cập phải ghi lại vết.

## BR-008 — Bảo vệ tệp riêng tư

Bản chụp hợp đồng và các tệp riêng tư lưu ở khu vực không truy cập trực tiếp được; mỗi lần xem
hệ thống cấp một đường dẫn có thời hạn ngắn. Chỉ chủ trọ sở hữu và người thuê liên quan xem
được.

## BR-009 — Thời hạn tin của người tìm thuê

Tin tìm phòng và tin ở ghép hiển thị 30 ngày rồi tự hết hạn; gia hạn thêm 30 ngày, không phải
duyệt lại nếu không sửa nội dung. *Khác BR-026 — quy tắc đó dành cho tin cho thuê của chủ
trọ.*

## BR-010 — Giới hạn số tin nhu cầu

Mỗi người thuê có tối đa 2 tin đang hiển thị cho mỗi loại (tìm phòng, ở ghép).

## BR-011 — Điều kiện xóa khu trọ

Không xóa được khu còn phòng đang cho thuê, đang giữ cọc, hoặc còn hợp đồng hiệu lực. Xóa hợp
lệ là xóa mềm — ẩn khỏi danh sách nhưng giữ lại dữ liệu.

## BR-012 — Chỉ số nhạy cảm trên báo cáo

Số phòng trống luôn hiển thị. **Tổng số phòng, số khách đang ở và doanh thu có công tắc bật
tắt, mặc định tắt.**

**Lý do:** báo cáo tuy riêng tư nhưng chủ trọ hay mở ở nơi công cộng hoặc chia sẻ màn hình; từ
ba con số này người khác suy ra được quy mô kinh doanh. Để chủ trọ chủ động bật khi cần.

## BR-013 — Vai trò tài khoản

Mỗi tài khoản mang **đúng một vai trò**: `TENANT` (người thuê), `LANDLORD` (chủ trọ), `STAFF`
(nhân viên vận hành) hoặc `ADMIN` (quản trị viên).

Quyền phân theo bốn tầng, **không chồng lấn giữa các vai trò**:

| Tầng | Điều kiện | Gồm những gì |
|---|---|---|
| Đã đăng nhập | Vai trò `TENANT` hoặc `LANDLORD` | Xem tin, tìm kiếm, lưu tin, nhắn tin, báo cáo vi phạm, đăng tin tìm phòng và ở ghép |
| Chủ trọ | Vai trò `LANDLORD` | Đăng tin cho thuê, đẩy tin, quản lý khu, phòng, người ở, hợp đồng, hóa đơn |
| Người đang ở | **Suy từ dữ liệu**, không phụ thuộc vai trò | Xem phòng đang thuê, hóa đơn của mình, báo sự cố, gửi chỉ số, viết đánh giá |
| Nội bộ | Vai trò `STAFF` hoặc `ADMIN` | Kiểm duyệt, xử lý báo cáo; quản trị viên thêm quyền quản lý tài khoản và danh mục |

Tài khoản mặc định sau khi đăng ký là `TENANT`. Nâng cấp thành `LANDLORD` qua thao tác "Trở
thành chủ trọ" — một chiều, không quay lại được, vì quay lại sẽ khiến các khu trọ và hợp đồng
đang quản lý bơ vơ.

**Lý do chia như vậy:** các quyền mà cả người thuê lẫn chủ trọ đều cần được đẩy xuống tầng "đã
đăng nhập", nên không vai trò nào phải kế thừa vai trò nào. Một chủ trọ đang đi thuê nhà nơi
khác vẫn xem được phòng mình thuê, vì quyền đó suy từ dữ liệu người ở chứ không từ vai trò.

## BR-014 — Hai kênh liên hệ

Nhắn tin trong ứng dụng và gọi điện. Khách chưa đăng nhập thấy số điện thoại che một phần;
đăng nhập rồi thấy đầy đủ. Hệ thống không tích hợp Zalo.

Nhắn tin bảo vệ số điện thoại của **người đi hỏi**, không phải của người đăng tin — người đăng
tin vốn chủ động công khai số của mình để nhận cuộc gọi.

## BR-015 — Gói dịch vụ và quyền vào khu quản lý

Bốn trạng thái: *chưa dùng*, *dùng thử*, *đang hiệu lực*, *hết hạn*.

Hết hạn thì khu quản lý vận hành chuyển sang **chỉ xem** — vẫn xem và xuất được dữ liệu, không
tạo sửa xóa; **dữ liệu giữ nguyên**. Chợ tin đăng và nhắn tin **không bị ảnh hưởng**.

Gia hạn xong mở lại quyền ghi ngay. Chạm hạn mức số khu hoặc số phòng của gói thì chặn tạo
mới và gợi ý nâng gói.

**Lý do giữ nguyên dữ liệu:** xóa dữ liệu vận hành của khách hàng vì họ quên gia hạn là cách
nhanh nhất để mất họ vĩnh viễn.

## BR-016 — Định danh tài khoản

Số điện thoại là định danh duy nhất toàn hệ thống và là kênh nhận mã xác thực. Hệ thống
**không dùng email** và **không hỗ trợ đăng nhập bằng Google hay mạng xã hội**.

Tuy vậy, thông tin đăng nhập được lưu ở **một bảng riêng tách khỏi bảng tài khoản**, mỗi dòng
là một cách đăng nhập. Hiện mỗi tài khoản chỉ có một dòng kiểu mật khẩu. Thiết kế như vậy để
nếu sau này bổ sung đăng nhập bên thứ ba thì chỉ là thêm dòng, không phải sửa bảng tài khoản
đang chứa dữ liệu thật.

## BR-017 — Nhắc hạn gói dịch vụ

Nhắc gia hạn trước ngày hết hạn ở ba mốc: 6 tháng, 2 tháng và 1 tháng, kèm giá gia hạn. Thời
gian dùng thử sắp kết thúc thì nhắc trước 7 ngày.

## BR-018 — Tự tạm ẩn tin bị báo cáo nhiều

Tin nhận từ 3 báo cáo chưa xử lý trở lên sẽ tự chuyển về *chờ duyệt* và tạm ẩn, để hạn chế
thiệt hại trong lúc chờ người xem xét.

## BR-019 — Điều kiện mở hội thoại

Chỉ tài khoản đã đăng nhập mới nhắn tin được. Không mở hội thoại với tin đã hết hạn, đã cho
thuê hoặc đang ẩn. Mỗi cặp người khởi tạo và tin đăng chỉ có một hội thoại — nhắn lại thì mở
lại hội thoại cũ.

## BR-020 — Chặn và báo cáo trong tin nhắn

Người dùng chặn và báo cáo được trong hội thoại. Phạm vi chặn tính theo từng hội thoại.

## BR-022 — Quyền viết đánh giá

Chỉ tài khoản đã được liên kết với một phòng thuộc khu đó mới viết được đánh giá, và hợp đồng
phải đã tồn tại **ít nhất 30 ngày** hoặc đã có **ít nhất một lần ghi nhận thu tiền**.

**Chủ trọ không được đánh giá khu của chính mình.**

**Lý do có hai mốc điều kiện:** tránh việc vừa gắn vào phòng đã đánh giá ngay, vốn là cách dễ
nhất để tạo đánh giá giả.

## BR-023 — Giới hạn và kiểm duyệt đánh giá

Mỗi đợt ở chỉ viết được một đánh giá; sửa được trong 7 ngày kể từ khi gửi.

**Cả hai phía đều được báo cáo đánh giá.** Người dùng báo cáo đánh giá vi phạm; **chủ trọ báo
cáo đánh giá mà mình cho là sai sự thật** về khu của mình. Quyền quyết định ẩn hay giữ thuộc
về nhân viên vận hành, không thuộc chủ trọ. Đánh giá bị từ 3 lượt báo cáo trở lên tự ẩn tạm
chờ xem xét.

**Lý do cho chủ trọ quyền báo cáo:** nếu chỉ một phía báo cáo được thì chủ trọ không có cách
nào tự bảo vệ trước đánh giá ác ý, mà vẫn không thể tự ý xóa vì quyết định cuối thuộc nhân
viên vận hành.

## BR-024 — Hiển thị đánh giá và trang khu công khai

Đánh giá lưu gắn với khu trọ. Hiển thị ở hai nơi: điểm và số lượt trên tin đăng của khu, và
toàn bộ danh sách trên trang khu công khai.

Trang khu công khai hiện tên khu, khu vực, đánh giá và **các tin đang cho thuê gắn với khu** —
**không lộ** số phòng, doanh thu hay thông tin người đang ở. Người ở **viết được đánh giá bất
kể khu đang bật hay tắt trang công khai** — đánh giá luôn được lưu. Việc bật trang khu công
khai **chỉ quyết định hiển thị**: bật thì khu và đánh giá xuất hiện công khai; tắt thì ẩn,
nhưng đánh giá vẫn giữ nguyên để bật lại là hiện như cũ.

**Lý do không để việc bật công khai quyết định có nhận được đánh giá hay không:** nếu vậy, chủ
trọ cứ để khu ở chế độ riêng tư thì không ai đánh giá được, rồi bật lên khi muốn với lý lịch
sạch. Cách làm đúng là để đánh giá tích lũy, chủ trọ chỉ kiểm soát hiển thị — và muốn điểm
đánh giá hiện trên tin đăng thì phải bật công khai, khi đó đánh giá xấu hiện cùng đánh giá
tốt.

## BR-025 — Giờ giấc ra vào và thời điểm tin

Tin đăng và phòng có thông tin giờ giấc ra vào (tự do hoặc có khung giờ), dùng làm bộ lọc khi
tìm kiếm. Trang chi tiết hiển thị thời điểm đăng và thời điểm cập nhật gần nhất để người thuê
đánh giá độ mới của tin.

## BR-026 — Thời hạn tin cho thuê

Tin cho thuê hiển thị 60 ngày kể từ khi được duyệt rồi tự hết hạn; gia hạn được. *Khác BR-009
— quy tắc đó dành cho tin của người tìm thuê.*

## BR-027 — Đồng bộ phòng và tin đăng

Phòng gắn với một tin đăng mà chuyển sang *đang cho thuê* thì tin đó không còn hiển thị như
phòng trống nữa.

**Lý do:** đây là cơ chế chống tin ảo — nguồn gốc của nỗi bực nhất mà người thuê gặp phải.

## BR-028 — Khóa tài khoản và tin đăng

Khóa tài khoản thì tin đăng của họ tự ẩn khỏi trang công khai, nhưng dữ liệu quản lý vận hành
được giữ nguyên để khôi phục khi mở khóa.

## BR-029 — Liên kết người ở với tài khoản

Chủ trọ liên kết bản ghi người ở với một tài khoản bằng số điện thoại. Liên kết **có hiệu lực
ngay**, không cần người thuê bấm đồng ý.

Người được liên kết nhận **thông báo** và có nút **"Không phải tôi"** để tự gỡ. Khi gỡ, bản
ghi người ở quay về dạng chỉ có tên và số điện thoại; dữ liệu quản lý của chủ trọ không mất.

Bản ghi người ở **không bắt buộc** phải gắn với tài khoản — chủ trọ vẫn quản lý được người
không dùng ứng dụng. Nhưng ai muốn **dùng dịch vụ** của hệ thống thì bắt buộc phải có tài
khoản và được liên kết.

**Lý do bỏ bước xác nhận:** người thuê đã ký hợp đồng và đóng cọc ngoài đời, bắt xác nhận thêm
lần nữa vừa thừa vừa tạo ra trạng thái lơ lửng không xử lý được — từ chối rồi thì có trả cọc
không, có cho thuê tiếp không. Nút "Không phải tôi" đủ để xử lý trường hợp gõ nhầm số.

## BR-030 — Cấm tự tương tác

Không nhắn tin với tin đăng của chính mình; không đánh giá khu trọ của chính mình. Hệ thống
kiểm tra khi nhận yêu cầu, không chỉ ẩn nút ở giao diện.

## BR-031 — Đồng bộ trạng thái phòng với hợp đồng

Tạo hợp đồng hiệu lực thì phòng tự chuyển sang *đang cho thuê*, trong cùng một giao dịch dữ
liệu. Hợp đồng kết thúc và phòng không còn hợp đồng hiệu lực nào thì hệ thống **gợi ý** chuyển
về *còn trống*, không tự chuyển — vì phòng có thể đang dọn dẹp hoặc sửa chữa.

Trạng thái *đã nhận cọc* do chủ trọ tự đặt, vì việc nhận cọc diễn ra ngoài hệ thống; trạng
thái này bị thay bằng *đang cho thuê* khi có hợp đồng hiệu lực.

## BR-032 — Báo cáo vi phạm bắt buộc đăng nhập

Chỉ tài khoản đã đăng nhập mới gửi được báo cáo. Khách chưa đăng nhập thấy nút báo cáo nhưng
bấm vào sẽ được mời đăng nhập trước, đăng nhập xong quay lại đúng chỗ cũ.

**Lý do:** báo cáo ẩn danh mở đường cho spam và cho đối thủ dìm hàng loạt; gắn báo cáo với tài
khoản cho phép truy vết và xử lý người báo cáo sai sự thật.

## BR-033 — Người ở gửi chỉ số điện nước

Tính năng bật tắt **theo từng khu trọ**, mặc định tắt. Người ở gửi chỉ số kèm **ảnh chụp đồng
hồ bắt buộc**; chỉ số nằm ở trạng thái chờ duyệt.

**Chỉ khi chủ trọ xác nhận mới sinh ra chỉ số chính thức.** Nếu chủ trọ sửa số thì vẫn lưu lại
số người ở gửi ban đầu để đối chiếu.

**Lý do:** người ở có động cơ khai thấp, nên bằng chứng ảnh cộng quyền duyệt của chủ trọ là
bắt buộc. Đặt ở cấp khu vì một chủ có thể muốn dùng cho khu ở xa mà không dùng cho khu gần
nhà.

## BR-034 — Phạm vi truy cập của người ở

Người ở chỉ đọc được dữ liệu gắn với bản ghi người ở đã liên kết của chính mình — phòng đang
ở, hợp đồng của mình, hóa đơn của mình. Không thấy phòng khác, không thấy số liệu vận hành của
khu. Người đã rời đi vẫn xem được lịch sử của chính mình.

**Khi gói dịch vụ của chủ trọ hết hạn:** người ở **vẫn xem được** hợp đồng và hóa đơn đã phát
hành, nhưng **không tạo mới** báo cáo sự cố hay gửi chỉ số.

**Lý do:** chủ trọ đang không thao tác được để xử lý, nên nhận thêm yêu cầu chỉ tạo ra chờ đợi
vô ích. Nhưng khóa quyền xem của người ở chỉ vì chủ trọ quên gia hạn thì vô lý và sẽ đẻ ra
khiếu nại.

## BR-035 — Vòng đời báo cáo sự cố

*Mới gửi* → *đã tiếp nhận* → *đang xử lý* → *đã xử lý xong* → *đóng*. Chỉ chủ trọ sở hữu khu
chuyển được trạng thái; người ở xác nhận đóng hoặc mở lại về *đang xử lý*. Mỗi lần chuyển
trạng thái đều gửi thông báo cho phía còn lại. Ảnh đính kèm lưu riêng tư và phân quyền như bản
chụp hợp đồng.

## BR-036 — Đơn giá điện nước ba tầng

Ba tầng, tầng dưới đè tầng trên:

| Tầng | Nơi đặt | Vai trò |
|---|---|---|
| 1 | Khu trọ | Giá mặc định cho mọi phòng trong khu |
| 2 | Phòng | Giá riêng của phòng; để trống thì dùng giá của khu |
| 3 | Bản ghi chỉ số | **Chốt cứng lúc ghi** — chép đơn giá đang áp dụng vào chính bản ghi, không bao giờ đọc ngược lên hai tầng trên |

Sửa giá ở tầng 1 hay 2 về sau chỉ ảnh hưởng các kỳ ghi sau.

Ở cấp phòng, **để trống nghĩa là dùng giá của khu; số 0 nghĩa là miễn phí**. Giao diện không
được hiển thị ô trống thành "chưa cấu hình".

**Lý do:** đổi giá điện tháng này không được phép làm đổi số tiền hóa đơn các tháng trước.

## BR-037 — Người ở và ngày kết thúc

Một phòng có nhiều bản ghi người ở (phòng ở ghép), trong đó **một người là đại diện** đứng tên
hợp đồng và nhận hóa đơn.

Ngày kết thúc ở là **ngày đầu tiên người đó không còn ở**. Chưa tới ngày đó vẫn tính là đang
ở.

**Lý do:** giao diện và máy chủ hiểu lệch một ngày là ra lệch cả hóa đơn lẫn tình trạng phòng
trống.

## BR-038 — Mã hóa đơn và nội dung chuyển khoản

**Mã hóa đơn lưu cố định**, sinh một lần lúc tạo, không bao giờ đổi. Dạng mặc định *mã phòng -
năm tháng*, ví dụ `P203-202603`; nếu cùng phòng có hai hóa đơn trong một tháng thì thêm hậu tố
số thứ tự sau phần kỳ: `P203-202603-2`.

Nội dung chuyển khoản **tối đa 25 ký tự** theo giới hạn của hệ thống chuyển tiền trong nước.
Khi phải rút gọn thì rút phần mã phòng trước, **không bao giờ cắt phần kỳ, không cắt hậu tố**.

Mã QR được sinh tại máy người dùng, không gọi dịch vụ tạo ảnh QR bên ngoài.

**Lý do:** mã lưu cố định vì nó là tham chiếu ra ngoài hệ thống — đã nằm trong nội dung chuyển
khoản thì không được đổi. Cắt hậu tố thì `P203-202603-2` thành `P203-202603`, trùng đúng mã
hóa đơn thứ nhất. Cắt phần kỳ tạo ra một kỳ khác có thật, khiến chủ trọ đối chiếu nhầm tháng.
Gọi dịch vụ ngoài đồng nghĩa gửi số tài khoản và số tiền của chủ trọ sang bên thứ ba.

## BR-039 — Webhook thanh toán tới muộn

- Giao dịch ở trạng thái `Pending` quá 15 phút mà chưa có webhook thì tác vụ định kỳ đánh
  `Failed` — nhưng đây **chỉ để dọn giao diện**, không phải quyết định về tiền.
- Nếu webhook báo thành công tới sau đó, hệ thống **vẫn kích hoạt quyền lợi** và cho phép
  chuyển `Failed` → `Success`. Việc chuyển ngược này **chỉ được thực hiện qua webhook đã xác
  thực chữ ký**, không có đường nào khác.
- Nếu trong lúc chờ, chủ trọ đã thử lại và giao dịch thứ hai cũng thành công — tức trả tiền
  hai lần — thì kích hoạt cả hai (cộng dồn thời hạn) và ghi nhật ký để quản trị viên hoàn
  tiền thủ công. Hệ thống **không tự hoàn tiền**.

**Lý do:** webhook có chữ ký hợp lệ nghĩa là tiền đã rời tài khoản khách. Bỏ qua nó thì khách
mất tiền mà không nhận được gì — loại khiếu nại tệ nhất. Nguồn chân lý về việc đã thanh toán
hay chưa luôn là cổng thanh toán, không phải tác vụ định kỳ của hệ thống.

## BR-040 — Webhook không khớp giao dịch

- Webhook có **chữ ký hợp lệ** nhưng mã giao dịch không khớp bản ghi nào: trả về thành công
  cho cổng thanh toán và **ghi nhật ký cảnh báo** để người vận hành kiểm tra. Không trả lỗi.
- Webhook có **chữ ký không hợp lệ**: từ chối ngay, ghi nhật ký. Đây có thể là yêu cầu giả mạo.
- Hành vi gửi lại cụ thể tùy nhà cung cấp — cần đối chiếu tài liệu PayOS khi triển khai thật.

**Lý do phân biệt hai ca:** cổng thanh toán thường gửi lại khi nhận lỗi. Mã không khớp thì gửi
lại bao nhiêu lần cũng không khớp, chỉ tạo vòng lặp vô ích. Còn chữ ký sai thì phải chặn.

## BR-041 — Làm tròn tiền và đơn vị lưu trữ

- Chỉ số đồng hồ điện nước lưu **số nguyên** (đồng hồ thông thường hiển thị số nguyên).
- Mọi khoản tiền lưu **số nguyên đồng**, không dùng số thực.
- Làm tròn tới đồng gần nhất ở **từng dòng hóa đơn**; tổng hóa đơn là **tổng các dòng đã làm
  tròn**, không phải làm tròn trên tổng.
- Hệ thống **không tự làm tròn lên hàng nghìn**. Chủ trọ muốn làm tròn theo thói quen của mình
  thì tự sửa dòng hóa đơn.

**Lý do làm tròn từng dòng:** nếu làm tròn trên tổng, các dòng cộng lại có thể lệch tổng hiển
thị một hai đồng. Số tiền nhỏ nhưng người ở soi thấy là mất lòng tin vào cả hóa đơn.

---
