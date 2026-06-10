import { PrismaClient } from "@prisma/client"
import dotenv from 'dotenv'
dotenv.config({ override: true });

const url = process.env.DATABASE_URL.replace('mariadb://', 'mysql://');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  try {
    console.log("Testing explicit Prisma with URL:", url.split('@')[1]);
    const users = await prisma.user.findMany();
    console.log("Success! Users count:", users.length);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
