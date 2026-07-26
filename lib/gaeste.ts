import { prisma } from "@/lib/prisma";

export { istBellaCardAktiv } from "@/lib/gast-status";

export type GastInput = {
  name: string;
  telefon: string;
  telefonNormalisiert: string;
  notizen: string | null;
};

export class GastValidationError extends Error {}

export function normalisiereTelefonnummer(value: unknown) {
  if (typeof value !== "string") {
    throw new GastValidationError("Bitte eine Telefonnummer angeben.");
  }

  let normalisiert = value.trim().replace(/[\s()./\-]/g, "");
  if (normalisiert.startsWith("00")) {
    normalisiert = `+${normalisiert.slice(2)}`;
  }

  if (!/^\+?\d{7,15}$/.test(normalisiert)) {
    throw new GastValidationError(
      "Die Telefonnummer muss zwischen 7 und 15 Ziffern enthalten.",
    );
  }

  return normalisiert;
}

export function validateGastInput(input: {
  name?: unknown;
  telefon?: unknown;
  notizen?: unknown;
}): GastInput {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const telefon = typeof input.telefon === "string" ? input.telefon.trim() : "";
  const notizen =
    typeof input.notizen === "string" && input.notizen.trim()
      ? input.notizen.trim()
      : null;

  if (name.length < 2 || name.length > 100) {
    throw new GastValidationError(
      "Der Name muss zwischen 2 und 100 Zeichen lang sein.",
    );
  }
  if (notizen && notizen.length > 1000) {
    throw new GastValidationError("Notizen dürfen höchstens 1000 Zeichen lang sein.");
  }

  return {
    name,
    telefon,
    telefonNormalisiert: normalisiereTelefonnummer(telefon),
    notizen,
  };
}

export function listGaeste() {
  return prisma.gast.findMany({
    include: { _count: { select: { reservierungen: true, bestellungen: true } } },
    orderBy: { name: "asc" },
  });
}

export function findGastByTelefon(value: unknown) {
  const telefonNormalisiert = normalisiereTelefonnummer(value);
  return prisma.gast.findUnique({ where: { telefonNormalisiert } });
}

export async function createGast(input: GastInput) {
  await assertTelefonnummerFrei(input.telefonNormalisiert);
  return prisma.gast.create({ data: input });
}

export async function updateGast(id: string, input: GastInput) {
  if (!id) {
    throw new GastValidationError("Gast-ID fehlt.");
  }
  await assertTelefonnummerFrei(input.telefonNormalisiert, id);
  return prisma.gast.update({ where: { id }, data: input });
}

export async function deleteGast(id: string) {
  if (!id) {
    throw new GastValidationError("Gast-ID fehlt.");
  }
  const verknuepfungen = await prisma.gast.findUnique({
    where: { id },
    select: { _count: { select: { reservierungen: true, bestellungen: true } } },
  });
  if (!verknuepfungen) {
    throw new GastValidationError("Der Gast wurde nicht gefunden.");
  }
  if (verknuepfungen._count.reservierungen > 0 || verknuepfungen._count.bestellungen > 0) {
    throw new GastValidationError(
      "Der Gast kann nicht gelöscht werden, solange Reservierungen oder Bestellungen mit ihm verknüpft sind.",
    );
  }
  try {
    return await prisma.gast.delete({ where: { id } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2003") {
      throw new GastValidationError(
        "Der Gast kann nicht gelöscht werden, solange Reservierungen oder Bestellungen mit ihm verknüpft sind.",
      );
    }
    throw error;
  }
}

async function assertTelefonnummerFrei(
  telefonNormalisiert: string,
  ausgenommeneId?: string,
) {
  const vorhanden = await prisma.gast.findFirst({
    where: {
      telefonNormalisiert,
      ...(ausgenommeneId ? { id: { not: ausgenommeneId } } : {}),
    },
    select: { id: true },
  });
  if (vorhanden) {
    throw new GastValidationError(
      "Für diese Telefonnummer existiert bereits ein Gast.",
    );
  }
}
