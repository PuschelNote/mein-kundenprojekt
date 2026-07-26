import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { BestellungStatus, TischStatus } from "../generated/prisma/enums";
import { assertKuechenannahmeOffen, berechneRechnung, BestellungValidationError, createBestellung, deleteBestellung, listBestelloptionen, updateBestellung, updateBestellungStatus, validateBestellungInput } from "../lib/bestellungen";
import { createGericht, validateGerichtInput } from "../lib/gerichte";
import { prisma } from "../lib/prisma";
import { TischValidationError, updateTischStatus } from "../lib/tische";
import { deleteFeiertagsOeffnungszeit, upsertFeiertagsOeffnungszeit, validateFeiertagsOeffnungszeitInput } from "../lib/oeffnungszeiten";

const suffix = String(Date.now());
let gerichtId = "";
let fremdesGerichtId = "";
const bestellungIds: string[] = [];
const gastIds: string[] = [];
const reservierungIds: string[] = [];
const testTischIds = Array.from({ length: 7 }, (_, index) => `test-bestellung-tisch-${suffix}-${index}`);
const fremderTestTischId = `test-bestellung-tisch-fremd-${suffix}`;
const urspruenglicheTischstatus = new Map<string, TischStatus>();

before(async () => {
  const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "inhaber-marcello" } });
  gerichtId = (await createGericht(inhaber, "kreuzberg", validateGerichtInput({ name: `Testpasta ${suffix}`, beschreibung: "Erfundenes Testgericht", preis: "12,90", kategorie: "pasta" }))).id;
  fremdesGerichtId = (await createGericht(inhaber, "spandau", validateGerichtInput({ name: `Testpasta ${suffix}`, beschreibung: "Erfundenes Testgericht", preis: "13,90", kategorie: "pasta" }))).id;
  await prisma.tisch.createMany({ data: [
    ...testTischIds.map((id, index) => ({ id, nummer: 910 + index, kapazitaet: 6, bereich: "innen" as const, rasterZeile: 91, rasterSpalte: index, vorlaeufig: false, standortId: "kreuzberg" })),
    { id: fremderTestTischId, nummer: 910, kapazitaet: 6, bereich: "innen", rasterZeile: 91, rasterSpalte: 0, vorlaeufig: false, standortId: "spandau" },
  ] });
});

after(async () => {
  await prisma.bestellung.deleteMany({ where: { id: { in: bestellungIds } } });
  await prisma.reservierung.deleteMany({ where: { id: { in: reservierungIds } } });
  for (const [id, status] of urspruenglicheTischstatus) {
    await prisma.tisch.update({ where: { id }, data: { status } });
  }
  await prisma.gast.deleteMany({ where: { id: { in: gastIds } } });
  await prisma.tisch.deleteMany({ where: { id: { in: [...testTischIds, fremderTestTischId] } } });
  await prisma.gericht.deleteMany({ where: { id: { in: [gerichtId, fremdesGerichtId] } } });
  await prisma.$disconnect();
});

function input(tischId: string, id = gerichtId, reservierungId?: string) {
  return validateBestellungInput({ tischId, reservierungId, gerichtIds: [id], mengen: ["2"], sonderwuensche: ["ohne Knoblauch"] });
}

function merkeTischstatus(tisch: { id: string; status: TischStatus }) {
  if (!urspruenglicheTischstatus.has(tisch.id)) urspruenglicheTischstatus.set(tisch.id, tisch.status);
}

async function testTisch(index: number) {
  return prisma.tisch.findUniqueOrThrow({ where: { id: testTischIds[index] } });
}

describe("Bestellvalidierung", () => {
  it("verlangt mindestens eine vollständige Position und begrenzt Mengen", () => {
    assert.throws(() => validateBestellungInput({ tischId: "x", gerichtIds: [], mengen: [], sonderwuensche: [] }), BestellungValidationError);
    assert.throws(() => validateBestellungInput({ tischId: "x", gerichtIds: ["g"], mengen: ["0"], sonderwuensche: [""] }), BestellungValidationError);
  });
  it("erzwingt den Küchenannahmeschluss in Berliner Ortszeit", async () => {
    await assertKuechenannahmeOffen("kreuzberg", new Date("2026-07-25T18:00:00.000Z"));
    await assert.rejects(assertKuechenannahmeOffen("kreuzberg", new Date("2026-07-25T20:30:00.000Z")), BestellungValidationError);
    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "inhaber-marcello" } });
    const override = await upsertFeiertagsOeffnungszeit(inhaber, validateFeiertagsOeffnungszeitInput({ standortId: "kreuzberg", datum: "2099-08-15", geschlossen: "on" }));
    try {
      await assert.rejects(assertKuechenannahmeOffen("kreuzberg", new Date("2099-08-15T18:00:00.000Z")), BestellungValidationError);
    } finally {
      await deleteFeiertagsOeffnungszeit(override.id, inhaber);
    }
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
    const tisch = await testTisch(6);
    merkeTischstatus(tisch);
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    assert.equal(bestellung.aufgenommenVonId, mitarbeiter.id);
    assert.equal(bestellung.positionen[0].einzelpreisCent, 1290);
    assert.equal(bestellung.positionen[0].sonderwunsch, "ohne Knoblauch");
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tisch.id } })).status, TischStatus.besetzt);
    const optionen = await listBestelloptionen("kreuzberg", new Date("2026-07-25T18:00:00.000Z"));
    assert.ok(!optionen.tische.some((eintrag) => eintrag.id === tisch.id));
    await assert.rejects(updateTischStatus(tisch.id, TischStatus.frei, mitarbeiter, "kreuzberg"), TischValidationError);
    await assert.rejects(updateTischStatus(tisch.id, TischStatus.reserviert, mitarbeiter, "kreuzberg"), TischValidationError);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tisch.id } })).status, TischStatus.besetzt);
    await prisma.gericht.update({ where: { id: gerichtId }, data: { preisCent: 1490 } });
    assert.equal((await prisma.bestellposition.findFirstOrThrow({ where: { bestellungId: bestellung.id } })).einzelpreisCent, 1290);
    const bearbeitet = await updateBestellung(mitarbeiter, "kreuzberg", bestellung.id, input(tisch.id));
    assert.equal(bearbeitet.positionen[0].einzelpreisCent, 1290);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:05:00.000Z")), BestellungValidationError);
  });
  it("weist standortfremde Gerichte und unbekannte Gastnummern ab", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tisch = await testTisch(1);
    merkeTischstatus(tisch);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tisch.id, fremdesGerichtId), new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: "+491111111111" }, new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tisch.id } })).status, tisch.status);
  });
  it("übernimmt Gast und Tisch aus einer offenen Reservierung und weist manipulierte Tischbezüge ab", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tische = await prisma.tisch.findMany({ where: { id: { in: [testTischIds[2], testTischIds[3]] } }, orderBy: { nummer: "asc" } });
    assert.equal(tische.length, 2);
    tische.forEach(merkeTischstatus);
    const gast = await prisma.gast.create({ data: { name: "Testgast Reservierung", telefon: `+49 155 30 ${suffix}`, telefonNormalisiert: `+4915530${suffix}` } });
    gastIds.push(gast.id);
    const reservierung = await prisma.reservierung.create({ data: { id: `test-reservierung-bestellung-${suffix}`, datum: "2099-08-15", uhrzeitMinute: 19 * 60, personenzahl: 4, standortId: "kreuzberg", tischId: tische[0].id, gastId: gast.id, erstelltVonId: mitarbeiter.id } });
    reservierungIds.push(reservierung.id);
    const fremderTisch = await prisma.tisch.findUniqueOrThrow({ where: { id: fremderTestTischId } });
    const fremdeReservierung = await prisma.reservierung.create({ data: { id: `test-reservierung-bestellung-fremd-${suffix}`, datum: "2099-08-15", uhrzeitMinute: 20 * 60, personenzahl: 2, standortId: "spandau", tischId: fremderTisch.id, gastId: gast.id, erstelltVonId: "manager-spandau-renate" } });
    reservierungIds.push(fremdeReservierung.id);

    const optionen = await listBestelloptionen("kreuzberg", new Date("2099-08-15T10:00:00.000Z"));
    assert.ok(optionen.reservierungen.some((eintrag) => eintrag.id === reservierung.id));
    assert.ok(!optionen.reservierungen.some((eintrag) => eintrag.id === fremdeReservierung.id));
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tische[0].id, gerichtId, fremdeReservierung.id), new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
    await assert.rejects(createBestellung(mitarbeiter, "kreuzberg", input(tische[1].id, gerichtId, reservierung.id), new Date("2026-07-25T18:00:00.000Z")), BestellungValidationError);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tische[1].id } })).status, tische[1].status);

    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", input(tische[0].id, gerichtId, reservierung.id), new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    assert.equal(bestellung.reservierungId, reservierung.id);
    assert.equal(bestellung.gastId, gast.id);
    const bearbeitet = await updateBestellung(mitarbeiter, "kreuzberg", bestellung.id, input(tische[0].id, gerichtId, reservierung.id));
    assert.equal(bearbeitet.gastId, gast.id);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tische[0].id } })).status, TischStatus.besetzt);
    assert.ok(!(await listBestelloptionen("kreuzberg", new Date("2099-08-15T10:00:00.000Z"))).reservierungen.some((eintrag) => eintrag.id === reservierung.id));

    await assert.rejects(deleteBestellung(mitarbeiter, "kreuzberg", bestellung.id), BestellungValidationError);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.storniert);
    const fremderMitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-spandau-renate" } });
    await assert.rejects(deleteBestellung(fremderMitarbeiter, "spandau", bestellung.id), BestellungValidationError);
    await deleteBestellung(mitarbeiter, "kreuzberg", bestellung.id);
    assert.equal(await prisma.bestellung.count({ where: { id: bestellung.id } }), 0);
    assert.equal(await prisma.bestellposition.count({ where: { bestellungId: bestellung.id } }), 0);
    assert.ok((await listBestelloptionen("kreuzberg", new Date("2099-08-15T10:00:00.000Z"))).reservierungen.some((eintrag) => eintrag.id === reservierung.id));
  });
  it("erlaubt nur offen zu zubereitet zu serviert zu bezahlt und sperrt abgeschlossene Bestellungen", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const tisch = await testTisch(4);
    merkeTischstatus(tisch);
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", input(tisch.id), new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt), BestellungValidationError);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tisch.id } })).status, TischStatus.besetzt);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert), BestellungValidationError);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.zubereitet);
    await assert.rejects(updateTischStatus(tisch.id, TischStatus.frei, mitarbeiter, "kreuzberg"), TischValidationError);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt);
    assert.equal((await prisma.tisch.findUniqueOrThrow({ where: { id: tisch.id } })).status, TischStatus.frei);
    await assert.rejects(updateBestellung(mitarbeiter, "kreuzberg", bestellung.id, input(tisch.id)), BestellungValidationError);
    await assert.rejects(updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.storniert), BestellungValidationError);
  });

  it("speichert den Bella-Card-Rabatt und zählt einen Besuch genau einmal", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const gast = await prisma.gast.create({ data: { name: "Testgast Bella", telefon: `+49 155 10 ${suffix}`, telefonNormalisiert: `+4915510${suffix}`, besuchszaehler: 10 } });
    gastIds.push(gast.id);
    const tisch = await testTisch(5);
    merkeTischstatus(tisch);
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: gast.telefonNormalisiert }, new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    const erwarteteAusgangssumme = bestellung.positionen[0].menge * bestellung.positionen[0].einzelpreisCent;
    const erwarteterRabatt = Math.round(erwarteteAusgangssumme * 0.15);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.zubereitet);
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
    const tisch = await testTisch(0);
    merkeTischstatus(tisch);
    const bestellung = await createBestellung(mitarbeiter, "kreuzberg", { ...input(tisch.id), gastTelefonNormalisiert: gast.telefonNormalisiert }, new Date("2026-07-25T18:00:00.000Z"));
    bestellungIds.push(bestellung.id);
    const erwarteteAusgangssumme = bestellung.positionen[0].menge * bestellung.positionen[0].einzelpreisCent;
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.zubereitet);
    await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.serviert);
    const bezahlt = await updateBestellungStatus(mitarbeiter, "kreuzberg", bestellung.id, BestellungStatus.bezahlt);
    assert.equal(bezahlt.rabattCent, 0);
    assert.equal(bezahlt.gesamtsummeCent, erwarteteAusgangssumme);
    assert.equal((await prisma.gast.findUniqueOrThrow({ where: { id: gast.id } })).besuchszaehler, 10);
  });
});
