# Bella Vista Restaurant-App

Interne Restaurantverwaltung für die Bella-Vista-Standorte Kreuzberg und
Spandau. Die Anwendung digitalisiert Reservierungen, Tischverwaltung,
Bestellungen, Küchenabläufe, Abrechnung, Gästedaten und das Bella-Card-
Treueprogramm.

## Funktionsumfang

- aufgabenorientiertes Dashboard mit explizitem Standort- und Mitarbeiterkontext
- Reservierungen mit zweistündigen Zeitfenstern, Tischzuordnung und
  Öffnungszeitenprüfung
- schematischer Tischgrundriss mit Status und sichtbaren Reservierungen
- standortgetrennte Speisekarten; Grillgerichte ausschließlich in Kreuzberg
- Bestellaufnahme, Küchenansicht, Statusablauf und historische Einzelpreise
- Tischabrechnung mit automatischem Bella-Card-Rabatt ab zehn abgeschlossenen
  Besuchen
- Gastprofile mit Telefonnummer, Besuchszähler, Notizen und Allergiehinweisen
- Catering-Aufträge für Manager und Inhaber
- Feiertags-Öffnungszeiten, die Marco für beide Standorte pflegen kann
- responsive, installierbare PWA-Hülle mit Offline-Fallback

## Rollen

| Rolle | Wesentliche Rechte |
|---|---|
| Bedienung | Reservierungen, Bestellungen, Küche, Tische und Speisekarte |
| Manager | zusätzlich Gastdaten, Bella-Card und Mitarbeiterverwaltung am eigenen Standort |
| Inhaber (Marco) | vollständiger Zugriff auf Kreuzberg und Spandau, einschließlich Preisen und Feiertagszeiten |

Berechtigungen und Standortgrenzen werden serverseitig geprüft. Ausgeblendete
Navigationselemente sind lediglich Teil der Bedienführung.

## Technologie

- Next.js 16 mit App Router
- React 19 und TypeScript
- Prisma ORM 7
- SQLite mit `@prisma/adapter-better-sqlite3`
- Node-Test-Runner über `tsx`
- ESLint

## Lokal starten

Vorausgesetzt werden eine aktuelle Node.js-LTS-Version und npm.

```powershell
npm install
Copy-Item .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Danach ist die App unter [http://localhost:3000](http://localhost:3000)
erreichbar. `npm run dev` generiert den Prisma-Client und spielt ausstehende
Migrationen vor jedem lokalen Start automatisch ein.

Der Seed ist idempotent und stellt unter anderem beide Standorte, Mitarbeiter,
Öffnungszeiten, vorläufige Tische, Beispielkarten sowie klar gekennzeichnete
Demo-Gäste und Demo-Reservierungen bereit. Bereits gepflegte Datensätze werden
nicht zurückgesetzt.

## Nützliche Befehle

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Production-Build erzeugen |
| `npm start` | erzeugten Production-Build starten |
| `npm test` | Grunddaten einspielen und vollständige Testsuite ausführen |
| `npm run lint` | Code mit ESLint prüfen |
| `npm run db:check` | lokale SQLite-Verbindung prüfen |
| `npm run db:seed` | nicht-destruktive Demo- und Grunddaten anlegen |
| `npm run db:migrate` | neue Prisma-Migration im Entwicklungsbetrieb erstellen |
| `npm run db:studio` | Prisma Studio öffnen |

## Projektstruktur

```text
app/                  Next.js-Seiten und Server Actions
components/           gemeinsame UI-Komponenten
lib/                  Domänenlogik, Berechtigungen und Datenzugriff
prisma/               Schema und versionierte Migrationen
public/               statische PWA- und Offline-Dateien
scripts/              Datenbank- und Seed-Skripte
tests/                Validierungs- und SQLite-Integrationstests
docs/                 Spec, Backlog, Architektur, Entscheidungen und Konzepte
```

## Aktueller Entwicklungsstand

Die lokalen Kernabläufe sind umgesetzt. Die sichere Anmeldung und Phase 6 sind
noch in Arbeit:

- Sitzungen verwenden bereits zufällige Tokens, serverseitig gespeicherte Hashes
  und eine Ablaufzeit. Persönliche PIN-Vergabe, PIN-Prüfung und Schutz vor
  wiederholten Fehlversuchen fehlen noch.
- Manifest, Service Worker, Verbindungsanzeige und ein datensparsamer
  Offline-Fallback sind vorhanden. Offline-Schreiben, Synchronisation und
  sichtbare Konfliktauflösung sind noch nicht umgesetzt.
- SQLite ist die lokale Projektpersistenz und noch kein Mehrgeräte- oder
  Cloud-Synchronisationssystem.

## Verbindliche Projektdokumentation

- [Fachliche Spezifikation](docs/spec.md)
- [Backlog und Umsetzungsstatus](docs/backlog.md)
- [Architektur](docs/architecture.md)
- [Entscheidungen](docs/decisions.md)
- [Arbeitsweise](docs/modus-operandi.md)
- [Manuelle Kalibrierungsnotizen](KALIBRIERUNG.md)

Die `docs/spec.md` ist die fachliche Single Source of Truth. Eine `prd.md` wird
in diesem Projekt nicht verwendet.
