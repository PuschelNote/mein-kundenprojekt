# Architecture Decisions - Bella Vista Restaurant-App

Dieses Dokument haelt zentrale Architekturentscheidungen fest. Neue
Entscheidungen sollen nachvollziehbar begruendet und bei Aenderungen nicht
still ersetzt, sondern durch neue Eintraege ergaenzt werden.

## ADR-001 - Initialer Technologie-Stack

- **Status:** Vorgeschlagen
- **Datum:** 2026-06-26

### Frameworkentscheidung

Die App soll als Web-App umgesetzt werden.

Empfohlene Frameworkentscheidung:

- **Frontend:** React mit TypeScript
- **Build-Tool:** Vite

### Backendentscheidung

Das Backend soll als schlanke HTTP-API umgesetzt werden.

Empfohlene Backendentscheidung:

- **Backend:** Node.js mit Express und TypeScript
- **API-Stil:** REST

### Datenbankentscheidung

Die Datenhaltung soll relational umgesetzt werden.

Empfohlene Datenbankentscheidung:

- **Datenbank:** SQLite fuer lokale Entwicklung und einfache Offline-nahe
  Nutzung
- **Datenzugriff:** ORM oder Query Builder erst festlegen, wenn die
  Implementierung startet

### Begruendung

- Die Anwendung ist daten- und workfloworientiert: Reservierungen, Tische,
  Bestellungen, Gaeste, Mitarbeiter und Speisekarten haben klare Beziehungen.
- Ein relationales Modell passt gut zu den spezifizierten Entitaeten und
  Geschaeftsregeln.
- SQLite ist fuer den Projektstart pragmatisch, einfach lokal nutzbar und passt
  zur Offline-Anforderung besser als eine rein entfernte Datenbank.
- React mit TypeScript eignet sich fuer eine interaktive Restaurantoberflaeche
  mit Tischuebersicht, Formularen, Statuswechseln und Rollenlogik.
- Vite haelt das Setup klein und schnell.
- Express mit TypeScript reicht fuer eine klar strukturierte REST-API ohne
  unnoetige Framework-Komplexitaet.

### Konsequenzen

- Die Offline-Faehigkeit muss bei der spaeteren Daten- und Sync-Architektur
  genauer ausgearbeitet werden.
- Bei spaeterem Mehrgeraetebetrieb muss entschieden werden, ob SQLite lokal
  bleibt, synchronisiert wird oder durch eine Serverdatenbank ersetzt wird.
- Rollen- und Geschaeftsregeln duerfen nicht nur im Frontend umgesetzt werden.

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
