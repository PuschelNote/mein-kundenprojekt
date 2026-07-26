# Architektur — Bella Vista Restaurant-App

_Stand: 26.07.2026_

## Zweck

Dieses Dokument beschreibt die technische Wahrheit des Projekts. Die fachliche
Wahrheit steht in [`spec.md`](spec.md).

## Gewählter Technologie-Stack

| Bereich | Technologie | Begründung |
|---|---|---|
| Anwendung | Next.js 16 mit App Router | Gemeinsame React-/Server-Anwendung, dateibasiertes Routing und serverseitige Geschäftslogik in einem Projekt. |
| Sprache | TypeScript 6 im Strict Mode | Statische Prüfung des Domänenmodells und der Schnittstellen; Version 6 ist mit der aktuellen Next.js-ESLint-Kette kompatibel. |
| Oberfläche | React 19, zunächst ohne UI-Framework | Das Setup bleibt klein; ein Design-System wird erst bei konkretem Bedarf gewählt. |
| Persistenz | SQLite | Lokale, dateibasierte SQL-Datenbank ohne separaten Datenbankdienst; passend für den Projektstart. |
| Datenzugriff | Prisma ORM 7 | Typsicherer Client, versionierbare Migrationen und ein explizites Schema. |
| SQLite-Treiber | `@prisma/adapter-better-sqlite3` | Offizieller Prisma-Adapter für lokales SQLite. |
| Qualität | ESLint 9 mit `eslint-config-next` | Next.js-, React-, TypeScript- und Core-Web-Vitals-Regeln. |

Die lokale Verbindung wird über `DATABASE_URL="file:./dev.db"` konfiguriert.
`.env` und die SQLite-Datei werden nicht versioniert; `.env.example`, Prisma-
Schema und Migrationen gehören ins Repository. Der generierte Prisma Client
liegt in `generated/prisma/`.

### Abgrenzung

SQLite ist für den aktuellen lokalen Projektstart gewählt, löst aber die in der
Spec geforderte Offline-Synchronisation zwischen mehreren Geräten nicht allein.
Vor einem Mehrgeräte- oder Cloud-Betrieb muss entschieden werden, ob SQLite nur
lokaler Client-Speicher bleibt oder die zentrale Persistenz durch einen
synchronisierbaren Dienst ersetzt wird. Diese Änderung muss über Prisma-
Migrationen und einen dokumentierten Datenmigrationsplan erfolgen.

## Qualitätsziele

1. **Offline arbeitsfähig:** Ein Internetausfall darf Reservierungs-, Tisch- und
   Bestellabläufe im Restaurant nicht zum Stillstand bringen.
2. **Standorttrennung:** Kreuzberg und Spandau teilen sich das System, aber keine
   standortgebundenen Tische, Karten, Reservierungen oder Bestellungen.
3. **Nachvollziehbarkeit:** Kritische Änderungen speichern Zeitpunkt und
   verantwortlichen Mitarbeiter; historische Bestellpreise bleiben erhalten.
4. **Sichere Berechtigungen:** Rollenregeln werden an der Geschäftslogik bzw. API
   geprüft, nicht nur durch ausgeblendete UI-Elemente.
5. **Einfache Bedienung:** Der Betrieb wechselt von Papier zu Software; zentrale
   Abläufe müssen mit wenigen, klaren Schritten funktionieren.

## Systemkontext

```text
Mitarbeitergerät
  ├─ Reservierungen und Tischstatus
  ├─ Bestellungen und Abrechnung
  ├─ lokale Offline-Daten + ausstehende Änderungen
  └─ Synchronisation
          │
          ▼
Zentrale Anwendung / API
  ├─ Authentifizierung und Rollenprüfung
  ├─ Geschäftsregeln
  ├─ Konfliktbehandlung und Audit-Daten
  └─ persistente Datenbank
          │
          └─ Küchenausgabe (Medium noch festzulegen)
```

## Domänenmodule

| Modul | Verantwortung |
|---|---|
| Standorte & Tische | Öffnungszeiten, Feiertags-Overrides, Bereiche, Tischstatus und schematische Grundrisspositionen |
| Reservierungen | Standortpflicht, Tischzuordnung, Gastbezug, Änderungsprotokoll |
| Speisekarte | Standortkarten, Kategorien, Saison-/Tageskennzeichen, Preise |
| Bestellungen | Positionen, Sonderwünsche, Statusfluss, Küchenausgabe |
| Gäste & Bella-Card | Telefonnummer als Erkennungsmerkmal, Notizen, Besuche, Rabatt |
| Abrechnung | unveränderliche Einzelpreise, Gesamtsumme, automatischer Rabatt |
| Identität & Rechte | Mitarbeiter, Standortzuordnung, Rollen und Autorisierung |

### Implementierte Modulstruktur

| Pfad | Verantwortung |
|---|---|
| `app/page.tsx` | Rollenbasiertes Arbeitsdashboard nach Standort- und Mitarbeiterwahl mit primären Vorgängen, operativen Schnellzugriffen und berechtigter Verwaltung |
| `app/mitarbeiter/` | Servergerenderte Mitarbeiterverwaltung, Formulare und Server Actions |
| `app/mitarbeiter-waehlen/` | Prototypische Mitarbeiter-Session für den aktiven Standort |
| `app/nicht-erlaubt/` | Verständliche Zielseite bei fehlender Capability |
| `app/gaeste/` | Geschützte Gastverwaltung für Manager und Inhaber |
| `app/reservierungen/` | Standortbezogene Reservierungsliste sowie geschützte Anlage, Bearbeitung und Statuswechsel per Server Actions |
| `app/speisekarte/` | Standortkarte für alle Rollen sowie geschützte Inhaberpflege von Gerichten und Preisen |
| `app/bestellungen/` | Standortbezogene Bestellaufnahme, Rechnungsvorschau, Statusfluss und gespeicherte Abrechnung |
| `app/kueche/` | Standortbezogene Küchenbons und Übergang von offen zu serviert |
| `app/tische/` | Schematischer Standortgrundriss, Tischliste, Statussteuerung und geschützte Stammdatenpflege |
| `app/standort/` | Explizite Standortauswahl und serverseitiger Kontextwechsel |
| `components/app-header.tsx` | Reduzierte globale Navigation sowie sichtbare Mitarbeiter- und Standortsession mit Wechsel- und Abmeldemöglichkeit |
| `components/opening-hours.tsx` | Vollständiger Wochenplan mit geöffneten und geschlossenen Tagen |
| `lib/mitarbeiter.ts` | Validierung, Standortprüfung und CRUD-Anwendungslogik |
| `lib/gaeste.ts` | Gastvalidierung, Telefonnummern-Normalisierung und CRUD-Logik |
| `lib/reservierungen.ts` | Reservierungsvalidierung, Standortabgleich, Tisch-/Gastbezug und Persistenz |
| `lib/gerichte.ts` | Gerichtvalidierung, Centpreise, Standortabfragen, Grillregel und Inhaberpflege |
| `lib/gericht-kategorien.ts` | Client-sichere Kategorie-Reihenfolge und deutsche Anzeigelabels |
| `lib/bestellungen.ts` | Bestellvalidierung, historische Positionspreise, Statusfluss sowie atomare Abrechnung, Rabatt- und Besuchslogik |
| `lib/tische.ts` | Tischvalidierung, Rasterpositionen, Rollen-/Standortprüfung, Verfügbarkeit und Persistenz |
| `lib/gast-status.ts` | Client- und serverseitig nutzbare Ableitung des Bella-Card-Status |
| `lib/grunddaten.ts` | Idempotente, nicht-destruktive Anlage von Standorten, Managern und Standardzeiten |
| `lib/berechtigungen.ts` | Capability-Matrix, Mitarbeiter-Session und serverseitige Guards |
| `lib/oeffnungszeiten.ts` | Zeitvalidierung, Formatierung, Öffnungsprüfung und Datenzugriff |
| `lib/standort.ts` | Cookie-Kontext, ID-Validierung und verpflichtender Standortzugriff |
| `lib/prisma.ts` | Prozessweit wiederverwendeter Prisma Client mit SQLite-Adapter |
| `prisma/schema.prisma` | Relationales Datenmodell und technische Constraints |
| `scripts/seed.ts` | Idempotente Grunddaten für Kreuzberg und Spandau |
| `tests/` | Node-Test-Runner mit TypeScript sowie lokale SQLite-Integrationstests |

## Kernmodell und Invarianten

- Jede standortabhängige Entität referenziert genau einen Standort.
- Ein Mitarbeiter besitzt genau eine Rolle. Manager und Inhaber besitzen eine
  feste Standortrelation; Bedienungen dürfen bei unbekanntem Einsatzort
  `standortId = null` tragen.
- Standortbezogene Mitarbeiterabfragen liefern fest zugeordnete Personen des
  Standorts plus standortoffene Bedienungen. Jede betriebliche Entität und Abfrage
  bleibt unabhängig davon zwingend an den validierten aktiven Standort gebunden.
- Reguläre Öffnungszeiten sind je Standort und Wochentag eindeutig. Ein fehlender
  Eintrag bedeutet „geschlossen“; Zeitfenster verwenden Minuten seit Mitternacht.
- Standortgebundene Seiten und Operationen verwenden ausschließlich einen
  serverseitig validierten Standortkontext; Clientwerte allein sind nicht
  vertrauenswürdig.
- Tischidentität ist nicht standortübergreifend aus der sichtbaren Nummer
  ableitbar; intern wird eine eindeutige Tisch-ID verwendet.
- Tischnummer und Rasterposition sind innerhalb eines Standorts eindeutig. Nur
  verfügbare Tische dürfen neu einer Reservierung zugeordnet werden.
- Ein Tisch hat höchstens eine aktive Bestellung gleichzeitig.
- Eine Bestellposition speichert den Einzelpreis zum Bestellzeitpunkt.
- Der Besuchszähler steigt genau einmal beim Übergang einer Bestellung auf
  `bezahlt`; wiederholte Verarbeitung muss idempotent sein.
- Ab zehn abgeschlossenen Besuchen werden 15 % Rabatt automatisch berechnet.
- Der zehnte bezahlte Besuch aktiviert die Bella-Card für die folgende Abrechnung;
  die Berechtigung wird vor der Besuchserhöhung geprüft.
- Beim Bezahlen werden Ausgangssumme, kaufmännisch auf Cent gerundeter Rabatt,
  Endsumme und Abrechnungszeitpunkt gemeinsam mit Status und Besuchserhöhung
  transaktional gespeichert. Bezahlte Rechnungssnapshots sind unveränderlich.
- Telefonnummern werden zusätzlich in normalisierter Form eindeutig gespeichert;
  der Bella-Card-Status wird aus dem Besuchszähler abgeleitet.
- Gast-Erkennung verwendet ausschließlich einen exakten Vergleich des
  normalisierten Werts und gibt höchstens ein Profil zurück.
- Reservierungen speichern lokales Datum und Uhrzeit getrennt; Tisch und
  Reservierung müssen serverseitig demselben aktiven Standort zugeordnet sein.
  Der handelnde Mitarbeiter muss dort gültig oder eine standortoffene Bedienung sein.
- Gastauflösung und Reservierungsanlage laufen in einer Transaktion: Eine bekannte
  normalisierte Telefonnummer wird verknüpft, eine unbekannte Nummer erzeugt nur
  zusammen mit einem gültigen Gastnamen ein neues Gastprofil.
- Bearbeitungen und Statuswechsel erhalten Erstellerdaten unverändert und setzen
  automatisch letzten Änderungszeitpunkt sowie verantwortlichen Mitarbeiter.
- Bis zur finalen Tischliste werden stabile, ausdrücklich als vorläufig markierte
  Grunddaten verwendet. Ihre Kapazitäten lösen noch keine Reservierungsablehnung aus.
- Grillgerichte sind ausschließlich Kreuzberg zugeordnet und in Spandau weder
  sichtbar noch bestellbar.
- Gerichtspreise werden als positive ganzzahlige Centwerte gespeichert; Namen
  sind normalisiert je Standort eindeutig.
- Der Inhaber darf nach explizitem Standortwechsel beide Karten administrieren;
  standortoffene Bedienungs-Sessions gelten ebenfalls in beiden expliziten
  Standortkontexten. Manager-Sessions bleiben an ihren Standort gebunden.
- Neue Bestellungen sind ab 30 Minuten vor Standortschließung gesperrt.
- Bestellungen werden unter `/bestellungen` über `lib/bestellungen.ts` atomar
  geschrieben; `/kueche` liest dieselben standortgebundenen Datensätze als
  interne, regelmäßig aktualisierte Küchenwarteschlange.
- Ein partieller SQLite-Unique-Index auf `Bestellung.tischId` schützt die
  aktiven Zustände `offen` und `serviert` auch bei parallelen Schreibzugriffen.
- Bestellpositionen behalten ihren erstmalig übernommenen Centpreis. Bereits
  bezahlte oder stornierte Bestellungen sind unveränderlich.
- Preis- und Kartenänderungen sind ausschließlich für die Rolle `inhaber`
  zulässig.
- Berechtigungen werden serverseitig vor schreibenden Operationen geprüft. Eine
  ausgeblendete Navigation ist nur Bedienhilfe und keine Sicherheitsgrenze.

## Offline- und Synchronisationsprinzipien

- Schreibvorgänge erhalten clientseitig eine eindeutige ID und werden lokal
  dauerhaft in einer Ausgangswarteschlange gespeichert.
- Die Oberfläche zeigt lokalen, synchronisierten und konfliktbehafteten Status
  verständlich an.
- Wiederholte Synchronisation darf Reservierungen, Bestellungen, Besuche oder
  Zahlungen nicht doppelt erzeugen.
- Konfliktregeln werden pro Entität festgelegt. Finanz- und Statuskonflikte
  dürfen nicht still per „last write wins“ überschrieben werden.
- Authentifizierungs- und Berechtigungsstrategie im längeren Offline-Betrieb ist
  vor Implementierung in einem Konzept zu entscheiden.

## Sicherheits- und Datenschutzgrenzen

- Gastdaten sind personenbezogen und werden nur für den beschriebenen
  Betriebszweck verarbeitet.
- Telefonnummern dürfen nicht in Logs, Test-Fixtures oder Fehlermeldungen im
  Klartext erscheinen.
- Autorisierung erfolgt für jede schreibende Operation erneut.
- Kritische Änderungen an Reservierungen, Preisen und Bestellungen werden mit
  Mitarbeiter-ID und Zeitstempel nachvollziehbar gespeichert.

## Noch zu entscheiden

- Zielplattform-Ausprägung (Web/PWA oder verpackte Hybrid-App)
- Hosting- und Deployment-Lösung
- Synchronisationsmodell und konkrete Konfliktregeln
- Authentifizierung, Gerätekopplung und Offline-Sitzungsdauer
- Medium und Protokoll der Küchenausgabe (Display, Drucker oder beides)
- Steuerlogik und Beleganforderungen
- Reservierungsdauer sowie Regeln für Zeitüberschneidungen
