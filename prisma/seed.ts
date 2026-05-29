import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Vaciando base de datos...");

    await prisma.shipment.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.rate.deleteMany();
    await prisma.user.deleteMany();

    console.log("Poblando tarifas...");

    const tarifas = [
        {
            id: "trf_01J",
            weight_range: { min: 0, max: 30 },
            price_per_km: 0.05,
        },
        {
            id: "trf_02J",
            weight_range: { min: 31, max: 100 },
            price_per_km: 0.15,
        },
        {
            id: "trf_03J",
            weight_range: { min: 101, max: 250 },
            price_per_km: 0.35,
        },
        {
            id: "trf_04J",
            weight_range: { min: 251, max: 600 },
            price_per_km: 0.70,
        },
        {
            id: "trf_05J",
            weight_range: { min: 601, max: 99999 },
            price_per_km: 1.50,
        },
    ];

    for (const t of tarifas) {
        await prisma.rate.create({ data: t });
        console.log(`  ✔ ${t.id} — ${t.weight_range.min}-${t.weight_range.max} kg → $${t.price_per_km}/km`);
    }

    console.log("✅ Base de datos poblada.");
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
