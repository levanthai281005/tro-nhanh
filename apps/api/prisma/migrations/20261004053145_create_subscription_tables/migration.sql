-- CreateEnum
CREATE TYPE "user_subscription_status" AS ENUM ('Trial', 'Active', 'Expired', 'Cancelled');

-- CreateEnum
CREATE TYPE "platform_transaction_type" AS ENUM ('Boost', 'Subscription');

-- CreateEnum
CREATE TYPE "platform_transaction_status" AS ENUM ('Pending', 'Success', 'Failed');

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "start_date" TIMESTAMPTZ(3) NOT NULL,
    "expire_date" TIMESTAMPTZ(3) NOT NULL,
    "status" "user_subscription_status" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_transactions" (
    "id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "type" "platform_transaction_type" NOT NULL,
    "listing_id" UUID,
    "boost_package_id" UUID,
    "user_subscription_id" UUID,
    "plan_id" UUID,
    "amount" INTEGER NOT NULL,
    "payment_method" VARCHAR(30) NOT NULL,
    "status" "platform_transaction_status" NOT NULL DEFAULT 'Pending',
    "gateway_txn_id" VARCHAR(255),
    "idempotency_key" VARCHAR(100) NOT NULL,
    "paid_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "platform_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_subscriptions_landlord_id_status_idx" ON "user_subscriptions"("landlord_id", "status");

-- CreateIndex
CREATE INDEX "user_subscriptions_plan_id_idx" ON "user_subscriptions"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_transactions_idempotency_key_key" ON "platform_transactions"("idempotency_key");

-- CreateIndex
CREATE INDEX "platform_transactions_landlord_id_idx" ON "platform_transactions"("landlord_id");

-- CreateIndex
CREATE INDEX "platform_transactions_listing_id_idx" ON "platform_transactions"("listing_id");

-- CreateIndex
CREATE INDEX "platform_transactions_boost_package_id_idx" ON "platform_transactions"("boost_package_id");

-- CreateIndex
CREATE INDEX "platform_transactions_user_subscription_id_idx" ON "platform_transactions"("user_subscription_id");

-- CreateIndex
CREATE INDEX "platform_transactions_plan_id_idx" ON "platform_transactions"("plan_id");

-- CreateIndex
CREATE INDEX "platform_transactions_status_created_at_idx" ON "platform_transactions"("status", "created_at");

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_transactions" ADD CONSTRAINT "platform_transactions_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_transactions" ADD CONSTRAINT "platform_transactions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "rental_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_transactions" ADD CONSTRAINT "platform_transactions_boost_package_id_fkey" FOREIGN KEY ("boost_package_id") REFERENCES "boost_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_transactions" ADD CONSTRAINT "platform_transactions_user_subscription_id_fkey" FOREIGN KEY ("user_subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_transactions" ADD CONSTRAINT "platform_transactions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security (thêm tay — Prisma không sinh). Bật RLS, KHÔNG policy: chặn Data API của
-- Supabase; chủ bảng (user `prisma`, chạy migration) vượt RLS. Xem ADD_DB_MIGRATION.md.
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "platform_transactions" ENABLE ROW LEVEL SECURITY;
