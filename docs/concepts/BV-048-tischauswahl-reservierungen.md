# Konzept — BV-048 Tischauswahl und Reservierungshinweise

## Ziel

Der schematische Grundriss wird zur auswählbaren operativen Übersicht. Mitarbeitende
erkennen direkt, ob ein Tisch offene zukünftige Reservierungen besitzt, und können
die zugehörigen Termine ohne Wechsel in die vollständige Reservierungsliste ansehen.

## Regeln

- Angezeigt werden ausschließlich Reservierungen im Status `offen` ab dem
  aktuellen Berliner Kalendertag.
- Stornierte und vergangene Reservierungen markieren den Tisch nicht.
- Die Abfrage filtert Tische und Reservierungen an der Datenbankgrenze über den
  explizit aktiven Standort.
- Der manuelle Tischstatus bleibt unabhängig vom Reservierungshinweis. Eine
  automatische zeitabhängige Statusänderung wird ohne definierte Reservierungsdauer
  nicht eingeführt.
- Ein manipulierter Auswahlparameter zeigt keine fremden Tischdaten, weil nur ein
  Tisch aus der bereits standortgefilterten Ergebnisliste ausgewählt werden kann.

## Oberfläche

- Jeder Tisch im Grundriss ist ein per Maus und Tastatur bedienbarer Link.
- Tischkarten zeigen Reservierungsanzahl und den nächsten Termin als Text.
- Die Auswahl erhält einen deutlich sichtbaren Fokus- und Auswahlzustand.
- Ein Detailbereich zeigt Gastname, Termin und Personenzahl aller relevanten
  Reservierungen des ausgewählten Tischs.
- Die semantische Tischliste bietet denselben Reservierungsindikator und einen
  direkten Sprung zum Detailbereich.

## Prüfkriterien

- Offene zukünftige Reservierungen werden chronologisch am richtigen Tisch angezeigt.
- Tische ohne relevante Reservierung sind eindeutig gekennzeichnet.
- Stornierte, vergangene und standortfremde Reservierungen werden nicht angezeigt.
- Ein Tisch ist per Tastatur auswählbar und der ausgewählte Zustand ist nicht nur
  farblich erkennbar.
