import { randomUUID } from "node:crypto";
import type { Rolle } from "@/generated/prisma/enums";
import { assertBerechtigung } from "@/lib/berechtigungen";
import { normalisiereTelefonnummer } from "@/lib/gaeste";
import { prisma } from "@/lib/prisma";

export type ReservierungInput = {
  tischId: string;
  gastName: string;
  gastTelefon: string;
  gastTelefonNormalisiert: string;
  datum: string;
  uhrzeitMinute: number;
  personenzahl: number;
};

export type ReservierungMitarbeiter = {
  id: string;
  rolle: Rolle;
  standortId: string;
};

export class ReservierungValidationError extends Error {}

export function validateReservierungInput(input: {
  tischId?: unknown;
  gastName?: unknown;
  gastTelefon?: unknown;
  datum?: unknown;
  uhrzeit?: unknown;
  personenzahl?: unknown;
}): ReservierungInput {
  const tischId = typeof input.tischId === "string" ? input.tischId.trim() : "";
  const gastName = typeof input.gastName === "string" ? input.gastName.trim() : "";
  const gastTelefon =
    typeof input.gastTelefon === "string" ? input.gastTelefon.trim() : "";
  const datum = typeof input.datum === "string" ? input.datum.trim() : "";
  const uhrzeit = typeof input.uhrzeit === "string" ? input.uhrzeit.trim() : "";
  const personenzahl = Number(input.personenzahl);

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

  let gastTelefonNormalisiert: string;
  try {
    gastTelefonNormalisiert = normalisiereTelefonnummer(input.gastTelefon);
  } catch {
    throw new ReservierungValidationError(
      "Bitte eine gültige Gast-Telefonnummer angeben.",
    );
  }

  const [stunden, minuten] = uhrzeit.split(":").map(Number);
  return {
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
) {
  assertBerechtigung(mitarbeiter.rolle, "reservierungen_verwalten");
  if (!standortId || mitarbeiter.standortId !== standortId) {
    throw new ReservierungValidationError(
      "Mitarbeiter und Reservierung müssen zum aktiven Standort gehören.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const [gespeicherterMitarbeiter, tisch, vorhandenerGast] = await Promise.all([
      tx.mitarbeiter.findFirst({
        where: {
          id: mitarbeiter.id,
          standortId,
          rolle: mitarbeiter.rolle,
        },
        select: { id: true },
      }),
      tx.tisch.findFirst({
        where: { id: input.tischId, standortId },
        select: { id: true },
      }),
      tx.gast.findUnique({
        where: { telefonNormalisiert: input.gastTelefonNormalisiert },
        select: { id: true },
      }),
    ]);

    if (!gespeicherterMitarbeiter) {
      throw new ReservierungValidationError("Der aktive Mitarbeiter ist ungültig.");
    }
    if (!tisch) {
      throw new ReservierungValidationError(
        "Der gewählte Tisch gehört nicht zum aktiven Standort.",
      );
    }

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
          telefonNormalisiert: input.gastTelefonNormalisiert,
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

export function listTischeFuerReservierung(standortId: string) {
  return prisma.tisch.findMany({
    where: { standortId },
    orderBy: { nummer: "asc" },
  });
}

export function listReservierungen(standortId: string) {
  return prisma.reservierung.findMany({
    where: { standortId },
    include: {
      gast: { select: { name: true } },
      tisch: { select: { nummer: true } },
      erstelltVon: { select: { name: true } },
    },
    orderBy: [{ datum: "asc" }, { uhrzeitMinute: "asc" }],
  });
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
