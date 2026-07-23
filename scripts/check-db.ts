import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

try {
  const result = await prisma.$queryRawUnsafe("SELECT 1 AS ok");
  console.log("SQLite connection successful:", result);
} finally {
  await prisma.$disconnect();
}
