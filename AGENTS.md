# AGENTS.md

## Projektziel

Bella Vista ist eine Restaurant-App fuer zwei italienische Standorte in Berlin:
Kreuzberg und Spandau. Die App ersetzt Papierprozesse durch digitale Workflows
fuer Reservierungen, Tischstatus, Bestellungen, Speisekarte, Gastprofile,
Bella-Card, Abrechnung, Rollen und Offline-nahe Nutzung.

## Arbeitsmethodik

Dieses Repo ist als SOLO-Projekt nach der Methodik aus
`github.com/jacekzawisza/modus-operandi` eingerichtet.

Grundregeln:

- Markdown im Repo ist die Single Source of Truth.
- `CLAUDE.md` ist der Einstieg fuer AI-Coding-Sessions.
- `docs/SPEC_Marco Ferretti Bella Vista.md` beschreibt WAS und WARUM.
- `docs/backlog.md` ist die operative Feature-Registry mit stabilen IDs,
  Phase und Status.
- `docs/architecture.md` beschreibt WIE gebaut wird.
- `docs/decisions.md` dokumentiert Produkt- und Architekturentscheidungen.
- `docs/modus-operandi.md` beschreibt den projektspezifischen SOLO-Workflow.

Vor fachlichen Aenderungen zuerst lesen:

1. `docs/SPEC_Marco Ferretti Bella Vista.md`
2. `docs/backlog.md`
3. `docs/architecture.md`
4. `docs/decisions.md`

## Verwendete Technologien

Aktueller Projektstand:

- Next.js App Router
- TypeScript
- Tailwind CSS
- `sql.js` / SQLite-nahe lokale Datenhaltung
- Tests mit `tsx --test`
- Git als Versionsverwaltung

Bei Stack-Aenderungen muessen `docs/architecture.md`, `docs/decisions.md`,
`CLAUDE.md` und dieses Dokument aktualisiert werden.

## Ordnerstruktur

```text
.
+-- AGENTS.md
+-- CLAUDE.md
+-- app/
+-- lib/
+-- tests/
+-- types/
+-- docs/
|   +-- SPEC_Marco Ferretti Bella Vista.md
|   +-- backlog.md
|   +-- architecture.md
|   +-- decisions.md
|   +-- modus-operandi.md
|   +-- concepts/
|   +-- audit/
+-- .agents/
```

Wichtige Dateien:

- `docs/SPEC_Marco Ferretti Bella Vista.md`: fachliche Rohspezifikation
- `docs/backlog.md`: Features mit ID, Phase und Status
- `docs/architecture.md`: technischer Zielzustand
- `docs/decisions.md`: ADR-Log
- `docs/modus-operandi.md`: SOLO-Prozess fuer dieses Projekt
- `CLAUDE.md`: Kurzbriefing fuer Claude
- `AGENTS.md`: Arbeitsregeln fuer Agenten und Entwickler

## Backlog-Konventionen

- Feature-IDs folgen `FNNN`, z. B. `F014`.
- IDs bleiben stabil und werden nicht wiederverwendet.
- Jedes neue Feature braucht eine ID, Phase und Status.
- Phasen sind aktuell `Kern` und `Spaeter`.
- Statuswerte sind aktuell `Todo`, `In Progress`, `Done`.
- Commits sollen Feature-IDs referenzieren, wenn sie ein Backlog-Feature
  betreffen.

## Coding-Konventionen

- Fachliche Begriffe aus der Spezifikation beibehalten.
- Geschaeftsregeln zentral in Services implementieren, nicht nur in UI-
  Komponenten.
- Rollen und Berechtigungen explizit und serverseitig pruefen.
- Statuswerte nur aus den spezifizierten Mengen verwenden.
- Preisberechnungen und Rabatte nachvollziehbar kapseln.
- Historische Einzelpreise von Bestellpositionen nicht nachtraeglich veraendern.
- Kleine, klar benannte Module bevorzugen.
- Keine unnoetigen Abstraktionen einfuehren.
- Tests fuer Geschaeftsregeln, Berechtigungen und Abrechnung ergaenzen.
- Neue Dateien bevorzugt in ASCII halten, solange kein fachlicher Grund fuer
  Sonderzeichen besteht.

## Fachliche Regeln

- Standorttrennung zwischen Kreuzberg und Spandau darf nicht aufgeweicht werden.
- Reservierungen muessen immer einen expliziten Standort haben.
- Grillgerichte duerfen fuer Spandau nicht angezeigt oder bestellt werden.
- Speisekarten- und Preisaenderungen bleiben dem Inhaber vorbehalten.
- Bella-Card-Rabatt wird automatisch ab 10 Besuchen angewendet.
- Der Besuchszaehler wird erst bei bezahlter Bestellung erhoeht.
- Kuechenschluss ist 30 Minuten vor Restaurantschluss zu beachten.
- Eine servierte Bestellung ist noch nicht abgeschlossen.
- Offline-Faehigkeit bei Architekturentscheidungen beruecksichtigen.

## Doku-Regeln

- Bei neuen fachlichen Anforderungen Spezifikation oder `docs/backlog.md`
  aktualisieren.
- Bei Architekturentscheidungen eine neue ADR in `docs/decisions.md` ergaenzen.
- Bei komplexen Features vorab ein Konzept in `docs/concepts/` anlegen.
- Audit-Ergebnisse in `docs/audit/` dokumentieren.

## Commit-Konventionen

Commits sollen kurz, beschreibend und nach Conventional Commits benannt werden.

Beispiele:

- `docs: align solo project docs`
- `feat: F006 require reservation location`
- `fix: F014 prevent grill items in spandau`
- `test: F011 cover bella card discount`
- `refactor: simplify order status handling`

Empfohlene Typen:

- `docs`: Dokumentation
- `feat`: neues Feature
- `fix`: Fehlerbehebung
- `test`: Tests
- `refactor`: interne Struktur ohne Verhaltensaenderung
- `chore`: Wartung, Build, Konfiguration

## Regeln fuer zukuenftige Aenderungen

- Keine Dateien oder Inhalte entfernen, die nicht eindeutig zur Aufgabe
  gehoeren.
- Bestehende Nutzer- oder Agentenaenderungen nicht ungefragt zuruecksetzen.
- Neue Features muessen auf ein Backlog-Feature oder eine klare neue
  Anforderung zurueckfuehrbar sein.
- Bei Widerspruechen zwischen Code, Backlog und Spezifikation nachfragen
  oder die Annahme in `docs/decisions.md` dokumentieren.
- Kern-Features haben Vorrang vor Spaeter-Features.
- Nach jeder relevanten Aenderung geeignete Tests oder Pruefschritte ausfuehren.
