import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MITARBEITER_COOKIE } from "@/lib/session-constants";
import { Rolle } from "@/generated/prisma/enums";

export const STANDORT_COOKIE = "bella-vista-standort";
export const STANDORT_IDS = ["kreuzberg", "spandau"] as const;

export type StandortId = (typeof STANDORT_IDS)[number];

export function parseStandortId(value: unknown): StandortId | null {
  return typeof value === "string" &&
    (STANDORT_IDS as readonly string[]).includes(value)
    ? (value as StandortId)
    : null;
}

export function safeReturnTo(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }

  return value;
}

export async function getAktiverStandort() {
  const cookieStore = await cookies();
  const standortId = parseStandortId(cookieStore.get(STANDORT_COOKIE)?.value);

  if (!standortId) {
    return null;
  }

  return prisma.standort.findUnique({ where: { id: standortId } });
}

export async function requireAktiverStandort(returnTo = "/") {
  const standort = await getAktiverStandort();

  if (!standort) {
    redirect(`/standort?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
  }

  return standort;
}

export async function setAktiverStandort(value: unknown) {
  const standortId = parseStandortId(value);
  if (!standortId) {
    return null;
  }

  const standort = await prisma.standort.findUnique({
    where: { id: standortId },
  });
  if (!standort) {
    return null;
  }

  const cookieStore = await cookies();
  const mitarbeiterId = cookieStore.get(MITARBEITER_COOKIE)?.value;
  const aktiverMitarbeiter = mitarbeiterId
    ? await prisma.mitarbeiter.findUnique({
        where: { id: mitarbeiterId },
        select: { rolle: true },
      })
    : null;
  cookieStore.set(STANDORT_COOKIE, standort.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  if (aktiverMitarbeiter?.rolle !== Rolle.inhaber) {
    cookieStore.delete(MITARBEITER_COOKIE);
  }

  return standort;
}
