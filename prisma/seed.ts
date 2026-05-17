import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Vaciando base de datos...");

    await prisma.envio.deleteMany();
    await prisma.cotizacion.deleteMany();
    await prisma.tarifa.deleteMany();
    await prisma.usuario.deleteMany();

    console.log("✅ Base de datos vaciada.");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
