import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  // eslint-disable-next-line node/no-process-env
  connectionString: process.env.DATABASE_URL,
});

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
});

// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
