import 'dotenv/config';
import { prisma } from './src/lib/prisma.ts';
console.log("Prisma instance imported.");
const users = await prisma.user.findMany();
console.log("Users:", users);
await prisma.$disconnect();
