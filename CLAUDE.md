# CLAUDE.md - Bella Vista

## Projekt

Bella Vista ist eine Restaurant-App fuer zwei italienische Standorte in Berlin:
Kreuzberg und Spandau. Die App ersetzt Papierprozesse fuer Reservierungen,
Tischstatus, Bestellungen, Speisekarte, Gastprofile, Bella-Card und Abrechnung.

## Setup

- Arbeitsmodus: SOLO-Projekt nach Modus Operandi
- Source of Truth: Markdown im Repo, keine externen PM-Tools
- Strategische und fachliche Grundlage: `docs/SPEC_Marco Ferretti Bella Vista.md`
- Operative Feature-Registry: `docs/backlog.md`

## Was bauen wir?

Lies vor fachlichen Aenderungen:

1. `docs/SPEC_Marco Ferretti Bella Vista.md`
2. `docs/backlog.md`

## Tech-Stack + Standards

Lies `docs/architecture.md`.

Aktueller Stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- `sql.js` / SQLite-nahe lokale Datenhaltung
- Node-Test-Runner via `tsx --test`

## Architektur-Entscheidungen

Lies `docs/decisions.md`.

Neue Architektur- oder Produktentscheidungen werden dort als ADR ergaenzt.
Bestehende Entscheidungen nicht still ersetzen; bei Aenderungen eine neue ADR
anfuegen.

## Arbeitsweise

Lies `docs/modus-operandi.md`.

Session-Regel:

1. Kontext laden: Spec, Backlog, Architecture, Decisions und relevante Dateien.
2. Aufgabe auf Feature-ID oder klare neue Anforderung zurueckfuehren.
3. Bei groesseren Aenderungen kurz planen, dann implementieren.
4. Tests oder passende Pruefschritte ausfuehren.
5. Docs synchron halten: Backlog-Status, Decisions und Architecture nach Bedarf.

## Coding-Prinzipien

**Think Before Coding.** Annahmen explizit machen. Bei Widerspruch zwischen
Spezifikation, Backlog, Architektur und Code nachfragen oder Annahme
dokumentieren.

**Simplicity First.** Kleine, klare Module bevorzugen. Keine Abstraktionen ohne
aktuellen Nutzen.

**Surgical Changes.** Nur Dateien anfassen, die zur Aufgabe gehoeren.
Bestehende Nutzer- oder Agentenaenderungen nicht ungefragt zuruecksetzen.

**Goal-Driven Execution.** Akzeptanzkriterien aus dem Backlog als Ziel nutzen.
Bei Bugs erst reproduzierbaren Test oder klaren Pruefschritt definieren.

## Projektregeln

- Fachbegriffe aus der Spezifikation beibehalten.
- Standorttrennung zwischen Kreuzberg und Spandau nie aufweichen.
- Reservierungen brauchen immer einen expliziten Standort.
- Grillgerichte duerfen fuer Spandau nicht sichtbar oder bestellbar sein.
- Speisekarten- und Preisaenderungen bleiben dem Inhaber vorbehalten.
- Bella-Card-Rabatt wird ab 10 Besuchen automatisch angewendet.
- Besuchszaehler werden erst bei bezahlter Bestellung erhoeht.
- Kuechenschluss ist 30 Minuten vor Restaurantschluss.
- Historische Einzelpreise von Bestellpositionen duerfen sich nicht nachtraeglich aendern.
- Rollen und Berechtigungen serverseitig pruefen.
- Offline-Faehigkeit bei Architekturentscheidungen beruecksichtigen.

## Tests

- Standardtest: `npm test`
- Geschaeftsregeln, Berechtigungen und Abrechnung muessen durch Tests oder
  dokumentierte Pruefschritte abgesichert werden.

## Commits

Conventional Commits verwenden, moeglichst mit Feature-ID:

- `feat: F006 require location for reservations`
- `fix: F014 prevent grill items in spandau`
- `test: F011 cover bella card discount`
- `docs: align solo project docs`

## Gotchas

- `docs/decisions.md` hatte frueher eine Vite/Express-Empfehlung. Der reale
  Projektstand nutzt Next.js; ADR-002 ist massgeblich.
- Die Spezifikation enthaelt Sonderzeichen. Neue Dateien bleiben bevorzugt
  ASCII, solange kein fachlicher Grund dagegen spricht.
