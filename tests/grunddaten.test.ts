import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { anekdotenGaeste, demoGaeste, demoReservierungen, seedGrunddaten } from "../lib/grunddaten";
import { prisma } from "../lib/prisma";

after(async () => {
  await prisma.$disconnect();
});

describe("Demo-Gäste und Reservierungen als Grunddaten", () => {
  it("stellt die Besuchszahlen 0 bis 9 jeweils genau einmal bereit", () => {
    assert.deepEqual(demoGaeste.map((gast) => gast.besuchszaehler).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("legt Demo-Gäste und Reservierungen an beiden Standorten idempotent an", async () => {
    await seedGrunddaten();
    await seedGrunddaten();
    assert.equal(await prisma.gast.count({ where: { id: { in: demoGaeste.map((gast) => gast.id) } } }), 10);
    const reservierungen = await prisma.reservierung.findMany({ where: { id: { in: demoReservierungen.map((reservierung) => reservierung.id) } } });
    assert.equal(reservierungen.length, demoReservierungen.length);
    assert.deepEqual(new Set(reservierungen.map((reservierung) => reservierung.standortId)), new Set(["kreuzberg", "spandau"]));
  });
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
      assert.ok(treffer[0].besuchszaehler >= erwartet.besuchszaehler);
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
