# Konzept — BV-047 Standortoffene Bedienungen

## Ziel

Sofia, Nico und Fatima sind als Bedienungen bekannt, ihre regelmäßigen
Einsatzstandorte jedoch nicht. Sie werden deshalb ohne feste Standortzuordnung
geführt und stehen nach einer expliziten Standortwahl in Kreuzberg und Spandau
als Mitarbeiterzugang bereit.

## Regeln

- Nur die Rolle `bedienung` darf `standortId = null` besitzen.
- Manager benötigen weiterhin einen festen Standort; Giuseppe bleibt Kreuzberg
  und Renate Spandau zugeordnet.
- Der Inhaber behält seinen Datensatz am Hauptstandort und seine dokumentierte
  standortübergreifende Sessionregel.
- Jeder betriebliche Vorgang trägt weiterhin zwingend den aktiven Standort.
- Eine standortoffene Bedienung darf nur Daten des explizit aktiven
  Standortkontexts lesen oder verändern.
- Standortoffenheit erweitert keine Rolle oder Capability.

## Daten und Auswahl

Die drei Bedienungen erhalten stabile IDs und werden idempotent als Grunddaten
angelegt. Standortbezogene Mitarbeiterwahlen liefern sowohl fest zugeordnete
Personen des Standorts als auch standortoffene Bedienungen. Die allgemeine
Mitarbeiterverwaltung zeigt sie in einer eigenen Gruppe.

## Prüfkriterien

- Sofia, Nico und Fatima existieren genau einmal mit Rolle `bedienung` und ohne
  Standort-ID.
- Alle drei erscheinen in der Mitarbeiterwahl beider Standorte.
- Manager eines fremden Standorts bleiben ungültig.
- Eine standortoffene Bedienung kann einen Vorgang für den aktiven Standort
  erstellen; der gespeicherte Vorgang besitzt diesen Standort eindeutig.
- Standortwechsel erhalten die Session einer standortoffenen Bedienung, ohne
  standortgebundene Daten zu vermischen.
