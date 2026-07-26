# Kalibrierung – Bella Vista Restaurant-App

## Business Rule 1

**Wenn der Besuchszähler eines Gastes 10 oder mehr beträgt, dann wird bei der
Abrechnung automatisch 15 % Rabatt auf die Gesamtsumme angewendet.** –
Konfidenz 7 – Test durch kompletten Bestellablauf

## Business Rule 2

**Wenn eine Reservierung geändert wird, dann werden Zeitstempel und
Mitarbeiter-ID (Name) automatisch protokolliert.** – Konfidenz 9 – getestet
durch unterschiedlich vorgenommene Änderungen

## Datenmodell (n:m)

**Eine Bestellung enthält mehrere Gerichte. Ein Gericht steht auf vielen
Bestellungen. → Verbindungsentität: Bestellposition (Attribute: Menge,
Sonderwunsch, Einzelpreis).** – Konfidenz 8 – Bestellung mit mehreren Gerichten
angelegt, mehrere Bestellungen mit denselben Gerichten gleichzeitig

## Widerspruchsauflösung

**„Alles auf Papier“ – aber Excel für Preise: Preise können nun ausschließlich
durch den Inhaber Marco in der App geändert werden.** – Konfidenz 7 –
Berechtigung durch wechselnde Rollen geprüft

## Tischübersicht

**Übersichtliche Darstellung aller Tische am Standort, inklusive aktuellem
Status und Hinweisen bei anstehenden Reservierungen.** – Konfidenz 8 – durch
unterschiedliche Aktivitäten zum Ändern der Statuswerte getestet
