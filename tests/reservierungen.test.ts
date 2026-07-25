import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
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

const telefon = `+4931${String(Date.now()).slice(-8)}`;
const neueTelefonnummer = `+4932${String(Date.now()).slice(-8)}`;
let gastId: string | undefined;
let reservierungId: string | undefined;

after(async () => {
  if (reservierungId) {
    await prisma.reservierung.deleteMany({ where: { id: reservierungId } });
  }
  if (gastId) {
    await prisma.gast.deleteMany({ where: { id: gastId } });
  }
  await prisma.$disconnect();
});

describe("Reservierungsvalidierung", () => {
  it("wandelt eine gültige lokale Uhrzeit in Minuten um", () => {
    const input = validateReservierungInput({
      tischId: "tisch-kreuzberg-1",
      gastTelefon: "+49 (31) 123-4567",
      datum: "2026-08-15",
      uhrzeit: "18:30",
      personenzahl: "4",
    });

    assert.equal(input.uhrzeitMinute, 18 * 60 + 30);
    assert.equal(input.gastTelefonNormalisiert, "+49311234567");
    assert.equal(formatiereUhrzeit(input.uhrzeitMinute), "18:30");
  });

  it("lehnt fehlende Pflichtwerte und ungültige Kalenderdaten ab", () => {
    assert.throws(
      () =>
        validateReservierungInput({
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
      tischId: "tisch-kreuzberg-1",
      gastTelefon: telefon,
      datum: "2026-08-15",
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
    assert.equal(reservierung.tischId, "tisch-kreuzberg-1");
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
        tischId: "tisch-kreuzberg-2",
        gastTelefon: "",
        gastTelefonOptional: true,
        datum: "2026-08-16",
        uhrzeit: "20:30",
        personenzahl: 5,
      }),
    );
    assert.equal(updated.tischId, "tisch-kreuzberg-2");
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
      tischId: "tisch-kreuzberg-2",
      gastName: "Neuer Reservierungsgast",
      gastTelefon: neueTelefonnummer,
      datum: "2026-08-18",
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
      tischId: "tisch-kreuzberg-2",
      gastTelefon: unbekannteTelefonnummer,
      datum: "2026-08-18",
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
      tischId: "tisch-spandau-1",
      gastTelefon: telefon,
      datum: "2026-08-16",
      uhrzeit: "19:00",
      personenzahl: 2,
    });

    await assert.rejects(
      createReservierung(mitarbeiter, "kreuzberg", input),
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
});
