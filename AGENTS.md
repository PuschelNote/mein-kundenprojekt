# AGENTS.md — Bella Vista Restaurant-App

## Projekt

Dieses Repository enthält die Bella-Vista-Restaurant-App für die Standorte
Kreuzberg und Spandau. Sie ersetzt papierbasierte Reservierungen, Bestellungen,
Tischverwaltung und das bisherige Treueprogramm.

## Verbindliche Dokumente

Lies vor Änderungen mindestens die für die Aufgabe relevanten Dokumente:

- `docs/spec.md` — fachliche Single Source of Truth; ersetzt ein PRD vollständig
- `docs/backlog.md` — Features, Phasen und Status mit stabilen IDs
- `docs/architecture.md` — technische Struktur, Qualitätsziele und offene Fragen
- `docs/decisions.md` — dauerhaft gültige fachliche und technische Entscheidungen
- `docs/modus-operandi.md` — Arbeitsweise für dieses Solo-Projekt

Eine `prd.md` wird nicht angelegt oder ausgewertet. Bei Widersprüchen zwischen
anderen Dokumenten und `docs/spec.md` gilt die Spec, bis eine bewusst
dokumentierte Entscheidung die Spec aktualisiert.

## Arbeitsregeln

1. Vor dem Coden Ziel, Annahmen und prüfbare Akzeptanzkriterien benennen.
2. Nur den angeforderten Scope ändern; keine vorsorglichen Abstraktionen oder
   unaufgeforderten Architekturumbauten.
3. Geschäftsregeln aus `docs/spec.md` server- bzw. domänenseitig erzwingen und
   mit Tests absichern; UI-Prüfungen allein reichen nicht.
4. Standortdaten strikt trennen. Jede standortgebundene Entität trägt eine
   eindeutige Standortreferenz.
5. Rollen und Berechtigungen nicht nur in der Oberfläche, sondern an jeder
   schreibenden Systemgrenze prüfen.
6. Offline-Fähigkeit bei Architektur- und Datenflussentscheidungen von Beginn
   an berücksichtigen.
7. Keine Secrets, echten Telefonnummern oder sonstigen personenbezogenen
   Produktionsdaten committen. Beispiele müssen erfunden oder anonymisiert sein.
8. Bestehenden Stil beibehalten und nur Dateien anfassen, die für die Aufgabe
   erforderlich sind.

## Feature-Workflow

1. Passende ID in `docs/backlog.md` wählen oder die nächste freie `BV-NNN`-ID
   ergänzen; IDs werden nie neu vergeben.
2. Bei komplexen Features vorab `docs/concepts/BV-NNN-kurzname.md` anlegen.
3. Implementieren und durch passende automatisierte sowie manuelle Tests prüfen.
4. Backlog-Status und betroffene Dokumentation im selben Arbeitsgang aktualisieren.
5. Dauerhafte Architektur- oder Produktentscheidungen in `docs/decisions.md`
   ergänzen und, falls fachlich relevant, in `docs/spec.md` nachziehen.
6. **Vor jedem Commit** die Änderung dokumentieren: getroffene Entscheidungen in
   `docs/decisions.md` ergänzen und den Status aller betroffenen Feature-IDs in
   `docs/backlog.md` aktualisieren. Erst danach darf committed werden.
7. Conventional Commits verwenden, möglichst mit Feature-ID, zum Beispiel
   `feat: BV-003 Tischstatus verwalten`.

## Definition of Done

- Akzeptanzkriterien sind erfüllt und nachvollziehbar geprüft.
- Relevante Tests laufen erfolgreich; neue Geschäftslogik ist abgedeckt.
- Berechtigungen, Standorttrennung und Offline-Verhalten wurden berücksichtigt.
- `docs/backlog.md`, `docs/architecture.md`, `docs/decisions.md` und
  `docs/spec.md` sind bei Bedarf synchronisiert.
- Die Änderung ist vor dem Commit in `docs/decisions.md` dokumentiert und der
  Status aller betroffenen IDs in `docs/backlog.md` ist aktuell.
- Keine Secrets, Produktionsdaten, Debug-Ausgaben oder unbeabsichtigten Dateien
  sind Teil der Änderung.
