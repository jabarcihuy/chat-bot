import { PrismaClient } from "@prisma/client"
import 'dotenv/config'

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing standard Prisma with URL from .env...");
    const users = await prisma.user.findMany();
    console.log("Success! Users count:", users.length);
  } catch (error) {
    console.error("Connection failed:", error);
    console.error("Error details:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
