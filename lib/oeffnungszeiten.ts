import type { Prisma, StandardOeffnungszeit, Wochentag, Rolle } from "@/generated/prisma/client";
import { assertBerechtigung } from "@/lib/berechtigungen";
import { prisma } from "@/lib/prisma";

export const WOCHENTAGE: Wochentag[] = [
  "montag",
  "dienstag",
  "mittwoch",
  "donnerstag",
  "freitag",
  "samstag",
  "sonntag",
];

export const WOCHENTAG_LABEL: Record<Wochentag, string> = {
  montag: "Montag",
  dienstag: "Dienstag",
  mittwoch: "Mittwoch",
  donnerstag: "Donnerstag",
  freitag: "Freitag",
  samstag: "Samstag",
  sonntag: "Sonntag",
};

export type Zeitfenster = Pick<
  StandardOeffnungszeit,
  "wochentag" | "oeffnetMinute" | "schliesstMinute"
>;

export class OeffnungszeitValidationError extends Error {}

export type FeiertagsOeffnungszeitInput = {
  standortId: string;
  datum: string;
  geschlossen: boolean;
  oeffnetMinute: number | null;
  schliesstMinute: number | null;
};

export function validateFeiertagsOeffnungszeitInput(input: {
  standortId?: unknown; datum?: unknown; geschlossen?: unknown;
  oeffnet?: unknown; schliesst?: unknown;
}): FeiertagsOeffnungszeitInput {
  const standortId = typeof input.standortId === "string" ? input.standortId.trim() : "";
  const datum = typeof input.datum === "string" ? input.datum.trim() : "";
  const geschlossen = input.geschlossen === true || input.geschlossen === "on";
  if (!standortId) throw new OeffnungszeitValidationError("Bitte einen Standort auswählen.");
  if (!istGueltigesDatum(datum)) throw new OeffnungszeitValidationError("Bitte ein gültiges Datum angeben.");
  if (geschlossen) return { standortId, datum, geschlossen, oeffnetMinute: null, schliesstMinute: null };
  const oeffnetMinute = parseUhrzeit(input.oeffnet);
  const schliesstMinute = parseUhrzeit(input.schliesst);
  validateZeitfenster(oeffnetMinute, schliesstMinute);
  return { standortId, datum, geschlossen, oeffnetMinute, schliesstMinute };
}

export async function upsertFeiertagsOeffnungszeit(mitarbeiter: { id: string; rolle: Rolle }, input: FeiertagsOeffnungszeitInput) {
  assertBerechtigung(mitarbeiter.rolle, "oeffnungszeiten_verwalten");
  return prisma.$transaction(async (tx) => {
    const [inhaber, standort] = await Promise.all([
      tx.mitarbeiter.findFirst({ where: { id: mitarbeiter.id, rolle: "inhaber" }, select: { id: true } }),
      tx.standort.findUnique({ where: { id: input.standortId }, select: { id: true } }),
    ]);
    if (!inhaber) throw new OeffnungszeitValidationError("Nur der Inhaber darf Feiertagszeiten verwalten.");
    if (!standort) throw new OeffnungszeitValidationError("Der Standort ist ungültig.");
    return tx.feiertagsOeffnungszeit.upsert({
      where: { standortId_datum: { standortId: input.standortId, datum: input.datum } },
      create: input,
      update: { geschlossen: input.geschlossen, oeffnetMinute: input.oeffnetMinute, schliesstMinute: input.schliesstMinute },
    });
  });
}

export async function deleteFeiertagsOeffnungszeit(id: string, mitarbeiter: { id: string; rolle: Rolle }) {
  assertBerechtigung(mitarbeiter.rolle, "oeffnungszeiten_verwalten");
  return prisma.$transaction(async (tx) => {
    const inhaber = await tx.mitarbeiter.findFirst({ where: { id: mitarbeiter.id, rolle: "inhaber" }, select: { id: true } });
    if (!inhaber) throw new OeffnungszeitValidationError("Nur der Inhaber darf Feiertagszeiten verwalten.");
    const eintrag = await tx.feiertagsOeffnungszeit.findUnique({ where: { id }, select: { id: true } });
    if (!eintrag) throw new OeffnungszeitValidationError("Der Feiertagseintrag wurde nicht gefunden.");
    return tx.feiertagsOeffnungszeit.delete({ where: { id } });
  });
}

type OeffnungszeitenClient = Pick<Prisma.TransactionClient, "feiertagsOeffnungszeit" | "standardOeffnungszeit">;

export async function getEffektiveOeffnungszeit(standortId: string, datum: string, client: OeffnungszeitenClient = prisma) {
  const override = await client.feiertagsOeffnungszeit.findUnique({ where: { standortId_datum: { standortId, datum } } });
  if (override) return override.geschlossen ? null : { oeffnetMinute: override.oeffnetMinute!, schliesstMinute: override.schliesstMinute!, quelle: "feiertag" as const };
  const wochentag = wochentagFuerDatum(datum);
  const standard = await client.standardOeffnungszeit.findUnique({ where: { standortId_wochentag: { standortId, wochentag } } });
  return standard ? { oeffnetMinute: standard.oeffnetMinute, schliesstMinute: standard.schliesstMinute, quelle: "standard" as const } : null;
}

export function listFeiertagsOeffnungszeiten(vonDatum?: string) {
  return prisma.feiertagsOeffnungszeit.findMany({
    where: vonDatum ? { datum: { gte: vonDatum } } : undefined,
    include: { standort: { select: { name: true } } },
    orderBy: [{ datum: "asc" }, { standortId: "asc" }],
  });
}

export function validateZeitfenster(
  oeffnetMinute: number,
  schliesstMinute: number,
) {
  if (
    !Number.isInteger(oeffnetMinute) ||
    !Number.isInteger(schliesstMinute) ||
    oeffnetMinute < 0 ||
    schliesstMinute > 24 * 60 ||
    oeffnetMinute >= schliesstMinute
  ) {
    throw new OeffnungszeitValidationError(
      "Öffnungszeiten müssen ein gültiges Zeitfenster innerhalb eines Tages bilden.",
    );
  }
}

export function formatiereMinute(minute: number) {
  if (!Number.isInteger(minute) || minute < 0 || minute > 24 * 60) {
    throw new OeffnungszeitValidationError("Die Zeitangabe ist ungültig.");
  }

  if (minute === 24 * 60) {
    return "24:00";
  }

  const stunde = Math.floor(minute / 60);
  const restminute = minute % 60;
  return `${String(stunde).padStart(2, "0")}:${String(restminute).padStart(2, "0")}`;
}

export function istRegulaerGeoeffnet(
  zeiten: Zeitfenster[],
  wochentag: Wochentag,
  minute: number,
) {
  const zeitfenster = zeiten.find((zeit) => zeit.wochentag === wochentag);
  if (!zeitfenster) {
    return false;
  }

  validateZeitfenster(zeitfenster.oeffnetMinute, zeitfenster.schliesstMinute);
  return minute >= zeitfenster.oeffnetMinute && minute < zeitfenster.schliesstMinute;
}

export function getStandardOeffnungszeiten(standortId: string) {
  return prisma.standardOeffnungszeit.findMany({ where: { standortId } });
}

export function sortiereOeffnungszeiten(zeiten: Zeitfenster[]) {
  return [...zeiten].sort(
    (a, b) => WOCHENTAGE.indexOf(a.wochentag) - WOCHENTAGE.indexOf(b.wochentag),
  );
}

function parseUhrzeit(value: unknown) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new OeffnungszeitValidationError("Bitte gültige Öffnungs- und Schließzeiten angeben.");
  const [stunden, minuten] = value.split(":").map(Number);
  return stunden * 60 + minuten;
}

function istGueltigesDatum(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const datum = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return datum.getUTCFullYear() === Number(match[1]) && datum.getUTCMonth() === Number(match[2]) - 1 && datum.getUTCDate() === Number(match[3]);
}

function wochentagFuerDatum(datum: string): Wochentag {
  return WOCHENTAGE[(new Date(`${datum}T12:00:00.000Z`).getUTCDay() + 6) % 7];
}
