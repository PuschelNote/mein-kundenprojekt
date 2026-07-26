import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import { createGast, deleteGast, validateGastInput } from "../lib/gaeste";
import { prisma } from "../lib/prisma";
import {
  createReservierung,
  formatiereUhrzeit,
  ReservierungValidationError,
  updateReservierung,
  updateReservierungStatus,
  validateReservierungInput,
} from "../lib/reservierungen";
import { istReservierungstagWaehbar } from "../app/reservierungen/reservierungs-kalender";

const telefon = `+4931${String(Date.now()).slice(-8)}`;
const neueTelefonnummer = `+4932${String(Date.now()).slice(-8)}`;
let gastId: string | undefined;
let reservierungId: string | undefined;
const testTischId = `test-reservierungstisch-${Date.now()}`;

before(async () => {
  await prisma.tisch.create({ data: { id: testTischId, nummer: 901, kapazitaet: 10, status: "frei", bereich: "innen", verfuegbar: true, rasterZeile: 19, rasterSpalte: 19, vorlaeufig: false, standortId: "kreuzberg" } });
});

after(async () => {
  if (reservierungId) {
    await prisma.reservierung.deleteMany({ where: { id: reservierungId } });
  }
  if (gastId) {
    await prisma.gast.deleteMany({ where: { id: gastId } });
  }
  await prisma.tisch.deleteMany({ where: { id: testTischId } });
  await prisma.$disconnect();
});

describe("Reservierungsvalidierung", () => {
  it("markiert im Kalender nur zukünftige Öffnungstage als auswählbar", () => {
    const kreuzberg = ["dienstag", "mittwoch", "donnerstag", "freitag", "samstag", "sonntag"];
    const spandau = ["donnerstag", "freitag", "samstag", "sonntag"];
    assert.equal(istReservierungstagWaehbar("2026-07-27", "2026-07-26", kreuzberg), false);
    assert.equal(istReservierungstagWaehbar("2026-07-28", "2026-07-26", kreuzberg), true);
    assert.equal(istReservierungstagWaehbar("2026-07-28", "2026-07-26", spandau), false);
    assert.equal(istReservierungstagWaehbar("2026-07-25", "2026-07-26", kreuzberg), false);
  });

  it("wandelt eine gültige lokale Uhrzeit in Minuten um", () => {
    const input = validateReservierungInput({
      standortId: "kreuzberg",
      tischId: testTischId,
      gastTelefon: "+49 (31) 123-4567",
      datum: "2098-08-15",
      uhrzeit: "18:30",
      personenzahl: "4",
    });

    assert.equal(input.uhrzeitMinute, 18 * 60 + 30);
    assert.equal(input.gastTelefonNormalisiert, "+49311234567");
    assert.equal(formatiereUhrzeit(input.uhrzeitMinute), "18:30");
  });

  it("lehnt fehlende Pflichtwerte und ungültige Kalenderdaten ab", () => {
    assert.throws(
      () => validateReservierungInput({ tischId: "tisch-kreuzberg-1", gastTelefon: telefon, datum: "2026-08-15", uhrzeit: "18:00", personenzahl: 2 }),
      ReservierungValidationError,
    );
    assert.throws(
      () =>
        validateReservierungInput({
          standortId: "kreuzberg",
          tischId: "",
          gastTelefon: telefon,
          datum: "2026-02-30",
          uhrzeit: "25:00",
          personenzahl: 0,
        }),
      ReservierungValidationError,
    );
    assert.throws(
      () =>
        validateReservierungInput({
          standortId: "kreuzberg",
          tischId: "tisch-kreuzberg-1",
          gastTelefon: telefon,
          datum: "2026-02-30",
          uhrzeit: "18:00",
          personenzahl: 2,
        }),
      ReservierungValidationError,
    );
  });
});

describe("Reservierungspersistenz und Standorttrennung", () => {
  it("speichert Gast, Tisch, Standort und Ersteller nachvollziehbar", async () => {
    const gast = await createGast(
      validateGastInput({ name: "Reservierungsgast", telefon }),
    );
    gastId = gast.id;
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const input = validateReservierungInput({
      standortId: "kreuzberg",
      tischId: testTischId,
      gastTelefon: telefon,
      datum: "2098-08-15",
      uhrzeit: "19:15",
      personenzahl: 4,
    });

    const reservierung = await createReservierung(
      mitarbeiter,
      "kreuzberg",
      input,
    );
    reservierungId = reservierung.id;

    assert.equal(reservierung.standortId, "kreuzberg");
    assert.equal(reservierung.tischId, testTischId);
    assert.equal(reservierung.gastId, gast.id);
    assert.equal(reservierung.erstelltVonId, mitarbeiter.id);
    assert.equal(reservierung.status, "offen");
    assert.ok(reservierung.erstelltAm instanceof Date);
    assert.equal(
      await prisma.gast.count({ where: { telefonNormalisiert: telefon } }),
      1,
    );

    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "inhaber-marcello" },
    });
    const updated = await updateReservierung(
      reservierung.id,
      inhaber,
      "kreuzberg",
      validateReservierungInput({
        standortId: "kreuzberg",
        tischId: "tisch-kreuzberg-4",
        gastTelefon: "",
        gastTelefonOptional: true,
        datum: "2098-08-16",
        uhrzeit: "20:30",
        personenzahl: 5,
      }),
    );
    assert.equal(updated.tischId, "tisch-kreuzberg-4");
    assert.equal(updated.gastId, gast.id);
    assert.equal(updated.erstelltVonId, mitarbeiter.id);
    assert.equal(updated.geaendertVonId, inhaber.id);

    const storniert = await updateReservierungStatus(
      reservierung.id,
      "storniert",
      mitarbeiter,
      "kreuzberg",
    );
    assert.equal(storniert.status, "storniert");
    assert.equal(storniert.geaendertVonId, mitarbeiter.id);

    const wiederGeoeffnet = await updateReservierungStatus(
      reservierung.id,
      "offen",
      inhaber,
      "kreuzberg",
    );
    assert.equal(wiederGeoeffnet.status, "offen");
    assert.equal(wiederGeoeffnet.geaendertVonId, inhaber.id);

    await assert.rejects(
      updateReservierungStatus(
        reservierung.id,
        "storniert",
        {
          id: "manager-spandau-renate",
          rolle: Rolle.manager,
          standortId: "spandau",
        },
        "spandau",
      ),
      ReservierungValidationError,
    );

    await prisma.reservierung.delete({ where: { id: reservierung.id } });
    reservierungId = undefined;
    await deleteGast(gast.id);
    gastId = undefined;
  });

  it("legt einen unbekannten Gast atomar mit der Reservierung an", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const input = validateReservierungInput({
      standortId: "kreuzberg",
      tischId: "tisch-kreuzberg-2",
      gastName: "Neuer Reservierungsgast",
      gastTelefon: neueTelefonnummer,
      datum: "2098-08-19",
      uhrzeit: "18:45",
      personenzahl: 3,
    });

    const reservierung = await createReservierung(
      mitarbeiter,
      "kreuzberg",
      input,
    );
    reservierungId = reservierung.id;
    gastId = reservierung.gastId;
    const gast = await prisma.gast.findUniqueOrThrow({
      where: { id: reservierung.gastId },
    });

    assert.equal(gast.name, "Neuer Reservierungsgast");
    assert.equal(gast.telefonNormalisiert, neueTelefonnummer);

    await prisma.reservierung.delete({ where: { id: reservierung.id } });
    reservierungId = undefined;
    await deleteGast(gast.id);
    gastId = undefined;
  });

  it("legt ohne Namen weder unbekannten Gast noch Reservierung an", async () => {
    const unbekannteTelefonnummer = `+4933${String(Date.now()).slice(-8)}`;
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const input = validateReservierungInput({
      standortId: "kreuzberg",
      tischId: "tisch-kreuzberg-2",
      gastTelefon: unbekannteTelefonnummer,
      datum: "2098-08-19",
      uhrzeit: "20:00",
      personenzahl: 2,
    });

    await assert.rejects(
      createReservierung(mitarbeiter, "kreuzberg", input),
      ReservierungValidationError,
    );
    assert.equal(
      await prisma.gast.count({
        where: { telefonNormalisiert: unbekannteTelefonnummer },
      }),
      0,
    );
  });

  it("weist einen Tisch eines anderen Standorts serverseitig ab", async () => {
    const gast = await createGast(
      validateGastInput({ name: "Standorttest", telefon }),
    );
    gastId = gast.id;
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({
      where: { id: "manager-kreuzberg-giuseppe" },
    });
    const input = validateReservierungInput({
      standortId: "kreuzberg",
      tischId: "tisch-spandau-1",
      gastTelefon: telefon,
      datum: "2098-08-16",
      uhrzeit: "19:00",
      personenzahl: 2,
    });

    await assert.rejects(
      createReservierung(mitarbeiter, "kreuzberg", input),
      ReservierungValidationError,
    );
    await assert.rejects(
      createReservierung(mitarbeiter, "kreuzberg", { ...input, standortId: "spandau", tischId: "tisch-kreuzberg-1" }),
      ReservierungValidationError,
    );

    assert.equal(
      await prisma.reservierung.count({ where: { gastId: gast.id } }),
      0,
    );
    await deleteGast(gast.id);
    gastId = undefined;
  });

  it("weist einen Mitarbeiter eines anderen Standortkontexts ab", async () => {
    await assert.rejects(
      createReservierung(
        {
          id: "manager-spandau-renate",
          rolle: Rolle.manager,
          standortId: "spandau",
        },
        "kreuzberg",
        {
          standortId: "kreuzberg",
          tischId: "tisch-kreuzberg-1",
          gastName: "",
          gastTelefon: telefon,
          gastTelefonNormalisiert: telefon,
          datum: "2026-08-17",
          uhrzeitMinute: 18 * 60,
          personenzahl: 2,
        },
      ),
      ReservierungValidationError,
    );
  });

  it("erzwingt zwei Stunden ohne Überschneidung, Tischkapazität, Öffnungszeiten und Zukunft", async () => {
    const mitarbeiter = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "manager-kreuzberg-giuseppe" } });
    const testTelefon = `+4935${String(Date.now()).slice(-8)}`;
    const gast = await createGast(validateGastInput({ name: "Zeitfenster-Testgast", telefon: testTelefon }));
    const ids: string[] = [];
    const eingabe = (tischId: string, datum: string, uhrzeit: string, personenzahl = 2) => validateReservierungInput({
      standortId: "kreuzberg", tischId, gastTelefon: testTelefon, datum, uhrzeit, personenzahl,
    });
    try {
      const erste = await createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-3", "2099-08-15", "18:00"), new Date("2099-08-15T15:00:00.000Z"));
      ids.push(erste.id);
      await assert.rejects(createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-3", "2099-08-15", "19:59"), new Date("2099-08-15T15:00:00.000Z")), ReservierungValidationError);
      const anschliessend = await createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-3", "2099-08-15", "20:00"), new Date("2099-08-15T15:00:00.000Z"));
      ids.push(anschliessend.id);
      await assert.rejects(createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-1", "2099-08-15", "18:00", 3), new Date("2099-08-15T15:00:00.000Z")), ReservierungValidationError);
      await assert.rejects(createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-4", "2099-08-15", "22:00"), new Date("2099-08-15T15:00:00.000Z")), ReservierungValidationError);
      await assert.rejects(createReservierung(mitarbeiter, "kreuzberg", eingabe("tisch-kreuzberg-4", "2099-08-15", "18:00"), new Date("2099-08-16T10:00:00.000Z")), ReservierungValidationError);
    } finally {
      await prisma.reservierung.deleteMany({ where: { id: { in: ids } } });
      await prisma.gast.delete({ where: { id: gast.id } });
    }
  });

  it("erlaubt einer standortoffenen Bedienung Vorgänge im explizit aktiven Standort", async () => {
    const sofia = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "bedienung-sofia" } });
    const offeneTelefonnummer = `+4934${String(Date.now()).slice(-8)}`;
    const reservierung = await createReservierung(
      sofia,
      "spandau",
      validateReservierungInput({
        standortId: "spandau",
        tischId: "tisch-spandau-1",
        gastName: "Standortoffener Testgast",
        gastTelefon: offeneTelefonnummer,
        datum: "2098-08-21",
        uhrzeit: "18:30",
        personenzahl: 2,
      }),
    );
    assert.equal(sofia.standortId, null);
    assert.equal(reservierung.standortId, "spandau");
    assert.equal(reservierung.erstelltVonId, sofia.id);
    await prisma.reservierung.delete({ where: { id: reservierung.id } });
    await prisma.gast.delete({ where: { id: reservierung.gastId } });
  });
});
