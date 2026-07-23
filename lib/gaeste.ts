import { prisma } from "@/lib/prisma";

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

export function istBellaCardAktiv(besuchszaehler: number) {
  return besuchszaehler >= 10;
}

export function listGaeste() {
  return prisma.gast.findMany({ orderBy: { name: "asc" } });
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
  return prisma.gast.delete({ where: { id } });
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
