import { prisma } from "../lib/prisma";
import { validateZeitfenster } from "../lib/oeffnungszeiten";
import { Wochentag } from "../generated/prisma/enums";

const standorte = [
  { id: "kreuzberg", name: "Kreuzberg" },
  { id: "spandau", name: "Spandau" },
];

const oeffnungszeiten = [
  ...[
    Wochentag.dienstag,
    Wochentag.mittwoch,
    Wochentag.donnerstag,
    Wochentag.freitag,
    Wochentag.samstag,
    Wochentag.sonntag,
  ].map((wochentag) => ({
      standortId: "kreuzberg",
      wochentag,
      oeffnetMinute: 17 * 60,
      schliesstMinute: 23 * 60,
    })),
  ...[
    Wochentag.donnerstag,
    Wochentag.freitag,
    Wochentag.samstag,
    Wochentag.sonntag,
  ].map((wochentag) => ({
    standortId: "spandau",
    wochentag,
    oeffnetMinute: 17 * 60,
    schliesstMinute: 22 * 60,
  })),
] as const;

try {
  for (const standort of standorte) {
    await prisma.standort.upsert({
      where: { id: standort.id },
      create: standort,
      update: { name: standort.name },
    });
  }

  for (const zeit of oeffnungszeiten) {
    validateZeitfenster(zeit.oeffnetMinute, zeit.schliesstMinute);
    await prisma.standardOeffnungszeit.upsert({
      where: {
        standortId_wochentag: {
          standortId: zeit.standortId,
          wochentag: zeit.wochentag,
        },
      },
      create: zeit,
      update: {
        oeffnetMinute: zeit.oeffnetMinute,
        schliesstMinute: zeit.schliesstMinute,
      },
    });
  }

  console.log("Standorte und Standardöffnungszeiten angelegt.");
} finally {
  await prisma.$disconnect();
}
