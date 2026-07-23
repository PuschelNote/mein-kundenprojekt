import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Rolle } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { MITARBEITER_COOKIE } from "@/lib/session-constants";
import { getAktiverStandort, safeReturnTo } from "@/lib/standort";

export const BERECHTIGUNGEN = [
  "reservierungen_verwalten",
  "bestellungen_aufnehmen",
  "tischstatus_sehen",
  "gastdaten_sehen",
  "bella_card_rabatt_vergeben",
  "speisekarte_preise_bearbeiten",
  "mitarbeiter_verwalten",
] as const;

export type Berechtigung = (typeof BERECHTIGUNGEN)[number];

const rollenBerechtigungen: Record<Rolle, ReadonlySet<Berechtigung>> = {
  [Rolle.bedienung]: new Set([
    "reservierungen_verwalten",
    "bestellungen_aufnehmen",
    "tischstatus_sehen",
  ]),
  [Rolle.manager]: new Set([
    "reservierungen_verwalten",
    "bestellungen_aufnehmen",
    "tischstatus_sehen",
    "gastdaten_sehen",
    "bella_card_rabatt_vergeben",
    "mitarbeiter_verwalten",
  ]),
  [Rolle.inhaber]: new Set(BERECHTIGUNGEN),
};

export class BerechtigungsFehler extends Error {}

export function hatBerechtigung(rolle: Rolle, berechtigung: Berechtigung) {
  return rollenBerechtigungen[rolle]?.has(berechtigung) ?? false;
}

export function assertBerechtigung(
  rolle: Rolle,
  berechtigung: Berechtigung,
) {
  if (!hatBerechtigung(rolle, berechtigung)) {
    throw new BerechtigungsFehler(
      `Die Rolle ${rolle} besitzt die Berechtigung ${berechtigung} nicht.`,
    );
  }
}

export async function getAktiverMitarbeiter() {
  const [cookieStore, standort] = await Promise.all([
    cookies(),
    getAktiverStandort(),
  ]);
  const mitarbeiterId = cookieStore.get(MITARBEITER_COOKIE)?.value;

  if (!mitarbeiterId || !standort) {
    return null;
  }

  return prisma.mitarbeiter.findFirst({
    where: { id: mitarbeiterId, standortId: standort.id },
    include: { standort: true },
  });
}

export async function requireAktiverMitarbeiter(returnTo = "/") {
  const mitarbeiter = await getAktiverMitarbeiter();
  if (!mitarbeiter) {
    redirect(
      `/mitarbeiter-waehlen?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`,
    );
  }
  return mitarbeiter;
}

export async function requireBerechtigung(
  berechtigung: Berechtigung,
  returnTo = "/",
) {
  const mitarbeiter = await requireAktiverMitarbeiter(returnTo);
  if (!hatBerechtigung(mitarbeiter.rolle, berechtigung)) {
    redirect(`/nicht-erlaubt?permission=${encodeURIComponent(berechtigung)}`);
  }
  return mitarbeiter;
}

export async function setAktiverMitarbeiter(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const standort = await getAktiverStandort();
  if (!standort) {
    return null;
  }

  const mitarbeiter = await prisma.mitarbeiter.findFirst({
    where: { id: value, standortId: standort.id },
  });
  if (!mitarbeiter) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(MITARBEITER_COOKIE, mitarbeiter.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 12,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return mitarbeiter;
}

export async function clearAktiverMitarbeiter() {
  const cookieStore = await cookies();
  cookieStore.delete(MITARBEITER_COOKIE);
}
