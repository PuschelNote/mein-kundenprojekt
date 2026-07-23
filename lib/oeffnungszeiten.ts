import type { StandardOeffnungszeit, Wochentag } from "@/generated/prisma/client";
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
