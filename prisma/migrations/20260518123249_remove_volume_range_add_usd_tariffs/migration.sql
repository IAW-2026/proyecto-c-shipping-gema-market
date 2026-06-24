/*
  Warnings:

  - You are about to drop the column `volume_range` on the `Tarifa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cotizacion" ADD COLUMN     "delivery_lat" DOUBLE PRECISION,
ADD COLUMN     "delivery_lng" DOUBLE PRECISION,
ADD COLUMN     "pickup_lat" DOUBLE PRECISION,
ADD COLUMN     "pickup_lng" DOUBLE PRECISION,
ADD COLUMN     "route_distance" DOUBLE PRECISION,
ADD COLUMN     "route_duration" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Envio" ADD COLUMN     "delivery_lat" DOUBLE PRECISION,
ADD COLUMN     "delivery_lng" DOUBLE PRECISION,
ADD COLUMN     "pickup_lat" DOUBLE PRECISION,
ADD COLUMN     "pickup_lng" DOUBLE PRECISION,
ADD COLUMN     "route_distance" DOUBLE PRECISION,
ADD COLUMN     "route_duration" DOUBLE PRECISION,
ADD COLUMN     "route_geometry" JSONB;

-- AlterTable
ALTER TABLE "Tarifa" DROP COLUMN "volume_range";
