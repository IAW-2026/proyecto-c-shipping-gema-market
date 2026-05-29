-- Rename tables (preserves all data)
ALTER TABLE "Usuario"    RENAME TO "User";
ALTER TABLE "Cotizacion" RENAME TO "Quote";
ALTER TABLE "Envio"      RENAME TO "Shipment";
ALTER TABLE "Tarifa"     RENAME TO "Rate";

-- Rename primary keys
ALTER INDEX "Usuario_pkey"    RENAME TO "User_pkey";
ALTER INDEX "Cotizacion_pkey" RENAME TO "Quote_pkey";
ALTER INDEX "Envio_pkey"      RENAME TO "Shipment_pkey";
ALTER INDEX "Tarifa_pkey"     RENAME TO "Rate_pkey";

-- Rename unique indexes
ALTER INDEX "Usuario_clerk_user_id_key" RENAME TO "User_clerk_user_id_key";
ALTER INDEX "Envio_order_id_key"       RENAME TO "Shipment_order_id_key";
ALTER INDEX "Envio_tracking_code_key"   RENAME TO "Shipment_tracking_code_key";

-- Rename FK constraint
ALTER TABLE "Shipment" RENAME CONSTRAINT "Envio_logistics_id_fkey" TO "Shipment_logistics_id_fkey";

-- Change DateTime columns to timestamptz
ALTER TABLE "User"     ALTER COLUMN "created_at"    TYPE timestamptz(3);
ALTER TABLE "Quote"    ALTER COLUMN "valid_until"   TYPE timestamptz(3);
ALTER TABLE "Quote"    ALTER COLUMN "created_at"    TYPE timestamptz(3);
ALTER TABLE "Shipment" ALTER COLUMN "picked_up_at"  TYPE timestamptz(3);
ALTER TABLE "Shipment" ALTER COLUMN "delivered_at"  TYPE timestamptz(3);
ALTER TABLE "Shipment" ALTER COLUMN "created_at"    TYPE timestamptz(3);
