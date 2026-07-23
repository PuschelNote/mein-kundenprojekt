import { seedGrunddaten } from "../lib/grunddaten";
import { prisma } from "../lib/prisma";

try {
  await seedGrunddaten();
  console.log("Standorte, Manager und Standardöffnungszeiten angelegt.");
} finally {
  await prisma.$disconnect();
}
