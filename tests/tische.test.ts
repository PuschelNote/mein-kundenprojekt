import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import { BerechtigungsFehler } from "../lib/berechtigungen";
import { createGast, validateGastInput } from "../lib/gaeste";
import { prisma } from "../lib/prisma";
import {
  createReservierung,
  ReservierungValidationError,
  validateReservierungInput,
} from "../lib/reservierungen";
import {
  createTisch,
  deleteTisch,
  listTische,
  TischValidationError,
  updateTisch,
  updateTischStatus,
  validateTischInput,
} from "../lib/tische";

const testNummer = 800 + (Date.now() % 100);
const telefon = `+4934${String(Date.now()).slice(-8)}`;
const tischIds: string[] = [];
let reservierungId: string | undefined;
let gastId: string | undefined;

after(async () => {
  if (reservierungId) {
    await prisma.reservierung.deleteMany({ where: { id: reservierungId } });
  }
  if (gastId) {
    await prisma.gast.deleteMany({ where: { id: gastId } });
  }
  if (tischIds.length) {
    await prisma.tisch.deleteMany({ where: { id: { in: tischIds } } });
  }
  await prisma.$disconnect();
});

describe("Tischvalidierung", () => {
  it("akzeptiert vollständige Tischstammdaten", () => {
    assert.deepEqual(
      validateTischInput({
        nummer: "90",
        kapazitaet: "6",
        bereich: "terrasse",
        verfuegbar: "on",
        rasterZeile: "5",
        rasterSpalte: "3",
      }),
      {
        nummer: 90,
        kapazitaet: 6,
        bereich: "terrasse",
        verfuegbar: true,
        rasterZeile: 5,
        rasterSpalte: 3,
      },
    );
  });

  it("lehnt ungültige Werte und deaktivierte Innentische ab", () => {
    assert.throws(
      () =>
        validateTischInput({
          nummer: 0,
          kapazitaet: 0,
          bereich: "dach",
          rasterZeile: 0,
          rasterSpalte: 0,
        }),
      TischValidationError,
    );
    assert.throws(
      () =>
        validateTischInput({
          nummer: 90,
          kapazitaet: 4,
          bereich: "innen",
          verfuegbar: false,
          rasterZeile: 5,
          rasterSpalte: 3,
        }),
      TischValidationError,
    );
  });
});

describe("Tischpersistenz, Rechte und Standorttrennung", () => {
  it("verwaltet Stammdaten standortbezogen und Status operativ", async () => {
    const managerKreuzberg = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const managerSpandau = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-spandau-renate" },
    });
    const input = validateTischInput({
      nummer: testNummer,
      kapazitaet: 4,
      bereich: "terrasse",
      verfuegbar: true,
      rasterZeile: 20,
      rasterSpalte: 20,
    });
    const kreuzberg = await createTisch(
      managerKreuzberg,
      "kreuzberg",
      input,
    );
    tischIds.push(kreuzberg.id);
    const spandau = await createTisch(managerSpandau, "spandau", input);
    tischIds.push(spandau.id);

    assert.equal(kreuzberg.nummer, spandau.nummer);
    assert.notEqual(kreuzberg.standortId, spandau.standortId);

    await assert.rejects(
      createTisch(managerKreuzberg, "kreuzberg", input),
      TischValidationError,
    );

    const status = await updateTischStatus(
      kreuzberg.id,
      "besetzt",
      managerKreuzberg,
      "kreuzberg",
    );
    assert.equal(status.status, "besetzt");

    await assert.rejects(
      updateTischStatus(
        spandau.id,
        "frei",
        managerKreuzberg,
        "kreuzberg",
      ),
      TischValidationError,
    );

    await deleteTisch(kreuzberg.id, managerKreuzberg, "kreuzberg");
    tischIds.splice(tischIds.indexOf(kreuzberg.id), 1);
    await deleteTisch(spandau.id, managerSpandau, "spandau");
    tischIds.splice(tischIds.indexOf(spandau.id), 1);
  });

  it("verweigert Bedienungen die Stammdatenpflege", async () => {
    await assert.rejects(
      createTisch(
        {
          id: "manipulierte-bedienung",
          rolle: Rolle.bedienung,
          standortId: "kreuzberg",
        },
        "kreuzberg",
        validateTischInput({
          nummer: testNummer,
          kapazitaet: 2,
          bereich: "innen",
          verfuegbar: true,
          rasterZeile: 20,
          rasterSpalte: 20,
        }),
      ),
      BerechtigungsFehler,
    );
  });

  it("blockiert Terrassendeaktivierung bei offener zukünftiger Reservierung", async () => {
    const manager = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const input = validateTischInput({
      nummer: testNummer + 1,
      kapazitaet: 4,
      bereich: "terrasse",
      verfuegbar: true,
      rasterZeile: 20,
      rasterSpalte: 19,
    });
    const tisch = await createTisch(manager, "kreuzberg", input);
    tischIds.push(tisch.id);
    const gast = await createGast(
      validateGastInput({ name: "Terrassentest", telefon }),
    );
    gastId = gast.id;
    const reservierung = await createReservierung(
      manager,
      "kreuzberg",
      validateReservierungInput({
        standortId: "kreuzberg",
        tischId: tisch.id,
        gastTelefon: telefon,
        datum: "2099-08-15",
        uhrzeit: "19:00",
        personenzahl: 2,
      }),
    );
    reservierungId = reservierung.id;

    const grundriss = await listTische("kreuzberg", "2026-07-25");
    const tischMitReservierung = grundriss.find((eintrag) => eintrag.id === tisch.id);
    assert.equal(tischMitReservierung?.reservierungen.length, 1);
    assert.equal(tischMitReservierung?.reservierungen[0].gast.name, "Terrassentest");
    assert.equal(tischMitReservierung?.reservierungen[0].datum, "2099-08-15");
    assert.ok(grundriss.every((eintrag) => eintrag.standortId === "kreuzberg"));

    await assert.rejects(
      updateTisch(
        tisch.id,
        manager,
        "kreuzberg",
        { ...input, verfuegbar: false },
        "2026-07-25",
      ),
      TischValidationError,
    );
    await assert.rejects(
      deleteTisch(tisch.id, manager, "kreuzberg"),
      TischValidationError,
    );

    await prisma.reservierung.delete({ where: { id: reservierung.id } });
    reservierungId = undefined;
    const ohneReservierung = await listTische("kreuzberg", "2026-07-25");
    assert.equal(ohneReservierung.find((eintrag) => eintrag.id === tisch.id)?.reservierungen.length, 0);
    const deaktiviert = await updateTisch(
      tisch.id,
      manager,
      "kreuzberg",
      { ...input, verfuegbar: false },
      "2026-07-25",
    );
    assert.equal(deaktiviert.verfuegbar, false);
    await assert.rejects(
      createReservierung(
        manager,
        "kreuzberg",
        validateReservierungInput({
          standortId: "kreuzberg",
          tischId: tisch.id,
          gastTelefon: telefon,
          datum: "2099-08-16",
          uhrzeit: "19:00",
          personenzahl: 2,
        }),
      ),
      ReservierungValidationError,
    );
    await prisma.gast.delete({ where: { id: gast.id } });
    gastId = undefined;
    await deleteTisch(tisch.id, manager, "kreuzberg");
    tischIds.splice(tischIds.indexOf(tisch.id), 1);
  });
});
