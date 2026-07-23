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

## 2026-07-23 — Mitarbeiter als standortgebundene Entität

- **Status:** angenommen
- **Kontext:** `BV-001` verlangt für jeden Mitarbeiter ID, Name, Standort und
  genau eine der drei Rollen. Das vollständige Standortfeature `BV-002` folgt
  erst anschließend, die Relation ist jedoch bereits für `BV-001` erforderlich.
- **Entscheidung:** `Mitarbeiter` referenziert verpflichtend einen minimalen
  `Standort`-Datensatz. Kreuzberg und Spandau werden idempotent als Grunddaten
  angelegt. Rollen werden als Prisma-Enum `bedienung`, `manager` und `inhaber`
  gespeichert.
- **Konsequenz:** Die Datenbank verhindert Mitarbeiter ohne gültigen Standort
  oder Rolle. Der globale Standortkontext und weitere Standortlogik bleiben
  weiterhin Scope von `BV-002`.

## 2026-07-23 — Mitarbeiterverwaltung nutzt Server Actions

- **Status:** angenommen
- **Kontext:** Das erste CRUD-Feature soll ohne zusätzliche API-Schicht klein und
  serverseitig validiert bleiben.
- **Entscheidung:** `/mitarbeiter` verwendet Next.js Server Components und Server
  Actions. Validierung und Prisma-Zugriffe liegen unabhängig von der UI in
  `lib/mitarbeiter.ts`. Mitarbeiter können angelegt, bearbeitet und gelöscht
  werden; Standortlöschung bleibt durch die Datenbankrelation eingeschränkt.
- **Konsequenz:** Die Oberfläche ist kein Sicherheitsperimeter. Authentifizierung
  und Autorisierung werden später mit `BV-022` an der serverseitigen
  Anwendungsgrenze ergänzt.

## 2026-07-23 — Lokale CRUD-Integrationstests gegen SQLite

- **Status:** angenommen
- **Kontext:** Validierung allein beweist nicht, dass Prisma-Schema, Adapter und
  CRUD-Logik gemeinsam funktionieren.
- **Entscheidung:** Der eingebaute Node-Test-Runner wird über `tsx` ausgeführt.
  Tests prüfen Validierung und einen vollständigen Anlegen–Ändern–Löschen-Ablauf
  gegen die lokale SQLite-Datenbank. Testdatensätze tragen eindeutige Namen und
  werden wieder entfernt.
- **Konsequenz:** `npm test` setzt eine migrierte lokale Datenbank voraus, lässt
  aber keine Mitarbeiter-Testdaten zurück.

## 2026-07-23 — Expliziter Standortkontext im HTTP-only Cookie

- **Status:** angenommen
- **Kontext:** Fehlende oder implizite Standortannahmen haben im realen Betrieb
  bereits eine Doppelbuchung zwischen Kreuzberg und Spandau verursacht.
- **Entscheidung:** Der aktive Standort wird erst nach ausdrücklicher Auswahl in
  einem HTTP-only Cookie `bella-vista-standort` gespeichert. Ohne gültigen Cookie
  leiten standortgebundene Seiten nach `/standort` um. Zulässig sind nur die IDs
  `kreuzberg` und `spandau`, zusätzlich validiert gegen die Datenbank.
- **Alternativen:** Ein stiller Standardstandort und eine rein clientseitige
  Auswahl wurden verworfen, weil beide falsche oder manipulierbare Zuordnungen
  ermöglichen.
- **Konsequenz:** Künftige standortgebundene Server Actions müssen den zentralen
  Helper in `lib/standort.ts` verwenden. Das Cookie erleichtert Kontextführung,
  ersetzt aber weder Anmeldung noch Berechtigungsprüfung aus `BV-022`.

## 2026-07-23 — Standortwechsel erlaubt nur interne Rücksprungziele

- **Status:** angenommen
- **Kontext:** Nach der Standortwahl soll zur ursprünglich angeforderten Seite
  zurückgesprungen werden, ohne eine Open-Redirect-Schwachstelle einzuführen.
- **Entscheidung:** `returnTo` akzeptiert ausschließlich absolute interne Pfade,
  die mit genau einem `/` beginnen. Externe URLs, protokollrelative URLs und
  ungültige Werte fallen auf `/` zurück.
- **Konsequenz:** Standortauswahl bleibt komfortabel und kann nicht als
  Weiterleitung auf fremde Domains missbraucht werden.

## 2026-07-23 — Standardöffnungszeiten als Minuten seit Mitternacht

- **Status:** angenommen
- **Kontext:** Standardzeiten müssen angezeigt und später für Reservierungen und
  den Küchenannahmeschluss zuverlässig verglichen werden können. SQLite besitzt
  keinen eigenständigen Uhrzeittyp.
- **Entscheidung:** Pro Standort und geöffnetem Wochentag existiert genau ein
  `StandardOeffnungszeit`-Datensatz. Öffnungs- und Schließzeit werden als ganze
  Minuten seit Mitternacht gespeichert. Ein fehlender Wochentag bedeutet
  „geschlossen“.
- **Alternativen:** Freie Uhrzeitstrings und explizite Datensätze mit
  `geschlossen=true` wurden verworfen, weil sie zusätzliche Format- bzw.
  Konsistenzzustände erlauben würden.
- **Konsequenz:** Zeitfenster sind eindeutig vergleichbar. Die Domänenlogik
  validiert `0 <= Öffnung < Schließung <= 1440`; die Schließminute selbst gilt
  bereits als geschlossen.

## 2026-07-23 — Standardzeiten sind feste Grunddaten

- **Status:** angenommen
- **Kontext:** Die Spec nennt feste reguläre Zeiten; veränderliche Feiertage sind
  getrennt als `BV-016` vorgesehen.
- **Entscheidung:** Kreuzberg Di–So 17–23 Uhr und Spandau Do–So 17–22 Uhr werden
  idempotent über den Seed gepflegt und zunächst nur angezeigt.
- **Konsequenz:** `BV-020` enthält keine Bearbeitungsoberfläche. Feiertags-
  Overrides oder sonstige Ausnahmen verändern die Standarddatensätze später
  nicht, sondern überlagern sie datumsbezogen.

## 2026-07-23 — Stabile IDs für bekannte Standortmanager

- **Status:** angenommen
- **Kontext:** Die Spec benennt Giuseppe für Kreuzberg und Renate für Spandau.
  Wiederholtes Seeding bei Setup und Tests darf keine Duplikate erzeugen.
- **Entscheidung:** Beide Manager erhalten stabile technische IDs
  `manager-kreuzberg-giuseppe` und `manager-spandau-renate`. Das zentrale
  Grunddaten-Seeding verwendet Upserts mit leerem Update-Zweig.
- **Alternativen:** Namen als natürliche Schlüssel und ein Seed, der Datensätze
  bei jedem Lauf vollständig überschreibt, wurden verworfen. Namen sind nicht
  garantiert eindeutig; destruktive Updates würden bewusste Änderungen
  unbemerkt zurücksetzen.
- **Konsequenz:** Fehlende Manager werden reproduzierbar angelegt, vorhandene
  Datensätze aber nicht durch `npm test` oder `db:seed` überschrieben. Änderungen
  und Löschungen bleiben bis zur Berechtigungsumsetzung in `BV-022` möglich.

## 2026-07-23 — Standortfilterung erfolgt in Prisma-Abfragen

- **Status:** angenommen
- **Kontext:** Spätere Reservierungs- und Bestellabläufe dürfen keine Mitarbeiter
  eines anderen Standorts als Auswahl anbieten.
- **Entscheidung:** `lib/mitarbeiter.ts` stellt explizite Abfragen für Mitarbeiter
  und Manager eines Standorts bereit; der Filter wird als `where: { standortId }`
  an SQLite übergeben.
- **Konsequenz:** Künftige standortgebundene Formulare nutzen diese Abfragen mit
  dem validierten Standortkontext. Die administrative Mitarbeiterseite darf
  weiterhin beide Standorte zeigen und gruppiert sie serverseitig.
