import { randomUUID } from "node:crypto";
import { BestellungStatus, GerichtKategorie, type Rolle } from "@/generated/prisma/enums";
import { assertBerechtigung, istMitarbeiterFuerStandortGueltig, mitarbeiterStandortBedingung } from "@/lib/berechtigungen";
import { normalisiereTelefonnummer } from "@/lib/gaeste";
import { istBellaCardAktiv } from "@/lib/gast-status";
import { prisma } from "@/lib/prisma";
import { lokalesDatumBerlin } from "@/lib/tische";
import { getEffektiveOeffnungszeit } from "@/lib/oeffnungszeiten";

export type BestellungMitarbeiter = { id: string; rolle: Rolle; standortId: string | null };
export type BestellpositionInput = { gerichtId: string; menge: number; sonderwunsch: string | null };
export type BestellungInput = { tischId: string; reservierungId: string | null; gastTelefonNormalisiert: string | null; positionen: BestellpositionInput[] };
export class BestellungValidationError extends Error {}

export type Rechnungsposition = { menge: number; einzelpreisCent: number };
export type Rechnung = { ausgangssummeCent: number; rabattCent: number; gesamtsummeCent: number };

export function berechneRechnung(positionen: Rechnungsposition[], bellaCardAktiv: boolean): Rechnung {
  const ausgangssummeCent = positionen.reduce((summe, position) => {
    if (!Number.isInteger(position.menge) || position.menge < 1 || !Number.isInteger(position.einzelpreisCent) || position.einzelpreisCent < 0) {
      throw new BestellungValidationError("Die Rechnung enthält ungültige Bestellpositionen.");
    }
    return summe + position.menge * position.einzelpreisCent;
  }, 0);
  const rabattCent = bellaCardAktiv ? Math.round(ausgangssummeCent * 0.15) : 0;
  return { ausgangssummeCent, rabattCent, gesamtsummeCent: ausgangssummeCent - rabattCent };
}

export function validateBestellungInput(input: {
  tischId?: unknown;
  reservierungId?: unknown;
  gastTelefon?: unknown;
  gerichtIds?: unknown[];
  mengen?: unknown[];
  sonderwuensche?: unknown[];
}): BestellungInput {
  const tischId = typeof input.tischId === "string" ? input.tischId.trim() : "";
  if (!tischId) throw new BestellungValidationError("Bitte einen Tisch auswählen.");
  const reservierungId = typeof input.reservierungId === "string" && input.reservierungId.trim() ? input.reservierungId.trim() : null;
  let gastTelefonNormalisiert: string | null = null;
  if (typeof input.gastTelefon === "string" && input.gastTelefon.trim()) {
    try { gastTelefonNormalisiert = normalisiereTelefonnummer(input.gastTelefon); }
    catch { throw new BestellungValidationError("Bitte eine gültige Gast-Telefonnummer angeben."); }
  }
  if (reservierungId && gastTelefonNormalisiert) throw new BestellungValidationError("Bitte entweder eine Reservierung oder eine Gast-Telefonnummer auswählen.");
  const ids = input.gerichtIds ?? [];
  const mengen = input.mengen ?? [];
  const sonderwuensche = input.sonderwuensche ?? [];
  if (ids.length === 0 || ids.length !== mengen.length || ids.length !== sonderwuensche.length) {
    throw new BestellungValidationError("Eine Bestellung benötigt mindestens eine vollständige Position.");
  }
  const positionen = ids.map((id, index) => {
    const gerichtId = typeof id === "string" ? id.trim() : "";
    const menge = Number(mengen[index]);
    const sonderwunsch = typeof sonderwuensche[index] === "string" ? sonderwuensche[index].trim() : "";
    if (!gerichtId || !Number.isInteger(menge) || menge < 1 || menge > 99) {
      throw new BestellungValidationError("Gericht und Menge jeder Position müssen gültig sein.");
    }
    if (sonderwunsch.length > 300) throw new BestellungValidationError("Ein Sonderwunsch darf höchstens 300 Zeichen lang sein.");
    return { gerichtId, menge, sonderwunsch: sonderwunsch || null };
  });
  return { tischId, reservierungId, gastTelefonNormalisiert, positionen };
}

export async function createBestellung(mitarbeiter: BestellungMitarbeiter, standortId: string, input: BestellungInput, now = new Date()) {
  assertKontext(mitarbeiter, standortId);
  await assertKuechenannahmeOffen(standortId, now);
  try {
    return await prisma.$transaction(async (tx) => {
      const [person, tisch, reservierung, gast, gerichte] = await Promise.all([
        tx.mitarbeiter.findFirst({ where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle, ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId) }, select: { id: true } }),
        tx.tisch.findFirst({ where: { id: input.tischId, standortId, verfuegbar: true }, select: { id: true } }),
        input.reservierungId ? tx.reservierung.findFirst({
          where: { id: input.reservierungId, standortId, tischId: input.tischId, status: "offen", bestellung: null },
          select: { id: true, gastId: true },
        }) : null,
        input.gastTelefonNormalisiert ? tx.gast.findUnique({ where: { telefonNormalisiert: input.gastTelefonNormalisiert }, select: { id: true } }) : null,
        tx.gericht.findMany({ where: { id: { in: input.positionen.map((p) => p.gerichtId) }, standortId }, select: { id: true, preisCent: true, kategorie: true } }),
      ]);
      if (!person) throw new BestellungValidationError("Der aktive Mitarbeiter ist ungültig.");
      if (!tisch) throw new BestellungValidationError("Der Tisch gehört nicht zum aktiven Standort oder ist nicht verfügbar.");
      if (input.reservierungId && !reservierung) throw new BestellungValidationError("Die Reservierung ist für diesen Tisch und Standort nicht verfügbar.");
      if (input.gastTelefonNormalisiert && !gast) throw new BestellungValidationError("Zu dieser Telefonnummer wurde kein Gast gefunden.");
      const gerichtMap = new Map(gerichte.map((g) => [g.id, g]));
      for (const position of input.positionen) {
        const gericht = gerichtMap.get(position.gerichtId);
        if (!gericht) throw new BestellungValidationError("Ein Gericht gehört nicht zum aktiven Standort.");
        if (standortId !== "kreuzberg" && gericht.kategorie === GerichtKategorie.grill) throw new BestellungValidationError("Grillgerichte dürfen in Spandau nicht bestellt werden.");
      }
      const bestellung = await tx.bestellung.create({
        data: {
          id: randomUUID(), standortId, tischId: tisch.id, reservierungId: reservierung?.id,
          gastId: reservierung?.gastId ?? gast?.id,
          aufgenommenVonId: person.id,
          positionen: { create: input.positionen.map((p) => ({ id: randomUUID(), ...p, einzelpreisCent: gerichtMap.get(p.gerichtId)!.preisCent })) },
        }, include: { positionen: true },
      });
      await tx.tisch.update({ where: { id: tisch.id }, data: { status: "besetzt" } });
      return bestellung;
    });
  } catch (error) {
    if (error instanceof BestellungValidationError) throw error;
    if (String(error).includes("Bestellung_reservierungId_key") || String(error).includes("reservierungId")) {
      throw new BestellungValidationError("Für diese Reservierung wurde bereits eine Bestellung aufgenommen.");
    }
    if (String(error).includes("Bestellung_tischId_aktiv_key") || String(error).includes("Unique constraint")) {
      throw new BestellungValidationError("Für diesen Tisch besteht bereits eine aktive Bestellung.");
    }
    throw error;
  }
}

export async function updateBestellung(mitarbeiter: BestellungMitarbeiter, standortId: string, id: string, input: BestellungInput) {
  assertKontext(mitarbeiter, standortId);
  if (!id) throw new BestellungValidationError("Bestell-ID fehlt.");
  return prisma.$transaction(async (tx) => {
    const person = await tx.mitarbeiter.findFirst({ where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle, ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId) }, select: { id: true } });
    if (!person) throw new BestellungValidationError("Der aktive Mitarbeiter ist ungültig.");
    const bestellung = await tx.bestellung.findFirst({ where: { id, standortId, status: BestellungStatus.offen }, select: { id: true, tischId: true, gastId: true, reservierungId: true, positionen: { select: { gerichtId: true, einzelpreisCent: true } } } });
    if (!bestellung) throw new BestellungValidationError("Nur offene Bestellungen des aktiven Standorts können bearbeitet werden.");
    if (input.reservierungId !== bestellung.reservierungId) throw new BestellungValidationError("Der Reservierungsbezug einer Bestellung kann nicht geändert werden.");
    const [tisch, gast, gerichte] = await Promise.all([
      tx.tisch.findFirst({ where: { id: input.tischId, standortId, verfuegbar: true }, select: { id: true } }),
      input.gastTelefonNormalisiert ? tx.gast.findUnique({ where: { telefonNormalisiert: input.gastTelefonNormalisiert }, select: { id: true } }) : null,
      tx.gericht.findMany({ where: { id: { in: input.positionen.map((p) => p.gerichtId) }, standortId }, select: { id: true, preisCent: true, kategorie: true } }),
    ]);
    if (!tisch) throw new BestellungValidationError("Der Tisch gehört nicht zum aktiven Standort.");
    if (bestellung.reservierungId && input.tischId !== bestellung.tischId) throw new BestellungValidationError("Der Tisch einer reservierungsbezogenen Bestellung kann nicht geändert werden.");
    if (input.gastTelefonNormalisiert && !gast) throw new BestellungValidationError("Zu dieser Telefonnummer wurde kein Gast gefunden.");
    const gerichtMap = new Map(gerichte.map((g) => [g.id, g]));
    const bisherigerPreis = new Map(bestellung.positionen.map((p) => [p.gerichtId, p.einzelpreisCent]));
    for (const position of input.positionen) {
      const gericht = gerichtMap.get(position.gerichtId);
      if (!gericht || (standortId !== "kreuzberg" && gericht.kategorie === GerichtKategorie.grill)) throw new BestellungValidationError("Ein Gericht ist an diesem Standort nicht bestellbar.");
    }
    await tx.bestellposition.deleteMany({ where: { bestellungId: id } });
    return tx.bestellung.update({ where: { id }, data: { tischId: tisch.id, gastId: bestellung.reservierungId ? bestellung.gastId : gast?.id ?? null, positionen: { create: input.positionen.map((p) => ({ id: randomUUID(), ...p, einzelpreisCent: bisherigerPreis.get(p.gerichtId) ?? gerichtMap.get(p.gerichtId)!.preisCent })) } }, include: { positionen: true } });
  });
}

export async function updateBestellungStatus(mitarbeiter: BestellungMitarbeiter, standortId: string, id: string, status: unknown) {
  assertKontext(mitarbeiter, standortId);
  if (!Object.values(BestellungStatus).includes(status as BestellungStatus)) throw new BestellungValidationError("Der Bestellstatus ist ungültig.");
  return prisma.$transaction(async (tx) => {
    const [person, bestellung] = await Promise.all([
      tx.mitarbeiter.findFirst({ where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle, ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId) }, select: { id: true } }),
      tx.bestellung.findFirst({
        where: { id, standortId },
        select: {
          id: true,
          status: true,
          gastId: true,
          gast: { select: { besuchszaehler: true } },
          positionen: { select: { menge: true, einzelpreisCent: true } },
        },
      }),
    ]);
    if (!person) throw new BestellungValidationError("Der aktive Mitarbeiter ist ungültig.");
    if (!bestellung) throw new BestellungValidationError("Die Bestellung gehört nicht zum aktiven Standort.");
    if (bestellung.status === BestellungStatus.bezahlt || bestellung.status === BestellungStatus.storniert) throw new BestellungValidationError("Eine abgeschlossene Bestellung kann nicht mehr geändert werden.");
    const erlaubt: BestellungStatus[] = bestellung.status === BestellungStatus.offen
      ? [BestellungStatus.serviert, BestellungStatus.storniert]
      : [BestellungStatus.bezahlt, BestellungStatus.storniert];
    if (!erlaubt.includes(status as BestellungStatus)) throw new BestellungValidationError("Dieser Statuswechsel ist nicht zulässig.");
    if (status === BestellungStatus.bezahlt) {
      const rechnung = berechneRechnung(bestellung.positionen, istBellaCardAktiv(bestellung.gast?.besuchszaehler ?? 0));
      const bezahlt = await tx.bestellung.updateMany({
        where: { id, standortId, status: BestellungStatus.serviert },
        data: { status: BestellungStatus.bezahlt, ...rechnung, abgerechnetAm: new Date() },
      });
      if (bezahlt.count !== 1) throw new BestellungValidationError("Die Bestellung wurde bereits abgeschlossen.");
      if (bestellung.gastId) {
        await tx.gast.update({ where: { id: bestellung.gastId }, data: { besuchszaehler: { increment: 1 } } });
      }
      return tx.bestellung.findUniqueOrThrow({ where: { id } });
    }
    return tx.bestellung.update({ where: { id }, data: { status: status as BestellungStatus } });
  });
}

export async function deleteBestellung(mitarbeiter: BestellungMitarbeiter, standortId: string, id: string) {
  assertKontext(mitarbeiter, standortId);
  if (!id) throw new BestellungValidationError("Bestell-ID fehlt.");
  return prisma.$transaction(async (tx) => {
    const person = await tx.mitarbeiter.findFirst({
      where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle, ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId) },
      select: { id: true },
    });
    if (!person) throw new BestellungValidationError("Der aktive Mitarbeiter ist ungültig.");
    const geloescht = await tx.bestellung.deleteMany({ where: { id, standortId, status: BestellungStatus.storniert } });
    if (geloescht.count !== 1) throw new BestellungValidationError("Nur stornierte Bestellungen des aktiven Standorts können gelöscht werden.");
  });
}

export function listBestellungen(standortId: string, nurKueche = false) {
  return prisma.bestellung.findMany({
    where: { standortId, ...(nurKueche ? { status: BestellungStatus.offen } : {}) },
    include: { tisch: { select: { nummer: true } }, gast: { select: { name: true, besuchszaehler: true } }, reservierung: { select: { id: true, datum: true, uhrzeitMinute: true, personenzahl: true } }, aufgenommenVon: { select: { name: true } }, positionen: { include: { gericht: { select: { name: true } } } } },
    orderBy: { erstelltAm: nurKueche ? "asc" : "desc" },
  });
}

export async function listBestelloptionen(standortId: string, now = new Date()) {
  const [tische, gerichte, reservierungen] = await Promise.all([
    prisma.tisch.findMany({
      where: { standortId, verfuegbar: true, bestellungen: { none: { status: { in: [BestellungStatus.offen, BestellungStatus.serviert] } } } },
      orderBy: { nummer: "asc" },
    }),
    prisma.gericht.findMany({ where: { standortId, ...(standortId === "spandau" ? { kategorie: { not: GerichtKategorie.grill } } : {}) }, orderBy: [{ kategorie: "asc" }, { name: "asc" }] }),
    prisma.reservierung.findMany({
      where: { standortId, status: "offen", datum: { gte: lokalesDatumBerlin(now) }, bestellung: null, tisch: { verfuegbar: true } },
      select: { id: true, datum: true, uhrzeitMinute: true, personenzahl: true, tischId: true, gast: { select: { name: true } } },
      orderBy: [{ datum: "asc" }, { uhrzeitMinute: "asc" }],
    }),
  ]);
  return { tische, gerichte, reservierungen };
}

export async function assertKuechenannahmeOffen(standortId: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const minute = Number(parts.find((p) => p.type === "hour")?.value) * 60 + Number(parts.find((p) => p.type === "minute")?.value);
  const zeit = await getEffektiveOeffnungszeit(standortId, lokalesDatumBerlin(now));
  if (!zeit || minute < zeit.oeffnetMinute || minute >= zeit.schliesstMinute - 30) {
    throw new BestellungValidationError("Neue Bestellungen sind nur während der Küchenannahmezeit möglich.");
  }
}

function assertKontext(mitarbeiter: BestellungMitarbeiter, standortId: string) {
  assertBerechtigung(mitarbeiter.rolle, "bestellungen_aufnehmen");
  if (!standortId || !istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standortId)) throw new BestellungValidationError("Mitarbeiter und Bestellung müssen zum aktiven Standort gehören.");
}
