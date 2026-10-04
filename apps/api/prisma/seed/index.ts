import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client';
import { AMENITIES, BOOST_PACKAGES, LISTING_TYPES, ROLES, SUBSCRIPTION_PLANS } from './data';

/**
 * `pnpm db:seed` (Postgres ở máy) hoặc `pnpm db:seed:supabase`.
 *
 * Chỉ CHÈN dòng còn thiếu (`skipDuplicates` → `ON CONFLICT DO NOTHING`), không ghi đè: chạy bao
 * nhiêu lần cũng được, và không xóa chỉnh sửa của quản trị viên. Tất cả trong một transaction —
 * hỏng giữa chừng thì không để lại danh mục nửa vời.
 *
 * Chạy bằng chính user của migration (DIRECT_URL) — trên Supabase là `prisma`, chủ của các bảng.
 */
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Thiếu DIRECT_URL — chép apps/api/.env.example thành .env');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main(): Promise<void> {
  const [roles, listingTypes, amenities, boostPackages, plans] = await prisma.$transaction([
    prisma.role.createMany({ data: ROLES, skipDuplicates: true }),
    prisma.listingType.createMany({ data: LISTING_TYPES, skipDuplicates: true }),
    prisma.amenity.createMany({ data: AMENITIES, skipDuplicates: true }),
    prisma.boostPackage.createMany({ data: BOOST_PACKAGES, skipDuplicates: true }),
    prisma.subscriptionPlan.createMany({ data: SUBSCRIPTION_PLANS, skipDuplicates: true }),
  ]);

  console.log(
    'Seed — số dòng mới chèn:',
    `vai trò ${roles.count}/${ROLES.length},`,
    `loại hình ${listingTypes.count}/${LISTING_TYPES.length},`,
    `tiện ích ${amenities.count}/${AMENITIES.length},`,
    `gói đẩy tin ${boostPackages.count}/${BOOST_PACKAGES.length},`,
    `gói dịch vụ ${plans.count}/${SUBSCRIPTION_PLANS.length}`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
