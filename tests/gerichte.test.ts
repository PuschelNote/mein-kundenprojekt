import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { BerechtigungsFehler } from "../lib/berechtigungen";
import {
  createGericht,
  formatierePreis,
  GerichtValidationError,
  listGerichte,
  parsePreisCent,
  updateGericht,
  validateGerichtInput,
} from "../lib/gerichte";
import { prisma } from "../lib/prisma";

const suffix = String(Date.now()).slice(-6);
const gerichtIds: string[] = [];

after(async () => {
  if (gerichtIds.length) {
    await prisma.gericht.deleteMany({ where: { id: { in: gerichtIds } } });
  }
  await prisma.$disconnect();
});

describe("Gerichtvalidierung und Preise", () => {
  it("verarbeitet deutsche und internationale Preise exakt in Cent", () => {
    assert.equal(parsePreisCent("12,90"), 1290);
    assert.equal(parsePreisCent("12.9"), 1290);
    assert.equal(formatierePreis(1290).includes("12,90"), true);
  });

  it("lehnt ungültige Preise und Kategorien ab", () => {
    assert.throws(() => parsePreisCent("12,999"), GerichtValidationError);
    assert.throws(() => parsePreisCent("-1,00"), GerichtValidationError);
    assert.throws(
      () =>
        validateGerichtInput({
          name: "Testgericht",
          beschreibung: "Beschreibung",
          preis: "12,00",
          kategorie: "pizza",
        }),
      GerichtValidationError,
    );
  });
});

describe("Gerichtpersistenz, Rollen und Standorttrennung", () => {
  it("erlaubt gleiche Namen an verschiedenen Standorten ohne Vermischung", async () => {
    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "inhaber-marcello" },
    });
    const input = validateGerichtInput({
      name: `Pasta Test ${suffix}`,
      beschreibung: "Erfundene Testbeschreibung",
      preis: "14,50",
      kategorie: "pasta",
      istTagesgericht: "on",
    });
    const kreuzberg = await createGericht(inhaber, "kreuzberg", input);
    const spandau = await createGericht(inhaber, "spandau", input);
    gerichtIds.push(kreuzberg.id, spandau.id);

    const kreuzbergKarte = await listGerichte("kreuzberg");
    const spandauKarte = await listGerichte("spandau");
    assert.equal(kreuzbergKarte.some((gericht) => gericht.id === kreuzberg.id), true);
    assert.equal(kreuzbergKarte.some((gericht) => gericht.id === spandau.id), false);
    assert.equal(spandauKarte.some((gericht) => gericht.id === spandau.id), true);

    await assert.rejects(
      createGericht(inhaber, "kreuzberg", {
        ...input,
        name: input.name.toLocaleLowerCase("de-DE"),
      }),
      GerichtValidationError,
    );

    const updated = await updateGericht(
      spandau.id,
      inhaber,
      "spandau",
      { ...input, preisCent: 1590, istSaisongericht: true },
    );
    assert.equal(updated.preisCent, 1590);
    assert.equal(updated.istSaisongericht, true);
  });

  it("verbietet Grill in Spandau und blendet Grill dort defensiv aus", async () => {
    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "inhaber-marcello" },
    });
    const grillInput = validateGerichtInput({
      name: `Grill Test ${suffix}`,
      beschreibung: "Erfundenes Testgericht",
      preis: "21,00",
      kategorie: "grill",
    });
    await assert.rejects(
      createGericht(inhaber, "spandau", grillInput),
      GerichtValidationError,
    );
    const grill = await createGericht(inhaber, "kreuzberg", grillInput);
    gerichtIds.push(grill.id);
    assert.equal(
      (await listGerichte("spandau")).some(
        (gericht) => gericht.kategorie === "grill",
      ),
      false,
    );
  });

  it("verweigert Managern Preis- und Kartenänderungen", async () => {
    const manager = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    await assert.rejects(
      createGericht(
        manager,
        "kreuzberg",
        validateGerichtInput({
          name: `Unerlaubt ${suffix}`,
          beschreibung: "Darf nicht gespeichert werden",
          preis: "10,00",
          kategorie: "dessert",
        }),
      ),
      BerechtigungsFehler,
    );
  });
});
