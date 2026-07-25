import { seedGrunddaten } from "../lib/grunddaten";
import { prisma } from "../lib/prisma";

try {
  await seedGrunddaten();
  console.log("Standorte, Mitarbeiter, Öffnungszeiten und vorläufige Tische angelegt.");
} finally {
  await prisma.$disconnect();
}
