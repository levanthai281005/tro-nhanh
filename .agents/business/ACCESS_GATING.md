# Gating truy cập Workspace SaaS

Bốn trạng thái gói dịch vụ và luồng chủ trọ mở Workspace lần đầu. Mọi màn hình trong
`app/(workspace)` đều chịu ảnh hưởng của cơ chế này.

---

## Mô hình Gating SaaS — 4 trạng thái & luồng truy cập Workspace

Hệ thống tách bạch **hai khái niệm** để mô hình freemium rõ ràng:

- **Đăng tin trên Marketplace** (đăng tin cho thuê, boost, nhắn tin): **miễn phí**, chỉ cần vai trò `LANDLORD` (mục 1.7) — không phụ thuộc gói.
- **Workspace quản lý vận hành** (Property/Room/Occupancy/Contract/Invoice…): nằm **sau cổng gating**, vào bằng `TRIAL` hoặc `ACTIVE`.

Gói dịch vụ **không phải vai trò**: mua hay chưa mua thì vẫn là `LANDLORD`, chỉ khác phạm vi chức năng mở ra (mục 1.8).

**Bốn trạng thái gói** — `subscriptionStatus`, suy từ `UserSubscription`; chưa có bản ghi = NONE:

| Trạng thái | Điều kiện | Quyền trong Workspace |
|---|---|---|
| **NONE** | Chưa từng kích hoạt gói/TRIAL | Zone Tin đăng dùng bình thường; zone SaaS chỉ thấy màn mời dùng thử (B1) |
| **TRIAL** | Bấm dùng thử (mỗi Landlord 1 lần — lần hai trả `TRIAL_ALREADY_USED`) | Dùng gần như đầy đủ; hạn mức lấy từ **plan Trial** (`isTrialPlan`; mặc định `maxProperties=1`, `maxRooms=5`, `trialDays=30` — Admin cấu hình được) |
| **ACTIVE** | Đã mua, còn hạn | Đầy đủ theo `maxProperties/maxRooms` của gói |
| **READ_ONLY** | Hết hạn TRIAL/ACTIVE | Chỉ xem/xuất; **không** tạo/sửa/xóa (BR-015); **dữ liệu giữ nguyên** |

> **Lý do có TRIAL:** hạ rào cản để chủ trọ trải nghiệm trọn luồng "ghi điện nước → hóa đơn kèm VietQR" trước khi trả tiền. Hết TRIAL không mua → READ_ONLY, **không xóa dữ liệu** (mất dữ liệu vận hành của chủ trọ là tối kỵ).

**Luồng truy cập Workspace (golden path):**
1. Tài khoản mặc định là **`TENANT`** → dùng Marketplace.
2. Bấm **"Trở thành chủ trọ"** → vai trò đổi thành **`LANDLORD`** (một chiều, không mất gì — mục 1.8) → FE gọi `POST /auth/refresh` → vào Workspace, zone SaaS ở `NONE` → màn B1 có **hai lối rõ ràng**: *"Đăng tin cho thuê (miễn phí)"* và *"Dùng thử bộ quản lý (TRIAL)"* — không ép người chỉ muốn đăng tin phải đi qua màn chào bán.
3. Chọn dùng thử → tạo `UserSubscription` status=`Trial` (`expireDate = now + trialDays` của plan Trial) → **onboarding wizard 3 bước**: (a) tạo Property + thông tin nhận tiền (→ VietQR); (b) thêm Room; (c) (tùy chọn) Occupancy + Contract → Dashboard.
4. Mua/gia hạn gói → luồng thanh toán phí nền tảng (mục 4.9) → `ACTIVE`. Gia hạn được chọn **thời hạn** khác lần trước (một năm → ba năm) — đổi thời hạn, không phải đổi sang loại gói có tính năng khác.
5. Gần hết hạn → Notification nhắc (BR-017). Hết hạn → job tự chuyển `READ_ONLY`; **Marketplace & Messaging KHÔNG bị ảnh hưởng** — chủ trọ vẫn đăng tin và nhận khách bình thường.
- **Ngoại lệ:** chạm `maxProperties/maxRooms` → chặn tạo mới, gợi ý gia hạn với gói lớn hơn. **Over-limit** (gia hạn gói nhỏ hơn dữ liệu hiện có): giữ nguyên dữ liệu, chỉ **chặn tạo mới** cho tới khi về dưới hạn mức — nhất quán tinh thần "không bao giờ xóa dữ liệu" (BR-015).

**Ảnh hưởng tới người ở khi gói của chủ trọ hết hạn (BR-034):** người ở **vẫn xem được** hợp đồng và hóa đơn đã phát hành, nhưng **không tạo mới** báo cáo sự cố hay gửi chỉ số — chủ trọ đang không thao tác được để xử lý, nhận thêm yêu cầu chỉ tạo chờ đợi vô ích; còn khóa quyền xem của người ở vì chủ trọ quên gia hạn thì vô lý và sẽ đẻ ra khiếu nại.

**Quan trọng:** gating chỉ khóa **quyền ghi** của các module SaaS. Marketplace (đăng tin, boost, nhắn tin, gọi) **luôn miễn phí và không bị gating**.
