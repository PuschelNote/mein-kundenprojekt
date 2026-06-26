# AGENTS.md

## Projektziel

Bella Vista ist eine Restaurant-App fuer zwei italienische Standorte in Berlin:
Kreuzberg und Spandau. Die App soll Papierprozesse durch digitale Workflows
ersetzen.

Kernziele:

- Reservierungen pro Standort verwalten
- Tischstatus pro Standort sichtbar machen
- Bestellungen digital aufnehmen
- Speisekarten standortbezogen verwalten
- Gastprofile mit Telefonnummer, Besuchszaehler und Notizen pflegen
- Bella-Card-Rabatt automatisch anwenden
- Abrechnung pro Tisch ermoeglichen
- Mitarbeiter, Rollen und Berechtigungen nachvollziehbar abbilden
- Offline-Nutzung fuer den Restaurantbetrieb sicherstellen

## Verwendete Technologien

Der technische Stack ist aktuell noch nicht festgelegt.

Aktueller Projektstand:

- Markdown fuer Spezifikation und Backlog
- Git als Versionsverwaltung
- Noch keine App-, Backend-, Frontend- oder Datenbankstruktur vorhanden

Wenn ein technischer Stack eingefuehrt wird, muss dieser Abschnitt aktualisiert
werden.

## Ordnerstruktur

```text
.
+-- AGENTS.md
+-- docs/
|   +-- SPEC_Marco Ferretti Bella Vista.md
|   +-- backlog.md
+-- .agents/
```

Wichtige Dateien:

- `docs/SPEC_Marco Ferretti Bella Vista.md`: fachliche Spezifikation
- `docs/backlog.md`: abgeleitetes Product Backlog
- `AGENTS.md`: Arbeitsregeln fuer zukuenftige Agenten und Entwickler

## Coding-Konventionen

Diese Regeln gelten, sobald Code im Projekt angelegt wird:

- Fachliche Begriffe aus der Spezifikation beibehalten.
- Geschaeftsregeln zentral implementieren und nicht ueber UI-Komponenten
  verstreuen.
- Rollen und Berechtigungen explizit pruefen.
- Statuswerte nur aus den spezifizierten Mengen verwenden.
- Preisberechnungen und Rabatte nachvollziehbar kapseln.
- Historische Einzelpreise von Bestellpositionen nicht nachtraeglich veraendern.
- Kleine, klar benannte Module bevorzugen.
- Keine unnoetigen Abstraktionen einfuehren.
- Tests fuer Geschaeftsregeln, Berechtigungen und Abrechnung ergaenzen.
- Neue Dateien bevorzugt in ASCII halten, solange kein fachlicher Grund fuer
  Sonderzeichen besteht.

## Commit-Konventionen

Commits sollen kurz, beschreibend und nach Conventional Commits benannt werden.

Beispiele:

- `docs: add product backlog`
- `feat: add reservation management`
- `fix: prevent grill items in spandau`
- `test: cover bella card discount`
- `refactor: simplify order status handling`

Empfohlene Typen:

- `docs`: Dokumentation
- `feat`: neues Feature
- `fix`: Fehlerbehebung
- `test`: Tests
- `refactor`: interne Struktur ohne Verhaltensaenderung
- `chore`: Wartung, Build, Konfiguration

## Regeln fuer zukuenftige Aenderungen

- Vor fachlichen Aenderungen zuerst Spezifikation und Backlog lesen.
- Keine Dateien oder Inhalte entfernen, die nicht eindeutig zur Aufgabe gehoeren.
- Bestehende Nutzer- oder Agentenaenderungen nicht ungefragt zuruecksetzen.
- Neue Features muessen auf ein Backlog-Feature oder eine klare neue Anforderung
  zurueckfuehrbar sein.
- Bei Widerspruechen zwischen Code, Backlog und Spezifikation nachfragen oder die
  Annahme dokumentieren.
- MVP-Features haben Vorrang vor Future-Features.
- Standorttrennung zwischen Kreuzberg und Spandau darf nicht aufgeweicht werden.
- Reservierungen muessen immer einen expliziten Standort haben.
- Grillgerichte duerfen fuer Spandau nicht bestellbar sein.
- Speisekarten- und Preisaenderungen bleiben dem Inhaber vorbehalten.
- Bella-Card-Rabatt wird automatisch ab 10 Besuchen angewendet.
- Der Besuchszaehler wird erst bei bezahlter Bestellung erhoeht.
- Kuechenschluss ist 30 Minuten vor Restaurantschluss zu beachten.
- Offline-Faehigkeit bei Architekturentscheidungen beruecksichtigen.
- Nach jeder relevanten Aenderung geeignete Tests oder Pruefschritte ausfuehren.
