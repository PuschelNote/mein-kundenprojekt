import { Rolle, Wochentag } from "@/generated/prisma/enums";
import { validateZeitfenster } from "@/lib/oeffnungszeiten";
import { prisma } from "@/lib/prisma";

const standorte = [
  { id: "kreuzberg", name: "Kreuzberg" },
  { id: "spandau", name: "Spandau" },
] as const;

const manager = [
  {
    id: "manager-kreuzberg-giuseppe",
    name: "Giuseppe",
    rolle: Rolle.manager,
    standortId: "kreuzberg",
  },
  {
    id: "manager-spandau-renate",
    name: "Renate",
    rolle: Rolle.manager,
    standortId: "spandau",
  },
] as const;

const inhaber = {
  id: "inhaber-marcello",
  name: "Marco",
  rolle: Rolle.inhaber,
  standortId: "kreuzberg",
} as const;

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
];

export async function seedGrunddaten() {
  for (const standort of standorte) {
    await prisma.standort.upsert({
      where: { id: standort.id },
      create: standort,
      update: {},
    });
  }

  for (const person of manager) {
    await prisma.mitarbeiter.upsert({
      where: { id: person.id },
      create: person,
      update: {},
    });
  }

  await prisma.mitarbeiter.upsert({
    where: { id: inhaber.id },
    create: inhaber,
    update: { name: inhaber.name },
  });

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
      update: {},
    });
  }
}
