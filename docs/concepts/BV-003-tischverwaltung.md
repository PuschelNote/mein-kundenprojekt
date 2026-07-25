# Konzept — BV-003 und Phase-2-Tischverwaltung

## Umfang

Dieses Konzept bündelt `BV-003`, `BV-028`, `BV-029`, `BV-030` und `BV-031`.
`BV-032` ist durch die vorläufigen Tisch-Grunddaten bereits abgeschlossen.

## Ziel

Jeder Standort erhält eine serverseitig gefilterte Tischübersicht aus zwei
Darstellungen:

- Ein schematischer, nicht maßstabsgetreuer Grundriss ordnet die Tische auf einer
  festen Rasterposition an und macht den operativen Status `frei`, `besetzt` oder
  `reserviert` auf einen Blick sichtbar.
- Eine ergänzende Liste zeigt Nummer, Kapazität, Bereich, saisonale Verfügbarkeit,
  vorläufigen Zustand und Status und dient der barrierearmen Bedienung sowie der
  Stammdatenpflege.

Ein exakter baulicher Grundriss oder ein frei verschiebbarer Planeditor ist kein Ziel.

## Rollen

- Alle Mitarbeiterrollen dürfen die Tischliste sehen und den operativen Status
  eines Tischs am aktiven Standort ändern.
- Nummer, Kapazität, Bereich, saisonale Verfügbarkeit sowie Anlage und Entfernung
  sind Stammdaten. Sie werden durch Manager des aktiven Standorts und den Inhaber
  gepflegt. Bedienungen erhalten diese Berechtigung nicht.
- Jede schreibende Operation prüft Capability, Mitarbeiter und Standort erneut
  auf dem Server.

Diese Rollenabgrenzung wird als bewusste Projektentscheidung dokumentiert und kann
nach fachlicher Klärung zentral in der Capability-Matrix geändert werden.

## Daten und Invarianten

- Sichtbare Tischnummern sind positive ganze Zahlen und je Standort eindeutig.
- Dieselbe Nummer darf in Kreuzberg und Spandau vorkommen.
- Kapazität ist eine positive ganze Personenzahl; eine Reservierungsablehnung bei
  Überschreitung bleibt wegen der offenen fachlichen Regel außerhalb des Scopes.
- Bereich ist ausschließlich `innen` oder `terrasse`.
- Jeder Tisch erhält eine standortbezogene Rasterposition aus Zeile und Spalte.
  Positionen sind je Standort eindeutig und dienen nur der schematischen Anzeige.
- Saisonale Verfügbarkeit wird explizit gespeichert. Innentische sind immer
  verfügbar; nur Terrassentische können deaktiviert werden.
- Vorläufige Datensätze bleiben sichtbar gekennzeichnet und können später durch
  bestätigte Stammdaten ersetzt werden.
- Physisches Löschen wird blockiert, sobald Reservierungen auf einen Tisch zeigen.

## Terrassensaison und Reservierungen

Ein nicht verfügbarer Terrassentisch bleibt in der Tischliste sichtbar, wird aber
für neue Reservierungen nicht angeboten. Eine Deaktivierung wird blockiert, wenn
offene Reservierungen ab dem aktuellen lokalen Kalendertag bestehen. Vorhandene
historische oder stornierte Reservierungen bleiben nachvollziehbar.

## Akzeptanzkriterien

- `/tische` zeigt ausschließlich Tische des aktiven Standorts als schematischen
  Grundriss und ergänzende Liste.
- Im Grundriss sind Nummer und Status jedes Tischs ohne Öffnen eines Detaildialogs
  erkennbar; Status wird nicht ausschließlich über Farbe kommuniziert.
- Die Darstellung bleibt auf kleinen Bildschirmen bedienbar und besitzt eine
  semantische Listenalternative.
- Nummer, Kapazität, Bereich, Verfügbarkeit, Vorläufigkeit und Status sind sichtbar.
- Standortfremde IDs werden bei jeder Schreiboperation abgewiesen.
- Alle Mitarbeiter können Statuswerte serverseitig validiert ändern.
- Manager und Inhaber können Stammdaten anlegen, ändern oder entfernen.
- Nicht verfügbare Terrassentische fehlen bei neuen Reservierungszuordnungen.
- Automatisierte Tests decken Rollen, Standorttrennung, Eindeutigkeit, Validierung,
  Reservierungsabhängigkeiten und Statuswechsel ab.

## Nicht-Ziele

- exakter oder maßstabsgetreuer Raumplan
- Drag-and-drop-Planeditor oder freie Positionierung im laufenden Betrieb
- automatische Ableitung des Status aus Uhrzeit oder Reservierungen
- Reservierungsdauer und Überschneidungsprüfung
- automatische Sommerkalender oder Wetterdaten
- Bestell- und Abrechnungsfolgen; diese werden in späteren Phasen integriert
