/** Registry query key cục bộ của feature workspace — không dùng chung với feature khác. */
export const PROPERTY_QUERY_KEYS = {
  all: ['workspace', 'properties'] as const,
  list: (sellerId: string | undefined) =>
    [...PROPERTY_QUERY_KEYS.all, 'list', sellerId ?? 'guest'] as const,
  detail: (propertyId: string) => [...PROPERTY_QUERY_KEYS.all, 'detail', propertyId] as const,
};

export const ROOM_QUERY_KEYS = {
  all: ['workspace', 'rooms'] as const,
  byProperty: (propertyId: string) => [...ROOM_QUERY_KEYS.all, 'by-property', propertyId] as const,
  detail: (roomId: string) => [...ROOM_QUERY_KEYS.all, 'detail', roomId] as const,
  /** B9 — khối dữ liệu gộp của màn chi tiết phòng. */
  overview: (roomId: string) => [...ROOM_QUERY_KEYS.all, 'overview', roomId] as const,
};

export const OCCUPANCY_QUERY_KEYS = {
  all: ['workspace', 'occupancies'] as const,
  byRoom: (roomId: string) => [...OCCUPANCY_QUERY_KEYS.all, 'by-room', roomId] as const,
};

export const CONTRACT_QUERY_KEYS = {
  all: ['workspace', 'contracts'] as const,
  bySeller: (sellerId: string | undefined) =>
    [...CONTRACT_QUERY_KEYS.all, 'by-seller', sellerId ?? 'guest'] as const,
  detail: (contractId: string) => [...CONTRACT_QUERY_KEYS.all, 'detail', contractId] as const,
};

export const UTILITY_QUERY_KEYS = {
  all: ['workspace', 'utility-readings'] as const,
  byPeriod: (sellerId: string | undefined, propertyId: string, period: string) =>
    [...UTILITY_QUERY_KEYS.all, sellerId ?? 'guest', propertyId, period] as const,
};

export const INVOICE_QUERY_KEYS = {
  all: ['workspace', 'invoices'] as const,
  bySeller: (sellerId: string | undefined) =>
    [...INVOICE_QUERY_KEYS.all, 'by-seller', sellerId ?? 'guest'] as const,
  /** Phòng đủ điều kiện xuất hóa đơn cho một kỳ — phụ thuộc kỳ nên kỳ nằm trong key. */
  roomOptions: (sellerId: string | undefined, period: string) =>
    [...INVOICE_QUERY_KEYS.all, 'room-options', sellerId ?? 'guest', period] as const,
};
