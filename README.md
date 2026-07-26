# Bella Vista Restaurant-App

Eine lokal ausführbare Restaurant-Anwendung für die beiden Bella-Vista-Standorte **Kreuzberg** und **Spandau**.

Die App unterstützt unter anderem die Verwaltung von Standorten, Tischen, Gästen, Reservierungen, Bestellungen, Speisekarten und Mitarbeiterrollen.

## Funktionsumfang

- standortbezogene Arbeitsoberflächen für Kreuzberg und Spandau
- Tischstatus und Tischverwaltung
- Gästeverwaltung mit Telefonnummer, Notizen und Besuchszähler
- Reservierungsverwaltung
- Bestellaufnahme und Küchenansicht
- standortabhängige Speisekarten
- rollenbasierte Berechtigungen für Bedienung, Manager und Inhaber
- lokale SQLite-Datenbank mit Prisma
- automatisierte Tests für zentrale Fachlogik

## Technischer Aufbau

- **Frontend und Server:** Next.js mit React und TypeScript
- **Datenbank:** SQLite
- **ORM:** Prisma
- **Styling:** globale CSS-Komponenten und wiederverwendbare UI-Bausteine
- **Tests:** Node Test Runner über `tsx`

## Quellcode und Projektstruktur

```text
app/          Seiten, Routen, Server Actions und App-Layout
components/   Wiederverwendbare UI-Komponenten
lib/          Fachlogik, Datenzugriff und Berechtigungen
prisma/       Prisma-Schema und Datenbankmigrationen
scripts/      Hilfsskripte, insbesondere Seed und Datenbankprüfung
tests/        Automatisierte Tests
docs/         Spezifikation, Architektur, Backlog und Entscheidungen
AGENTS.md     Arbeitsregeln und Projektkontext für den Coding-Agenten
```

Der vollständige Quellcode eines Features verteilt sich in der Regel auf mehrere Bereiche:

- Benutzeroberfläche und Route unter `app/`
- wiederverwendbare UI-Bestandteile unter `components/`
- Fachlogik und Datenzugriff unter `lib/`
- Datenmodell unter `prisma/schema.prisma`
- Tests unter `tests/`

Die Feature-IDs und ihr Umsetzungsstatus sind in `docs/backlog.md` dokumentiert. Architektur- und Implementierungsentscheidungen stehen in `docs/architecture.md` und `docs/decisions.md`.

## Voraussetzungen

- Node.js
- npm
- Git

## Installation

Repository klonen:

```bash
git clone https://github.com/PuschelNote/mein-kundenprojekt.git
cd mein-kundenprojekt
```

Abhängigkeiten installieren:

```bash
npm install
```

Umgebungsdatei anlegen:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS/Linux

```bash
cp .env.example .env
```

Die lokale Datenbankverbindung ist bereits in `.env.example` vorbereitet:

```env
DATABASE_URL="file:./dev.db"
```

## Datenbank vorbereiten

Prisma-Client erzeugen:

```bash
npm run db:generate
```

Datenbankmigrationen anwenden:

```bash
npm run db:migrate
```

Test- und Ausgangsdaten einspielen:

```bash
npm run db:seed
```

Optional kann die Datenbank geprüft werden:

```bash
npm run db:check
```

## Anwendung starten

Entwicklungsserver starten:

```bash
npm run dev
```

Danach im Browser öffnen:

```text
http://localhost:3000
```

## Qualitätssicherung

Lint-Prüfung:

```bash
npm run lint
```

Automatisierte Tests:

```bash
npm test
```

Produktions-Build:

```bash
npm run build
```

## KI-Unterstützung
ChatGPT als unterstützung bei prompts oder fehlern und bei der Erstellung der Readme.md

## Projektdokumentation

- `docs/spec.md` – fachliche Spezifikation
- `docs/backlog.md` – Features, Phasen und Status
- `docs/architecture.md` – technischer Aufbau und Datenmodell
- `docs/decisions.md` – Architektur- und Umsetzungsentscheidungen
- `AGENTS.md` – Arbeits- und Qualitätsregeln für den Coding-Agenten
