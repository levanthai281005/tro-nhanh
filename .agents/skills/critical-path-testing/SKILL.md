---
name: critical-path-testing
description: Bốn vùng bắt buộc có kiểm thử — tính tiền điện nước và hóa đơn, lọc dữ liệu theo chủ sở hữu, kiểm tra quyền theo gói dịch vụ, chống trùng khi cổng thanh toán gọi lại. Dùng khi viết hoặc sửa code chạm một trong bốn vùng đó.
---

# Bốn vùng bắt buộc có kiểm thử

Lát cắt chạm một trong bốn vùng dưới đây thì **test viết trong cùng lát cắt**, không để sau:

| Vùng | Hỏng thì sao | Quy tắc gốc |
|---|---|---|
| Tính tiền điện nước và hóa đơn | Sai số tiền thật giữa chủ trọ và người ở | BR-004, BR-036, BR-038, BR-041 |
| Lọc dữ liệu theo chủ sở hữu | Chủ trọ thấy dữ liệu của chủ trọ khác | BR-007, BR-008, BR-034 |
| Kiểm tra quyền theo gói dịch vụ | Mất doanh thu gói, hoặc khóa nhầm phần miễn phí | BR-015 |
| Chống trùng khi cổng thanh toán gọi lại | Tính phí trùng, cộng quyền lợi hai lần | BR-039, BR-040, AS-026 |

Điểm chung của bốn vùng: **sai không lộ ra trên màn hình**. Nút vẫn bấm được, trang vẫn hiện,
chỉ có con số hoặc phạm vi quyền là sai — và thường chỉ phát hiện khi đã có người khiếu nại.
Các vùng khác viết test khi thấy cần; bốn vùng này không có chuyện "thấy cần" hay không.

Bảng ca tối thiểu cho từng vùng: `references/TEST_CASES.md`.

## Công cụ và chỗ đặt

Vitest, đã dùng ở `packages/access` và `packages/utils`. Test đặt trong
`src/__tests__/<tên>.test.ts` cạnh code. Tên ca viết tiếng Việt, mô tả **hành vi mong đợi**
chứ không mô tả tên hàm:

```ts
it('cắt mã phòng chứ không cắt kỳ', () => { … });
```

Ca nào chép lại một bảng quyết định trong `../../business/` thì ghi rõ nguồn ngay trên
`describe` — sửa tài liệu mà quên sửa code (hoặc ngược lại) sẽ có test đỏ báo.

## Tách phần tính thuần ra khỏi Nest

Test phải chạy nhanh và chạy được ở CI không có cơ sở dữ liệu:

- Phép tính (tiền điện nước, tổng hóa đơn, suy trạng thái từ tổng đã thu, sinh mã hóa đơn)
  viết thành **hàm thuần**: vào là số, ra là số. Test gọi thẳng, không dựng module Nest.
- Luật truy cập theo gói đã có ở `packages/access` — backend **dùng lại**, không viết bảng
  quyết định thứ hai. Hai bảng thì sớm muộn lệch nhau, và bản lệch sẽ là bản đang chạy thật.
- Phần thật sự cần cơ sở dữ liệu (lọc theo chủ sở hữu, khóa unique) test ở tầng service với
  dữ liệu dựng sẵn.

Không mock tới mức test chỉ còn kiểm tra chính cái mock: mock service của module khác thì
được, mock chính hàm đang kiểm thì không còn gì để kiểm.

## Mỗi lần sửa lỗi thì thêm một ca

Sửa lỗi trong bốn vùng này thì viết ca tái hiện đúng lỗi đó **trước khi** sửa — để chắc chắn
ca thật sự đỏ vì lỗi, không phải đỏ vì viết sai. Mục "Cạm bẫy đã gặp" cuối
`../../PROJECT_STATE.md` ghi lại các lỗi đã gặp; phần lớn là lỗi tính toán và lỗi ranh giới,
đúng loại hay tái phát.

## Trước khi bàn giao

`pnpm test` xanh, và đối chiếu `../../tasks/PRE_HANDOFF_CHECKLIST.md`.
