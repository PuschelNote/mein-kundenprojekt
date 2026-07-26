# Konzept — BV-010 Abrechnung und Bella-Card

## Ziel und Scope

Phase 5 ergänzt die bestehende Bestellkette um eine nachvollziehbare
Tischrechnung, den automatischen Bella-Card-Rabatt und die genau einmalige
Besuchszählung beim Bezahlen. Sie umfasst `BV-010`, `BV-040`, `BV-011`,
`BV-041` und `BV-042`.

Nicht Teil dieser Phase sind getrennte Zahlungen, Steuernachweise, Belegdruck,
manuelle Rabatte oder eine externe Zahlungsintegration.

## Fachliche Regeln

- Die Ausgangssumme ist die Summe aus `Menge × einzelpreisCent` aller
  Bestellpositionen. Aktuelle Kartenpreise werden nicht erneut gelesen.
- Eine Bella-Card ist bei mindestens zehn bereits abgeschlossenen Besuchen aktiv.
  Der zehnte bezahlte Besuch aktiviert sie daher für die folgende Abrechnung.
- Bei aktiver Bella-Card werden automatisch 15 Prozent der Ausgangssumme
  abgezogen. Der Rabatt wird kaufmännisch auf ganze Cent gerundet.
- Eine Bestellung ohne Gast erhält keinen Rabatt und verändert keinen
  Besuchszähler.
- Erst `serviert → bezahlt` schließt den Besuch ab. Statuswechsel, Rechnungssnapshot
  und Besuchserhöhung erfolgen in derselben Datenbanktransaktion.
- Eine abgeschlossene Rechnung speichert Ausgangssumme, Rabatt, Endsumme und
  Abrechnungszeitpunkt unveränderlich an der Bestellung.

## Berechtigungen und Standorttrennung

Alle Rollen mit `bestellungen_aufnehmen` dürfen den bestehenden Bestellablauf bis
zum Bezahlen ausführen. Die automatische Rabattberechnung benötigt keine manuelle
Freigabe und gibt Bedienungen weder Besuchszähler noch weitere Gastprofildaten
preis. Jede Schreiboperation prüft Bestellung und Mitarbeiter erneut gegen den
aktiven Standort.

## Offline- und Wiederholbarkeit

Die lokale SQLite-Transaktion macht den Bezahlvorgang im aktuellen Einzelgerät-
Setup atomar. Wiederholte Bezahlversuche werden anhand des bereits abgeschlossenen
Status abgewiesen und dürfen weder Rechnung noch Besuchszähler ein zweites Mal
verändern. Eine spätere geräteübergreifende Synchronisation muss denselben
Bestellungsstatus und die gespeicherten Rechnungswerte als konfliktkritisch
behandeln.

## Prüfkriterien

- Summen verwenden ausschließlich historisierte Positionspreise.
- Rabatt wird nur für einen zugeordneten Gast mit mindestens zehn bisherigen
  Besuchen berechnet.
- Besuchszähler steigt bei erfolgreichem Bezahlen genau einmal.
- Bezahlte Rechnungswerte ändern sich durch spätere Preis- oder Gaständerungen
  nicht.
- Ausgangssumme, Rabatt und Endsumme sind in der Bestellübersicht verständlich
  sichtbar.
