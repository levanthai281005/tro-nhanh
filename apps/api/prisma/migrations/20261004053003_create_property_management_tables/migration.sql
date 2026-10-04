-- CreateEnum
CREATE TYPE "access_policy" AS ENUM ('Free', 'Restricted');

-- CreateEnum
CREATE TYPE "water_pricing_method" AS ENUM ('PerCubicMeter', 'PerPerson', 'FlatRate');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('Available', 'Deposited', 'Rented', 'Hidden');

-- CreateEnum
CREATE TYPE "contract_status" AS ENUM ('Draft', 'Active', 'Expired', 'Terminated');

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province_code" CHAR(2),
    "ward_code" CHAR(5),
    "ward_name" TEXT,
    "floor_count" INTEGER,
    "note" TEXT,
    "bank_name" VARCHAR(20),
    "bank_account_number" VARCHAR(20),
    "bank_account_name" TEXT,
    "is_public_profile_enabled" BOOLEAN NOT NULL DEFAULT false,
    "public_slug" VARCHAR(160),
    "avg_rating" DOUBLE PRECISION,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "allow_occupant_meter_submission" BOOLEAN NOT NULL DEFAULT false,
    "electricity_unit_price" INTEGER,
    "water_unit_price" INTEGER,
    "service_fee" INTEGER,
    "water_pricing_method" "water_pricing_method",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "room_code" VARCHAR(20) NOT NULL,
    "floor" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "price" INTEGER NOT NULL,
    "status" "room_status" NOT NULL DEFAULT 'Available',
    "access_policy" "access_policy" NOT NULL DEFAULT 'Free',
    "access_open_time" CHAR(5),
    "access_close_time" CHAR(5),
    "note" TEXT,
    "electricity_price" INTEGER,
    "water_price" INTEGER,
    "service_price" INTEGER,
    "max_occupants" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_amenities" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "room_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupancies" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" TEXT NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "occupant_count" INTEGER NOT NULL DEFAULT 1,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "occupancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "occupancy_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "rent_price" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "status" "contract_status" NOT NULL DEFAULT 'Draft',
    "terminate_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "properties_public_slug_key" ON "properties"("public_slug");

-- CreateIndex
CREATE INDEX "properties_landlord_id_idx" ON "properties"("landlord_id");

-- CreateIndex
CREATE INDEX "rooms_property_id_status_idx" ON "rooms"("property_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_property_id_room_code_live_key" ON "rooms"("property_id", "room_code") WHERE (is_deleted = false);

-- CreateIndex
CREATE INDEX "room_amenities_amenity_id_idx" ON "room_amenities"("amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "room_amenities_room_id_amenity_id_live_key" ON "room_amenities"("room_id", "amenity_id") WHERE (is_deleted = false);

-- CreateIndex
CREATE INDEX "occupancies_room_id_user_id_idx" ON "occupancies"("room_id", "user_id");

-- CreateIndex
CREATE INDEX "occupancies_user_id_idx" ON "occupancies"("user_id");

-- CreateIndex
CREATE INDEX "contracts_room_id_status_idx" ON "contracts"("room_id", "status");

-- CreateIndex
CREATE INDEX "contracts_occupancy_id_idx" ON "contracts"("occupancy_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_room_id_active_key" ON "contracts"("room_id") WHERE (status = 'Active' AND is_deleted = false);

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenities" ADD CONSTRAINT "room_amenities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_amenities" ADD CONSTRAINT "room_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupancies" ADD CONSTRAINT "occupancies_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupancies" ADD CONSTRAINT "occupancies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_occupancy_id_fkey" FOREIGN KEY ("occupancy_id") REFERENCES "occupancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security (thêm tay — Prisma không sinh). Bật RLS, KHÔNG policy: chặn Data API của
-- Supabase; chủ bảng (user `prisma`, chạy migration) vượt RLS. Xem ADD_DB_MIGRATION.md.
ALTER TABLE "properties" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "room_amenities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "occupancies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;
