# Konzept — BV-046 Rollenbasiertes Arbeitsdashboard

## Ziel

Die Startseite führt Mitarbeitende nach der expliziten Standortwahl und dem
Mitarbeiterzugang direkt zu ihrer nächsten Aufgabe. Sie priorisiert Vorgänge aus
dem Restaurantbetrieb statt technischer Module.

## Ablauf

```text
Standort wählen → Mitarbeiterzugang wählen → Arbeitsdashboard
                                          ├→ Reservierung anlegen
                                          ├→ Bestellung aufnehmen
                                          ├→ Im Betrieb weiterarbeiten
                                          └→ berechtigte Verwaltung
```

Die Mitarbeiterwahl bleibt im Prototyp eine Cookie-Session ohne persönliche PIN
und ist keine produktionsreife Authentifizierung. Standortwechsel und Abmeldung
verwenden weiterhin die bestehenden serverseitigen Regeln.

## Informationshierarchie

1. Aktiver Mitarbeiter, Rolle und Standort sind sofort sichtbar.
2. „Reservierung anlegen“ und „Bestellung aufnehmen“ sind die beiden dominanten
   Hauptaktionen und führen direkt zum jeweiligen Formular.
3. Tischübersicht, Küche, Reservierungen, Bestellungen und Speisekarte bilden
   einen nachgeordneten Bereich für laufende Arbeit.
4. Gäste- und Mitarbeiterverwaltung werden nur bei vorhandener Capability in
   einem getrennten Verwaltungsbereich gezeigt.
5. Öffnungszeiten und Standortwechsel ergänzen den Arbeitskontext, konkurrieren
   aber nicht mit den Hauptaktionen.

## Berechtigungen und Daten

Das Dashboard leitet Sichtbarkeit aus der zentralen Capability-Matrix ab. Es ist
kein Sicherheitsperimeter; jede Zielseite und jede schreibende Operation prüft
Rolle und Standort weiterhin serverseitig. Das Dashboard erzeugt keine neuen
personenbezogenen Daten und zeigt Bedienungen keine Gast- oder Treuedaten.

## Akzeptanzkriterien

- Ohne Standort führt `/` zur Standortwahl und anschließend zurück in den Ablauf.
- Ohne Mitarbeiter führt `/` nach gewähltem Standort zur Mitarbeiterwahl.
- Das Dashboard zeigt Mitarbeiter, Rolle und Standort eindeutig.
- Hauptaktionen springen direkt zu den Formularen für neue Reservierungen und
  Bestellungen.
- Verwaltungsaktionen erscheinen ausschließlich für berechtigte Rollen.
- Abmeldung und Standortwechsel bleiben klar erreichbar.
- Kopfzeile und Dashboard sind auf kleinen Bildschirmen ohne horizontales
  Überlaufen bedienbar.
- Bestehende Geschäftsregeln, Standorttrennung und Autorisierung bleiben
  unverändert wirksam.
