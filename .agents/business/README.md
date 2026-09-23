# Tài liệu nghiệp vụ

Nguồn chân lý nghiệp vụ của dự án Trọ Nhanh. Mỗi file phụ trách một chủ đề tra cứu — **đọc
đúng file cần thay vì đọc tất cả**, để tiết kiệm ngữ cảnh và tránh nhiễu.

## Đọc file nào cho việc gì

| Bạn đang làm | Đọc |
|---|---|
| Mới vào dự án, chưa nắm gì | `GLOSSARY.md` → `PRODUCT_OVERVIEW.md` → `SURFACES_AND_MODES.md` |
| Tạo file mới, không biết đặt ở đâu | `ARCHITECTURE_AND_SHELLS.md`, `FEATURE_MODULES.md` |
| Dựng navigation, ẩn/hiện theo quyền | **`SURFACES_AND_MODES.md`**, `ROLES_AND_IDENTITY.md`, `ACTORS_AND_RBAC.md` |
| Làm màn hình trong `app/(workspace)` | `ACCESS_GATING.md`, `SCREENS_WORKSPACE.md` |
| Làm màn hình trong `app/(public)` | `SCREENS_PUBLIC.md` |
| Làm màn hình trong `app/(residency)` hoặc app mobile | `SCREENS_RESIDENCY.md`, `ACCESS_GATING.md` |
| Làm khu quản trị | `SCREENS_ADMIN.md` |
| Dựng một luồng nhiều bước | `USER_FLOWS.md` |
| Render badge, bộ lọc, điều kiện hiển thị | `STATUS_ENUMS.md` |
| Viết Zod schema cho form | `VALIDATION_RULES.md`, `DATA_ENTITIES.md` |
| Gọi API, xử lý lỗi | `API_CONTRACT.md`, `API_RESPONSE_STANDARD.md` |
| Không chắc một luật nghiệp vụ | `BUSINESS_RULES.md` |
| Không chắc tính năng có trong phạm vi | `ROADMAP_AND_RATIONALE.md`, `ASSUMPTIONS.md` |

## Danh sách đầy đủ

**Nền tảng chung**
- `GLOSSARY.md` — từ điển thuật ngữ, đọc trước tiên
- `PRODUCT_OVERVIEW.md` — hai trụ cột, thanh toán, ranh giới hệ thống
- `ARCHITECTURE_AND_SHELLS.md` — hai domain, ba shell, hai zone
- `FEATURE_MODULES.md` — 19 module, ánh xạ sang thư mục feature

**Định danh và quyền**
- `SURFACES_AND_MODES.md` — **ba Surface, Mode, Capability; bảng quyết định vào được đâu.**
  Được thi hành bằng code ở `packages/access` — sửa luật thì sửa file này trước
- `ROLES_AND_IDENTITY.md` — bốn vai trò (mỗi tài khoản một vai trò), ba tầng định danh, JWT
- `ACTORS_AND_RBAC.md` — 5 actor, ma trận quyền, pipeline guard
- `ACCESS_GATING.md` — 4 trạng thái Workspace, luồng mở Workspace

**Nghiệp vụ**
- `USER_FLOWS.md` — 11 luồng nghiệp vụ chi tiết
- `BUSINESS_RULES.md` — BR-001 → BR-041
- `ASSUMPTIONS.md` — AS-001 → AS-028

**Dữ liệu**
- `DATA_ENTITIES.md` — 37 entity, field chính và quan hệ
- `STATUS_ENUMS.md` — toàn bộ enum trạng thái
- `VALIDATION_RULES.md` — ràng buộc nhập liệu

**Giao tiếp với backend**
- `API_CONTRACT.md` — namespace và toàn bộ endpoint
- `API_RESPONSE_STANDARD.md` — chuẩn response, mã lỗi, phân trang
- `BACKEND_SERVICES.md` — module NestJS nào sở hữu dữ liệu gì

**Màn hình**
- `SCREENS_PUBLIC.md` · `SCREENS_WORKSPACE.md` · `SCREENS_RESIDENCY.md` · `SCREENS_ADMIN.md`

**Khác**
- `NON_FUNCTIONAL.md` — hiệu năng, bảo mật, riêng tư
- `ROADMAP_AND_RATIONALE.md` — phân kỳ MVP/V1/V2 và lý do thiết kế

## Nguyên tắc

- Tài liệu này mô tả **nghiệp vụ**, không mô tả cách viết code — quy ước code nằm ở `../rules/`.
- Khi tài liệu mâu thuẫn với yêu cầu được giao, **dừng lại và hỏi**, không tự quyết.
- Mã `BR-xxx` và `AS-xxx` là định danh ổn định; dùng chúng khi trao đổi và khi viết commit.
