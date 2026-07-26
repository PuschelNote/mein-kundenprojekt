import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { anekdotenGaeste, seedGrunddaten } from "../lib/grunddaten";
import { prisma } from "../lib/prisma";

after(async () => {
  await prisma.$disconnect();
});

describe("Anekdoten-Gäste als Grunddaten", () => {
  it("legt Herr Kellner und Herr Bergmann idempotent mit erfundenen Kontaktdaten an", async () => {
    await seedGrunddaten();
    await seedGrunddaten();

    for (const erwartet of anekdotenGaeste) {
      const treffer = await prisma.gast.findMany({ where: { id: erwartet.id } });
      assert.equal(treffer.length, 1);
      assert.equal(treffer[0].name, erwartet.name);
      assert.equal(treffer[0].telefonNormalisiert, erwartet.telefonNormalisiert);
      assert.equal(treffer[0].notizen, erwartet.notizen);
      assert.equal(treffer[0].besuchszaehler, erwartet.besuchszaehler);
    }
    assert.ok((await prisma.gast.findUniqueOrThrow({ where: { id: "gast-anekdote-herr-bergmann" } })).besuchszaehler >= 10);
  });

  it("überschreibt spätere Änderungen an einem Anekdoten-Gast nicht", async () => {
    const gast = anekdotenGaeste[1];
    const eigeneNotiz = "Vom Restaurant später gepflegte Notiz";
    await prisma.gast.update({ where: { id: gast.id }, data: { notizen: eigeneNotiz } });
    try {
      await seedGrunddaten();
      assert.equal((await prisma.gast.findUniqueOrThrow({ where: { id: gast.id } })).notizen, eigeneNotiz);
    } finally {
      await prisma.gast.update({ where: { id: gast.id }, data: { notizen: gast.notizen } });
    }
  });
});
