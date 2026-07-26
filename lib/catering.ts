import { CateringStatus, type Rolle } from "@/generated/prisma/enums";
import { assertBerechtigung, istMitarbeiterFuerStandortGueltig } from "@/lib/berechtigungen";
import { parsePreisCent } from "@/lib/gerichte";
import { prisma } from "@/lib/prisma";

export const CATERING_STATUS = Object.values(CateringStatus);

export type CateringInput = {
  kundenname: string;
  datum: string;
  beschreibung: string;
  angebotssummeCent: number;
  status: CateringStatus;
};

type CateringMitarbeiter = { id: string; rolle: Rolle; standortId: string | null };

export class CateringValidationError extends Error {}

export function validateCateringInput(input: Record<string, unknown>): CateringInput {
  const kundenname = typeof input.kundenname === "string" ? input.kundenname.trim() : "";
  const beschreibung = typeof input.beschreibung === "string" ? input.beschreibung.trim() : "";
  const datum = typeof input.datum === "string" ? input.datum : "";
  if (kundenname.length < 2 || kundenname.length > 120) throw new CateringValidationError("Der Kundenname muss 2 bis 120 Zeichen lang sein.");
  if (beschreibung.length < 2 || beschreibung.length > 2000) throw new CateringValidationError("Die Beschreibung muss 2 bis 2.000 Zeichen lang sein.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || Number.isNaN(Date.parse(`${datum}T00:00:00Z`))) throw new CateringValidationError("Bitte ein gültiges Datum angeben.");
  if (!CATERING_STATUS.includes(input.status as CateringStatus)) throw new CateringValidationError("Der Auftragsstatus ist ungültig.");
  try {
    return { kundenname, beschreibung, datum, angebotssummeCent: parsePreisCent(input.angebotssumme), status: input.status as CateringStatus };
  } catch {
    throw new CateringValidationError("Bitte eine positive Angebotssumme mit höchstens zwei Nachkommastellen angeben.");
  }
}

export function listCateringAuftraege(standortId: string) {
  return prisma.cateringAuftrag.findMany({ where: { standortId }, include: { bearbeitetVon: true }, orderBy: [{ datum: "asc" }, { erstelltAm: "asc" }] });
}

export async function createCateringAuftrag(mitarbeiter: CateringMitarbeiter, standortId: string, input: CateringInput) {
  await assertZugriff(mitarbeiter, standortId);
  return prisma.cateringAuftrag.create({ data: { ...input, standortId, bearbeitetVonId: mitarbeiter.id } });
}

export async function updateCateringAuftrag(id: string, mitarbeiter: CateringMitarbeiter, standortId: string, input: CateringInput) {
  await assertZugriff(mitarbeiter, standortId);
  const auftrag = await prisma.cateringAuftrag.findFirst({ where: { id, standortId }, select: { id: true } });
  if (!auftrag) throw new CateringValidationError("Der Catering-Auftrag gehört nicht zum aktiven Standort.");
  return prisma.cateringAuftrag.update({ where: { id }, data: { ...input, bearbeitetVonId: mitarbeiter.id } });
}

async function assertZugriff(mitarbeiter: CateringMitarbeiter, standortId: string) {
  assertBerechtigung(mitarbeiter.rolle, "catering_verwalten");
  if (!istMitarbeiterFuerStandortGueltig(mitarbeiter.rolle, mitarbeiter.standortId, standortId)) throw new CateringValidationError("Der Mitarbeiter darf diesen Standort nicht verwalten.");
  const gueltig = await prisma.mitarbeiter.count({ where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle } });
  if (!gueltig) throw new CateringValidationError("Der aktive Mitarbeiter ist ungültig.");
}
