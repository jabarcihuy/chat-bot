import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const urlString = process.env.DATABASE_URL;
  if (!urlString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  const dbUrl = new URL(urlString);
  const host = dbUrl.hostname;
  const port = dbUrl.port ? parseInt(dbUrl.port) : 3306;
  const user = dbUrl.username;
  const password = decodeURIComponent(dbUrl.password);
  const database = dbUrl.pathname.replace(/^\//, "");

  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 10,
  });

  return new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
