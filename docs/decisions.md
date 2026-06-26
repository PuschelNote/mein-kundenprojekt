# Architecture Decisions - Bella Vista Restaurant-App

Dieses Dokument haelt zentrale Produkt- und Architekturentscheidungen fest.
Neue Entscheidungen werden chronologisch ergaenzt. Bestehende ADRs nicht still
umschreiben; bei Aenderungen eine neue ADR anlegen.

## ADR-001 - Lokale relationale Datenhaltung fuer den MVP

- **Status:** Akzeptiert
- **Datum:** 2026-06-26

### Kontext

Bella Vista verwaltet Reservierungen, Tische, Bestellungen, Gaeste,
Mitarbeitende, Speisekarten und Abrechnung. Diese Daten haben klare Beziehungen
und muessen auch bei eingeschraenkter Internetverbindung nutzbar bleiben.

### Entscheidung

Der MVP nutzt eine relationale, SQLite-nahe lokale Datenhaltung. Im aktuellen
Projektstand wird dafuer `sql.js` eingesetzt.

### Begruendung

- Das relationale Modell passt zu den spezifizierten Entitaeten und
  Kardinalitaeten.
- Lokale Datenhaltung reduziert Abhaengigkeit von externen Cloud-Systemen.
- `sql.js` ist fuer Kurs-, Demo- und Testkontext einfach in einem
  Next.js/TypeScript-Projekt nutzbar.

### Konsequenzen

- Mehrgeraete-Synchronisation ist damit noch nicht geloest.
- Persistenz- und Backup-Strategie muessen vor produktivem Einsatz konkret
  entschieden werden.
- Geschaeftsregeln muessen in Services und Tests abgesichert werden, nicht nur
  in UI-Komponenten.

## ADR-002 - Next.js statt Vite/Express als aktueller App-Stack

- **Status:** Akzeptiert
- **Datum:** 2026-06-26
- **Ersetzt:** fruehere vorgeschlagene Vite/Express-Empfehlung

### Kontext

Die vorhandene Codebasis enthaelt bereits ein Next.js-Projekt mit App Router,
TypeScript, Tailwind CSS, Server Actions und `sql.js`. Eine aeltere
Entscheidungsnotiz hatte noch React/Vite plus Express als Empfehlung genannt,
was nicht mehr dem realen Projektstand entspricht.

### Entscheidung

Der dokumentierte aktuelle Stack ist:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Server Actions und bei Bedarf Route Handler
- `sql.js` / SQLite-nahe lokale Datenhaltung
- Tests mit `tsx --test`

### Begruendung

- Der Stack ist bereits im Repo angelegt.
- Next.js reicht fuer Frontend und serverseitige App-Logik in einem kleinen
  Projekt aus.
- Ein separates Express-Backend wuerde aktuell mehr Struktur und Deployment-
  Aufwand erzeugen, ohne ein klares MVP-Problem zu loesen.

### Konsequenzen

- `docs/architecture.md`, `CLAUDE.md` und `AGENTS.md` muessen Next.js als
  aktuellen Stack fuehren.
- Neue Backendlogik gehoert in Services und wird ueber Server Actions oder
  Route Handler angebunden.
- Falls spaeter ein separates Backend erforderlich wird, braucht es eine neue
  ADR mit Migrationsplan.

## ADR-003 - SOLO-Modus nach Modus Operandi

- **Status:** Akzeptiert
- **Datum:** 2026-06-26

### Kontext

Das Projekt soll nach der Methodik aus `github.com/jacekzawisza/modus-operandi`
als SOLO-Projekt eingerichtet werden. Es gibt eine fachliche Spezifikation und
bereits mehr als 15 Features, daher ist ein Backlog mit stabilen IDs sinnvoll.

### Entscheidung

Das Projekt nutzt folgende SOLO-Artefakte:

- `CLAUDE.md`
- `AGENTS.md`
- `docs/SPEC_Marco Ferretti Bella Vista.md`
- `docs/backlog.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `docs/modus-operandi.md`
- `docs/concepts/`
- `docs/audit/`

`docs/INBOX.md` wird nicht angelegt, solange keine parallelen Doc-Edits ueber
mehrere Worktrees oder Maschinen auftreten.

### Begruendung

- Die Methodik trennt strategischen Scope, operative Featureliste,
  Architekturentscheidungen und Ergebnisse.
- Markdown im Repo ist fuer Coding-Agenten direkt lesbar.
- Das Backlog hat bereits stabile Feature-IDs, Phase und Status.

### Konsequenzen

- Vor fachlichen Aenderungen werden Spezifikation und Backlog gelesen.
- Nach relevanten Aenderungen werden Doku und Tests synchronisiert.
- Feature-Commits sollen nach Moeglichkeit die Feature-ID referenzieren.

## Vorlage fuer neue Architekturentscheidungen

## ADR-XXX - Titel der Entscheidung

- **Status:** Vorgeschlagen | Akzeptiert | Abgelehnt | Ersetzt
- **Datum:** YYYY-MM-DD
- **Ersetzt:** ADR-XXX, falls zutreffend

### Kontext

Welche fachliche oder technische Situation macht die Entscheidung notwendig?

### Entscheidung

Welche konkrete Entscheidung wurde getroffen?

### Begruendung

Warum wurde diese Option gewaehlt? Welche Alternativen wurden betrachtet?

### Konsequenzen

Welche Auswirkungen, Risiken oder Folgeschritte entstehen durch diese
Entscheidung?
