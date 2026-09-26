import { z } from 'zod';
import { addressViewSchema, addressWriteSchema } from './address';
import { amenityRefSchema, listingTypeRefSchema } from './catalog';
import {
  auditFieldsSchema,
  catalogCodeSchema,
  isoDateTimeSchema,
  moneySchema,
  paginatedSchema,
  paginationQuerySchema,
  positiveMoneySchema,
  timeOfDaySchema,
  uuidSchema,
  vnPhoneSchema,
  waterPricingMethodSchema,
} from './common';

/**
 * Tin cho thuê (`RentalListing`) và những thứ đi kèm: chi phí, tiện ích xung quanh, ảnh.
 *
 * Chỉ chứa luật thuộc về **dữ liệu**, không chứa luật thuộc về giao diện: form đăng tin chia
 * làm mấy bước là chuyện của feature, máy chủ không biết tới.
 *
 * Không có ở đây vì cần tra dữ liệu khác (thuộc service `apps/api`): `typeId` và `amenityIds`
 * có thật không, `propertyId`/`roomId` có thuộc chính người đăng không, nội dung có chạm từ
 * khóa cấm không, tin có đang ở trạng thái cho phép sửa không.
 */

export const LISTING_STATUS_VALUES = [
  'Draft',
  'PendingApproval',
  'Active',
  'Rejected',
  'Expired',
  'Rented',
  'Hidden',
] as const;

export const listingStatusSchema = z.enum(LISTING_STATUS_VALUES);

export const ACCESS_POLICY_VALUES = ['Free', 'Restricted'] as const;
export const accessPolicySchema = z.enum(ACCESS_POLICY_VALUES);

export const listingTitleSchema = z
  .string()
  .trim()
  .min(10, 'Tiêu đề cần ít nhất 10 ký tự')
  .max(120, 'Tiêu đề tối đa 120 ký tự');

export const listingPriceSchema = positiveMoneySchema;

export const listingAreaSchema = z
  .number({ invalid_type_error: 'Diện tích phải là số' })
  .positive('Diện tích phải lớn hơn 0');

export const listingDescriptionSchema = z
  .string()
  .trim()
  .min(10, 'Mô tả cần ít nhất 10 ký tự')
  .max(5000, 'Mô tả tối đa 5.000 ký tự');

/** Ảnh tối thiểu 3 (Mục 9). */
export const LISTING_MIN_PHOTOS = 3;

/**
 * Ảnh của tin gửi lên dưới dạng **mã của file đã upload**, không phải đường dẫn: ảnh đi qua
 * `POST /media/upload` trước, tin đăng chỉ gắn chúng vào (`Media.ownerId`).
 *
 * Thứ tự trong mảng là thứ tự hiển thị; **phần tử đầu là ảnh đại diện** (`Media.displayOrder`).
 */
export const listingMediaIdsSchema = z
  .array(uuidSchema)
  .min(LISTING_MIN_PHOTOS, `Cần ít nhất ${LISTING_MIN_PHOTOS} ảnh của phòng`)
  .max(20, 'Tối đa 20 ảnh');

export const listingMediaViewSchema = z.object({
  id: uuidSchema,
  url: z.string().url(),
  displayOrder: z.number().int().nonnegative(),
});

/**
 * Giờ giấc ra vào (BR-025). Khai **một lần** ở đây rồi trộn vào nơi cần — trước đây schema
 * thực thể chép lại ba trường này mà bỏ mất phép kiểm chéo, nên `Restricted` thiếu giờ vẫn
 * lọt qua.
 */
export const accessRuleShape = {
  accessPolicy: accessPolicySchema,
  accessOpenTime: timeOfDaySchema.nullable(),
  accessCloseTime: timeOfDaySchema.nullable(),
};

function checkAccessRule(
  value: {
    accessPolicy?: (typeof ACCESS_POLICY_VALUES)[number];
    accessOpenTime?: string | null;
    accessCloseTime?: string | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.accessPolicy !== 'Restricted') return;
  if (value.accessOpenTime && value.accessCloseTime) return;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['accessOpenTime'],
    message: 'Chọn giờ giới hạn thì phải nhập cả giờ mở và giờ đóng cửa',
  });
}

export const accessRuleSchema = z.object(accessRuleShape).superRefine(checkAccessRule);

/**
 * Các khoản chi phí của tin (`ListingCost`) — entity riêng, **không phải cột cố định trên
 * tin đăng** (Module 3): thêm loại chi phí mới về sau không phải đổi cấu trúc dữ liệu.
 *
 * `null` nghĩa là **chưa cung cấp**, `0` nghĩa là **miễn phí** — hai ý khác nhau, gộp lại là
 * hiển thị sai cho người đi thuê (cùng nguyên tắc với BR-036 ở cấp phòng).
 *
 * Có số tiền nước thì **buộc phải** có cách tính: "100.000đ" không nói lên gì khi thiếu đơn
 * vị — theo đầu người hay theo khối là hai con số khác hẳn, ghi thiếu là người thuê hiểu sai
 * giá (BR-042).
 */
export const listingCostSchema = z
  .object({
    electricityBill: moneySchema.nullable(),
    waterBill: moneySchema.nullable(),
    waterPricingMethod: waterPricingMethodSchema.nullable(),
    serviceFee: moneySchema.nullable(),
    deposit: moneySchema.nullable(),
  })
  .refine((value) => value.waterBill == null || value.waterPricingMethod != null, {
    message: 'Có tiền nước thì phải chọn cách tính: theo khối, theo đầu người, hay khoán',
    path: ['waterPricingMethod'],
  });

/**
 * Loại tiện ích xung quanh (`ListingNearbyPlace.type`).
 *
 * Tập giá trị cố định chứ không phải chuỗi tự do: để tự do thì mỗi người gõ một kiểu
 * ("trường học", "Trường Học", "th cấp 1") và không nhóm được, cũng không lọc được.
 */
export const LISTING_NEARBY_TYPE_VALUES = [
  'School',
  'University',
  'Market',
  'Supermarket',
  'ConvenienceStore',
  'Hospital',
  'Pharmacy',
  'Restaurant',
  'Cafe',
  'BusStation',
  'MetroStation',
  'Park',
  'Gym',
  'Other',
] as const;

export const listingNearbyTypeSchema = z.enum(LISTING_NEARBY_TYPE_VALUES, {
  message: 'Loại tiện ích xung quanh không hợp lệ',
});

export const listingNearbyPlaceSchema = z.object({
  type: listingNearbyTypeSchema,
  description: z.string().trim().max(200, 'Mô tả tối đa 200 ký tự').nullable(),
  /** Khoảng cách tính bằng **km** (Mục 6). */
  distance: z
    .number({ invalid_type_error: 'Khoảng cách phải là số' })
    .nonnegative('Khoảng cách không được âm')
    .max(50, 'Khoảng cách không hợp lệ'),
});

/**
 * Toạ độ cho bản đồ (AS-018). **Được rỗng** — sinh bằng geocoding từ địa chỉ lúc đăng, không
 * bắt người dùng nhập tay; thiếu thì giao diện ẩn bản đồ.
 *
 * Đặc tả cố ý không đặt ràng buộc dải giá trị, nên ở đây cũng không đặt.
 */
export const listingCoordinatesShape = {
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
};

const rentalListingWriteBase = z
  .object({
    typeId: uuidSchema,
    propertyId: uuidSchema.nullable().default(null),
    roomId: uuidSchema.nullable().default(null),
    title: listingTitleSchema,
    area: listingAreaSchema,
    price: listingPriceSchema,
    description: listingDescriptionSchema,
    contactPhone: vnPhoneSchema,
    amenityIds: z.array(uuidSchema).max(30, 'Quá nhiều tiện ích'),
    mediaIds: listingMediaIdsSchema,
    cost: listingCostSchema,
    nearbyPlaces: z.array(listingNearbyPlaceSchema).max(20, 'Tối đa 20 địa điểm lân cận'),
    ...listingCoordinatesShape,
    ...accessRuleShape,
  })
  .merge(addressWriteSchema);

/** `POST /marketplace/listings`. */
export const createRentalListingSchema = rentalListingWriteBase.superRefine(checkAccessRule);

/**
 * `PUT /marketplace/listings/{id}` — thay toàn bộ nội dung tin, nên yêu cầu đủ trường như lúc
 * tạo. Sửa trường quan trọng thì phải duyệt lại (BR-003), nhưng đó là luật của service.
 */
export const updateRentalListingSchema = createRentalListingSchema;

/**
 * Lưu nháp giữa chừng (Module 3) — **cố ý dễ tính**: thiếu trường được, chưa đủ 3 ảnh được,
 * chọn giờ giới hạn mà chưa nhập giờ cũng được.
 *
 * Bản nháp là ghi chú của người đăng, chưa phải tin. Ràng buộc đầy đủ áp lúc **gửi duyệt**,
 * bằng `createRentalListingSchema`. Bắt nháp phải hợp lệ thì người ta mất sạch nội dung đang
 * gõ dở chỉ vì chưa chọn xong ảnh.
 */
export const saveListingDraftSchema = rentalListingWriteBase.partial().extend({
  mediaIds: z.array(uuidSchema).max(20, 'Tối đa 20 ảnh').optional(),
});

export type CreateRentalListingInput = z.infer<typeof createRentalListingSchema>;
export type UpdateRentalListingInput = z.infer<typeof updateRentalListingSchema>;
export type SaveListingDraftInput = z.infer<typeof saveListingDraftSchema>;
export type ListingCostInput = z.infer<typeof listingCostSchema>;
export type ListingNearbyPlaceInput = z.infer<typeof listingNearbyPlaceSchema>;
export type ListingStatus = (typeof LISTING_STATUS_VALUES)[number];
export type AccessPolicy = (typeof ACCESS_POLICY_VALUES)[number];
export type ListingNearbyType = (typeof LISTING_NEARBY_TYPE_VALUES)[number];

/* -------------------------------------------------------------------------- */
/*  Response — A2 danh sách tin, A3 chi tiết tin                               */
/* -------------------------------------------------------------------------- */

/**
 * Điểm đánh giá của khu gắn với tin (BR-024). `null` khi tin không gắn khu, hoặc khu chưa
 * bật hồ sơ công khai — **máy chủ quyết định**, client không tự suy.
 */
export const listingPropertyRefSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1),
  publicSlug: z.string().trim().min(1).nullable(),
  avgRating: z.number().min(1).max(5).nullable(),
  reviewCount: z.number().int().nonnegative(),
});

/**
 * Một thẻ tin trong danh sách (A2).
 *
 * Giữ `boostExpireAt` và `approvedAt` thay vì một nhãn dựng sẵn: nhãn "Tin nổi bật" / "Mới
 * đăng" là chuyện hiển thị, và trạng thái đẩy tin **suy từ `boostExpireAt`**, không có cờ
 * riêng.
 */
export const listingCardSchema = z.object({
  id: uuidSchema,
  title: listingTitleSchema,
  price: listingPriceSchema,
  area: listingAreaSchema,
  address: addressViewSchema,
  type: listingTypeRefSchema,
  coverImageUrl: z.string().url().nullable(),
  amenities: z.array(amenityRefSchema),
  property: listingPropertyRefSchema.nullable(),
  approvedAt: isoDateTimeSchema.nullable(),
  boostExpireAt: isoDateTimeSchema.nullable(),
});

/**
 * Chi tiết tin (A3).
 *
 * Bỏ `isDeleted` khỏi response công khai: tin đã xóa mềm thì không trả ra, nên cột đó không
 * có việc gì ở đây ngoài việc rò rỉ trạng thái nội bộ.
 */
export const listingDetailSchema = auditFieldsSchema.omit({ isDeleted: true }).extend({
  landlordId: uuidSchema,
  propertyId: uuidSchema.nullable(),
  roomId: uuidSchema.nullable(),
  title: listingTitleSchema,
  type: listingTypeRefSchema,
  address: addressViewSchema,
  ...listingCoordinatesShape,
  area: listingAreaSchema,
  price: listingPriceSchema,
  description: listingDescriptionSchema,
  contactPhone: vnPhoneSchema,
  ...accessRuleShape,
  /**
   * Số người ở tối đa, lấy từ phòng khi tin có gắn phòng (`Room.maxOccupants`). `null` khi
   * tin không gắn phòng hoặc chủ trọ không đặt — tin đăng tự do không có phòng thật để lấy.
   */
  maxOccupants: z.number().int().positive().nullable(),
  cost: listingCostSchema,
  media: z.array(listingMediaViewSchema),
  amenities: z.array(amenityRefSchema),
  nearbyPlaces: z.array(listingNearbyPlaceSchema),
  property: listingPropertyRefSchema.nullable(),
  status: listingStatusSchema,
  approvedAt: isoDateTimeSchema.nullable(),
  expireAt: isoDateTimeSchema.nullable(),
  boostExpireAt: isoDateTimeSchema.nullable(),
});

export type ListingCard = z.infer<typeof listingCardSchema>;
export type ListingDetail = z.infer<typeof listingDetailSchema>;

/* -------------------------------------------------------------------------- */
/*  Tìm kiếm và lọc (A2)                                                       */
/* -------------------------------------------------------------------------- */

export const LISTING_SORT_VALUES = [
  'newest',
  'price-asc',
  'price-desc',
  'area-desc',
  'rating-desc',
] as const;

export const listingSortSchema = z.enum(LISTING_SORT_VALUES);

/**
 * Query string cho phép lặp khóa (`?tien-ich=wifi&tien-ich=may-lanh`) hoặc ngăn bằng dấu
 * phẩy. Nhận cả hai rồi chuẩn hoá về mảng, để client không phải nhớ đúng một kiểu.
 */
function queryArray<TItem extends z.ZodTypeAny>(itemSchema: TItem) {
  return z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : value.split(',')))
    .transform((values) => values.map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(itemSchema));
}

/**
 * `GET /public/search/listings` (Module 12).
 *
 * Khoảng giá và khoảng diện tích nhận **số**, không nhận nhãn: "2 – 4 triệu" là chuyện hiển
 * thị của web, API không phụ thuộc vào cách đặt nhãn.
 *
 * Lọc khu vực đi bằng **mã** chứ không bằng tên (BR-043); lọc loại hình và tiện ích đi bằng
 * **mã danh mục** chứ không bằng tên.
 */
export const listingSearchQuerySchema = paginationQuerySchema
  .extend({
    keyword: z.string().trim().max(120).optional(),
    provinceCode: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/)
      .optional(),
    wardCode: z
      .string()
      .trim()
      .regex(/^\d{1,5}$/)
      .optional(),
    priceMin: z.coerce.number().int().nonnegative().optional(),
    priceMax: z.coerce.number().int().positive().optional(),
    areaMin: z.coerce.number().positive().optional(),
    areaMax: z.coerce.number().positive().optional(),
    typeCodes: queryArray(catalogCodeSchema).optional(),
    amenityCodes: queryArray(catalogCodeSchema).optional(),
    accessPolicy: accessPolicySchema.optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    /**
     * Khu chưa có đánh giá thì không có điểm. Loại thẳng những tin đó ra thì tin mới đăng gần
     * như không ai thấy, nên công tắc này **mặc định bật** (Module 12).
     */
    includeUnrated: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((value) => value === true || value === 'true')
      .default(true),
    sort: listingSortSchema.default('newest'),
  })
  .superRefine((value, ctx) => {
    if (value.priceMin != null && value.priceMax != null && value.priceMin > value.priceMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['priceMax'],
        message: 'Giá tối đa phải lớn hơn giá tối thiểu',
      });
    }

    if (value.areaMin != null && value.areaMax != null && value.areaMin > value.areaMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['areaMax'],
        message: 'Diện tích tối đa phải lớn hơn diện tích tối thiểu',
      });
    }
  });

export const listingSearchResponseSchema = paginatedSchema(listingCardSchema);

export type ListingSearchQueryInput = z.infer<typeof listingSearchQuerySchema>;
export type ListingSearchResponse = z.infer<typeof listingSearchResponseSchema>;
export type ListingSort = (typeof LISTING_SORT_VALUES)[number];
