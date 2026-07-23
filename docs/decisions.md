# Entscheidungen — Bella Vista Restaurant-App

_Chronologisch. Neue Einträge unten ergänzen; bestehende Entscheidungen nicht
lautlos umschreiben._

## 2026-07-23 — `docs/spec.md` ersetzt das PRD

- **Status:** angenommen
- **Kontext:** Für das Projekt existiert bereits eine detaillierte fachliche Spec.
- **Entscheidung:** Es wird keine `prd.md` geführt. `docs/spec.md` ist die
  fachliche Single Source of Truth und übernimmt die strategische Rolle des PRD.
- **Konsequenz:** Arbeitsanweisungen und Dokumente verweisen auf `spec.md`.

## 2026-07-23 — Solo-Dokumentationsmodell

- **Status:** angenommen
- **Kontext:** Das Projekt wird von einer Person mit AI-Unterstützung umgesetzt.
- **Entscheidung:** Es gibt keine Team-Missionen, Meeting-Ordner, Results-Ordner
  oder INBOX. Status und Arbeitsfluss leben in Spec, Backlog, Konzepten,
  Architektur, Entscheidungen und Git-Historie.
- **Konsequenz:** Zusätzliche Koordinationsartefakte werden erst eingeführt, wenn
  ein reales Problem sie rechtfertigt.

## 2026-07-23 — Standort ist eine harte Datengrenze

- **Status:** angenommen
- **Kontext:** Fehlende Standortangaben verursachten bereits eine Doppelbuchung;
  außerdem unterscheiden sich Karten, Tische und Öffnungszeiten.
- **Entscheidung:** Jede standortgebundene Operation und Entität trägt eine
  explizite Standort-ID. Sichtbare Tischnummern sind nur innerhalb eines
  Standorts eindeutig.
- **Konsequenz:** Datenmodell, Abfragen, Tests und Oberfläche behandeln den
  Standort nicht als optionalen Filter.

## 2026-07-23 — Preise werden auf Bestellpositionen historisiert

- **Status:** angenommen
- **Kontext:** Kartenpreise können sich ändern, abgeschlossene Abrechnungen
  müssen jedoch reproduzierbar bleiben.
- **Entscheidung:** Jede Bestellposition speichert den beim Hinzufügen gültigen
  Einzelpreis; spätere Kartenänderungen verändern bestehende Bestellungen nicht.
- **Konsequenz:** Summen werden aus Positionspreisen berechnet, nicht aus dem
  aktuellen Gerichtspreis.

## 2026-07-23 — Offline-Fähigkeit ist Architekturvorgabe

- **Status:** angenommen
- **Kontext:** Die App darf bei einem Internetausfall im Restaurant nicht
  zusammenbrechen.
- **Entscheidung:** Kernabläufe werden offline-first geplant. Schreibvorgänge
  benötigen stabile IDs, lokale Persistenz, idempotente Synchronisation und
  explizite Konfliktregeln.
- **Konsequenz:** Ein reiner Online-Client ohne lokale Schreibfähigkeit erfüllt
  die Spec nicht.

## 2026-07-23 — Next.js, Prisma und SQLite als initialer Stack

- **Status:** angenommen
- **Kontext:** Das Projekt benötigt ein schlankes, typsicheres Grundgerüst für
  Oberfläche, serverseitige Geschäftslogik und lokale relationale Persistenz.
- **Entscheidung:** Die Anwendung verwendet Next.js 16 mit App Router, React 19,
  TypeScript 6 im Strict Mode, Prisma ORM 7 und lokales SQLite über den offiziellen
  `@prisma/adapter-better-sqlite3`. ESLint 9 übernimmt die statische Prüfung.
- **Alternativen:** Ein getrenntes Frontend/Backend und eine zentrale PostgreSQL-
  Datenbank wurden für den Projektstart nicht gewählt, weil sie zusätzliche
  Betriebs- und Deployment-Komplexität erzeugen.
- **Konsequenz:** Prisma-Schema und Migrationen sind die versionierte Datenbank-
  Wahrheit. Lokale `.env`- und Datenbankdateien werden nicht committed. SQLite
  erfüllt allein noch keine Mehrgeräte-Synchronisation; dafür bleibt eine eigene
  Architekturentscheidung erforderlich.

## 2026-07-23 — Dokumentation ist verpflichtender Pre-Commit-Schritt

- **Status:** angenommen
- **Kontext:** Code, Entscheidungen und operativer Feature-Status sollen nicht
  auseinanderlaufen.
- **Entscheidung:** Vor jedem Commit werden relevante Entscheidungen in dieser
  Datei ergänzt und die betroffenen Feature-Status in `backlog.md` aktualisiert.
- **Konsequenz:** Ein Commit ist erst bereit, wenn Implementierung und
  Projektdokumentation denselben Stand abbilden.
