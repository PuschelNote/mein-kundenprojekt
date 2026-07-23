import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import {
  createMitarbeiter,
  deleteMitarbeiter,
  MitarbeiterValidationError,
  updateMitarbeiter,
  validateMitarbeiterInput,
} from "../lib/mitarbeiter";
import { prisma } from "../lib/prisma";

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

  it("verlangt Name und Standort", () => {
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
      standortId: "kreuzberg",
    });

    assert.equal(updated.rolle, Rolle.manager);

    await deleteMitarbeiter(created.id);
    testId = undefined;
    assert.equal(
      await prisma.mitarbeiter.count({ where: { id: created.id } }),
      0,
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
