import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { BestellungStatus } from "../generated/prisma/enums";
import { assertKuechenannahmeOffen, berechneRechnung, BestellungValidationError, createBestellung, updateBestellung, updateBestellungStatus, validateBestellungInput } from "../lib/bestellungen";
import { createGericht, validateGerichtInput } from "../lib/gerichte";
import { prisma } from "../lib/prisma";

const suffix = String(Date.now());
let gerichtId = "";
let fremdesGerichtId = "";
const bestellungIds: string[] = [];
const gastIds: string[] = [];

before(async () => {
  const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "inhaber-marcello" } });
  gerichtId = (await createGericht(inhaber, "kreuzberg", validateGerichtInput({ name: `Testpasta ${suffix}`, beschreibung: "Erfundenes Testgericht", preis: "12,90", kategorie: "pasta" }))).id;
  fremdesGerichtId = (await createGericht(inhaber, "spandau", validateGerichtInput({ name: `Testpasta ${suffix}`, beschreibung: "Erfundenes Testgericht", preis: "13,90", kategorie: "pasta" }))).id;
});

after(async () => {
  await prisma.bestellung.deleteMany({ where: { id: { in: bestellungIds } } });
  await prisma.gast.deleteMany({ where: { id: { in: gastIds } } });
  await prisma.gericht.deleteMany({ where: { id: { in: [gerichtId, fremdesGerichtId] } } });
  await prisma.$disconnect();
});

function input(tischId: string, id = gerichtId) {
  return validateBestellungInput({ tischId, gerichtIds: [id], mengen: ["2"], sonderwuensche: ["ohne Knoblauch"] });
}

describe("Bestellvalidierung", () => {
  it("verlangt mindestens eine vollständige Position und begrenzt Mengen", () => {
    assert.throws(() => validateBestellungInput({ tischId: "x", gerichtIds: [], mengen: [], sonderwuensche: [] }), BestellungValidationError);
    assert.throws(() => validateBestellungInput({ tischId: "x", gerichtIds: ["g"], mengen: ["0"], sonderwuensche: [""] }), BestellungValidationError);
  });
  it("erzwingt den Küchenannahmeschluss in Berliner Ortszeit", async () => {
    await assertKuechenannahmeOffen("kreuzberg", new Date("2026-07-25T18:00:00.000Z"));
    await assert.rejects(assertKuechenannahmeOffen("kreuzberg", new Date("2026-07-25T20:30:00.000Z")), BestellungValidationError);
  });
});

describe("Rechnungsberechnung", () => {
  it("summiert Mengen und historische Centpreise", () => {
    assert.deepEqual(berechneRechnung([
      { menge: 2, einzelpreisCent: 1290 },
      { menge: 3, einzelpreisCent: 350 },
    ], false), { ausgangssummeCent: 3630, rabattCent: 0, gesamtsummeCent: 3630 });
  });

  it("rundet 15 Prozent Bella-Card-Rabatt auf ganze Cent", () => {
    assert.deepEqual(berechneRechnung([{ menge: 1, einzelpreisCent: 101 }], true), {
      ausgangssummeCent: 101,
      rabattCent: 15,
      gesamtsummeCent: 86,
    });
  });
});

describe("Bestellpersistenz und Standorttrennung", () => {
  it("historisiert Preis, Sonderwunsch und Mitarbeiter und verhindert eine zweite aktive Tischbestellung", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tisch = await prisma.tisch.findFirstOrThrow({ where: { standortId: "kreuzberg", verfuegbar: true } });
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    assert.equal(bestellung.aufgenommenVonId, mitarbeiter.id);
    assert.equal(bestellung.positionen[0].einzelpreisCent, 1290);
    assert.equal(bestellung.positionen[0].sonderwunsch, "ohne Knoblauch");
    await prisma.gericht.update({ where: { id: gerichtId }, data: { preisCent: 1490 } });
    assert.equal((await prisma.bestellposition.findFirstOrThrow({ where: { bestellungId: bestellung.id } })).einzelpreisCent, 1290);
    const bearbeitet = await updateBestellung(mitarbeiter, "kreuzberg", bestellung.id, input(tisch.id));
    assert.equal(bearbeitet.positionen[0].einzelpreisCent, 1290);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:05:00.000Z")), BestellungValidationError);
  });
  it("weist standortfremde Gerichte und unbekannte Gastnummern ab", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tisch = await prisma.tisch.findFirstOrThrow({ where: { standortId: "kreuzberg", verfuegbar: true, bestellungen: { none: { status: { in: ["offen", "serviert"] } } } } });
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tisch.id, fremdesGerichtId), new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: "+491111111111" }, new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
  });
  it("erlaubt nur offen zu serviert zu bezahlt und sperrt abgeschlossene Bestellungen", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tisch = await prisma.tisch.findFirstOrThrow({ where: { standortId: "kreuzberg", verfuegbar: true, bestellungen: { none: { status: { in: ["offen", "serviert"] } } } } });
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt), BestellungValidationError);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt);
    await assert.rejects(updateBestellung(mitarbeiter, "kreuzberg", bestellung.id, input(tisch.id)), BestellungValidationError);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.storniert), BestellungValidationError);
  });

  it("speichert den Bella-Card-Rabatt und zählt einen Besuch genau einmal", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const gast = await prisma.gast.create({ data: { name: "Testgast Bella", telefon: `+49 155 10 ${suffix}`, telefonNormalisiert: `+4915510${suffix}`, besuchszaehler: 10 } });
    gastIds.push(gast.id);
    const tisch = await prisma.tisch.findFirstOrThrow({ where: { standortId: "kreuzberg", verfuegbar: true, bestellungen: { none: { status: { in: ["offen", "serviert"] } } } } });
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: gast.telefonNormalisiert }, new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    const erwarteteAusgangssumme = bestellung.positionen[0].menge * bestellung.positionen[0].einzelpreisCent;
    const erwarteterRabatt = Math.round(erwarteteAusgangssumme * 0.15);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert);
    const bezahlt = await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt);
    assert.equal(bezahlt.ausgangssummeCent, erwarteteAusgangssumme);
    assert.equal(bezahlt.rabattCent, erwarteterRabatt);
    assert.equal(bezahlt.gesamtsummeCent, erwarteteAusgangssumme - erwarteterRabatt);
    assert.ok(bezahlt.abgerechnetAm);
    assert.equal((await prisma.gast.findUniqueOrThrow({ where: { id: gast.id } })).besuchszaehler, 11);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt), BestellungValidationError);
    assert.equal((await prisma.gast.findUniqueOrThrow({ where: { id: gast.id } })).besuchszaehler, 11);
  });

  it("aktiviert mit dem zehnten Besuch die Bella-Card erst für die folgende Rechnung", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const gast = await prisma.gast.create({ data: { name: "Testgast Zehn", telefon: `+49 155 20 ${suffix}`, telefonNormalisiert: `+4915520${suffix}`, besuchszaehler: 9 } });
    gastIds.push(gast.id);
    const tisch = await prisma.tisch.findFirstOrThrow({ where: { standortId: "kreuzberg", verfuegbar: true, bestellungen: { none: { status: { in: ["offen", "serviert"] } } } } });
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: gast.telefonNormalisiert }, new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    const erwarteteAusgangssumme = bestellung.positionen[0].menge * bestellung.positionen[0].einzelpreisCent;
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert);
    const bezahlt = await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt);
    assert.equal(bezahlt.rabattCent, 0);
    assert.equal(bezahlt.gesamtsummeCent, erwarteteAusgangssumme);
    assert.equal((await prisma.gast.findUniqueOrThrow({ where: { id: gast.id } })).besuchszaehler, 10);
  });
});
