import { seedGrunddaten } from "../lib/grunddaten";
import { prisma } from "../lib/prisma";

try {
  await seedGrunddaten();
  console.log("Standorte, Mitarbeiter, Anekdoten-Gäste, Öffnungszeiten, vorläufige Tische und Beispielkarten angelegt.");
} finally {
  await prisma.$disconnect();
}
