import { randomUUID } from "node:crypto";
import {
  TischBereich,
  TischStatus,
  type Rolle,
} from "@/generated/prisma/enums";
import {
  assertBerechtigung,
  istMitarbeiterFuerStandortGueltig,
  mitarbeiterStandortBedingung,
  type Berechtigung,
} from "@/lib/berechtigungen";
import { prisma } from "@/lib/prisma";

export type TischMitarbeiter = {
  id: string;
  rolle: Rolle;
  standortId: string | null;
};

export type TischInput = {
  nummer: number;
  kapazitaet: number;
  bereich: TischBereich;
  verfuegbar: boolean;
  rasterZeile: number;
  rasterSpalte: number;
};

export class TischValidationError extends Error {}

export function validateTischInput(input: {
  nummer?: unknown;
  kapazitaet?: unknown;
  bereich?: unknown;
  verfuegbar?: unknown;
  rasterZeile?: unknown;
  rasterSpalte?: unknown;
}): TischInput {
  const nummer = Number(input.nummer);
  const kapazitaet = Number(input.kapazitaet);
  const rasterZeile = Number(input.rasterZeile);
  const rasterSpalte = Number(input.rasterSpalte);
  const bereich = input.bereich;
  const verfuegbar =
    input.verfuegbar === true ||
    input.verfuegbar === "true" ||
    input.verfuegbar === "on";

  if (!Number.isInteger(nummer) || nummer < 1 || nummer > 999) {
    throw new TischValidationError("Die Tischnummer muss zwischen 1 und 999 liegen.");
  }
  if (!Number.isInteger(kapazitaet) || kapazitaet < 1 || kapazitaet > 100) {
    throw new TischValidationError("Die Kapazität muss zwischen 1 und 100 liegen.");
  }
  if (bereich !== TischBereich.innen && bereich !== TischBereich.terrasse) {
    throw new TischValidationError("Der Tischbereich ist ungültig.");
  }
  if (!Number.isInteger(rasterZeile) || rasterZeile < 1 || rasterZeile > 20) {
    throw new TischValidationError("Die Grundrisszeile muss zwischen 1 und 20 liegen.");
  }
  if (!Number.isInteger(rasterSpalte) || rasterSpalte < 1 || rasterSpalte > 20) {
    throw new TischValidationError("Die Grundrissspalte muss zwischen 1 und 20 liegen.");
  }
  if (bereich === TischBereich.innen && !verfuegbar) {
    throw new TischValidationError("Innentische müssen verfügbar sein.");
  }

  return {
    nummer,
    kapazitaet,
    bereich,
    verfuegbar,
    rasterZeile,
    rasterSpalte,
  };
}

export function listTische(standortId: string, heute = lokalesDatumBerlin()) {
  return prisma.tisch.findMany({
    where: { standortId },
    include: {
      reservierungen: {
        where: { status: "offen", datum: { gte: heute } },
        select: {
          id: true,
          datum: true,
          uhrzeitMinute: true,
          personenzahl: true,
          gast: { select: { name: true } },
        },
        orderBy: [{ datum: "asc" }, { uhrzeitMinute: "asc" }],
      },
    },
    orderBy: [{ rasterZeile: "asc" }, { rasterSpalte: "asc" }],
  });
}

export async function createTisch(
  mitarbeiter: TischMitarbeiter,
  standortId: string,
  input: TischInput,
) {
  await assertTischZugriff(mitarbeiter, standortId, "tischstammdaten_verwalten");
  await assertNummerUndPositionFrei(standortId, input);
  return prisma.tisch.create({
    data: {
      id: randomUUID(),
      ...input,
      standortId,
      vorlaeufig: false,
    },
  });
}

export async function updateTisch(
  id: string,
  mitarbeiter: TischMitarbeiter,
  standortId: string,
  input: TischInput,
  heute = lokalesDatumBerlin(),
) {
  await assertTischZugriff(mitarbeiter, standortId, "tischstammdaten_verwalten");
  const tisch = await prisma.tisch.findFirst({ where: { id, standortId } });
  if (!tisch) {
    throw new TischValidationError("Der Tisch gehört nicht zum aktiven Standort.");
  }
  await assertNummerUndPositionFrei(standortId, input, id);
  if (tisch.verfuegbar && !input.verfuegbar) {
    const offeneReservierungen = await prisma.reservierung.count({
      where: { tischId: id, status: "offen", datum: { gte: heute } },
    });
    if (offeneReservierungen > 0) {
      throw new TischValidationError(
        "Der Terrassentisch besitzt offene zukünftige Reservierungen und kann nicht deaktiviert werden.",
      );
    }
  }
  return prisma.tisch.update({
    where: { id },
    data: { ...input, vorlaeufig: false },
  });
}

export async function updateTischStatus(
  id: string,
  status: unknown,
  mitarbeiter: TischMitarbeiter,
  standortId: string,
) {
  await assertTischZugriff(mitarbeiter, standortId, "tischstatus_verwalten");
  if (!Object.values(TischStatus).includes(status as TischStatus)) {
    throw new TischValidationError("Der Tischstatus ist ungültig.");
  }
  return prisma.$transaction(async (tx) => {
    const tisch = await tx.tisch.findFirst({
      where: { id, standortId },
      select: { id: true },
    });
    if (!tisch) {
      throw new TischValidationError("Der Tisch gehört nicht zum aktiven Standort.");
    }
    if (status !== TischStatus.besetzt) {
      const aktiveBestellung = await tx.bestellung.count({
        where: { tischId: tisch.id, standortId, status: { in: ["offen", "serviert"] } },
      });
      if (aktiveBestellung > 0) {
        throw new TischValidationError("Ein Tisch mit aktiver Bestellung muss den Status besetzt behalten.");
      }
    }
    return tx.tisch.update({
      where: { id: tisch.id },
      data: { status: status as TischStatus },
    });
  });
}

export async function deleteTisch(
  id: string,
  mitarbeiter: TischMitarbeiter,
  standortId: string,
) {
  await assertTischZugriff(mitarbeiter, standortId, "tischstammdaten_verwalten");
  const tisch = await prisma.tisch.findFirst({
    where: { id, standortId },
    select: { id: true, _count: { select: { reservierungen: true } } },
  });
  if (!tisch) {
    throw new TischValidationError("Der Tisch gehört nicht zum aktiven Standort.");
  }
  if (tisch._count.reservierungen > 0) {
    throw new TischValidationError(
      "Ein Tisch mit Reservierungen kann nicht entfernt werden.",
    );
  }
  return prisma.tisch.delete({ where: { id: tisch.id } });
}

async function assertTischZugriff(
  mitarbeiter: TischMitarbeiter,
  standortId: string,
  berechtigung: Berechtigung,
) {
  assertBerechtigung(mitarbeiter.rolle, berechtigung);
  if (!standortId || !istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standortId)) {
    throw new TischValidationError(
      "Mitarbeiter und Tisch müssen zum aktiven Standort gehören.",
    );
  }
  const vorhanden = await prisma.mitarbeiter.findFirst({
    where: {
      id: mitarbeiter.id,
      rolle: mitarbeiter.rolle,
      ...mitarbeiterStandortBedingung(mitarbeiter.rolle, standortId),
    },
    select: { id: true },
  });
  if (!vorhanden) {
    throw new TischValidationError("Der aktive Mitarbeiter ist ungültig.");
  }
}

async function assertNummerUndPositionFrei(
  standortId: string,
  input: TischInput,
  ausgenommeneId?: string,
) {
  const konflikt = await prisma.tisch.findFirst({
    where: {
      standortId,
      ...(ausgenommeneId ? { id: { not: ausgenommeneId } } : {}),
      OR: [
        { nummer: input.nummer },
        { rasterZeile: input.rasterZeile, rasterSpalte: input.rasterSpalte },
      ],
    },
    select: { nummer: true, rasterZeile: true, rasterSpalte: true },
  });
  if (!konflikt) return;
  if (konflikt.nummer === input.nummer) {
    throw new TischValidationError("Diese Tischnummer existiert am Standort bereits.");
  }
  throw new TischValidationError("Diese Position im Grundriss ist bereits belegt.");
}

export function lokalesDatumBerlin(now = new Date()) {
  const parts = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const wert = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${wert.year}-${wert.month}-${wert.day}`;
}
