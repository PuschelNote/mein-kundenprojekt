import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Rolle } from "../generated/prisma/enums";
import {
  assertBerechtigung,
  BerechtigungsFehler,
  hatBerechtigung,
} from "../lib/berechtigungen";

describe("Rollenbasierte Berechtigungen", () => {
  it("erlaubt operative Grundfunktionen für alle Rollen", () => {
    for (const rolle of Object.values(Rolle)) {
      assert.equal(hatBerechtigung(rolle, "reservierungen_verwalten"), true);
      assert.equal(hatBerechtigung(rolle, "bestellungen_aufnehmen"), true);
      assert.equal(hatBerechtigung(rolle, "tischstatus_sehen"), true);
    }
  });

  it("verweigert Bedienungen sensible Funktionen", () => {
    assert.equal(hatBerechtigung(Rolle.bedienung, "gastdaten_sehen"), false);
    assert.equal(
      hatBerechtigung(Rolle.bedienung, "bella_card_rabatt_vergeben"),
      false,
    );
    assert.equal(
      hatBerechtigung(Rolle.bedienung, "speisekarte_preise_bearbeiten"),
      false,
    );
    assert.equal(
      hatBerechtigung(Rolle.bedienung, "mitarbeiter_verwalten"),
      false,
    );
  });

  it("erlaubt Managern Gastdaten, Rabatt und Mitarbeiterverwaltung", () => {
    assert.equal(hatBerechtigung(Rolle.manager, "gastdaten_sehen"), true);
    assert.equal(
      hatBerechtigung(Rolle.manager, "bella_card_rabatt_vergeben"),
      true,
    );
    assert.equal(hatBerechtigung(Rolle.manager, "mitarbeiter_verwalten"), true);
    assert.equal(
      hatBerechtigung(Rolle.manager, "speisekarte_preise_bearbeiten"),
      false,
    );
  });

  it("erlaubt dem Inhaber alle definierten Fähigkeiten", () => {
    assert.equal(
      hatBerechtigung(Rolle.inhaber, "speisekarte_preise_bearbeiten"),
      true,
    );
    assert.equal(hatBerechtigung(Rolle.inhaber, "mitarbeiter_verwalten"), true);
  });

  it("wirft bei direkter unberechtigter Prüfung einen Fehler", () => {
    assert.throws(
      () => assertBerechtigung(Rolle.bedienung, "mitarbeiter_verwalten"),
      BerechtigungsFehler,
    );
  });
});
