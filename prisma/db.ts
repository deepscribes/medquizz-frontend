import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export default (globalForPrisma.prisma as PrismaClient) ||
  (new PrismaClient() as PrismaClient);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClient();
}
