import { randomUUID } from "node:crypto";
import { GerichtKategorie, type Rolle } from "@/generated/prisma/enums";
import { assertBerechtigung } from "@/lib/berechtigungen";
import { GERICHT_KATEGORIEN } from "@/lib/gericht-kategorien";
import { prisma } from "@/lib/prisma";

export type GerichtInput = {
  name: string;
  nameNormalisiert: string;
  beschreibung: string;
  preisCent: number;
  kategorie: GerichtKategorie;
  istTagesgericht: boolean;
  istSaisongericht: boolean;
};

export type GerichtMitarbeiter = {
  id: string;
  rolle: Rolle;
  standortId: string | null;
};

export class GerichtValidationError extends Error {}

export function validateGerichtInput(input: {
  name?: unknown;
  beschreibung?: unknown;
  preis?: unknown;
  kategorie?: unknown;
  istTagesgericht?: unknown;
  istSaisongericht?: unknown;
}): GerichtInput {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const beschreibung =
    typeof input.beschreibung === "string" ? input.beschreibung.trim() : "";
  if (name.length < 2 || name.length > 100) {
    throw new GerichtValidationError(
      "Der Gerichtsname muss zwischen 2 und 100 Zeichen lang sein.",
    );
  }
  if (beschreibung.length < 2 || beschreibung.length > 500) {
    throw new GerichtValidationError(
      "Die Beschreibung muss zwischen 2 und 500 Zeichen lang sein.",
    );
  }
  if (!GERICHT_KATEGORIEN.includes(input.kategorie as GerichtKategorie)) {
    throw new GerichtValidationError("Die Gerichtskategorie ist ungültig.");
  }

  return {
    name,
    nameNormalisiert: normalisiereGerichtName(name),
    beschreibung,
    preisCent: parsePreisCent(input.preis),
    kategorie: input.kategorie as GerichtKategorie,
    istTagesgericht: istAktiv(input.istTagesgericht),
    istSaisongericht: istAktiv(input.istSaisongericht),
  };
}

export function parsePreisCent(value: unknown) {
  if (typeof value !== "string") {
    throw new GerichtValidationError("Bitte einen gültigen Preis angeben.");
  }
  const preis = value.trim().replace(",", ".");
  if (!/^\d{1,6}(?:\.\d{1,2})?$/.test(preis)) {
    throw new GerichtValidationError(
      "Der Preis muss als positiver Betrag mit höchstens zwei Nachkommastellen angegeben werden.",
    );
  }
  const [euro, nachkomma = ""] = preis.split(".");
  const cent = Number(euro) * 100 + Number(nachkomma.padEnd(2, "0"));
  if (!Number.isSafeInteger(cent) || cent < 1 || cent > 99_999_999) {
    throw new GerichtValidationError("Der Preis liegt außerhalb des erlaubten Bereichs.");
  }
  return cent;
}

export function formatierePreis(preisCent: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(preisCent / 100);
}

export function listGerichte(standortId: string) {
  return prisma.gericht.findMany({
    where: {
      standortId,
      ...(standortId === "spandau"
        ? { kategorie: { not: GerichtKategorie.grill } }
        : {}),
    },
    orderBy: [{ kategorie: "asc" }, { name: "asc" }],
  });
}

export async function createGericht(
  mitarbeiter: GerichtMitarbeiter,
  standortId: string,
  input: GerichtInput,
) {
  await assertGerichtPflege(mitarbeiter, standortId);
  assertGrillRegel(standortId, input.kategorie);
  await assertNameFrei(standortId, input.nameNormalisiert);
  return prisma.gericht.create({
    data: { id: randomUUID(), ...input, standortId },
  });
}

export async function updateGericht(
  id: string,
  mitarbeiter: GerichtMitarbeiter,
  standortId: string,
  input: GerichtInput,
) {
  await assertGerichtPflege(mitarbeiter, standortId);
  assertGrillRegel(standortId, input.kategorie);
  const gericht = await prisma.gericht.findFirst({
    where: { id, standortId },
    select: { id: true },
  });
  if (!gericht) {
    throw new GerichtValidationError(
      "Das Gericht gehört nicht zum aktiven Standort.",
    );
  }
  await assertNameFrei(standortId, input.nameNormalisiert, id);
  return prisma.gericht.update({ where: { id }, data: input });
}

function normalisiereGerichtName(name: string) {
  return name.normalize("NFKC").toLocaleLowerCase("de-DE");
}

function istAktiv(value: unknown) {
  return value === true || value === "true" || value === "on";
}

function assertGrillRegel(standortId: string, kategorie: GerichtKategorie) {
  if (kategorie === GerichtKategorie.grill && standortId !== "kreuzberg") {
    throw new GerichtValidationError(
      "Grillgerichte dürfen ausschließlich in Kreuzberg angeboten werden.",
    );
  }
}

async function assertGerichtPflege(
  mitarbeiter: GerichtMitarbeiter,
  standortId: string,
) {
  assertBerechtigung(mitarbeiter.rolle, "speisekarte_preise_bearbeiten");
  if (!standortId) {
    throw new GerichtValidationError("Ein aktiver Standort ist erforderlich.");
  }
  const vorhanden = await prisma.mitarbeiter.findFirst({
    where: { id: mitarbeiter.id, rolle: mitarbeiter.rolle },
    select: { id: true, rolle: true },
  });
  if (!vorhanden || vorhanden.rolle !== "inhaber") {
    throw new GerichtValidationError("Der aktive Inhaber ist ungültig.");
  }
}

async function assertNameFrei(
  standortId: string,
  nameNormalisiert: string,
  ausgenommeneId?: string,
) {
  const vorhanden = await prisma.gericht.findFirst({
    where: {
      standortId,
      nameNormalisiert,
      ...(ausgenommeneId ? { id: { not: ausgenommeneId } } : {}),
    },
    select: { id: true },
  });
  if (vorhanden) {
    throw new GerichtValidationError(
      "Ein Gericht mit diesem Namen existiert am Standort bereits.",
    );
  }
}
