import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import {
  formatiereMinute,
  istRegulaerGeoeffnet,
  OeffnungszeitValidationError,
  type Zeitfenster,
  validateZeitfenster,
  validateFeiertagsOeffnungszeitInput,
  upsertFeiertagsOeffnungszeit,
  getEffektiveOeffnungszeit,
  deleteFeiertagsOeffnungszeit,
} from "../lib/oeffnungszeiten";

after(() => prisma.$disconnect());

const kreuzberg: Zeitfenster[] = [
  { wochentag: "dienstag", oeffnetMinute: 17 * 60, schliesstMinute: 23 * 60 },
];
const spandau: Zeitfenster[] = [
  { wochentag: "donnerstag", oeffnetMinute: 17 * 60, schliesstMinute: 22 * 60 },
];

describe("Standardöffnungszeiten", () => {
  it("erkennt geöffnete Zeiten für beide Standorte", () => {
    assert.equal(istRegulaerGeoeffnet(kreuzberg, "dienstag", 18 * 60), true);
    assert.equal(istRegulaerGeoeffnet(spandau, "donnerstag", 18 * 60), true);
  });

  it("behandelt fehlende Wochentage als geschlossen", () => {
    assert.equal(istRegulaerGeoeffnet(kreuzberg, "montag", 18 * 60), false);
    assert.equal(istRegulaerGeoeffnet(spandau, "mittwoch", 18 * 60), false);
  });

  it("schließt exakt zur Schließzeit", () => {
    assert.equal(istRegulaerGeoeffnet(kreuzberg, "dienstag", 23 * 60), false);
    assert.equal(istRegulaerGeoeffnet(spandau, "donnerstag", 22 * 60), false);
  });

  it("formatiert Minuten als Uhrzeit", () => {
    assert.equal(formatiereMinute(17 * 60), "17:00");
    assert.equal(formatiereMinute(22 * 60 + 30), "22:30");
  });

  it("lehnt ungültige Zeitfenster ab", () => {
    assert.throws(
      () => validateZeitfenster(23 * 60, 17 * 60),
      OeffnungszeitValidationError,
    );
  });

  it("verwendet Inhaber-Overrides vor Standardzeiten und stellt den Fallback wieder her", async () => {
    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "inhaber-marcello" } });
    const datum = "2099-08-17";
    const override = await upsertFeiertagsOeffnungszeit(inhaber, validateFeiertagsOeffnungszeitInput({ standortId: "kreuzberg", datum, oeffnet: "12:00", schliesst: "20:00" }));
    assert.deepEqual(await getEffektiveOeffnungszeit("kreuzberg", datum), { oeffnetMinute: 720, schliesstMinute: 1200, quelle: "feiertag" });
    await assert.rejects(upsertFeiertagsOeffnungszeit({ id: "manager-kreuzberg-giuseppe", rolle: Rolle.manager }, validateFeiertagsOeffnungszeitInput({ standortId: "kreuzberg", datum, geschlossen: "on" })));
    await deleteFeiertagsOeffnungszeit(override.id, inhaber);
    assert.equal(await getEffektiveOeffnungszeit("kreuzberg", datum), null);
  });

  it("bildet einen explizit geschlossenen Feiertag ab", async () => {
    const inhaber = await prisma.mitarbeiter.findUniqueOrThrow({ where: { id: "inhaber-marcello" } });
    const datum = "2099-08-15";
    const override = await upsertFeiertagsOeffnungszeit(inhaber, validateFeiertagsOeffnungszeitInput({ standortId: "spandau", datum, geschlossen: "on" }));
    assert.equal(await getEffektiveOeffnungszeit("spandau", datum), null);
    await deleteFeiertagsOeffnungszeit(override.id, inhaber);
  });
});
