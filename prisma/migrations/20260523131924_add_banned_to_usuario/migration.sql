-- AlterTable
ALTER TABLE "Envio" ALTER COLUMN "status" SET DEFAULT 'waiting_for_courier';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;
