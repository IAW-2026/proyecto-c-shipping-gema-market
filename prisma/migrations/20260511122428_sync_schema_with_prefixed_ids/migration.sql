-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'logistics',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "reserved_for_order_id" TEXT,
    "package_details" JSONB NOT NULL,
    "origin_address" JSONB NOT NULL,
    "destination_address" JSONB NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "estimated_days" INTEGER NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cotizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Envio" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "logistics_id" TEXT,
    "weight" DECIMAL(10,2) NOT NULL,
    "dimensions" JSONB NOT NULL,
    "pickup_address" JSONB NOT NULL,
    "delivery_address" JSONB NOT NULL,
    "tracking_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_pickup',
    "price" DECIMAL(10,2) NOT NULL,
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL,
    "weight_range" JSONB NOT NULL,
    "volume_range" JSONB NOT NULL,
    "price_per_km" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_clerk_user_id_key" ON "Usuario"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_order_id_key" ON "Envio"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Envio_tracking_code_key" ON "Envio"("tracking_code");

-- AddForeignKey
ALTER TABLE "Envio" ADD CONSTRAINT "Envio_logistics_id_fkey" FOREIGN KEY ("logistics_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
