import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import {
  createGast,
  deleteGast,
  findGastByTelefon,
  GastValidationError,
  istBellaCardAktiv,
  normalisiereTelefonnummer,
  updateGast,
  validateGastInput,
} from "../lib/gaeste";
import { prisma } from "../lib/prisma";

const testTelefon = `+4930${String(Date.now()).slice(-8)}`;
let gastId: string | undefined;

after(async () => {
  if (gastId) {
    await prisma.gast.deleteMany({ where: { id: gastId } });
  }
  await prisma.$disconnect();
});

describe("Gast-Validierung", () => {
  it("normalisiert übliche Schreibweisen", () => {
    assert.equal(normalisiereTelefonnummer("+49 (30) 123-4567"), "+49301234567");
    assert.equal(normalisiereTelefonnummer("0049 30 1234567"), "+49301234567");
  });

  it("lehnt ungültige Telefonnummern und Namen ab", () => {
    assert.throws(() => normalisiereTelefonnummer("12ab"), GastValidationError);
    assert.throws(
      () => validateGastInput({ name: " ", telefon: "+49301234567" }),
      GastValidationError,
    );
  });

  it("normalisiert Notizen und begrenzt ihre Länge", () => {
    const mitNotiz = validateGastInput({
      name: "Testgast",
      telefon: "+49301234567",
      notizen: "  Haselnussallergie, bevorzugt Terrasse  ",
    });
    const ohneNotiz = validateGastInput({
      name: "Testgast",
      telefon: "+49301234567",
      notizen: "   ",
    });

    assert.equal(mitNotiz.notizen, "Haselnussallergie, bevorzugt Terrasse");
    assert.equal(ohneNotiz.notizen, null);
    assert.throws(
      () =>
        validateGastInput({
          name: "Testgast",
          telefon: "+49301234567",
          notizen: "a".repeat(1001),
        }),
      GastValidationError,
    );
  });

  it("leitet den Bella-Card-Status aus Besuchen ab", () => {
    assert.equal(istBellaCardAktiv(9), false);
    assert.equal(istBellaCardAktiv(10), true);
  });
});

describe("Gast-Persistenz", () => {
  it("legt einen Gast an, ändert ihn und löscht ihn", async () => {
    const input = validateGastInput({
      name: "Testgast",
      telefon: testTelefon,
      notizen: "Kein Knoblauch",
    });
    const created = await createGast(input);
    gastId = created.id;

    assert.equal(created.besuchszaehler, 0);
    assert.equal(created.telefonNormalisiert, testTelefon);

    const updated = await updateGast(
      created.id,
      validateGastInput({
        name: "Testgast Neu",
        telefon: testTelefon,
        notizen: "Terrasse",
      }),
    );
    assert.equal(updated.name, "Testgast Neu");
    assert.equal(updated.notizen, "Terrasse");

    const cleared = await updateGast(
      created.id,
      validateGastInput({
        name: "Testgast Neu",
        telefon: testTelefon,
        notizen: " ",
      }),
    );
    assert.equal(cleared.notizen, null);

    await deleteGast(created.id);
    gastId = undefined;
    assert.equal(await prisma.gast.count({ where: { id: created.id } }), 0);
  });

  it("erkennt normalisierte Telefonnummern als Duplikat", async () => {
    const created = await createGast(
      validateGastInput({ name: "Erster Gast", telefon: "+49 30 7654321" }),
    );
    gastId = created.id;

    await assert.rejects(
      createGast(
        validateGastInput({ name: "Zweiter Gast", telefon: "0049-30-7654321" }),
      ),
      GastValidationError,
    );

    await deleteGast(created.id);
    gastId = undefined;
  });

  it("findet einen Gast exakt trotz abweichender Schreibweise", async () => {
    const created = await createGast(
      validateGastInput({ name: "Suchgast", telefon: "+49 30 1122334" }),
    );
    gastId = created.id;

    const gefunden = await findGastByTelefon("0049 (30) 112-2334");
    const unbekannt = await findGastByTelefon("+49 30 9988776");

    assert.equal(gefunden?.id, created.id);
    assert.equal(unbekannt, null);

    await deleteGast(created.id);
    gastId = undefined;
  });
});
