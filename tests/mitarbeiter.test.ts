import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import {
  createMitarbeiter,
  deleteMitarbeiter,
  listManagerFuerStandort,
  listMitarbeiterFuerStandort,
  MitarbeiterValidationError,
  updateMitarbeiter,
  validateMitarbeiterInput,
} from "../lib/mitarbeiter";
import { prisma } from "../lib/prisma";
import { parseStandortId, safeReturnTo } from "../lib/standort";
import { seedGrunddaten } from "../lib/grunddaten";

const testName = `BV-001 Test ${Date.now()}`;
let testId: string | undefined;

describe("Mitarbeiter-Validierung", () => {
  it("trimmt und akzeptiert gültige Eingaben", () => {
    assert.deepEqual(
      validateMitarbeiterInput({
        name: "  Sofia  ",
        rolle: "bedienung",
        standortId: "kreuzberg",
      }),
      {
        name: "Sofia",
        rolle: Rolle.bedienung,
        standortId: "kreuzberg",
      },
    );
  });

  it("lehnt ungültige Rollen ab", () => {
    assert.throws(
      () =>
        validateMitarbeiterInput({
          name: "Sofia",
          rolle: "admin",
          standortId: "kreuzberg",
        }),
      MitarbeiterValidationError,
    );
  });

  it("erlaubt ausschließlich Bedienungen ohne festen Standort", () => {
    assert.deepEqual(validateMitarbeiterInput({ name: "Sofia", rolle: "bedienung", standortId: "" }), {
      name: "Sofia",
      rolle: Rolle.bedienung,
      standortId: null,
    });
    assert.throws(
      () => validateMitarbeiterInput({ name: "Giuseppe", rolle: "manager", standortId: "" }),
      MitarbeiterValidationError,
    );
  });

  it("verlangt einen gültigen Namen und für Manager einen Standort", () => {
    assert.throws(
      () =>
        validateMitarbeiterInput({
          name: " ",
          rolle: "manager",
          standortId: "",
        }),
      MitarbeiterValidationError,
    );
  });
});

describe("Standortkontext", () => {
  it("akzeptiert nur bekannte Standort-IDs", () => {
    assert.equal(parseStandortId("kreuzberg"), "kreuzberg");
    assert.equal(parseStandortId("spandau"), "spandau");
    assert.equal(parseStandortId("mitte"), null);
    assert.equal(parseStandortId(undefined), null);
  });

  it("erlaubt nur interne Rücksprungpfade", () => {
    assert.equal(safeReturnTo("/mitarbeiter"), "/mitarbeiter");
    assert.equal(safeReturnTo("https://example.com"), "/");
    assert.equal(safeReturnTo("//example.com"), "/");
  });
});

describe("Mitarbeiter-Persistenz", () => {
  before(async () => {
    await prisma.standort.upsert({
      where: { id: "kreuzberg" },
      create: { id: "kreuzberg", name: "Kreuzberg" },
      update: {},
    });
  });

  after(async () => {
    if (testId) {
      await prisma.mitarbeiter.deleteMany({ where: { id: testId } });
    }
    await prisma.$disconnect();
  });

  it("legt einen Mitarbeiter an, ändert ihn und löscht ihn", async () => {
    const created = await createMitarbeiter({
      name: testName,
      rolle: Rolle.bedienung,
      standortId: "kreuzberg",
    });
    testId = created.id;

    assert.equal(created.name, testName);
    assert.equal(created.rolle, Rolle.bedienung);

    const updated = await updateMitarbeiter(created.id, {
      name: `${testName} geändert`,
      rolle: Rolle.manager,
      standortId: "spandau",
    });

    assert.equal(updated.rolle, Rolle.manager);
    assert.equal(updated.standortId, "spandau");

    await deleteMitarbeiter(created.id);
    testId = undefined;
    assert.equal(
      await prisma.mitarbeiter.count({ where: { id: created.id } }),
      0,
    );
  });

  it("liefert feste und standortoffene Mitarbeiter für den gewählten Standort", async () => {
    await seedGrunddaten();
    const kreuzberg = await listMitarbeiterFuerStandort("kreuzberg");
    const spandau = await listMitarbeiterFuerStandort("spandau");

    assert.ok(kreuzberg.every((person) => person.rolle === Rolle.inhaber || person.standortId === "kreuzberg" || person.standortId === null));
    assert.ok(spandau.every((person) => person.rolle === Rolle.inhaber || person.standortId === "spandau" || person.standortId === null));
    for (const id of ["bedienung-sofia", "bedienung-nico", "bedienung-fatima"]) {
      assert.equal(kreuzberg.filter((person) => person.id === id).length, 1);
      assert.equal(spandau.filter((person) => person.id === id).length, 1);
    }
  });

  it("bietet den Inhaber an beiden Standorten zur Anmeldung an", async () => {
    const [kreuzberg, spandau] = await Promise.all([
      listMitarbeiterFuerStandort("kreuzberg"),
      listMitarbeiterFuerStandort("spandau"),
    ]);
    assert.ok(kreuzberg.some((person) => person.id === "inhaber-marcello"));
    assert.ok(spandau.some((person) => person.id === "inhaber-marcello"));
  });

  it("legt Manager und standortoffene Bedienungen idempotent an", async () => {
    await seedGrunddaten();
    await seedGrunddaten();

    const kreuzbergManager = await listManagerFuerStandort("kreuzberg");
    const spandauManager = await listManagerFuerStandort("spandau");

    assert.equal(
      kreuzbergManager.filter((person) => person.id === "manager-kreuzberg-giuseppe").length,
      1,
    );
    assert.equal(
      spandauManager.filter((person) => person.id === "manager-spandau-renate").length,
      1,
    );
    const marco = await prisma.mitarbeiter.findUnique({
      where: { id: "inhaber-marcello" },
    });
    assert.equal(marco?.name, "Marco");
    assert.equal(marco?.rolle, Rolle.inhaber);
    const bedienungen = await prisma.mitarbeiter.findMany({ where: { id: { in: ["bedienung-sofia", "bedienung-nico", "bedienung-fatima"] } } });
    assert.equal(bedienungen.length, 3);
    assert.ok(bedienungen.every((person) => person.rolle === Rolle.bedienung && person.standortId === null));
  });

  it("verhindert das Löschen des letzten Inhabers", async () => {
    await assert.rejects(
      deleteMitarbeiter("inhaber-marcello"),
      MitarbeiterValidationError,
    );
  });

  it("lehnt einen unbekannten Standort ab", async () => {
    await assert.rejects(
      createMitarbeiter({
        name: testName,
        rolle: Rolle.bedienung,
        standortId: "unbekannt",
      }),
      MitarbeiterValidationError,
    );
  });
});
