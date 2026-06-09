import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDatabase } from "../lib/db/mutations/seed";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const result = await seedDatabase();
    console.log(`✅ ${result.message}`);
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
