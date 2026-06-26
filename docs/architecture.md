# Projektarchitektur - Bella Vista Restaurant-App

## Zielbild

Die Bella Vista Restaurant-App wird als Full-Stack-Webanwendung mit Next.js,
TypeScript, Tailwind CSS und SQLite umgesetzt. Die Anwendung ersetzt die
bisherigen Papierprozesse fuer Reservierungen, Tischstatus, Bestellungen,
Speisekarte, Gastprofile, Bella-Card und Abrechnung.

Die Architektur ist auf ein kleines Restaurantprojekt ausgelegt: einfache
Bedienung, klare Rollen, robuste Geschaeftsregeln und eine relationale
Datenhaltung.

## Technologie-Stack

- **Framework:** Next.js
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js Server Actions und/oder Route Handler
- **Datenbank:** SQLite
- **Datenzugriff:** zentrale Repository- oder Service-Schicht

SQLite wird entsprechend der Kursvorgabe als Backend-/Datenbankbasis verwendet.
Die Backendlogik laeuft serverseitig innerhalb der Next.js-Anwendung.

## Architekturuebersicht

```text
Browser
  |
  v
Next.js App Router
  |
  +-- React UI Components
  +-- Server Actions / Route Handler
  |
  v
Application Services
  |
  v
Repositories
  |
  v
SQLite Database
```

## Schichten

### Presentation Layer

Enthaelt Seiten, Layouts und UI-Komponenten.

Aufgaben:

- Tischuebersicht anzeigen
- Reservierungsformulare bereitstellen
- Bestellungen aufnehmen
- Speisekarte darstellen
- Gastprofile anzeigen
- Rollenabhaengige Aktionen ein- oder ausblenden

Wichtig: UI-Komponenten duerfen Geschaeftsregeln nicht allein erzwingen.
Regeln muessen serverseitig erneut geprueft werden.

### Application Layer

Enthaelt fachliche Services fuer die zentralen Workflows.

Beispiele:

- `reservationService`
- `orderService`
- `guestService`
- `menuService`
- `billingService`
- `permissionService`

Aufgaben:

- Standortpflicht bei Reservierungen pruefen
- Kuechenschluss-Regel pruefen
- Bella-Card-Rabatt berechnen
- Besuchszaehler bei bezahlter Bestellung erhoehen
- Grillgerichte fuer Spandau sperren
- Rollen und Berechtigungen pruefen
- Mitarbeiter-Tracking setzen

### Data Access Layer

Enthaelt den Zugriff auf SQLite.

Aufgaben:

- SQL-Abfragen kapseln
- Transaktionen fuer kritische Workflows verwenden
- Entitaeten aus der Datenbank in TypeScript-Typen abbilden
- Historische Preise von Bestellpositionen unveraendert speichern

## Vorgeschlagene Ordnerstruktur

```text
.
+-- app/
|   +-- layout.tsx
|   +-- page.tsx
|   +-- reservations/
|   +-- tables/
|   +-- orders/
|   +-- guests/
|   +-- menu/
|   +-- billing/
|   +-- api/
|       +-- reservations/
|       +-- orders/
|       +-- guests/
|       +-- menu/
+-- components/
|   +-- ui/
|   +-- reservations/
|   +-- tables/
|   +-- orders/
|   +-- guests/
|   +-- menu/
+-- lib/
|   +-- db/
|   +-- services/
|   +-- repositories/
|   +-- auth/
|   +-- validation/
|   +-- constants/
+-- types/
+-- docs/
|   +-- SPEC_Marco Ferretti Bella Vista.md
|   +-- backlog.md
|   +-- decisions.md
|   +-- architecture.md
+-- public/
+-- tests/
```

## Domänenmodule

### Standorte und Tische

Zustaendig fuer:

- Kreuzberg und Spandau
- feste Standardoeffnungszeiten
- Kuechenschluss 30 Minuten vor Restaurantschluss
- Tische pro Standort
- Tischstatus `frei`, `besetzt`, `reserviert`

### Reservierungen

Zustaendig fuer:

- Reservierung erstellen, aendern und stornieren
- Standortpflicht
- Tischzuordnung
- Gastverknuepfung ueber Telefonnummer
- Mitarbeiter- und Zeitstempelprotokoll

### Bestellungen

Zustaendig fuer:

- aktive Bestellung pro Tisch
- Bestellpositionen mit Menge, Sonderwunsch und historischem Einzelpreis
- Status `offen`, `serviert`, `bezahlt`, `storniert`
- Mitarbeiter-Tracking fuer Trinkgeld-Aufteilung
- Sperre neuer Bestellungen nach Kuechenschluss

### Speisekarte

Zustaendig fuer:

- standortbezogene Gerichte
- Kategorien wie Antipasti, Pasta, Risotto, Dessert, Getraenke und Grill
- Preisverwaltung
- Sperre von Grillgerichten in Spandau
- Bearbeitung nur durch Inhaber

### Gaeste und Bella-Card

Zustaendig fuer:

- Gastprofil mit Telefonnummer
- Besuchszaehler
- Notizen und Vorlieben
- Bella-Card ab 10 Besuchen
- automatischer Rabatt von 15 Prozent bei Abrechnung

### Mitarbeiter und Rollen

Zustaendig fuer:

- Rollen `bedienung`, `manager`, `inhaber`
- Standortzuordnung
- Berechtigungspruefung
- Nachvollziehbarkeit bei Reservierungen und Bestellungen

## Datenmodell

Vorgeschlagene SQLite-Tabellen:

- `locations`
- `tables`
- `employees`
- `guests`
- `menu_items`
- `reservations`
- `orders`
- `order_items`
- `catering_orders` fuer Future
- `opening_hour_overrides` fuer Future

Wichtige Beziehungen:

- Ein Standort hat viele Tische.
- Ein Standort hat viele Gerichte.
- Ein Gast hat viele Reservierungen.
- Eine Reservierung gehoert zu einem Tisch.
- Eine Reservierung wird von einem Mitarbeiter erstellt.
- Ein Tisch hat maximal eine aktive Bestellung.
- Eine Bestellung wird von einem Mitarbeiter aufgenommen.
- Eine Bestellung hat viele Bestellpositionen.
- Eine Bestellposition verweist auf ein Gericht und speichert den Einzelpreis
  zum Bestellzeitpunkt.

## Serverseitige Geschäftsregeln

Folgende Regeln muessen serverseitig in Services validiert werden:

- Keine Reservierung ohne Standort.
- Keine neue Bestellung weniger als 30 Minuten vor Restaurantschluss.
- Besuchszaehler erst erhoehen, wenn Bestellung auf `bezahlt` gesetzt wird.
- Bella-Card-Rabatt automatisch ab 10 Besuchen anwenden.
- Bedienung darf keine Speisekarte oder Preise bearbeiten.
- Grillgerichte duerfen nur fuer Kreuzberg angezeigt und bestellt werden.
- Reservierungsaenderungen speichern Mitarbeiter-ID und Zeitstempel.
- Status `serviert` schliesst eine Bestellung nicht ab.
- Ein Tisch darf maximal eine aktive Bestellung haben.

## API- und Server-Action-Struktur

Fuer formularnahe Aktionen eignen sich Server Actions. Fuer klar getrennte
CRUD-Endpunkte oder spaetere externe Clients koennen Route Handler genutzt
werden.

Beispiele:

- `createReservation`
- `updateReservation`
- `cancelReservation`
- `createOrder`
- `addOrderItem`
- `markOrderServed`
- `payOrder`
- `updateMenuItem`
- `createGuest`
- `updateGuestNotes`

Alle schreibenden Aktionen sollen:

- Eingaben validieren
- Berechtigungen pruefen
- Geschaeftsregeln ausfuehren
- Datenbanktransaktionen nutzen, wenn mehrere Tabellen betroffen sind

## UI-Struktur

Wichtige Ansichten fuer das MVP:

- Standortauswahl
- Tischuebersicht
- Reservierungsliste und Reservierungsformular
- Bestellansicht pro Tisch
- Speisekartenansicht pro Standort
- Gastprofil
- Abrechnungsansicht
- einfache Mitarbeiter-/Rollenansicht

Tailwind CSS wird fuer konsistente, schnelle UI-Umsetzung genutzt. Die
Oberflaeche soll arbeitsorientiert und uebersichtlich bleiben.

## Offline-Anforderung

Die Spezifikation fordert Offline-Verfuegbarkeit. Mit Next.js und SQLite ist
fuer den Kurskontext zunaechst eine lokale serverseitige Datenhaltung sinnvoll.

MVP-Annahme:

- Die Anwendung laeuft lokal oder in einer Umgebung, die Zugriff auf die lokale
  SQLite-Datenbank hat.
- Der Betrieb darf nicht von einer externen Cloud-Datenbank abhaengen.

Spaeter zu klaeren:

- Mehrgeraete-Synchronisation
- Konfliktbehandlung bei gleichzeitigen Aenderungen
- PWA-Cache fuer Frontend-Assets
- lokaler Offline-Speicher im Browser

## Teststrategie

Priorisierte Tests:

- Reservierung ohne Standort wird abgelehnt.
- Grillgericht kann in Spandau nicht bestellt werden.
- Bestellung nach Kuechenschluss wird abgelehnt.
- Bella-Card-Rabatt wird ab 10 Besuchen berechnet.
- Besuchszaehler steigt erst bei `bezahlt`.
- Bedienung kann keine Preise bearbeiten.
- Historischer Einzelpreis bleibt nach Preisaenderung erhalten.

## Umsetzungsreihenfolge

1. Next.js-Projekt mit TypeScript und Tailwind CSS einrichten.
2. SQLite-Anbindung und initiales Schema erstellen.
3. Stammdaten fuer Standorte, Rollen und Beispiel-Tische anlegen.
4. Rollen- und Berechtigungslogik implementieren.
5. Reservierungen und Tischuebersicht umsetzen.
6. Speisekarte und Grill-Sperre umsetzen.
7. Bestellungen und Bestellpositionen umsetzen.
8. Abrechnung, Bella-Card und Besuchszaehler umsetzen.
9. Tests fuer zentrale Geschaeftsregeln ergaenzen.
10. Offline-Annahmen pruefen und dokumentieren.
