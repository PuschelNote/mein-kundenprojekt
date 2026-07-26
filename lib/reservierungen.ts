import { randomUUID } from "node:crypto";
import { ReservierungStatus, Wochentag, type Rolle } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { assertBerechtigung, istMitarbeiterFuerStandortGueltig, mitarbeiterStandortBedingung } from "@/lib/berechtigungen";
import { normalisiereTelefonnummer } from "@/lib/gaeste";
import { prisma } from "@/lib/prisma";

export type ReservierungInput = {
  standortId: string;
  tischId: string;
  gastName: string;
  gastTelefon: string;
  gastTelefonNormalisiert: string | null;
  datum: string;
  uhrzeitMinute: number;
  personenzahl: number;
};

export type ReservierungMitarbeiter = {
  id: string;
  rolle: Rolle;
  standortId: string | null;
};

export class ReservierungValidationError extends Error {}
export const RESERVIERUNGSDAUER_MINUTEN = 120;

export function validateReservierungInput(input: {
  standortId?: unknown;
  tischId?: unknown;
  gastName?: unknown;
  gastTelefon?: unknown;
  datum?: unknown;
  uhrzeit?: unknown;
  personenzahl?: unknown;
  gastTelefonOptional?: boolean;
}): ReservierungInput {
  const standortId = typeof input.standortId === "string" ? input.standortId.trim() : "";
  const tischId = typeof input.tischId === "string" ? input.tischId.trim() : "";
  const gastName = typeof input.gastName === "string" ? input.gastName.trim() : "";
  const gastTelefon =
    typeof input.gastTelefon === "string" ? input.gastTelefon.trim() : "";
  const datum = typeof input.datum === "string" ? input.datum.trim() : "";
  const uhrzeit = typeof input.uhrzeit === "string" ? input.uhrzeit.trim() : "";
  const personenzahl = Number(input.personenzahl);

  if (!standortId) {
    throw new ReservierungValidationError("Bitte einen Standort auswählen.");
  }
  if (!tischId) {
    throw new ReservierungValidationError("Bitte einen Tisch auswählen.");
  }
  if (!istGueltigesDatum(datum)) {
    throw new ReservierungValidationError("Bitte ein gültiges Datum angeben.");
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(uhrzeit)) {
    throw new ReservierungValidationError("Bitte eine gültige Uhrzeit angeben.");
  }
  if (!Number.isInteger(personenzahl) || personenzahl < 1 || personenzahl > 100) {
    throw new ReservierungValidationError(
      "Die Personenzahl muss zwischen 1 und 100 liegen.",
    );
  }
  if (gastName.length > 100) {
    throw new ReservierungValidationError(
      "Der Gastname darf höchstens 100 Zeichen lang sein.",
    );
  }

  let gastTelefonNormalisiert: string | null = null;
  if (gastTelefon || !input.gastTelefonOptional) {
    try {
      gastTelefonNormalisiert = normalisiereTelefonnummer(input.gastTelefon);
    } catch {
      throw new ReservierungValidationError(
        "Bitte eine gültige Gast-Telefonnummer angeben.",
      );
    }
  }

  const [stunden, minuten] = uhrzeit.split(":").map(Number);
  return {
    standortId,
    tischId,
    gastName,
    gastTelefon,
    gastTelefonNormalisiert,
    datum,
    uhrzeitMinute: stunden * 60 + minuten,
    personenzahl,
  };
}

export async function createReservierung(
  mitarbeiter: ReservierungMitarbeiter,
  standortId: string,
  input: ReservierungInput,
  now = new Date(),
) {
  assertBerechtigung(mitarbeiter.rolle, "reservierungen_verwalten");
  if (!input.gastTelefonNormalisiert) {
    throw new ReservierungValidationError(
      "Bitte eine gültige Gast-Telefonnummer angeben.",
    );
  }
  const gastTelefonNormalisiert = input.gastTelefonNormalisiert;
  if (!standortId || standortId !== input.standortId || !istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standortId)) {
    throw new ReservierungValidationError(
      "Mitarbeiter und Reservierung müssen zum aktiven Standort gehören.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const gespeicherterMitarbeiter = await tx.mitarbeiter.findFirst({
        where: {
          id: mitarbeiter.id,
          rolle: mitarbeiter.rolle,
          ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId),
        },
        select: { id: true },
      });
    const tisch = await tx.tisch.findFirst({
        where: { id: input.tischId, standortId, verfuegbar: true },
        select: { id: true, kapazitaet: true },
      });
    const vorhandenerGast = await tx.gast.findUnique({
        where: { telefonNormalisiert: gastTelefonNormalisiert },
        select: { id: true },
      });

    if (!gespeicherterMitarbeiter) {
      throw new ReservierungValidationError("Der aktive Mitarbeiter ist ungültig.");
    }
    if (!tisch) {
      throw new ReservierungValidationError(
        "Der gewählte Tisch gehört nicht zum aktiven Standort.",
      );
    }
    await assertReservierungsfenster(tx, standortId, input, tisch.kapazitaet, undefined, now);

    let gastId = vorhandenerGast?.id;
    if (!gastId) {
      if (input.gastName.length < 2) {
        throw new ReservierungValidationError(
          "Für einen neuen Gast wird ein Name mit mindestens 2 Zeichen benötigt.",
        );
      }
      const neuerGast = await tx.gast.create({
        data: {
          id: randomUUID(),
          name: input.gastName,
          telefon: input.gastTelefon,
          telefonNormalisiert: gastTelefonNormalisiert,
        },
        select: { id: true },
      });
      gastId = neuerGast.id;
    }

    return tx.reservierung.create({
      data: {
        id: randomUUID(),
        datum: input.datum,
        uhrzeitMinute: input.uhrzeitMinute,
        personenzahl: input.personenzahl,
        standortId,
        tischId: tisch.id,
        gastId,
        erstelltVonId: gespeicherterMitarbeiter.id,
      },
    });
  });
}

export async function updateReservierung(
  id: string,
  mitarbeiter: ReservierungMitarbeiter,
  standortId: string,
  input: ReservierungInput,
  now = new Date(),
) {
  assertReservierungKontext(id, mitarbeiter, standortId);
  if (standortId !== input.standortId) {
    throw new ReservierungValidationError("Der Standort einer bestehenden Reservierung kann nicht geändert werden.");
  }

  return prisma.$transaction(async (tx) => {
    const reservierung = await tx.reservierung.findFirst({
      where: { id, standortId },
      select: { id: true, gastId: true, tischId: true },
    });
    if (!reservierung) {
      throw new ReservierungValidationError(
        "Die Reservierung gehört nicht zum aktiven Standort.",
      );
    }
    const gespeicherterMitarbeiter = await tx.mitarbeiter.findFirst({
      where: {
        id: mitarbeiter.id,
        rolle: mitarbeiter.rolle,
        ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId),
      },
      select: { id: true },
    });
    const tisch = await tx.tisch.findFirst({
      where: {
        id: input.tischId,
        standortId,
        OR: [{ verfuegbar: true }, { id: reservierung.tischId }],
      },
      select: { id: true, kapazitaet: true },
    });
    const vorhandenerGast = input.gastTelefonNormalisiert
      ? await tx.gast.findUnique({
          where: { telefonNormalisiert: input.gastTelefonNormalisiert },
          select: { id: true },
        })
      : null;
    if (!gespeicherterMitarbeiter) {
      throw new ReservierungValidationError("Der aktive Mitarbeiter ist ungültig.");
    }
    if (!tisch) {
      throw new ReservierungValidationError(
        "Der gewählte Tisch gehört nicht zum aktiven Standort.",
      );
    }
    await assertReservierungsfenster(tx, standortId, input, tisch.kapazitaet, reservierung.id, now);

    let gastId = input.gastTelefonNormalisiert
      ? vorhandenerGast?.id
      : reservierung.gastId;
    if (!gastId && input.gastTelefonNormalisiert) {
      if (input.gastName.length < 2) {
        throw new ReservierungValidationError(
          "Für einen neuen Gast wird ein Name mit mindestens 2 Zeichen benötigt.",
        );
      }
      const neuerGast = await tx.gast.create({
        data: {
          id: randomUUID(),
          name: input.gastName,
          telefon: input.gastTelefon,
          telefonNormalisiert: input.gastTelefonNormalisiert,
        },
        select: { id: true },
      });
      gastId = neuerGast.id;
    }

    return tx.reservierung.update({
      where: { id: reservierung.id },
      data: {
        datum: input.datum,
        uhrzeitMinute: input.uhrzeitMinute,
        personenzahl: input.personenzahl,
        tischId: tisch.id,
        gastId,
        geaendertVonId: gespeicherterMitarbeiter.id,
      },
    });
  });
}

export async function updateReservierungStatus(
  id: string,
  status: unknown,
  mitarbeiter: ReservierungMitarbeiter,
  standortId: string,
) {
  assertReservierungKontext(id, mitarbeiter, standortId);
  if (status !== ReservierungStatus.offen && status !== ReservierungStatus.storniert) {
    throw new ReservierungValidationError("Der Reservierungsstatus ist ungültig.");
  }

  return prisma.$transaction(async (tx) => {
    const reservierung = await tx.reservierung.findFirst({
        where: { id, standortId },
        select: { id: true },
      });
    const gespeicherterMitarbeiter = await tx.mitarbeiter.findFirst({
        where: {
          id: mitarbeiter.id,
          rolle: mitarbeiter.rolle,
          ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId),
        },
        select: { id: true },
      });
    if (!reservierung) {
      throw new ReservierungValidationError(
        "Die Reservierung gehört nicht zum aktiven Standort.",
      );
    }
    if (!gespeicherterMitarbeiter) {
      throw new ReservierungValidationError("Der aktive Mitarbeiter ist ungültig.");
    }

    return tx.reservierung.update({
      where: { id: reservierung.id },
      data: { status, geaendertVonId: gespeicherterMitarbeiter.id },
    });
  });
}

export function listTischeFuerReservierung(standortId: string) {
  return prisma.tisch.findMany({
    where: { standortId },
    orderBy: { nummer: "asc" },
  });
}

export async function listReservierungsstandorte(standortIds: string[]) {
  return prisma.standort.findMany({
    where: { id: { in: standortIds } },
    orderBy: { name: "asc" },
  });
}

export function listTischeFuerReservierungsstandorte(standortIds: string[]) {
  return prisma.tisch.findMany({
    where: { standortId: { in: standortIds } },
    orderBy: [{ standortId: "asc" }, { nummer: "asc" }],
  });
}

export function listOeffnungstageFuerReservierungsstandorte(standortIds: string[]) {
  return prisma.standardOeffnungszeit.findMany({
    where: { standortId: { in: standortIds } },
    select: { standortId: true, wochentag: true },
    orderBy: [{ standortId: "asc" }, { wochentag: "asc" }],
  });
}

export function listReservierungen(standortId: string) {
  return prisma.reservierung.findMany({
    where: { standortId },
    include: {
      gast: { select: { name: true } },
      tisch: { select: { nummer: true } },
      erstelltVon: { select: { name: true } },
      geaendertVon: { select: { name: true } },
    },
    orderBy: [{ datum: "asc" }, { uhrzeitMinute: "asc" }],
  });
}

function assertReservierungKontext(
  id: string,
  mitarbeiter: ReservierungMitarbeiter,
  standortId: string,
) {
  assertBerechtigung(mitarbeiter.rolle, "reservierungen_verwalten");
  if (!id) {
    throw new ReservierungValidationError("Reservierungs-ID fehlt.");
  }
  if (!standortId || !istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standortId)) {
    throw new ReservierungValidationError(
      "Mitarbeiter und Reservierung müssen zum aktiven Standort gehören.",
    );
  }
}

export function formatiereUhrzeit(minute: number) {
  const stunden = Math.floor(minute / 60);
  const minuten = minute % 60;
  return `${String(stunden).padStart(2, "0")}:${String(minuten).padStart(2, "0")}`;
}

function istGueltigesDatum(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const jahr = Number(match[1]);
  const monat = Number(match[2]);
  const tag = Number(match[3]);
  const datum = new Date(Date.UTC(jahr, monat - 1, tag));
  return (
    datum.getUTCFullYear() === jahr &&
    datum.getUTCMonth() === monat - 1 &&
    datum.getUTCDate() === tag
  );
}

async function assertReservierungsfenster(
  tx: Prisma.TransactionClient,
  standortId: string,
  input: ReservierungInput,
  tischkapazitaet: number,
  ausgenommeneId: string | undefined,
  now: Date,
) {
  if (input.personenzahl > tischkapazitaet) {
    throw new ReservierungValidationError(`Der gewählte Tisch bietet nur ${tischkapazitaet} Plätze.`);
  }
  const lokaleZeit = berlinDatumUndMinute(now);
  if (input.datum < lokaleZeit.datum || (input.datum === lokaleZeit.datum && input.uhrzeitMinute < lokaleZeit.minute)) {
    throw new ReservierungValidationError("Reservierungen in der Vergangenheit sind nicht möglich.");
  }
  const wochentag = wochentagFuerDatum(input.datum);
  const oeffnungszeit = await tx.standardOeffnungszeit.findUnique({
    where: { standortId_wochentag: { standortId, wochentag } },
    select: { oeffnetMinute: true, schliesstMinute: true },
  });
  const endeMinute = input.uhrzeitMinute + RESERVIERUNGSDAUER_MINUTEN;
  if (!oeffnungszeit || input.uhrzeitMinute < oeffnungszeit.oeffnetMinute || endeMinute > oeffnungszeit.schliesstMinute) {
    throw new ReservierungValidationError("Das zweistündige Reservierungsfenster muss vollständig innerhalb der Öffnungszeiten liegen.");
  }
  const ueberschneidung = await tx.reservierung.findFirst({
    where: {
      standortId,
      tischId: input.tischId,
      datum: input.datum,
      status: ReservierungStatus.offen,
      ...(ausgenommeneId ? { id: { not: ausgenommeneId } } : {}),
      uhrzeitMinute: { gt: input.uhrzeitMinute - RESERVIERUNGSDAUER_MINUTEN, lt: endeMinute },
    },
    select: { id: true },
  });
  if (ueberschneidung) {
    throw new ReservierungValidationError("Der Tisch ist in diesem zweistündigen Zeitfenster bereits reserviert.");
  }
}

export function berlinDatumUndMinute(now: Date) {
  const parts = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const wert = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { datum: `${wert.year}-${wert.month}-${wert.day}`, minute: Number(wert.hour) * 60 + Number(wert.minute) };
}

function wochentagFuerDatum(datum: string): Wochentag {
  const index = new Date(`${datum}T12:00:00.000Z`).getUTCDay();
  return [Wochentag.sonntag, Wochentag.montag, Wochentag.dienstag, Wochentag.mittwoch, Wochentag.donnerstag, Wochentag.freitag, Wochentag.samstag][index];
}
