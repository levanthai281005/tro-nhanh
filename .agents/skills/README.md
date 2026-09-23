# Skills

Kỹ năng chuyên biệt cho các thao tác cần tra cứu nhiều chi tiết. Mỗi skill có `SKILL.md` mô
tả cách làm; skill nào cần bảng tra dài thì đặt thêm trong `references/`.

| Skill | Dùng khi |
|---|---|
| `porting-prototype-ui/` | Chuyển giao diện từ prototype: inline style sang Tailwind, react-router sang Next.js |
| `feature-scaffolding/` | Dựng thư mục và file cho một feature mới đúng cấu trúc |
| `api-integration/` | Nối endpoint của `apps/api` tới giao diện — schema dùng chung, service, TanStack Query, lỗi theo mã |
| `shared-schema-validation/` | Dùng chung Zod schema ở `packages/schemas` để kiểm tra dữ liệu đầu vào — đặt ràng buộc đúng tầng, map lỗi về đúng field |
| `critical-path-testing/` | Bốn vùng bắt buộc có kiểm thử: tiền điện nước và hóa đơn, lọc theo chủ sở hữu, quyền theo gói, chống trùng khi cổng thanh toán gọi lại |

Skill mô tả **cách làm một thao tác**; quy trình từng loại công việc nằm ở `../tasks/`; luật
nghiệp vụ nằm ở `../business/`.
