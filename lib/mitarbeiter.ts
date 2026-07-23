import { Rolle } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type MitarbeiterInput = {
  name: string;
  rolle: Rolle;
  standortId: string;
};

export class MitarbeiterValidationError extends Error {}

const rollen = new Set<string>(Object.values(Rolle));

export function validateMitarbeiterInput(input: {
  name?: unknown;
  rolle?: unknown;
  standortId?: unknown;
}): MitarbeiterInput {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const standortId =
    typeof input.standortId === "string" ? input.standortId.trim() : "";
  const rolle = typeof input.rolle === "string" ? input.rolle : "";

  if (name.length < 2 || name.length > 100) {
    throw new MitarbeiterValidationError(
      "Der Name muss zwischen 2 und 100 Zeichen lang sein.",
    );
  }

  if (!standortId) {
    throw new MitarbeiterValidationError("Bitte einen Standort auswählen.");
  }

  if (!rollen.has(rolle)) {
    throw new MitarbeiterValidationError("Die ausgewählte Rolle ist ungültig.");
  }

  return { name, standortId, rolle: rolle as Rolle };
}

export function listMitarbeiter() {
  return prisma.mitarbeiter.findMany({
    include: { standort: true },
    orderBy: [{ standort: { name: "asc" } }, { name: "asc" }],
  });
}

export function listStandorte() {
  return prisma.standort.findMany({ orderBy: { name: "asc" } });
}

export function listMitarbeiterFuerStandort(standortId: string) {
  return prisma.mitarbeiter.findMany({
    where: { standortId },
    include: { standort: true },
    orderBy: { name: "asc" },
  });
}

export function listManagerFuerStandort(standortId: string) {
  return prisma.mitarbeiter.findMany({
    where: { standortId, rolle: Rolle.manager },
    orderBy: { name: "asc" },
  });
}

export async function createMitarbeiter(input: MitarbeiterInput) {
  await assertStandortExists(input.standortId);
  return prisma.mitarbeiter.create({ data: input });
}

export async function updateMitarbeiter(
  id: string,
  input: MitarbeiterInput,
) {
  if (!id) {
    throw new MitarbeiterValidationError("Mitarbeiter-ID fehlt.");
  }

  await assertStandortExists(input.standortId);
  const bisher = await prisma.mitarbeiter.findUnique({ where: { id } });
  if (bisher?.rolle === Rolle.inhaber && input.rolle !== Rolle.inhaber) {
    await assertWeitererInhaber(id);
  }
  return prisma.mitarbeiter.update({ where: { id }, data: input });
}

export async function deleteMitarbeiter(id: string) {
  if (!id) {
    throw new MitarbeiterValidationError("Mitarbeiter-ID fehlt.");
  }

  const mitarbeiter = await prisma.mitarbeiter.findUnique({ where: { id } });
  if (mitarbeiter?.rolle === Rolle.inhaber) {
    await assertWeitererInhaber(id);
  }
  return prisma.mitarbeiter.delete({ where: { id } });
}

async function assertWeitererInhaber(ausgeschlosseneId: string) {
  const weitereInhaber = await prisma.mitarbeiter.count({
    where: { rolle: Rolle.inhaber, id: { not: ausgeschlosseneId } },
  });
  if (weitereInhaber === 0) {
    throw new MitarbeiterValidationError(
      "Der letzte Inhaber kann weder gelöscht noch herabgestuft werden.",
    );
  }
}

async function assertStandortExists(standortId: string) {
  const standort = await prisma.standort.findUnique({
    where: { id: standortId },
    select: { id: true },
  });

  if (!standort) {
    throw new MitarbeiterValidationError(
      "Der ausgewählte Standort existiert nicht.",
    );
  }
}
