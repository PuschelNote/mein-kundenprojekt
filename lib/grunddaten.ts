import { Rolle, TischBereich, Wochentag } from "@/generated/prisma/enums";
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

const bedienungen = [
  { id: "bedienung-sofia", name: "Sofia", rolle: Rolle.bedienung, standortId: null },
  { id: "bedienung-nico", name: "Nico", rolle: Rolle.bedienung, standortId: null },
  { id: "bedienung-fatima", name: "Fatima", rolle: Rolle.bedienung, standortId: null },
] as const;

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

const tische = [
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `tisch-kreuzberg-${index + 1}`,
    nummer: index + 1,
    kapazitaet: [2, 4, 4, 6][index % 4],
    bereich: index >= 13 ? TischBereich.terrasse : TischBereich.innen,
    verfuegbar: true,
    rasterZeile: Math.floor(index / 4) + 1,
    rasterSpalte: (index % 4) + 1,
    standortId: "kreuzberg",
    vorlaeufig: true,
  })),
  ...Array.from({ length: 11 }, (_, index) => ({
    id: `tisch-spandau-${index + 1}`,
    nummer: index + 1,
    kapazitaet: [2, 4, 4, 6][index % 4],
    bereich: index >= 9 ? TischBereich.terrasse : TischBereich.innen,
    verfuegbar: true,
    rasterZeile: Math.floor(index / 4) + 1,
    rasterSpalte: (index % 4) + 1,
    standortId: "spandau",
    vorlaeufig: true,
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

  for (const person of bedienungen) {
    await prisma.mitarbeiter.upsert({
      where: { id: person.id },
      create: person,
      update: { name: person.name, rolle: person.rolle, standortId: null },
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

  for (const tisch of tische) {
    await prisma.tisch.upsert({
      where: { id: tisch.id },
      create: tisch,
      update: {},
    });
  }
}
