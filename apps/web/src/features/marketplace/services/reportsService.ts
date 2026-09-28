import type {
  CreateListingReportInput,
  ListingReport,
} from '@/features/marketplace/types/listingDetail';
import { MOCK_LISTING_REPORTS } from '@/features/marketplace/constants/mockReports';

const MOCK_REQUEST_DELAY_MS = 180;
const listingReports: ListingReport[] = [...MOCK_LISTING_REPORTS];

function waitForMockRequest() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, MOCK_REQUEST_DELAY_MS);
  });
}

// TODO: nối API thật khi có endpoint thật:
// POST /marketplace/reports. reporterId sẽ lấy từ session, không lấy từ payload client.
export async function createListingReport(input: CreateListingReportInput): Promise<ListingReport> {
  await waitForMockRequest();

  const reason = input.reason.trim();
  if (!reason) throw new Error('Vui lòng chọn lý do báo cáo.');

  const now = new Date().toISOString();
  const report: ListingReport = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    reporterId: input.reporterId,
    targetType: 'RentalListing',
    targetId: input.listingId,
    reason,
    description: input.description?.trim() || null,
    status: 'Pending',
    resolution: null,
    handledBy: null,
  };

  listingReports.push(report);
  return report;
}
