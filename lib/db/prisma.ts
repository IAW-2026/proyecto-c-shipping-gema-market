import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
  const directUrl = process.env.DIRECT_URL!;
  const separator = directUrl.includes('?') ? '&' : '?';
  const connectionString = `${directUrl}${separator}options=${encodeURIComponent('-c TimeZone=-3')}`;

  const pool = new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 1000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
