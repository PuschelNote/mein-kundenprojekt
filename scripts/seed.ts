import { prisma } from "../lib/prisma";

const standorte = [
  { id: "kreuzberg", name: "Kreuzberg" },
  { id: "spandau", name: "Spandau" },
];

try {
  for (const standort of standorte) {
    await prisma.standort.upsert({
      where: { id: standort.id },
      create: standort,
      update: { name: standort.name },
    });
  }

  console.log("Standorte angelegt: Kreuzberg, Spandau");
} finally {
  await prisma.$disconnect();
}
