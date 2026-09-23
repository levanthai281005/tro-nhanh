# Thay đổi cấu trúc dữ liệu bằng migration

Dùng mỗi khi thêm, sửa hoặc bỏ bảng, cột, enum, index trong `apps/api`.

**Migration Prisma có đánh số là nguồn chân lý về cấu trúc dữ liệu.** Ba điều cấm, không có
ngoại lệ:

- Không sửa tay cơ sở dữ liệu
- Không `db push` lên môi trường dùng chung
- Không sửa migration đã merge

Luật nằm ở `../rules/CODING_STANDARDS.md`. File này là các bước và cách xử lý khi có sự cố.

---

## Bước 1 — Đối chiếu tài liệu trước khi đổi cấu trúc

`../business/DATA_ENTITIES.md` mô tả bảng, cột và index đề xuất. Thay đổi khớp tài liệu thì
làm tiếp. Lệch tài liệu thì sửa tài liệu trước rồi mới viết migration. Lệch
`docs/spec/dac-ta-ky-thuat.md` thì **dừng và hỏi** — đặc tả thắng.

Thứ tự này quan trọng: migration đã chạy rồi mới phát hiện mô hình sai thì phải thêm một
migration nữa để sửa, chứ không xóa được cái cũ.

## Bước 2 — Sửa `schema.prisma` rồi sinh migration

Một migration làm một việc, tên đặt theo đúng việc đó — ví dụ `add_invoice_code_to_invoice`.
Tên mô tả là thứ duy nhất giúp đọc được lịch sử sáu tháng sau.

Không gộp nhiều thay đổi không liên quan vào một migration cho "đỡ lẻ tẻ": gộp rồi thì khi
một phần sai, phần đúng cũng không tách ra được.

## Bước 3 — Đọc SQL sinh ra trước khi commit

Bắt buộc, không phải tùy chọn. Prisma sinh SQL đúng ý trong đa số trường hợp, trừ mấy chỗ sau:

| Thay đổi | Prisma hay sinh ra | Hậu quả |
|---|---|---|
| Đổi tên cột | `DROP COLUMN` + `ADD COLUMN` | Mất sạch dữ liệu của cột đó |
| Thêm cột `NOT NULL` vào bảng đã có dữ liệu | `ADD COLUMN … NOT NULL` | Migration chạy hỏng |
| Đổi kiểu cột | `ALTER TYPE` không kèm cách ép giá trị | Chạy hỏng hoặc mất dữ liệu |
| Thêm ràng buộc unique lên cột đang có giá trị trùng | `CREATE UNIQUE INDEX` | Chạy hỏng |

Gặp mấy dòng đó thì sửa SQL trong file migration **chưa merge** thành lệnh an toàn
(`RENAME COLUMN`, `USING` khi ép kiểu, dọn giá trị trùng trước khi tạo unique), rồi reset DB
local và chạy lại toàn bộ từ đầu để chắc rằng migration vẫn chạy được trên một DB trắng.

Nhân lúc đụng bảng nào thì thêm luôn index mà `../business/DATA_ENTITIES.md` đề xuất cho bảng
đó.

## Bước 4 — Cột `NOT NULL` trên bảng đã có dữ liệu: ba nhịp

1. Thêm cột cho phép null
2. `UPDATE` điền giá trị cho các dòng cũ
3. Chuyển cột sang `NOT NULL`

Ba nhịp nằm trong cùng một file migration cũng được, miễn đúng thứ tự. Điều quan trọng là
**bước điền dữ liệu phải nằm trong migration**, không chạy bằng script tay — môi trường khác
sẽ không có ai chạy script đó.

Migration chỉ chứa thay đổi cấu trúc và phần điền dữ liệu cho chính thay đổi đó. Dữ liệu danh
mục khởi tạo (loại tin, gói dùng thử, danh sách ngân hàng, từ khóa cấm) là **dữ liệu** chứ
không phải cấu trúc; cách nạp chốt lúc dựng `apps/api`.

## Bước 5 — Migration đã merge thì sai cũng không sửa

Sửa file đã merge làm lệch dữ liệu giữa các máy mà không ai biết: máy đã chạy bản cũ không
chạy lại, máy mới chạy bản đã sửa, hai cơ sở dữ liệu khác nhau nhưng lịch sử migration trông
như nhau.

| Migration đang ở đâu | Cách sửa |
|---|---|
| Còn trên nhánh của mình, chưa ai chạy | Sửa thẳng file, reset DB local, chạy lại từ đầu |
| Đã merge | Viết migration mới sửa lại; bản cũ để nguyên |

Chỉ đi tới, không đi lùi.

## Bước 6 — Hai nhánh cùng thêm migration

Thứ tự migration là một phần của nguồn chân lý, nên đây không phải việc để git tự trộn:

1. Rebase lên nhánh đích
2. Đổi tên thư mục migration của mình cho đứng **sau** migration vừa nhận về
3. Reset DB local, chạy lại toàn bộ từ đầu
4. Chạy `pnpm test` — thứ tự mới có thể phá giả định của migration mình vừa viết

## Bước 7 — Sau khi migration xong

- Mô hình dữ liệu đổi → cập nhật `../business/DATA_ENTITIES.md`
- Thêm hoặc bớt giá trị enum → `../business/STATUS_ENUMS.md`
- Ràng buộc mới → `../business/VALIDATION_RULES.md` và schema Zod tương ứng ở
  `packages/schemas` (xem `../skills/shared-schema-validation/SKILL.md`)
- Quality gate theo `PRE_HANDOFF_CHECKLIST.md`
