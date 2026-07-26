# BV-016 — Feiertags-Öffnungszeiten

## Ziel und Scope

Marco kann je Standort und lokalem Kalenderdatum die Standardöffnungszeit durch
ein abweichendes Zeitfenster oder „geschlossen“ ersetzen. Das Override gilt für
Reservierungen, Reservierungskalender und Küchenannahmeschluss. Standardzeiten
werden nicht verändert; das Löschen eines Overrides stellt den Fallback wieder her.

## Regeln

- Nur die Rolle `inhaber` besitzt die Schreibberechtigung.
- Standort und Datum sind Pflicht; je Standort und Datum existiert höchstens ein Override.
- Ein Override ist entweder geschlossen oder besitzt Öffnungs- und Schließminute.
- Geöffnete Zeitfenster liegen innerhalb eines Kalendertags und öffnen vor dem Schließen.
- Der Server wählt zuerst das exakte Override, andernfalls die Standardzeit des Wochentags.
- Standorttrennung und Berechtigung werden an jeder Schreibgrenze erneut geprüft.

## Prüfung

- Validierungs- und Persistenztests für geöffnet, geschlossen, Fallback, Rollen und Standorte.
- Reservierungs- und Bestelltests belegen die verbindliche Verwendung.
- Manueller Check der Inhaberoberfläche für Kreuzberg und Spandau.
