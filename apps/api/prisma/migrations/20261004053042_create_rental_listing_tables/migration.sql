-- CreateEnum
CREATE TYPE "listing_status" AS ENUM ('Draft', 'PendingApproval', 'Active', 'Rejected', 'Expired', 'Rented', 'Hidden');

-- CreateEnum
CREATE TYPE "listing_nearby_type" AS ENUM ('School', 'University', 'Market', 'Supermarket', 'ConvenienceStore', 'Hospital', 'Pharmacy', 'Restaurant', 'Cafe', 'BusStation', 'MetroStation', 'Park', 'Gym', 'Other');

-- CreateTable
CREATE TABLE "rental_listings" (
    "id" UUID NOT NULL,
    "landlord_id" UUID NOT NULL,
    "type_id" UUID,
    "property_id" UUID,
    "room_id" UUID,
    "title" TEXT,
    "province_code" CHAR(2),
    "ward_code" CHAR(5),
    "ward_name" TEXT,
    "address_detail" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "price" INTEGER,
    "description" TEXT,
    "access_policy" "access_policy" NOT NULL DEFAULT 'Free',
    "access_open_time" CHAR(5),
    "access_close_time" CHAR(5),
    "contact_phone" VARCHAR(20),
    "status" "listing_status" NOT NULL DEFAULT 'Draft',
    "reject_reason" TEXT,
    "approved_at" TIMESTAMPTZ(3),
    "expire_at" TIMESTAMPTZ(3),
    "boost_expire_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rental_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_costs" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "electricity_bill" INTEGER,
    "water_bill" INTEGER,
    "water_pricing_method" "water_pricing_method",
    "service_fee" INTEGER,
    "deposit" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listing_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_nearby_places" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "type" "listing_nearby_type" NOT NULL,
    "description" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listing_nearby_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_amenities" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "amenity_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "listing_amenities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rental_listings_status_province_code_ward_code_idx" ON "rental_listings"("status", "province_code", "ward_code");

-- CreateIndex
CREATE INDEX "rental_listings_status_price_idx" ON "rental_listings"("status", "price");

-- CreateIndex
CREATE INDEX "rental_listings_status_boost_expire_at_approved_at_idx" ON "rental_listings"("status", "boost_expire_at", "approved_at");

-- CreateIndex
CREATE INDEX "rental_listings_landlord_id_idx" ON "rental_listings"("landlord_id");

-- CreateIndex
CREATE INDEX "rental_listings_type_id_idx" ON "rental_listings"("type_id");

-- CreateIndex
CREATE INDEX "rental_listings_property_id_idx" ON "rental_listings"("property_id");

-- CreateIndex
CREATE INDEX "rental_listings_room_id_idx" ON "rental_listings"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_costs_listing_id_key" ON "listing_costs"("listing_id");

-- CreateIndex
CREATE INDEX "listing_nearby_places_listing_id_idx" ON "listing_nearby_places"("listing_id");

-- CreateIndex
CREATE INDEX "listing_amenities_amenity_id_idx" ON "listing_amenities"("amenity_id");

-- CreateIndex
CREATE UNIQUE INDEX "listing_amenities_listing_id_amenity_id_live_key" ON "listing_amenities"("listing_id", "amenity_id") WHERE (is_deleted = false);

-- AddForeignKey
ALTER TABLE "rental_listings" ADD CONSTRAINT "rental_listings_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_listings" ADD CONSTRAINT "rental_listings_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "listing_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_listings" ADD CONSTRAINT "rental_listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_listings" ADD CONSTRAINT "rental_listings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_costs" ADD CONSTRAINT "listing_costs_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "rental_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_nearby_places" ADD CONSTRAINT "listing_nearby_places_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "rental_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "rental_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_amenities" ADD CONSTRAINT "listing_amenities_amenity_id_fkey" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security (thêm tay — Prisma không sinh). Bật RLS, KHÔNG policy: chặn Data API của
-- Supabase; chủ bảng (user `prisma`, chạy migration) vượt RLS. Xem ADD_DB_MIGRATION.md.
ALTER TABLE "rental_listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_costs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_nearby_places" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_amenities" ENABLE ROW LEVEL SECURITY;
