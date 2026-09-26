// ╔═══════════════════════════════════════════════════════════════════════╗
// ║  FILE SINH TỰ ĐỘNG — ĐỪNG SỬA TAY                                     ║
// ║  Sinh lại:  node scripts/gen-vn-regions.mjs                           ║
// ╚═══════════════════════════════════════════════════════════════════════╝
//
// Đơn vị hành chính Việt Nam sau sáp nhập 01/07/2025 (Nghị quyết
// 1685/NQ-UBTVQH15): mô hình 2 cấp tỉnh/thành → phường/xã, KHÔNG còn cấp
// quận/huyện.
//
// 34 tỉnh/thành · sinh ngày 2026-08-08
//
// 2026-09-27: mã đổi từ number sang chuỗi 2 chữ số đệm số 0 bằng phép biến
// đổi cơ học trên chính file này. Script sinh ghi ở trên CHƯA có trong repo —
// ai dựng lại nó phải xuất mã dạng chuỗi đệm số 0.

/** Một tỉnh hoặc thành phố trực thuộc trung ương. */
export interface VnProvince {
  /**
   * Mã của Cục Thống kê, **chuỗi 2 chữ số có số 0 đứng đầu** ("01" là Hà Nội). Ổn định hơn
   * tên — dùng làm khóa lưu xuống DB. Không bao giờ đổi sang number: mất số 0 là lọc không ra
   * kết quả mà không báo lỗi.
   */
  readonly code: string;
  readonly name: string;
}

export const VN_PROVINCES: readonly VnProvince[] = [
  { code: '92', name: 'Thành phố Cần Thơ' },
  { code: '48', name: 'Thành phố Đà Nẵng' },
  { code: '01', name: 'Thành phố Hà Nội' },
  { code: '31', name: 'Thành phố Hải Phòng' },
  { code: '79', name: 'Thành phố Hồ Chí Minh' },
  { code: '46', name: 'Thành phố Huế' },
  { code: '91', name: 'Tỉnh An Giang' },
  { code: '24', name: 'Tỉnh Bắc Ninh' },
  { code: '96', name: 'Tỉnh Cà Mau' },
  { code: '04', name: 'Tỉnh Cao Bằng' },
  { code: '66', name: 'Tỉnh Đắk Lắk' },
  { code: '11', name: 'Tỉnh Điện Biên' },
  { code: '75', name: 'Tỉnh Đồng Nai' },
  { code: '82', name: 'Tỉnh Đồng Tháp' },
  { code: '52', name: 'Tỉnh Gia Lai' },
  { code: '42', name: 'Tỉnh Hà Tĩnh' },
  { code: '33', name: 'Tỉnh Hưng Yên' },
  { code: '56', name: 'Tỉnh Khánh Hòa' },
  { code: '12', name: 'Tỉnh Lai Châu' },
  { code: '20', name: 'Tỉnh Lạng Sơn' },
  { code: '15', name: 'Tỉnh Lào Cai' },
  { code: '68', name: 'Tỉnh Lâm Đồng' },
  { code: '40', name: 'Tỉnh Nghệ An' },
  { code: '37', name: 'Tỉnh Ninh Bình' },
  { code: '25', name: 'Tỉnh Phú Thọ' },
  { code: '51', name: 'Tỉnh Quảng Ngãi' },
  { code: '22', name: 'Tỉnh Quảng Ninh' },
  { code: '44', name: 'Tỉnh Quảng Trị' },
  { code: '14', name: 'Tỉnh Sơn La' },
  { code: '80', name: 'Tỉnh Tây Ninh' },
  { code: '19', name: 'Tỉnh Thái Nguyên' },
  { code: '38', name: 'Tỉnh Thanh Hóa' },
  { code: '08', name: 'Tỉnh Tuyên Quang' },
  { code: '86', name: 'Tỉnh Vĩnh Long' },
];
