import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Rolle } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { MITARBEITER_COOKIE } from "@/lib/session-constants";
import { createSessionToken, hashSessionToken } from "@/lib/auth";
import { getAktiverStandort, safeReturnTo } from "@/lib/standort";

export const BERECHTIGUNGEN = [
  "reservierungen_verwalten",
  "bestellungen_aufnehmen",
  "kueche_sehen",
  "tischstatus_sehen",
  "tischstatus_verwalten",
  "tischstammdaten_verwalten",
  "speisekarte_sehen",
  "gastdaten_sehen",
  "bella_card_rabatt_vergeben",
  "speisekarte_preise_bearbeiten",
  "mitarbeiter_verwalten",
  "oeffnungszeiten_verwalten",
  "catering_verwalten",
] as const;

export type Berechtigung = (typeof BERECHTIGUNGEN)[number];

const rollenBerechtigungen: Record<Rolle, ReadonlySet<Berechtigung>> = {
  [Rolle.bedienung]: new Set([
    "reservierungen_verwalten",
    "bestellungen_aufnehmen",
    "kueche_sehen",
    "tischstatus_sehen",
    "tischstatus_verwalten",
    "speisekarte_sehen",
  ]),
  [Rolle.manager]: new Set([
    "reservierungen_verwalten",
    "bestellungen_aufnehmen",
    "kueche_sehen",
    "tischstatus_sehen",
    "tischstatus_verwalten",
    "tischstammdaten_verwalten",
    "speisekarte_sehen",
    "gastdaten_sehen",
    "bella_card_rabatt_vergeben",
    "mitarbeiter_verwalten",
    "catering_verwalten",
  ]),
  [Rolle.inhaber]: new Set(BERECHTIGUNGEN),
};

export class BerechtigungsFehler extends Error {}

export function hatBerechtigung(rolle: Rolle, berechtigung: Berechtigung) {
  return rollenBerechtigungen[rolle]?.has(berechtigung) ?? false;
}

export function istMitarbeiterFuerStandortGueltig(
  rolle: Rolle,
  mitarbeiterStandortId: string | null,
  aktiverStandortId: string,
) {
  return rolle === Rolle.inhaber ||
    (rolle === Rolle.bedienung && mitarbeiterStandortId === null) ||
    mitarbeiterStandortId === aktiverStandortId;
}

export function mitarbeiterStandortBedingung(rolle: Rolle, standortId: string) {
  if (rolle === Rolle.inhaber) return {};
  if (rolle === Rolle.bedienung) return { OR: [{ standortId }, { standortId: null }] };
  return { standortId };
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
  const sessionToken = cookieStore.get(MITARBEITER_COOKIE)?.value;

  if (!sessionToken || !standort) {
    return null;
  }

  const session = await prisma.mitarbeiterSession.findUnique({
    where: { tokenHash: hashSessionToken(sessionToken) },
    include: { mitarbeiter: { include: { standort: true } } },
  });
  const mitarbeiter = session?.mitarbeiter;
  if (
    !session || session.laeuftAbAm <= new Date() ||
    !mitarbeiter ||
    !istMitarbeiterFuerStandortGueltig(
      mitarbeiter.rolle,
      mitarbeiter.standortId,
      standort.id,
    )
  ) {
    return null;
  }
  return mitarbeiter;
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

  const mitarbeiter = await prisma.mitarbeiter.findUnique({ where: { id: value } });
  if (!mitarbeiter || !istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standort.id)) {
    return null;
  }

  const cookieStore = await cookies();
  const token = createSessionToken();
  const laeuftAbAm = new Date(Date.now() + 1000 * 60 * 60 * 12);
  await prisma.mitarbeiterSession.create({ data: { tokenHash: hashSessionToken(token), mitarbeiterId: mitarbeiter.id, laeuftAbAm } });
  cookieStore.set(MITARBEITER_COOKIE, token, {
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
  const token = cookieStore.get(MITARBEITER_COOKIE)?.value;
  if (token) await prisma.mitarbeiterSession.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
  cookieStore.delete(MITARBEITER_COOKIE);
}
