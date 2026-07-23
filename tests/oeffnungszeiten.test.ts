import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatiereMinute,
  istRegulaerGeoeffnet,
  OeffnungszeitValidationError,
  type Zeitfenster,
  validateZeitfenster,
} from "../lib/oeffnungszeiten";

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
});
