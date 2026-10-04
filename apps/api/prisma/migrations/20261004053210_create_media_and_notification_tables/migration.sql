-- CreateEnum
CREATE TYPE "media_owner_type" AS ENUM ('RentalListing', 'RoommateWantedPost', 'Contract', 'Profile', 'Invoice', 'Incident', 'UtilityReadingSubmission');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('ListingApproved', 'Rejected', 'NewMessage', 'ContractExpiring', 'InvoiceDue', 'InvoiceOverdue', 'InvoiceReceived', 'SubscriptionRenewal', 'TrialEnding', 'ReviewModerated', 'OccupancyLinked', 'ListingAutoRented', 'FavoriteChanged', 'System');

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "owner_type" "media_owner_type" NOT NULL,
    "owner_id" UUID,
    "url" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "ref_type" VARCHAR(40),
    "ref_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_owner_type_owner_id_idx" ON "media"("owner_type", "owner_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security (thêm tay — Prisma không sinh). Bật RLS, KHÔNG policy: chặn Data API của
-- Supabase; chủ bảng (user `prisma`, chạy migration) vượt RLS. Xem ADD_DB_MIGRATION.md.
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
