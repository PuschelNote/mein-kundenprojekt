# Konzept — BV-006 und Phase-3-Speisekarten

## Umfang

Dieses Konzept bündelt `BV-006`, `BV-033`, `BV-015`, `BV-034` und `BV-035`.

## Ziel und Akzeptanzkriterien

- `/speisekarte` zeigt allen Mitarbeiterrollen ausschließlich Gerichte des
  explizit aktiven Standorts, gruppiert nach Kategorie.
- Ein Gericht besitzt Name, Beschreibung, ganzzahligen Centpreis, Kategorie sowie
  Tages- und Saisonkennzeichen.
- Namen sind normalisiert je Standort eindeutig.
- Nur der Inhaber kann Gerichte und Preise anlegen oder ändern.
- Der Inhaber kann nach bewusstem Standortwechsel beide Karten administrieren;
  Bedienungen und Manager bleiben an ihren Mitarbeiterstandort gebunden.
- `Grill` ist beim Schreiben ausschließlich für Kreuzberg zulässig und wird durch
  Spandauer Leseabfragen zusätzlich ausgeschlossen.
- Preise, Rollen und Standortregeln werden serverseitig validiert und getestet.

## Abgrenzung

- keine physische Löschung von Gerichten
- keine Aktivierung, Deaktivierung oder Terminplanung wechselnder Karten
- keine Bestellpositionen oder Preisübernahme in Bestellungen vor Phase 4
- keine Steuer-, Rundungs-, Beleg- oder Rabattlogik
- keine erfundenen Speisekarten-Grunddaten

`Tagesgericht` und `Saisongericht` sind in Phase 3 ausschließlich sichtbare und
pflegbare Kennzeichen. Der operative Wechsel kompletter Karten folgt mit `BV-018`.
