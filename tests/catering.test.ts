import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { CateringStatus } from "../generated/prisma/enums";
import { CateringValidationError, createCateringAuftrag, updateCateringAuftrag, validateCateringInput } from "../lib/catering";
import { BerechtigungsFehler } from "../lib/berechtigungen";
import { prisma } from "../lib/prisma";

const ids: string[] = [];

after(async () => {
  await prisma.cateringAuftrag.deleteMany({ where: { id: { in: ids } } });
  await prisma.$disconnect();
});

function input(status: CateringStatus = CateringStatus.angefragt) {
  return validateCateringInput({ kundenname: "Beispielwerk Berlin", datum: "2099-09-12", beschreibung: "Italienisches Buffet für 40 Personen", angebotssumme: "2450,50", status });
}

describe("Catering-Aufträge", () => {
  it("validiert Pflichtfelder, Centbetrag und kontrollierten Status", () => {
    assert.equal(input().angebotssummeCent, 245050);
    assert.throws(() => validateCateringInput({ kundenname: "X", datum: "falsch", beschreibung: "", angebotssumme: "0", status: "neu" }), CateringValidationError);
  });

  it("legt einen standortgebundenen Auftrag an und aktualisiert ihn nachvollziehbar", async () => {
    const manager = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const auftrag = await createCateringAuftrag(manager, "kreuzberg", input());
    ids.push(auftrag.id);
    assert.equal(auftrag.standortId, "kreuzberg");
    assert.equal(auftrag.bearbeitetVonId, manager.id);
    const aktualisiert = await updateCateringAuftrag(auftrag.id, manager, "kreuzberg", input(CateringStatus.bestaetigt));
    assert.equal(aktualisiert.status, CateringStatus.bestaetigt);
  });

  it("verweigert Bedienungen und standortfremden Managern den Schreibzugriff", async () => {
    const bedienung = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "bedienung-sofia" } });
    const fremderManager = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-spandau-renate" } });
    await assert.rejects(createCateringAuftrag(bedienung, "kreuzberg", input()), BerechtigungsFehler);
    await assert.rejects(createCateringAuftrag(fremderManager, "kreuzberg", input()), CateringValidationError);
  });
});
