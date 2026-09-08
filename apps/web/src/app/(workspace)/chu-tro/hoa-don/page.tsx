import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { SurfaceGate } from '@/features/session/components/SurfaceGate';
import { MOCK_USER_ID } from '@/features/session/constants/mockSessionContext';
import { BillingPage } from '@/features/workspace/components/billing/BillingPage';
import { INVOICE_QUERY_KEYS } from '@/features/workspace/constants/workspaceQueryKeys';
import { getInvoicesBySeller } from '@/features/workspace/services/invoicesService';
import { getProperties } from '@/features/workspace/services/propertiesService';

export const metadata: Metadata = {
  title: 'Điện nước & Hóa đơn',
};

export const dynamic = 'force-dynamic';

interface BillingRouteProps {
  /** `?phong=<roomId>` — link đi từ màn chi tiết phòng (B9). */
  searchParams: Promise<{ phong?: string }>;
}

/** B12 — điện nước và hóa đơn. `SCREENS_WORKSPACE.md`, Surface Workspace. */
export default async function BillingRoute({ searchParams }: BillingRouteProps) {
  const { phong } = await searchParams;
  // TODO: nối AuthContext khi có; thay mock id bằng user.id từ session đã xác thực.
  const sellerId = MOCK_USER_ID;
  const queryClient = new QueryClient();

  // Chỉ prefetch danh sách hóa đơn. Bảng chỉ số phụ thuộc khu và kỳ mà người dùng chọn trên
  // máy họ, nên prefetch ở máy chủ là đoán mò — đoán trượt thì vừa tốn một vòng gọi vừa để lại
  // dữ liệu thừa trong cache.
  const [, properties] = await Promise.all([
    queryClient.prefetchQuery({
      queryKey: INVOICE_QUERY_KEYS.bySeller(sellerId),
      queryFn: () => getInvoicesBySeller(sellerId),
    }),
    getProperties(sellerId),
  ]);

  return (
    <SurfaceGate surface="workspace">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BillingPage focusedRoomId={phong} properties={properties.items} sellerId={sellerId} />
      </HydrationBoundary>
    </SurfaceGate>
  );
}
